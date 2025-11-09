const { SlashCommandBuilder, EmbedBuilder, version: discordVersion } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Get detailed information about the bot'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        // Estadísticas del bot
        const guilds = client.guilds.cache.size;
        const users = client.users.cache.size;
        const channels = client.channels.cache.size;
        const commands = client.slashCommands.size;

        // Uso de memoria
        const memoryUsage = process.memoryUsage();
        const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
        const memoryPercent = ((usedMemory / totalMemory) * 100).toFixed(2);

        // Uptime
        const uptime = this.formatUptime(process.uptime());

        // Estadísticas del sistema
        const cpuUsage = await this.getCPUUsage();
        const platform = os.platform();
        const arch = os.arch();

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle('🤖 Nasa Yuzaki - Bot Information')
            .setThumbnail(client.user.displayAvatarURL({ size: 512 }))
            .setDescription(`Professional Discord bot with advanced features for server management, music, moderation, and utility.`)
            .addFields(
                {
                    name: '📊 Bot Statistics',
                    value: [
                        `**Servers:** ${guilds.toLocaleString()}`,
                        `**Users:** ${users.toLocaleString()}`,
                        `**Channels:** ${channels.toLocaleString()}`,
                        `**Commands:** ${commands.toLocaleString()}`,
                        `**Uptime:** ${uptime}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚙️ System Information',
                    value: [
                        `**Memory:** ${usedMemory}MB / ${totalMemory}MB (${memoryPercent}%)`,
                        `**CPU Usage:** ${cpuUsage}%`,
                        `**Platform:** ${platform}`,
                        `**Architecture:** ${arch}`,
                        `**Node.js:** ${process.version}`,
                        `**Discord.js:** v${discordVersion}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔧 Bot Details',
                    value: [
                        `**Version:** ${client.config.bot.version}`,
                        `**Developer:** ${client.config.bot.developer}`,
                        `**Created:** ${client.config.bot.createdAt}`,
                        `**Prefix:** ${client.config.defaults.prefix}`,
                        `**Library:** Discord.js v${discordVersion}`,
                        `**Language:** JavaScript/Node.js`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🌐 Links & Support',
                    value: [
                        `[GitHub](${client.config.bot.github}) - Source code and documentation`,
                        `[Telegram Channel](${client.config.bot.telegramChannel}) - Updates and announcements`,
                        `[Telegram Group](${client.config.bot.telegramGroup}) - Community support`,
                        `[Support Server](${client.config.bot.supportServer}) - Discord support`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎯 Features',
                    value: [
                        '✅ Advanced Moderation System',
                        '✅ Music Playback & Queue',
                        '✅ Level & XP System',
                        '✅ Ticket System',
                        '✅ Welcome/Goodbye Messages',
                        '✅ Utility Commands',
                        '✅ Fun & Entertainment',
                        '✅ Custom Configuration'
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} v${client.config.bot.version} | Developed with ❤️ by ${client.config.bot.developer}`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    formatUptime(seconds) {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0) parts.push(`${secs}s`);

        return parts.join(' ') || '0s';
    },

    async getCPUUsage() {
        const startUsage = process.cpuUsage();
        await new Promise(resolve => setTimeout(resolve, 100));
        const endUsage = process.cpuUsage(startUsage);
        
        const userUsage = endUsage.user / 1000000; // Convert to milliseconds
        const systemUsage = endUsage.system / 1000000;
        const totalUsage = userUsage + systemUsage;
        
        return Math.min(100, (totalUsage / 100) * 100).toFixed(1); // Cap at 100%
    }
};