# Ready Auto YT Uploader

An Electron desktop app that automatically uploads video files from a watched folder to YouTube, built with React and TypeScript.

## 📥 Quick Setup (Recommended)
**No coding required.** Directly download the latest Windows installer:
👉 **[Download Latest Ready Auto YT Setup (.exe)](https://github.com/ReadyZer0/Youtube-auto-uploader/releases/latest)**

---

## ✨ Features

- 🔗 **Official YouTube Account Linking** — Connects to your actual YouTube Channel via the official OAuth2 flow
- 📁 **Smart Watch Folder** — Automatically detects and uploads new videos from any folder
- ⏰ **Smart Scheduler** — Set upload times (interval, daily, weekly, or cron)
- 🔒 **Secure Auth** — Absolute session revocation on logout; tokens stored locally only
- 🎨 **Premium UI** — Dark glassmorphism design with smooth animations

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A Google Cloud project with the **YouTube Data API v3** enabled
- OAuth 2.0 credentials (Client ID & Secret) from [Google Cloud Console](https://console.cloud.google.com/)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/ReadyZer0/Youtube-auto-uploader
   cd Youtube-auto-uploader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure credentials**
   ```bash
   cp .env.example .env
   ```
   Fill in your own Google OAuth credentials in `.env`:
   ```
   MAIN_VITE_GOOGLE_CLIENT_ID=your_client_id_here
   MAIN_VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

### Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable **YouTube Data API v3**
3. Create OAuth 2.0 credentials → Desktop App
4. Add `http://localhost:4281` as an authorized redirect URI
5. Add your Gmail to **Test Users** (while the app is in Testing mode)

## 📦 Build

```bash
npm run build:win    # Windows installer
npm run build:mac    # macOS DMG
npm run build:linux  # Linux AppImage
```

## 🤝 Support

If this project helped you, consider supporting development:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ali%20Dheyaa-0077B5?style=flat&logo=linkedin)](https://iq.linkedin.com/in/ali-dheyaa-abdulwahab-6bbbb1239)

Click **Support Dev** inside the app to donate via Payoneer, Wire, or Crypto.

## 📄 License

MIT
