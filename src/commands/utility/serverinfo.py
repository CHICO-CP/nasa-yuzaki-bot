const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get detailed information about the server'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const guild = interaction.guild;
        
        // Estadísticas del servidor
        const totalMembers = guild.memberCount;
        const humanMembers = guild.members.cache.filter(member => !member.user.bot).size;
        const botMembers = totalMembers - humanMembers;
        
        const onlineMembers = guild.members.cache.filter(member => 
            member.presence?.status === 'online' || 
            member.presence?.status === 'idle' || 
            member.presence?.status === 'dnd'
        ).size;

        const channels = guild.channels.cache;
        const textChannels = channels.filter(ch => ch.type === 0).size;
        const voiceChannels = channels.filter(ch => ch.type === 2).size;
        const categoryChannels = channels.filter(ch => ch.type === 4).size;
        
        const roles = guild.roles.cache.size - 1; // Excluir @everyone
        const emojis = guild.emojis.cache;
        const staticEmojis = emojis.filter(e => !e.animated).size;
        const animatedEmojis = emojis.filter(e => e.animated).size;

        // Nivel de verificación
        const verificationLevels = {
            NONE: 'None',
            LOW: 'Low',
            MEDIUM: 'Medium',
            HIGH: 'High',
            VERY_HIGH: 'Highest'
        };

        // Características del servidor
        const features = guild.features.map(feature => 
            feature.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        );

        const embed = new EmbedBuilder()
            .setColor(guild.roles.highest.color || client.config.colors.primary)
            .setTitle(`📊 Server Information - ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 512 }))
            .setDescription(guild.description || 'No description set')
            .addFields(
                {
                    name: '👑 Server Owner',
                    value: `<@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: '🆔 Server ID',
                    value: guild.id,
                    inline: true
                },
                {
                    name: '📅 Created',
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: '👥 Members',
                    value: [
                        `**Total:** ${totalMembers.toLocaleString()}`,
                        `**Humans:** ${humanMembers.toLocaleString()}`,
                        `**Bots:** ${botMembers.toLocaleString()}`,
                        `**Online:** ${onlineMembers.toLocaleString()}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📚 Channels',
                    value: [
                        `**Text:** ${textChannels}`,
                        `**Voice:** ${voiceChannels}`,
                        `**Categories:** ${categoryChannels}`,
                        `**Total:** ${channels.size}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎨 Server Stats',
                    value: [
                        `**Roles:** ${roles}`,
                        `**Emojis:** ${emojis.size}`,
                        `**Static:** ${staticEmojis}`,
                        `**Animated:** ${animatedEmojis}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🛡️ Server Settings',
                    value: [
                        `**Verification:** ${verificationLevels[guild.verificationLevel]}`,
                        `**Boost Level:** ${guild.premiumTier}`,
                        `**Boost Count:** ${guild.premiumSubscriptionCount || 0}`,
                        `**AFK Timeout:** ${guild.afkTimeout / 60}min`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🌟 Server Features',
                    value: features.length > 0 
                        ? features.slice(0, 5).join(', ') + (features.length > 5 ? `... (+${features.length - 5} more)` : '')
                        : 'No special features',
                    inline: false
                }
            )
            .setImage(guild.bannerURL({ size: 1024 }))
            .setFooter({ 
                text: `${client.config.bot.name} Utility | Server ID: ${guild.id}`,
                iconURL: guild.iconURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};