# Assets Directory

This directory contains app icons, splash screens, and other visual assets.

## Required Assets

Before deploying to Google Play Store, you need to create:

### App Icon
- **File:** `icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Design:** Kagoma BBC logo or basketball-themed icon

### Splash Screen
- **File:** `splash.png`
- **Size:** 1242x2436 pixels
- **Format:** PNG
- **Design:** Kagoma BBC branding with app name

### Adaptive Icon (Android)
- **File:** `adaptive-icon.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Note:** Center area (512x512) should contain main logo

### Favicon (Web)
- **File:** `favicon.png`
- **Size:** 48x48 pixels
- **Format:** PNG

## Creating Assets

### Option 1: Online Tools
- Use [Figma](https://figma.com) or [Canva](https://canva.com)
- Design with basketball/team theme
- Export at required sizes

### Option 2: Hire a Designer
- Freelancer platforms (Fiverr, Upwork)
- Request complete app icon set
- Provide Kagoma BBC branding guidelines

### Option 3: Use App Icon Generators
- [App Icon Generator](https://www.appicon.co/)
- Upload your logo
- Download generated icons

## Color Scheme

Use these colors for consistency:

- **Primary:** #1a237e (Deep Blue)
- **Accent:** #ff6f00 (Orange)
- **Background:** #f5f5f5 (Light Gray)
- **Success:** #4caf50 (Green)
- **Error:** #f44336 (Red)

## Basketball Theme Ideas

- Basketball icon with dollar sign
- Basketball court diagram
- Kagoma BBC team logo
- Basketball with spreadsheet/chart
- Hands passing money + basketball

## Once Assets are Created

1. Place files in this directory
2. Update `app.json` with correct paths
3. Rebuild the app:
   ```bash
   expo start --clear
   ```

## Default Placeholders

For now, the app will use Expo's default icons. These work for development but should be replaced before production release.

