# Kagoma BBC Contributions App

<div align="center">

![Kagoma BBC Logo](https://via.placeholder.com/150?text=Kagoma+BBC)

**Basketball Team Contribution Tracking & Financial Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-50.0-black.svg)](https://expo.dev/)

[Features](#features) • [Screenshots](#screenshots) • [Installation](#installation) • [Usage](#usage) • [Deployment](#deployment) • [Contributing](#contributing)

</div>

---

## 📖 About

The **Kagoma Contributions App** is a mobile application designed to help basketball team treasurers efficiently manage team finances by:

- 📱 **Automatically detecting contributions** from bank and mobile money SMS notifications
- 📊 **Tracking member contributions and balances** in real-time
- 💰 **Managing expenses** with approval workflows
- ☁️ **Syncing data to Google Sheets** for cloud backup and reporting
- 📈 **Providing financial insights** through an intuitive dashboard

Built specifically for the **Kagoma Basketball Club** but adaptable for any team or organization managing contributions.

---

## ✨ Features

### 🎯 Core Features

- **SMS Integration**
  - Automatic detection of contributions from bank transfers
  - MTN Mobile Money transaction parsing
  - Smart extraction of amounts, names, and transaction references
  - Filter and categorize payment SMS messages

- **Contribution Management**
  - Add and track contributions from team members
  - Link SMS messages to specific contributors
  - View contribution history and trends
  - Track outstanding balances per member

- **Expense Tracking**
  - Record team expenses with categories (Equipment, Transportation, etc.)
  - Approval workflow for expenses
  - Automatic detection of payment SMS
  - Categorize expenses for reporting

- **Google Sheets Integration**
  - One-click authentication with Google
  - Automatic spreadsheet creation
  - Real-time sync of contributions and expenses
  - Cloud backup for data security

- **Dashboard & Analytics**
  - Current balance overview
  - Total contributions and expenses
  - Active member statistics
  - Recent transaction history
  - Visual charts and graphs

### 🎨 User Experience

- **Beautiful, Modern UI** with Material Design
- **Intuitive Navigation** with bottom tab bar
- **Real-time Updates** across all screens
- **Offline Support** with local SQLite database
- **Search & Filter** for quick access to data

---

## 📱 Screenshots

<div align="center">

| Dashboard | Contributions | Expenses |
|:---------:|:-------------:|:--------:|
| ![Dashboard](https://via.placeholder.com/250x500?text=Dashboard) | ![Contributions](https://via.placeholder.com/250x500?text=Contributions) | ![Expenses](https://via.placeholder.com/250x500?text=Expenses) |

| Contributors | Settings |
|:------------:|:--------:|
| ![Contributors](https://via.placeholder.com/250x500?text=Contributors) | ![Settings](https://via.placeholder.com/250x500?text=Settings) |

</div>

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Android Studio** (for Android development) - [Download](https://developer.android.com/studio)
- **Expo CLI** (will be installed automatically)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rweg/kagoma-bbc-management.git
cd kagoma-bbc-management
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
```

> **Note:** See [Google Sheets Setup](#google-sheets-setup) for instructions on obtaining OAuth credentials.

### Step 4: Start the Development Server

```bash
npm start
# or
expo start
```

### Step 5: Run on Android

- **Physical Device:** Install the Expo Go app from Google Play Store, scan the QR code
- **Android Emulator:** Press `a` in the terminal after starting the development server

---

## 📖 Usage

### First-Time Setup

1. **Grant SMS Permission**
   - Go to Settings tab
   - Tap "Grant" under SMS Permissions
   - Allow the app to read SMS messages

2. **Add Team Members**
   - Navigate to Contributors tab
   - Tap the "+" button
   - Enter member name, phone, and email
   - Repeat for all team members

3. **Connect Google Sheets** (Optional but Recommended)
   - Go to Settings tab
   - Tap "Connect Google Sheets"
   - Sign in with your Google account
   - Create a new spreadsheet

### Recording Contributions

#### Automatic (from SMS)
1. Go to Contributions tab
2. Tap "Sync SMS" button
3. Review detected contribution messages
4. Match each message to the correct contributor
5. Confirm and add

#### Manual
1. Go to Contributions tab
2. Tap the "+" button
3. Select the contributor
4. Enter amount and source
5. Add optional notes
6. Save

### Managing Expenses

#### From SMS
1. Go to Expenses tab
2. Review detected payment messages
3. Select a message
4. Choose expense category
5. Add description
6. Submit for approval

#### Manual
1. Go to Expenses tab
2. Tap the "+" button
3. Enter amount and select category
4. Add description
5. Submit (requires approval)

#### Approving Expenses
1. Navigate to Expenses tab
2. Find pending expenses (marked with "Pending" badge)
3. Tap "Approve" button
4. Confirm approval

### Viewing Dashboard

The Dashboard provides an overview of:
- **Current Balance** (Total Contributions - Approved Expenses)
- **Active Members** count
- **Pending Expenses** requiring approval
- **Recent Contributions** (last 5)
- **Recent Expenses** (last 5)

### Syncing to Google Sheets

1. Ensure Google Sheets is connected (Settings tab)
2. Go to Settings tab
3. Tap "Sync Now"
4. Data will be uploaded to your spreadsheet

---

## 🏗️ Deployment

### Building for Google Play Store

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Configure EAS

```bash
eas login
eas build:configure
```

#### Step 3: Build APK/AAB

For testing (APK):
```bash
eas build --platform android --profile preview
```

For production (AAB):
```bash
eas build --platform android --profile production
```

#### Step 4: Submit to Google Play

1. Create a Google Play Developer account ($25 one-time fee)
2. Create a new app in the Google Play Console
3. Prepare store listing:
   - App title: "Kagoma Contributions"
   - Short description
   - Full description
   - Screenshots (at least 2)
   - Feature graphic
   - App icon

4. Submit using EAS:
```bash
eas submit --platform android
```

Or manually upload the AAB file to Google Play Console.

### Google Sheets Setup

To enable Google Sheets integration:

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Name it "Kagoma Contributions App"

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Android" or "Web application"
   - Add authorized redirect URIs (for Expo)
   - Download the credentials JSON

4. **Configure in App**
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
   - Update in `src/services/googleSheetsService.js`

---

## 🛠️ Technology Stack

- **Frontend Framework:** React Native (0.73)
- **Development Platform:** Expo (50.0)
- **Navigation:** React Navigation (Bottom Tabs)
- **UI Components:** React Native Paper (Material Design)
- **Database:** SQLite (expo-sqlite)
- **SMS Reading:** react-native-get-sms-android
- **API Integration:** Axios
- **Cloud Storage:** Google Sheets API
- **Authentication:** Expo Auth Session
- **Charts:** react-native-chart-kit
- **Icons:** React Native Vector Icons (Material Community Icons)

---

## 📂 Project Structure

```
kagoma-bbc-management/
├── App.js                      # Main app entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── eas.json                    # EAS Build configuration
├── babel.config.js             # Babel configuration
├── .gitignore                  # Git ignore rules
│
├── src/
│   ├── screens/                # Screen components
│   │   ├── DashboardScreen.js
│   │   ├── ContributionsScreen.js
│   │   ├── ExpensesScreen.js
│   │   ├── ContributorsScreen.js
│   │   └── SettingsScreen.js
│   │
│   ├── services/               # Business logic & APIs
│   │   ├── smsService.js       # SMS reading & parsing
│   │   └── googleSheetsService.js  # Google Sheets integration
│   │
│   ├── database/               # SQLite database
│   │   └── database.js         # DB operations
│   │
│   └── theme/                  # Styling & theme
│       └── theme.js
│
├── assets/                     # Images, icons, fonts
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
│
└── docs/                       # Additional documentation
    ├── SETUP_GUIDE.md
    ├── USER_MANUAL.md
    └── API_REFERENCE.md
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Test on Android before submitting
- Update documentation as needed

---

## 🐛 Known Issues & Limitations

- **SMS reading is Android-only** (iOS does not allow SMS access)
- **Google Sheets sync requires internet connection**
- **First-time Google authentication** may require opening in browser
- **SMS patterns** are optimized for Rwandan banks and MTN Mobile Money

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Rweg** - *Initial work* - [GitHub](https://github.com/Rweg)

---

## 🙏 Acknowledgments

- Kagoma Basketball Club team members
- React Native and Expo communities
- Contributors to open-source libraries used in this project

---

## 📧 Support

For support, please:
- 📧 Email: [your-email@example.com]
- 💬 Open an issue on GitHub
- 📱 Contact the development team

---

## 🔮 Future Enhancements

- [ ] iOS version (without SMS features)
- [ ] Export to PDF reports
- [ ] Push notifications for new contributions
- [ ] Multi-currency support
- [ ] Team chat functionality
- [ ] Integration with payment platforms
- [ ] Recurring contribution reminders
- [ ] Advanced analytics and charts
- [ ] Dark mode support
- [ ] Multi-language support

---

<div align="center">

**Made with ❤️ for Kagoma Basketball Club**

[⬆ Back to Top](#kagoma-bbc-contributions-app)

</div>

