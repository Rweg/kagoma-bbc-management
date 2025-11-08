# Kagoma Contributions App - Detailed Setup Guide

This guide will walk you through setting up the Kagoma Contributions App from scratch.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] A computer running Windows, macOS, or Linux
- [ ] An Android phone (Android 8.0 or higher) OR Android Emulator
- [ ] Internet connection
- [ ] Google account (for Google Sheets integration)
- [ ] Basic command line knowledge

---

## 🔧 Step-by-Step Installation

### 1. Install Node.js

Node.js is required to run the development server.

**Windows:**
1. Download Node.js LTS from https://nodejs.org/
2. Run the installer
3. Follow the installation wizard
4. Verify installation:
```bash
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 2. Install Git

**Windows:**
1. Download from https://git-scm.com/
2. Run installer with default settings
3. Verify: `git --version`

**macOS:**
```bash
# Git comes pre-installed, or use Homebrew
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

### 3. Clone the Repository

```bash
# Navigate to your projects folder
cd ~/Documents

# Clone the repository
git clone https://github.com/Rweg/kagoma-bbc-management.git

# Enter the project directory
cd kagoma-bbc-management
```

### 4. Install Project Dependencies

```bash
# Install all required packages
npm install

# This may take 5-10 minutes
```

### 5. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# On Windows
notepad .env

# On macOS/Linux
nano .env
```

Add the following content:

```env
# Google OAuth Configuration (we'll fill this later)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

Save and close the file.

### 6. Set Up Android Development Environment

#### Option A: Use Expo Go (Easiest)

1. Install **Expo Go** from Google Play Store on your Android phone
2. Make sure your phone and computer are on the same WiFi network
3. That's it! No Android Studio needed.

#### Option B: Use Android Studio (Advanced)

1. Download Android Studio from https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio
4. Go to Tools → AVD Manager
5. Create a new Virtual Device (Pixel 6 recommended)
6. Download system image (Android 13 recommended)
7. Start the emulator

---

## ▶️ Running the App

### Start the Development Server

```bash
# In the project directory
npm start

# OR
npx expo start
```

You should see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Run on Your Phone (Recommended)

1. Open **Expo Go** app on your Android phone
2. Tap "Scan QR Code"
3. Scan the QR code in your terminal
4. Wait for the app to load (first time may take 2-3 minutes)

### Run on Emulator

With emulator running:
```bash
# Press 'a' in the terminal
# OR
npx expo start --android
```

---

## 🔐 Setting Up Google Sheets Integration

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click "Create Project"
3. Name: "Kagoma Contributions App"
4. Click "Create"

### Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it
4. Click "Enable"
5. Also enable "Google Drive API"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. You may need to configure OAuth consent screen first:
   - User Type: External
   - App name: "Kagoma Contributions"
   - User support email: your email
   - Developer contact: your email
   - Add scope: `../auth/spreadsheets`
   - Add test users: your email
4. Back to Create Credentials:
   - Application type: "Web application"
   - Name: "Kagoma Contributions Web Client"
   - Authorized redirect URIs:
     - `https://auth.expo.io/@your-username/kagoma-contributions-app`
     - `http://localhost:19000`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 4: Update App Configuration

1. Open `.env` file
2. Update with your credentials:
```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
```

3. Also update `src/services/googleSheetsService.js`:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'YOUR_ACTUAL_CLIENT_SECRET';
```

4. Restart the development server:
```bash
# Press Ctrl+C to stop
npm start
```

---

## ✅ Testing the Setup

### 1. Test SMS Permission

1. Open the app
2. Go to **Settings** tab
3. Tap "Grant" under SMS Permissions
4. Allow the permission
5. You should see "Permission granted"

### 2. Test Adding Contributors

1. Go to **Contributors** tab
2. Tap the **+** button
3. Enter:
   - Name: "Test Member"
   - Phone: "0788123456"
   - Email: "test@example.com"
4. Tap "Add Member"
5. You should see the member in the list

### 3. Test Adding Contributions

1. Go to **Contributions** tab
2. Tap the **+** button
3. Select "Test Member"
4. Enter amount: "5000"
5. Source: "MANUAL"
6. Tap "Add"
7. You should see the contribution in the list
8. Check **Dashboard** - balance should be 5000 FRW

### 4. Test SMS Sync

1. Make sure you have some bank or Mobile Money SMS in your phone
2. Go to **Contributions** tab
3. Tap "Sync SMS"
4. Grant permission if asked
5. You should see detected messages

### 5. Test Google Sheets (if configured)

1. Go to **Settings** tab
2. Tap "Connect Google Sheets"
3. Sign in with Google
4. Grant permissions
5. Enter spreadsheet name
6. Tap "Create"
7. You should see "Connected" status
8. Tap "Sync Now"
9. Open your Google Drive - you should see the spreadsheet

---

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### App won't load on phone

- Ensure phone and computer are on same WiFi
- Try restarting the Metro bundler
- Check firewall settings
- Try using tunnel mode: `npx expo start --tunnel`

### Google Sheets authentication fails

- Double-check Client ID and Secret
- Ensure redirect URIs are correct
- Make sure Google Sheets API is enabled
- Try in web browser mode

### SMS not detected

- Ensure permission is granted
- Check that SMS are from recognized banks (check patterns in `smsService.js`)
- Try manual sync: Settings → Sync SMS

### Build fails

```bash
# Clear Expo cache
npx expo start --clear

# Reset everything
rm -rf node_modules
npm install
```

---

## 📱 Building for Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on building and publishing to Google Play Store.

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. Check the main [README.md](./README.md)
2. Search existing issues on GitHub
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

## 🎉 Success!

If all tests pass, your setup is complete! You're ready to:

- Add all team members
- Start tracking contributions
- Manage expenses
- Sync to Google Sheets

Enjoy using Kagoma Contributions App! 🏀

---

**Next Steps:**
- Read [USER_MANUAL.md](./USER_MANUAL.md) for detailed usage instructions
- Invite your team treasurer to use the app
- Set up regular backups with Google Sheets

