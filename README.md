# 🤖 Nasa Yuzaki - Professional Discord Bot

![Nasa Yuzaki Banner](./assets/images/welcome-bg.png)
*Nasa Yuzaki - Exploring the Discord universe with precision and advanced features*

![Discord.js](https://img.shields.io/badge/Discord.js-14.14.1-5865F2?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.17.0+-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3.40+-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-FF6B6B?logo=bookstack&logoColor=white)
![Version](https://img.shields.io/badge/Version-2.0.0-9C59B6?logo=azurepipelines&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Android-4A154B?logo=linux&logoColor=white)

> **A feature-rich, professional Discord bot built with Discord.js featuring moderation, music, utility, and entertainment systems**

## 🚀 Features

### 🛡️ Advanced Moderation
![Moderation](https://img.shields.io/badge/Moderation-6_Commands-FF6B6B?logo=shield-check&logoColor=white)
- User management (ban, kick, timeout)
- Warning system with persistence
- Message cleanup and management
- Automated logging system

### 🎵 High-Quality Music
![Music](https://img.shields.io/badge/Music-7_Commands-1DB954?logo=spotify&logoColor=white)
- YouTube audio playback
- Queue management system
- Volume and playback controls
- Real-time music information

### 🔧 Server Utility
![Utility](https://img.shields.io/badge/Utility-6_Commands-4ECDC4?logo=tools&logoColor=white)
- User and server information
- Leveling system with XP
- Welcome/goodbye messages
- Custom avatar retrieval

### 🎯 Entertainment
![Fun](https://img.shields.io/badge/Fun-4_Commands-FFD93D?logo=gamepad&logoColor=black)
- Reddit meme integration
- Magic 8-ball fortune telling
- Rock Paper Scissors game
- Inspirational quotes API

### 💰 Virtual Economy
![Economy](https://img.shields.io/badge/Economy-2_Commands-27AE60?logo=coins&logoColor=white)
- Daily reward system with streaks
- Balance tracking and rankings
- Achievement system
- Virtual currency management

### ⚙️ Configuration
![Configuration](https://img.shields.io/badge/Configuration-5_Commands-9B59B6?logo=gear&logoColor=white)
- Per-server settings customization
- Welcome message configuration
- Auto-role assignment
- Logging channel setup

## 📋 Command Overview

### Prefix: `/` (Slash Commands)

| Category | Commands | Description |
|----------|----------|-------------|
| **🛡️ Moderation** | `ban`, `kick`, `timeout`, `clear`, `warn`, `slowmode` | Server management and user moderation |
| **🎵 Music** | `play`, `stop`, `skip`, `queue`, `volume`, `pause`, `nowplaying` | Audio playback and queue management |
| **🔧 Utility** | `userinfo`, `serverinfo`, `botinfo`, `avatar`, `ping`, `help` | Server and user information utilities |
| **🎯 Fun** | `meme`, `quote`, `8ball`, `rps` | Entertainment and interactive games |
| **💰 Economy** | `balance`, `daily` | Virtual currency and reward system |
| **⚙️ Configuration** | `setwelcome`, `setlogs`, `autorole`, `settings`, `prefix` | Bot and server configuration |

## 🛠️ Technical Specifications

### 🏗️ Architecture
![Architecture](https://img.shields.io/badge/Architecture-Modular-009688?logo=diagram-3&logoColor=white)
- **Framework**: Discord.js v14.14.1
- **Language**: JavaScript ES6+
- **Database**: SQLite3 with QuickDB
- **Audio**: @discordjs/voice with FFmpeg
- **API Integration**: Axios for external services

### 💾 Database Schema
![Database](https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite&logoColor=white)
```sql
-- User levels and XP
levels_guildId_userId: { xp, level, totalXP }

-- Economy system  
economy_guildId_userId: { cash, bank, dailyStreak, totalEarned }

-- Moderation warnings
warnings_guildId_userId: Array<warningObject>

-- Server configurations
welcome_channel_guildId, logs_channel_guildId, autorole_guildId
```

## 📊 System Requirements

### Minimum Specifications
![RAM](https://img.shields.io/badge/RAM-512MB-4A90E2?logo=memory&logoColor=white)
![CPU](https://img.shields.io/badge/CPU-1vCPU-8E44AD?logo=cpu&logoColor=white)
![Storage](https://img.shields.io/badge/Storage-10GB-27AE60?logo=hard-drive&logoColor=white)

### Recommended Specifications
![RAM](https://img.shields.io/badge/RAM-1GB-4A90E2?logo=memory&logoColor=white)
![CPU](https://img.shields.io/badge/CPU-1vCPU-8E44AD?logo=cpu&logoColor=white)
![Storage](https://img.shields.io/badge/Storage-20GB-27AE60?logo=hard-drive&logoColor=white)

## 🚀 Installation Guide

### 📥 Prerequisites
![Node.js](https://img.shields.io/badge/Node.js-18.17.0+-339933?logo=node.js&logoColor=white)
![Git](https://img.shields.io/badge/Git-2.25+-F05032?logo=git&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-5.0+-007808?logo=ffmpeg&logoColor=white)

### 🔧 Local Installation

#### Windows Installation
![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows&logoColor=white)

```bash
# Install Node.js from https://nodejs.org/
# Install Git from https://git-scm.com/

git clone https://github.com/CHICO-CP/nasa-yuzaki-bot.git
cd nasa-yuzaki-bot
npm install
copy .env.example .env
# Edit .env with your Discord token
npm run setup
npm start
```

#### Linux/Debian/Ubuntu Installation
![Linux](https://img.shields.io/badge/Linux-Ubuntu%2018.04+-E95420?logo=ubuntu&logoColor=white)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git ffmpeg

git clone https://github.com/CHICO-CP/nasa-yuzaki-bot.git
cd nasa-yuzaki-bot
npm install
cp .env.example .env
nano .env  # Add your Discord token
npm run setup
npm start
```

#### Termux (Android) Installation
![Android](https://img.shields.io/badge/Android-Termux-3DDC84?logo=android&logoColor=white)
```bash
pkg update && pkg upgrade
pkg install nodejs git ffmpeg

git clone https://github.com/CHICO-CP/nasa-yuzaki-bot.git
cd nasa-yuzaki-bot
npm install
cp .env.example .env
nano .env  # Add your Discord token
npm start
```

### ☁️ Server Deployment

#### Digital Ocean/VPS Deployment
![VPS](https://img.shields.io/badge/VPS-Digital_Ocean-0080FF?logo=digitalocean&logoColor=white)
```bash
ssh root@your-server-ip
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs git ffmpeg build-essential

npm install -g pm2
git clone https://github.com/CHICO-CP/nasa-yuzaki-bot.git
cd nasa-yuzaki-bot
npm install
cp .env.example .env
nano .env

npm run deploy
pm2 start src/index.js --name "nasa-yuzaki-bot"
pm2 startup
pm2 save
```

#### Docker Deployment
![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?logo=docker&logoColor=white)
```dockerfile
# docker-compose.yml
version: '3.8'
services:
  nasa-yuzaki-bot:
    image: node:18-alpine
    container_name: nasa-yuzaki-bot
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./:/app
    command: npm start
    env_file:
      - .env
```

# ⚙️ Configuration

### 🔑 Environment Setup

```env
# Required Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here

# Optional Features
DATABASE_URL=sqlite:./data/bot.db
YOUTUBE_API_KEY=your_youtube_api_key
WEATHER_API_KEY=your_weather_api_key
LOG_CHANNEL_ID=your_log_channel_id
```

# 🤖 Bot Application Setup

1. Create Application at Discord Developer Portal
2. Configure Bot with required intents:
   · ✅ PRESENCE INTENT
   · ✅ SERVER MEMBERS INTENT
   · ✅ MESSAGE CONTENT INTENT
3. Invite URL:
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
   ```

## 📊 Supported Platforms

### 🖥️ Operating Systems
![Windows](https://img.shields.io/badge/✅-Windows_10/11-0078D6?logo=windows&logoColor=white)
![Linux](https://img.shields.io/badge/✅-Ubuntu_18.04+-E95420?logo=ubuntu&logoColor=white)
![Linux](https://img.shields.io/badge/✅-Debian_10+-A81D33?logo=debian&logoColor=white)
![Linux](https://img.shields.io/badge/✅-CentOS_7+-262577?logo=centos&logoColor=white)
![Apple](https://img.shields.io/badge/✅-macOS_10.15+-000000?logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/✅-Android_Termux-3DDC84?logo=android&logoColor=white)

### ☁️ Hosting Providers
![Digital Ocean](https://img.shields.io/badge/⭐-Digital_Ocean-0080FF?logo=digitalocean&logoColor=white)
![AWS](https://img.shields.io/badge/⭐-AWS_EC2-FF9900?logo=amazonaws&logoColor=white)
![Vultr](https://img.shields.io/badge/⭐-Vultr-007BFC?logo=vultr&logoColor=white)
![Heroku](https://img.shields.io/badge/✅-Heroku-430098?logo=heroku&logoColor=white)
![Railway](https://img.shields.io/badge/✅-Railway-0B0D0E?logo=railway&logoColor=white)

### 🐛 Troubleshooting

# 🔍 Common Issues

Bot Startup Failure:

```bash
# Verify Node.js version
node --version  # Requires 18.17.0+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment configuration
cat .env | grep DISCORD_TOKEN
```

Command Deployment Issues:

```bash
# Redeploy slash commands
npm run deploy

# Verify bot permissions in Discord Developer Portal
# Ensure "Applications Commands" scope is enabled
```

Audio Playback Problems:

```bash
# Install FFmpeg
sudo apt install ffmpeg  # Linux
brew install ffmpeg     # macOS
# Download from https://ffmpeg.org/ (Windows)

# Check voice channel permissions
```

# 📝 Logging & Debugging

```bash
# Enable debug mode
DEBUG=discord.js* npm start

# PM2 logging
pm2 logs nasa-yuzaki-bot

# Real-time monitoring
pm2 monit
```

## 🤝 Contributing

![Contributions](https://img.shields.io/badge/Contributions-Welcome-4DC71F?logo=github&logoColor=white)

We welcome community contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

### 🐛 Issue Reporting
Please use our [GitHub Issues](https://github.com/CHICO-CP/nasa-yuzaki-bot/issues) page to:
- Report bugs 🐛
- Suggest new features 💡
- Request improvements 🔧

## 📞 Support & Community

### 🌐 Official Links
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)
**Source Code**: [nasa-yuzaki-bot](https://github.com/CHICO-CP/nasa-yuzaki-bot)

![Telegram](https://img.shields.io/badge/Telegram-Channel-26A5E4?logo=telegram&logoColor=white)
**Updates Channel**: [Ghost Developer](https://t.me/GhostDev)

![Telegram](https://img.shields.io/badge/Telegram-Community-26A5E4?logo=telegram&logoColor=white)
**Community Group**: [CodeBreakersHub](https://t.me/CodeBreakersHub)

![Discord](https://img.shields.io/badge/Discord-Support-5865F2?logo=discord&logoColor=white)
**Support Server**: [Discord](https://discord.gg/SHjF9qw9)

### 🆘 Getting Help
1. Check the `#help` channel in our Discord server
2. Search existing [GitHub Issues](https://github.com/CHICO-CP/nasa-yuzaki-bot/issues)
3. Contact support via Telegram groups
4. Review the documentation above

## 📊 Project Statistics

![Commands](https://img.shields.io/badge/Total_Commands-24+-9C59B6?logo=terminal&logoColor=white)
![Categories](https://img.shields.io/badge/Categories-6-3498DB?logo=layer-group&logoColor=white)
![Language](https://img.shields.io/badge/Language-English-FF6B6B?logo=translate&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active_Development-27AE60?logo=code&logoColor=white)
![Updates](https://img.shields.io/badge/Updates-Monthly-F39C12?logo=update&logoColor=white)

## 🔒 Security & Privacy

![Security](https://img.shields.io/badge/Security-Enhanced-4DC71F?logo=shield-check&logoColor=white)
- Regular security updates and patches
- Permission-based command access system
- No user data sharing with third parties
- Secure token and credential handling
- SQLite database encryption ready

## 📄 License

![License](https://img.shields.io/badge/License-MIT-FF6B6B?logo=bookstack&logoColor=white)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for full details.

## 🏆 Credits & Acknowledgments

**Developed by:** [Ghost Developer](https://github.com/CHICO-CP)  
**Special Thanks to:**
- Discord.js community and contributors
- Open source library maintainers
- Beta testers and bug reporters
- The entire NASA Yuzaki user community

---

<div align="center">

## ⭐ Support the Project

If you find NASA Yuzaki useful, please consider giving it a star on GitHub!

**NASA Yuzaki** - *Professional Discord Bot Framework* 🚀

![Footer](https://img.shields.io/badge/Made_with-❤️_-FF6B6B?logo=heart&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-NASA_Yuzaki-5865F2?logo=discord&logoColor=white)

</div>