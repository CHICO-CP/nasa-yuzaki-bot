const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and connection status'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        // Primer ping (medición inicial)
        const startTime = Date.now();
        const initialReply = await interaction.fetchReply();
        const apiLatency = Date.now() - startTime;
        
        // Latencia del WebSocket
        const wsLatency = client.ws.ping;

        // Segunda medición más precisa
        const secondStart = Date.now();
        await interaction.editReply('Calculating precise latency...');
        const preciseLatency = Date.now() - secondStart;

        // Estado basado en la latencia
        const getStatus = (latency) => {
            if (latency < 100) return '🟢 Excellent';
            if (latency < 200) return '🟡 Good';
            if (latency < 300) return '🟠 Average';
            return '🔴 Poor';
        };

        // Estadísticas de la base de datos (si existe)
        const dbStatus = await this.checkDatabaseStatus(client);

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle('🏓 Bot Latency & Status')
            .setDescription('Real-time connection status and performance metrics')
            .addFields(
                {
                    name: '📡 Connection Latency',
                    value: [
                        `**WebSocket:** ${wsLatency}ms - ${getStatus(wsLatency)}`,
                        `**API Response:** ${apiLatency}ms - ${getStatus(apiLatency)}`,
                        `**Precise Latency:** ${preciseLatency}ms - ${getStatus(preciseLatency)}`,
                        `**Average:** ${Math.round((wsLatency + apiLatency + preciseLatency) / 3)}ms`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '⚙️ System Status',
                    value: [
                        `**Bot Status:** 🟢 Online`,
                        `**Uptime:** ${this.formatUptime(client.uptime)}`,
                        `**Server Count:** ${client.guilds.cache.size}`,
                        `**User Cache:** ${client.users.cache.size}`,
                        `**Database:** ${dbStatus}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📊 Performance',
                    value: [
                        `**Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                        `**Node.js:** ${process.version}`,
                        `**Discord.js:** v${require('discord.js').version}`,
                        `**Platform:** ${process.platform}`
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Utility | Real-time monitoring`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
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

    async checkDatabaseStatus(client) {
        try {
            const startTime = Date.now();
            // Intentar una operación simple de la base de datos
            await client.db.set('ping_test', Date.now());
            await client.db.delete('ping_test');
            const dbLatency = Date.now() - startTime;
            
            return `🟢 Connected (${dbLatency}ms)`;
        } catch (error) {
            return '🔴 Disconnected';
        }
    }
};