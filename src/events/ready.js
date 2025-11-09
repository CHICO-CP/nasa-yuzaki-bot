const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const startupTime = new Date().toLocaleString();
        
        console.log(`
🚀 NASA YUZAKI BOT ACTIVATED
================================
✅ Logged in as: ${client.user.tag}
✅ Bot ID: ${client.user.id}
✅ Servers: ${client.guilds.cache.size}
✅ Users: ${client.users.cache.size}
✅ Commands: ${client.slashCommands.size}
✅ Startup Time: ${startupTime}
✅ Version: ${client.config.bot.version}
✅ Developer: ${client.config.bot.developer}
✅ Status: Operational
================================
🌐 GitHub: ${client.config.bot.github}
📱 Telegram: ${client.config.bot.telegramChannel}
👥 Community: ${client.config.bot.telegramGroup}
        `);

        // Estatus rotativo
        const activities = [
            { name: '/help | Exploring the Universe', type: ActivityType.Watching },
            { name: `${client.guilds.cache.size} servers`, type: ActivityType.Listening },
            { name: 'Nasa Yuzaki v2.0.0', type: ActivityType.Playing },
            { name: 'Ghost Developer', type: ActivityType.Watching }
        ];

        let currentActivity = 0;
        
        setInterval(() => {
            client.user.setPresence({
                activities: [activities[currentActivity]],
                status: 'online'
            });
            currentActivity = (currentActivity + 1) % activities.length;
        }, 30000);

        // Mensaje de log en canal específico
        const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);
        if (logChannel) {
            const startupEmbed = {
                color: client.config.colors.success,
                title: '🚀 Nasa Yuzaki - System Online',
                description: 'Bot successfully initialized and ready for cosmic operations!',
                fields: [
                    { name: 'Version', value: client.config.bot.version, inline: true },
                    { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Developer', value: client.config.bot.developer, inline: true },
                    { name: 'Uptime', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: 'GitHub', value: `[Click Here](${client.config.bot.github})`, inline: true },
                    { name: 'Telegram', value: `[Channel](${client.config.bot.telegramChannel})`, inline: true }
                ],
                footer: { 
                    text: `Nasa Yusaki v${client.config.bot.version} | By ${client.config.bot.developer}`,
                    iconURL: client.user.displayAvatarURL() 
                },
                timestamp: new Date()
            };
            
            await logChannel.send({ embeds: [startupEmbed] });
        }
    }
};