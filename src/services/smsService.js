import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { addSMSMessage } from '../database/database';

// SMS patterns for different banks and mobile money services
const SMS_PATTERNS = {
  // Bank patterns
  BANK_RECEIVED: [
    /received\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
    /credited\s+(?:with\s+)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
    /deposit\s+of\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
  ],
  BANK_SENT: [
    /sent\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
    /debited\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
    /paid\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
    /withdrawal\s+of\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW|Frw)?/i,
  ],
  
  // MTN Mobile Money patterns
  MTN_RECEIVED: [
    /You\s+have\s+received\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW)?/i,
    /Received\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW)?\s+from/i,
  ],
  MTN_SENT: [
    /You\s+have\s+sent\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW)?/i,
    /Sent\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW)?\s+to/i,
    /successfully\s+sent\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:RWF|FRW)?/i,
  ],
};

// Known sender patterns
const KNOWN_SENDERS = {
  MTN: ['MTN', 'MoMo', 'MOMO', '182'],
  BANKS: ['BANK', 'EQUITY', 'BK', 'COGEBANQUE', 'BPR', 'ECOBANK', 'ACCESS'],
};

export const requestSMSPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'Kagoma Contributions App needs access to your SMS to track contributions',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting SMS permission:', err);
    return false;
  }
};

export const extractAmount = (text) => {
  // Try all patterns
  const allPatterns = [
    ...SMS_PATTERNS.BANK_RECEIVED,
    ...SMS_PATTERNS.BANK_SENT,
    ...SMS_PATTERNS.MTN_RECEIVED,
    ...SMS_PATTERNS.MTN_SENT,
  ];

  for (const pattern of allPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Remove commas and convert to float
      const amountStr = match[1].replace(/,/g, '');
      return parseFloat(amountStr);
    }
  }
  return null;
};

export const classifySMS = (sender, body) => {
  const upperSender = sender.toUpperCase();
  const upperBody = body.toUpperCase();

  // Check if it's from a known sender
  let source = 'UNKNOWN';
  if (KNOWN_SENDERS.MTN.some(s => upperSender.includes(s))) {
    source = 'MTN_MOBILE_MONEY';
  } else if (KNOWN_SENDERS.BANKS.some(s => upperSender.includes(s))) {
    source = 'BANK';
  }

  // Determine type (received or sent)
  let type = 'UNKNOWN';
  
  // Check for received patterns
  if (SMS_PATTERNS.BANK_RECEIVED.some(p => p.test(body)) || 
      SMS_PATTERNS.MTN_RECEIVED.some(p => p.test(body))) {
    type = 'RECEIVED';
  }
  
  // Check for sent patterns
  if (SMS_PATTERNS.BANK_SENT.some(p => p.test(body)) || 
      SMS_PATTERNS.MTN_SENT.some(p => p.test(body))) {
    type = 'SENT';
  }

  return { source, type };
};

export const readSMSMessages = async (maxCount = 100) => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'android') {
      reject(new Error('SMS reading is only available on Android'));
      return;
    }

    const filter = {
      box: 'inbox',
      maxCount: maxCount,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.error('Failed to list SMS:', fail);
        reject(fail);
      },
      (count, smsList) => {
        try {
          const messages = JSON.parse(smsList);
          
          // Filter for financial messages
          const financialMessages = messages.filter(msg => {
            const { source, type } = classifySMS(msg.address, msg.body);
            return source !== 'UNKNOWN' && type !== 'UNKNOWN';
          });

          resolve(financialMessages);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

export const syncRecentSMS = async (daysBack = 30) => {
  try {
    const hasPermission = await requestSMSPermission();
    if (!hasPermission) {
      throw new Error('SMS permission denied');
    }

    const messages = await readSMSMessages(200);
    const now = Date.now();
    const cutoffDate = now - (daysBack * 24 * 60 * 60 * 1000);

    let processed = 0;
    for (const msg of messages) {
      const msgDate = parseInt(msg.date);
      
      if (msgDate >= cutoffDate) {
        const { source, type } = classifySMS(msg.address, msg.body);
        const amount = extractAmount(msg.body);

        if (amount) {
          await addSMSMessage(
            msg.address,
            msg.body,
            new Date(msgDate).toISOString(),
            `${source}_${type}`
          );
          processed++;
        }
      }
    }

    return { success: true, processed };
  } catch (error) {
    console.error('Error syncing SMS:', error);
    return { success: false, error: error.message };
  }
};

export const extractNameFromSMS = (body) => {
  // Try to extract name from common patterns
  const patterns = [
    /from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
};

export const extractTransactionRef = (body) => {
  // Try to extract transaction reference
  const patterns = [
    /Ref(?:erence)?[:\s]+([A-Z0-9]+)/i,
    /Transaction[:\s]+([A-Z0-9]+)/i,
    /TXN[:\s]+([A-Z0-9]+)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

export default {
  requestSMSPermission,
  readSMSMessages,
  syncRecentSMS,
  extractAmount,
  classifySMS,
  extractNameFromSMS,
  extractTransactionRef,
};

