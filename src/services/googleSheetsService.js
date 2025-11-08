import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

class GoogleSheetsService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.spreadsheetId = null;
  }

  async initialize() {
    // Load saved tokens
    this.accessToken = await SecureStore.getItemAsync('google_access_token');
    this.refreshToken = await SecureStore.getItemAsync('google_refresh_token');
    this.spreadsheetId = await SecureStore.getItemAsync('spreadsheet_id');
  }

  async authenticate() {
    try {
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const authRequest = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: false,
      });

      const result = await authRequest.promptAsync(discovery);

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for tokens
        const tokenResponse = await axios.post(
          'https://oauth2.googleapis.com/token',
          {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          }
        );

        this.accessToken = tokenResponse.data.access_token;
        this.refreshToken = tokenResponse.data.refresh_token;

        // Save tokens securely
        await SecureStore.setItemAsync('google_access_token', this.accessToken);
        if (this.refreshToken) {
          await SecureStore.setItemAsync('google_refresh_token', this.refreshToken);
        }

        return { success: true };
      }

      return { success: false, error: 'Authentication cancelled' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          refresh_token: this.refreshToken,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: 'refresh_token',
        }
      );

      this.accessToken = response.data.access_token;
      await SecureStore.setItemAsync('google_access_token', this.accessToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async createSpreadsheet(title = 'Kagoma BBC Contributions') {
    try {
      const response = await axios.post(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          properties: {
            title,
          },
          sheets: [
            {
              properties: {
                title: 'Contributors',
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
            {
              properties: {
                title: 'Contributions',
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
            {
              properties: {
                title: 'Expenses',
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
            {
              properties: {
                title: 'Summary',
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.spreadsheetId = response.data.spreadsheetId;
      await SecureStore.setItemAsync('spreadsheet_id', this.spreadsheetId);

      // Initialize headers
      await this.initializeSheetHeaders();

      return {
        success: true,
        spreadsheetId: this.spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`,
      };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      
      // Try to refresh token if unauthorized
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.createSpreadsheet(title);
      }
      
      return { success: false, error: error.message };
    }
  }

  async initializeSheetHeaders() {
    const requests = [
      {
        range: 'Contributors!A1:H1',
        values: [['ID', 'Name', 'Phone', 'Email', 'Balance', 'Total Contributed', 'Active', 'Last Updated']],
      },
      {
        range: 'Contributions!A1:H1',
        values: [['ID', 'Date', 'Contributor', 'Amount', 'Source', 'Transaction Ref', 'Notes', 'Synced At']],
      },
      {
        range: 'Expenses!A1:G1',
        values: [['ID', 'Date', 'Amount', 'Category', 'Description', 'Approved', 'Synced At']],
      },
      {
        range: 'Summary!A1:B1',
        values: [['Metric', 'Value']],
      },
    ];

    for (const request of requests) {
      await this.appendToSheet(request.range, request.values);
    }
  }

  async appendToSheet(range, values) {
    try {
      const response = await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}:append`,
        {
          values,
        },
        {
          params: {
            valueInputOption: 'RAW',
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error appending to sheet:', error);
      
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.appendToSheet(range, values);
      }
      
      return { success: false, error: error.message };
    }
  }

  async syncContributor(contributor) {
    const values = [[
      contributor.id,
      contributor.name,
      contributor.phone || '',
      contributor.email || '',
      contributor.balance,
      contributor.total_contributed,
      contributor.active ? 'Yes' : 'No',
      new Date().toISOString(),
    ]];

    return await this.appendToSheet('Contributors!A:H', values);
  }

  async syncContribution(contribution) {
    const values = [[
      contribution.id,
      new Date(contribution.date).toLocaleString(),
      contribution.contributor_name,
      contribution.amount,
      contribution.source,
      contribution.transaction_ref || '',
      contribution.notes || '',
      new Date().toISOString(),
    ]];

    return await this.appendToSheet('Contributions!A:H', values);
  }

  async syncExpense(expense) {
    const values = [[
      expense.id,
      new Date(expense.date).toLocaleString(),
      expense.amount,
      expense.category,
      expense.description || '',
      expense.approved ? 'Yes' : 'No',
      new Date().toISOString(),
    ]];

    return await this.appendToSheet('Expenses!A:G', values);
  }

  async syncSummary(stats) {
    const values = [
      ['Total Contributions', stats.totalContributions],
      ['Total Expenses', stats.totalExpenses],
      ['Current Balance', stats.currentBalance],
      ['Active Contributors', stats.activeContributors],
      ['Pending Expenses', stats.pendingExpenses],
      ['Last Updated', new Date().toLocaleString()],
    ];

    // Clear existing summary first
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Summary!A2:B100:clear`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    return await this.appendToSheet('Summary!A:B', values);
  }

  async isAuthenticated() {
    return this.accessToken !== null;
  }

  async disconnect() {
    this.accessToken = null;
    this.refreshToken = null;
    this.spreadsheetId = null;
    
    await SecureStore.deleteItemAsync('google_access_token');
    await SecureStore.deleteItemAsync('google_refresh_token');
    await SecureStore.deleteItemAsync('spreadsheet_id');
  }
}

export default new GoogleSheetsService();

