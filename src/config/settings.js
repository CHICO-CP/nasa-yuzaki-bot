const config = {
    bot: {
        name: "Nasa Yuzaki",
        version: "2.0.0",
        developer: "Ghost Developer",
        github: "https://github.com/CHICO-CP",
        telegramChannel: "https://t.me/GhostDev",
        telegramGroup: "https://t.me/CodeBreakersHub",
        supportServer: "https://discord.gg/yourserver",
        createdAt: "2025-11-09"
    },
    colors: {
        primary: 0x0099FF,
        success: 0x00FF00,
        error: 0xFF0000,
        warning: 0xFFFF00,
        info: 0x0099FF,
        music: 0x1DB954,
        moderation: 0xFF6B6B,
        utility: 0x4ECDC4
    },
    defaults: {
        prefix: "/",
        language: "en",
        welcomeMessage: "🚀 Welcome {user} to {server}! Enjoy your stay among the stars! 🌌",
        goodbyeMessage: "👋 {user} has left our cosmic community. We'll miss you! 💫",
        levelUpMessage: "🎉 {user} leveled up to level {level}! Keep exploring! 🌠"
    },
    settings: {
        maxWarnings: 3,
        autoRole: "🚀 Explorer",
        modLogs: true,
        welcomeImages: true,
        xpRate: 1,
        musicQuality: "high"
    }
};

module.exports = config;