const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    async execute(guild, client) {
        console.log(`✅ Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);

        // Buscar canal de sistema para enviar mensaje
        const systemChannel = guild.systemChannel || guild.channels.cache.find(channel => 
            channel.type === 0 && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
        );

        if (systemChannel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(client.config.colors.success)
                .setTitle('🚀 Nasa Yuzaki - Thank you for adding me!')
                .setDescription(`
Hello **${guild.name}**! I'm **Nasa Yuzaki**, your professional Discord bot.

**Quick Start:**
• Use \`/help\` to see all available commands
• Configure settings with \`/config\` commands
• Set up welcome messages with \`/setwelcome\`

**Main Features:**
🎵 **Music System** - High quality audio playback
🛡️ **Moderation** - Advanced moderation tools
📊 **Level System** - XP and ranking system
🎯 **Utility** - Server management tools
🎮 **Fun Commands** - Entertainment for your server

**Support & Links:**
[GitHub](${client.config.bot.github}) • [Telegram Channel](${client.config.bot.telegramChannel}) • [Community](${client.config.bot.telegramGroup})

Developed with ❤️ by **${client.config.bot.developer}**
                `)
                .setFooter({ 
                    text: `Nasa Yuzaki v${client.config.bot.version} | Type /help for commands`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            try {
                await systemChannel.send({ embeds: [welcomeEmbed] });
            } catch (error) {
                console.log(`Could not send welcome message to ${guild.name}`);
            }
        }

        // Log en consola
        console.log(`📊 Guild Stats: ${guild.memberCount} members, ${guild.channels.cache.size} channels, ${guild.roles.cache.size} roles`);
    }
};