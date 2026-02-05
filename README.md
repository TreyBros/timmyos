# TimmyOS - AI Agent Dashboard

Full dashboard for monitoring Clawdbot agent with animated login page.

## 🔗 Live Demo

**Vercel:** https://client-seven-ruby-49.vercel.app

**Passcode:** `686868`

## 🚀 Setup

### 1. Clone & Install
```bash
git clone https://github.com/TreyBros/timmyos.git
cd timmyos

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Set Environment Variables (Vercel)

In Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_API_URL=http://10.0.0.204:3333
VITE_WS_URL=ws://10.0.0.204:3333
```

**Never commit `.env` files to GitHub!**

### 3. Start Backend (on Jetson)
```bash
cd server
node server.js
```

### 4. Deploy Frontend
```bash
cd client
npm run build
vercel --prod
```

## 🏗️ Architecture

```
┌─────────────┐     HTTP/WebSocket      ┌─────────────┐     ┌─────────────┐
│   Vercel    │ ◄─────────────────────► │   Jetson    │ ◄──►│   System    │
│  (Frontend) │    VITE_API_URL         │  (Backend)  │     │  Data/APIs  │
└─────────────┘                         └─────────────┘     └─────────────┘
```

## ✨ Features

- **Animated Login Page** - Passcode 686868, floating orbs, rotating brain
- **System Health** - RAM, CPU temp, disk, uptime (real-time)
- **Memory Browser** - Local files + Knowcore chunks
- **Task Board** - Kanban with drag-and-drop
- **Skills Grid** - Installed capabilities
- **Knowcore Status** - Connection health
- **Activity Log** - Real-time updates via WebSocket

## 🔒 Security

- Environment variables for API URLs (no hardcoded IPs)
- Session storage for auth (no tokens in localStorage)
- `.env` files ignored in `.gitignore`
- Backend CORS configured for specific origins

## 📝 License

MIT
