import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Switch,
  Portal,
  Modal,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getSetting, setSetting, getDashboardStats } from '../database/database';
import googleSheetsService from '../services/googleSheetsService';
import { requestSMSPermission } from '../services/smsService';
import { colors } from '../theme/theme';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    autoSync: false,
    smsPermission: false,
    googleSheetsConnected: false,
    spreadsheetId: null,
  });
  const [loading, setLoading] = useState(false);
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [spreadsheetName, setSpreadsheetName] = useState('Kagoma BBC Contributions');

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      await googleSheetsService.initialize();
      const autoSync = await getSetting('auto_sync');
      const isConnected = await googleSheetsService.isAuthenticated();
      
      setSettings({
        ...settings,
        autoSync: autoSync === 'true',
        googleSheetsConnected: isConnected,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkPermissions = async () => {
    const hasPermission = await requestSMSPermission();
    setSettings(prev => ({ ...prev, smsPermission: hasPermission }));
  };

  const handleToggleAutoSync = async (value) => {
    try {
      await setSetting('auto_sync', value ? 'true' : 'false');
      setSettings({ ...settings, autoSync: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-sync setting');
    }
  };

  const handleRequestSMSPermission = async () => {
    const granted = await requestSMSPermission();
    setSettings({ ...settings, smsPermission: granted });
    if (granted) {
      Alert.alert('Success', 'SMS permission granted');
    } else {
      Alert.alert('Permission Denied', 'Please enable SMS permission in your device settings');
    }
  };

  const handleConnectGoogleSheets = async () => {
    setLoading(true);
    try {
      const result = await googleSheetsService.authenticate();
      if (result.success) {
        setGoogleModalVisible(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to authenticate with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    setLoading(true);
    try {
      const result = await googleSheetsService.createSpreadsheet(spreadsheetName);
      if (result.success) {
        Alert.alert(
          'Success',
          'Spreadsheet created successfully! You can now sync your data.',
          [
            {
              text: 'Open in Browser',
              onPress: () => {
                // Open in browser
                console.log('Open:', result.url);
              },
            },
            { text: 'OK' },
          ]
        );
        setSettings({ ...settings, googleSheetsConnected: true, spreadsheetId: result.spreadsheetId });
        setGoogleModalVisible(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to create spreadsheet');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!settings.googleSheetsConnected) {
      Alert.alert('Error', 'Please connect to Google Sheets first');
      return;
    }

    Alert.alert(
      'Sync to Google Sheets',
      'This will upload all contributions and expenses to your Google Sheet. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync',
          onPress: async () => {
            setLoading(true);
            try {
              const stats = await getDashboardStats();
              await googleSheetsService.syncSummary(stats);
              Alert.alert('Success', 'Data synced to Google Sheets');
            } catch (error) {
              Alert.alert('Error', 'Failed to sync data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDisconnectGoogle = async () => {
    Alert.alert(
      'Disconnect Google Sheets',
      'Are you sure you want to disconnect? Your data will remain in the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await googleSheetsService.disconnect();
            setSettings({ ...settings, googleSheetsConnected: false, spreadsheetId: null });
            Alert.alert('Disconnected', 'Google Sheets has been disconnected');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Google Sheets Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="google-spreadsheet" size={32} color={colors.success} />
            <Title style={styles.sectionTitle}>Google Sheets Integration</Title>
          </View>
          
          {settings.googleSheetsConnected ? (
            <View>
              <View style={styles.connectedBadge}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
              
              <Button
                mode="contained"
                icon="sync"
                onPress={handleSyncNow}
                style={styles.button}
                disabled={loading}
              >
                Sync Now
              </Button>
              
              <Button
                mode="outlined"
                icon="link-off"
                onPress={handleDisconnectGoogle}
                style={styles.button}
                disabled={loading}
              >
                Disconnect
              </Button>
            </View>
          ) : (
            <View>
              <Paragraph style={styles.description}>
                Connect to Google Sheets to automatically backup your contribution data to the cloud.
              </Paragraph>
              <Button
                mode="contained"
                icon="google"
                onPress={handleConnectGoogleSheets}
                style={styles.button}
                disabled={loading}
              >
                Connect Google Sheets
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* SMS Permissions Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="message-text" size={32} color={colors.primary} />
            <Title style={styles.sectionTitle}>SMS Permissions</Title>
          </View>
          
          <List.Item
            title="SMS Access"
            description={
              settings.smsPermission
                ? 'Permission granted - App can read financial SMS'
                : 'Permission needed to detect contributions from SMS'
            }
            left={(props) => (
              <Icon
                name={settings.smsPermission ? 'check-circle' : 'alert-circle'}
                size={24}
                color={settings.smsPermission ? colors.success : colors.warning}
              />
            )}
            right={(props) => (
              !settings.smsPermission && (
                <Button mode="outlined" onPress={handleRequestSMSPermission}>
                  Grant
                </Button>
              )
            )}
          />
        </Card.Content>
      </Card>

      {/* Sync Settings Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="sync" size={32} color={colors.info} />
            <Title style={styles.sectionTitle}>Sync Settings</Title>
          </View>
          
          <List.Item
            title="Auto-sync to Google Sheets"
            description="Automatically sync new contributions and expenses"
            left={(props) => <Icon name="cloud-sync" size={24} color={colors.info} />}
            right={(props) => (
              <Switch
                value={settings.autoSync}
                onValueChange={handleToggleAutoSync}
                disabled={!settings.googleSheetsConnected}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* App Information Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Information</Title>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <Icon name="information" size={24} color={colors.gray} />}
          />
          
          <List.Item
            title="Developer"
            description="Rweg - Kagoma Basketball Club"
            left={(props) => <Icon name="account" size={24} color={colors.gray} />}
          />
          
          <List.Item
            title="GitHub"
            description="github.com/Rweg/kagoma-bbc-management"
            left={(props) => <Icon name="github" size={24} color={colors.gray} />}
          />
        </Card.Content>
      </Card>

      {/* Data Management Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Data Management</Title>
          
          <Button
            mode="outlined"
            icon="download"
            onPress={() => Alert.alert('Coming Soon', 'Export to CSV feature coming soon')}
            style={styles.button}
          >
            Export to CSV
          </Button>
          
          <Button
            mode="outlined"
            icon="database"
            onPress={() => Alert.alert('Coming Soon', 'Backup database feature coming soon')}
            style={styles.button}
          >
            Backup Database
          </Button>
        </Card.Content>
      </Card>

      {/* Google Sheets Setup Modal */}
      <Portal>
        <Modal
          visible={googleModalVisible}
          onDismiss={() => setGoogleModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Create Google Spreadsheet</Title>
          <Paragraph style={styles.modalDescription}>
            A new Google Spreadsheet will be created to store your contribution data.
          </Paragraph>
          
          <TextInput
            label="Spreadsheet Name"
            value={spreadsheetName}
            onChangeText={setSpreadsheetName}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setGoogleModalVisible(false)} disabled={loading}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleCreateSpreadsheet} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </View>
        </Modal>
      </Portal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  description: {
    marginBottom: 16,
    color: colors.gray,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  connectedText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  button: {
    marginBottom: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalDescription: {
    marginVertical: 12,
    color: colors.gray,
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 24,
  },
});

export default SettingsScreen;

