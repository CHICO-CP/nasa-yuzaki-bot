const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        // Buscar canal de despedidas
        const goodbyeChannel = member.guild.channels.cache.find(
            channel => channel.name === 'goodbye' || channel.name === 'despedidas' || channel.name === '👋-goodbye'
        );

        if (!goodbyeChannel) return;

        const goodbyeEmbed = new EmbedBuilder()
            .setColor(client.config.colors.warning)
            .setTitle('👋 Member Left - Miembro Salió')
            .setDescription(`${member.user.tag} has left our cosmic community.`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { 
                    name: '📅 Account Created', 
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true 
                },
                { 
                    name: '📅 Joined Server', 
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                    inline: true 
                },
                { 
                    name: '👥 Members Left', 
                    value: `${member.guild.memberCount}`,
                    inline: true 
                }
            )
            .setFooter({ 
                text: `We'll miss you! • ${client.config.bot.name}`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
    }
};