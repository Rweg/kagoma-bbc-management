# Kagoma Contributions App - Quick Start

Get up and running in 5 minutes! ⚡

---

## 🚀 Installation (5 minutes)

### 1. Prerequisites

Make sure you have:
- [ ] Node.js installed ([Download](https://nodejs.org/))
- [ ] Android phone with Expo Go app installed

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Rweg/kagoma-bbc-management.git
cd kagoma-bbc-management

# Install dependencies (may take 3-5 minutes)
npm install
```

### 3. Start the App

```bash
# Start development server
npm start
```

### 4. Open on Your Phone

1. Open **Expo Go** app
2. Scan the QR code shown in terminal
3. Wait for app to load (first time takes 1-2 minutes)

---

## ✅ First-Time Setup (3 minutes)

### 1. Grant SMS Permission

- Open the app
- Go to **Settings** tab (bottom right)
- Tap **"Grant"** under SMS Permissions
- Allow the permission

### 2. Add Your First Team Member

- Go to **Contributors** tab
- Tap the **+** button (bottom right)
- Fill in:
  - Name: "John Doe"
  - Phone: "0788123456"
  - Email: "john@example.com"
- Tap **"Add Member"**

### 3. Add a Contribution

- Go to **Contributions** tab
- Tap the **+** button
- Select "John Doe"
- Enter amount: "10000"
- Select source: "MANUAL"
- Tap **"Add"**

### 4. Check Dashboard

- Go to **Dashboard** tab
- You should see:
  - Current Balance: 10,000 FRW
  - 1 Active Member
  - Recent contribution listed

---

## 🎯 Common Tasks

### Sync SMS Messages

```
Contributions Tab → "Sync SMS" button
→ Review detected messages
→ Match to contributors
→ Confirm
```

### Add an Expense

```
Expenses Tab → + button
→ Enter amount
→ Select category (e.g., "Equipment")
→ Add description
→ Submit
→ Go back and approve it
```

### Connect Google Sheets

```
Settings Tab → "Connect Google Sheets"
→ Sign in with Google
→ Grant permissions
→ Create spreadsheet
→ Tap "Sync Now"
```

---

## 📱 App Navigation

The app has **5 main tabs** at the bottom:

1. **📊 Dashboard** - Overview & statistics
2. **💰 Contributions** - Add & view contributions
3. **💸 Expenses** - Track team expenses
4. **👥 Contributors** - Manage team members
5. **⚙️ Settings** - Configure app & sync

---

## 🐛 Quick Troubleshooting

### "Can't connect to development server"

- Ensure phone and computer are on same WiFi
- Try: `npm start --tunnel`

### "App won't load"

- Close Expo Go completely
- Restart development server
- Scan QR code again

### "SMS not detected"

- Check SMS permission is granted
- Ensure SMS are from banks or Mobile Money
- Try manual sync: Settings → "Sync SMS"

---

## 🎓 Learn More

- **Full Documentation:** See [README.md](./README.md)
- **Detailed Setup:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🆘 Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Read the [FAQ](#) (coming soon)
3. Open an issue on [GitHub](https://github.com/Rweg/kagoma-bbc-management/issues)

---

## ✨ You're Ready!

That's it! You now have a fully functional contribution tracking app.

**Next Steps:**
- Add all your team members
- Sync your SMS messages
- Set up Google Sheets backup
- Start tracking contributions!

---

**Happy tracking! 🏀**

