const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get detailed information about a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.error)
                .setTitle('❌ User Not Found')
                .setDescription('The specified user is not in this server.')
                .setFooter({ 
                    text: `${client.config.bot.name} Utility`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        // Obtener información de niveles si existe
        const levelData = await client.db.get(`levels_${interaction.guild.id}_${targetUser.id}`) || { level: 1, xp: 0, totalXP: 0 };
        
        // Obtener badges basados en roles y estado
        const badges = this.getUserBadges(targetMember, targetUser);

        // Crear embed de información
        const embed = new EmbedBuilder()
            .setColor(targetMember.displayHexColor || client.config.colors.primary)
            .setTitle(`👤 User Information - ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL({ size: 512 }))
            .addFields(
                {
                    name: '📝 Basic Information',
                    value: [
                        `**Username:** ${targetUser.username}`,
                        `**Discriminator:** #${targetUser.discriminator}`,
                        `**ID:** ${targetUser.id}`,
                        `**Bot:** ${targetUser.bot ? '🤖 Yes' : '❌ No'}`,
                        `**Badges:** ${badges.join(' ') || 'None'}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📅 Account Information',
                    value: [
                        `**Created:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
                        `**Joined:** <t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`,
                        `**Account Age:** ${this.getTimeDifference(targetUser.createdTimestamp)}`,
                        `**Server Membership:** ${this.getTimeDifference(targetMember.joinedTimestamp)}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎯 Server Information',
                    value: [
                        `**Nickname:** ${targetMember.nickname || 'None'}`,
                        `**Highest Role:** ${targetMember.roles.highest}`,
                        `**Roles:** ${targetMember.roles.cache.size - 1}`, // Excluir @everyone
                        `**Level:** ${levelData.level}`,
                        `**XP:** ${levelData.xp}/${levelData.level * 100 * 1.5}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🛡️ Permissions',
                    value: [
                        `**Administrator:** ${targetMember.permissions.has('Administrator') ? '✅' : '❌'}`,
                        `**Moderator:** ${targetMember.permissions.has('ManageMessages') ? '✅' : '❌'}`,
                        `**Manage Server:** ${targetMember.permissions.has('ManageGuild') ? '✅' : '❌'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: [
                        `**Presence:** ${targetMember.presence?.status || 'offline'}`,
                        `**Boosting:** ${targetMember.premiumSince ? '✅ Since <t:' + Math.floor(targetMember.premiumSinceTimestamp / 1000) + ':R>' : '❌'}`,
                        `**Timeout:** ${targetMember.communicationDisabledUntil ? '✅ Until <t:' + Math.floor(targetMember.communicationDisabledUntilTimestamp / 1000) + ':R>' : '❌'}`
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Utility | Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    getUserBadges(member, user) {
        const badges = [];

        // Badges de Discord
        if (user.flags) {
            if (user.flags.has('Staff')) badges.push('👑');
            if (user.flags.has('Partner')) badges.push('🤝');
            if (user.flags.has('Hypesquad')) badges.push('🏠');
            if (user.flags.has('BugHunterLevel1')) badges.push('🐛');
            if (user.flags.has('BugHunterLevel2')) badges.push('🐛');
            if (user.flags.has('HypeSquadOnlineHouse1')) badges.push('⚔️');
            if (user.flags.has('HypeSquadOnlineHouse2')) badges.push('💎');
            if (user.flags.has('HypeSquadOnlineHouse3')) badges.push('🔮');
            if (user.flags.has('PremiumEarlySupporter')) badges.push('🎉');
            if (user.flags.has('VerifiedBot')) badges.push('🤖');
        }

        // Badges del servidor
        if (member.permissions.has('Administrator')) badges.push('⚡');
        if (member.permissions.has('ManageGuild')) badges.push('🔧');
        if (member.permissions.has('ManageMessages')) badges.push('🛡️');
        if (member.premiumSince) badges.push('🌟');

        return badges;
    },

    getTimeDifference(timestamp) {
        const diff = Date.now() - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) return `${years} year${years !== 1 ? 's' : ''}`;
        if (months > 0) return `${months} month${months !== 1 ? 's' : ''}`;
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
};