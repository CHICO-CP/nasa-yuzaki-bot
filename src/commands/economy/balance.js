const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s balance')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check balance for')
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
                    text: `${client.config.bot.name} Economy`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        // Obtener datos de economía
        const economyData = await this.getEconomyData(targetUser.id, interaction.guild.id, client);
        const rank = await this.getUserRank(targetUser.id, interaction.guild.id, client);

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle(`💰 Balance - ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                {
                    name: '💵 Cash',
                    value: `**${economyData.cash.toLocaleString()}** coins`,
                    inline: true
                },
                {
                    name: '🏦 Bank',
                    value: `**${economyData.bank.toLocaleString()}** coins`,
                    inline: true
                },
                {
                    name: '💳 Net Worth',
                    value: `**${(economyData.cash + economyData.bank).toLocaleString()}** coins`,
                    inline: true
                }
            )
            .addFields(
                {
                    name: '📊 Statistics',
                    value: [
                        `**Rank:** #${rank.position} of ${rank.total}`,
                        `**Daily Streak:** ${economyData.dailyStreak} days`,
                        `**Last Daily:** ${economyData.lastDaily ? `<t:${Math.floor(economyData.lastDaily / 1000)}:R>` : 'Never'}`,
                        `**Total Earned:** ${economyData.totalEarned.toLocaleString()} coins`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎯 Achievements',
                    value: this.getAchievements(economyData),
                    inline: true
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Economy • Use /daily to claim free coins!`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    async getEconomyData(userId, guildId, client) {
        const data = await client.db.get(`economy_${guildId}_${userId}`) || {
            cash: 100,
            bank: 0,
            bankSpace: 1000,
            lastDaily: null,
            dailyStreak: 0,
            totalEarned: 0,
            joinedAt: Date.now()
        };
        return data;
    },

    async getUserRank(userId, guildId, client) {
        const allData = await client.db.all();
        const economyUsers = [];

        for (const data of allData) {
            if (data.ID.startsWith(`economy_${guildId}_`)) {
                const userId = data.ID.split('_')[2];
                const userData = data.data;
                economyUsers.push({
                    userId,
                    netWorth: userData.cash + userData.bank,
                    ...userData
                });
            }
        }

        // Ordenar por net worth
        economyUsers.sort((a, b) => b.netWorth - a.netWorth);
        
        const position = economyUsers.findIndex(user => user.userId === userId) + 1;
        
        return {
            position: position || 1,
            total: economyUsers.length
        };
    },

    getAchievements(economyData) {
        const achievements = [];
        const netWorth = economyData.cash + economyData.bank;

        if (netWorth >= 1000) achievements.push('💰 Thousandaire');
        if (netWorth >= 10000) achievements.push('💎 Ten Thousandaire');
        if (netWorth >= 100000) achievements.push('👑 Hundred Thousandaire');
        if (netWorth >= 1000000) achievements.push('🎩 Millionaire');
        if (economyData.dailyStreak >= 7) achievements.push('🔥 Weekly Streak');
        if (economyData.dailyStreak >= 30) achievements.push('⭐ Monthly Streak');
        if (economyData.totalEarned >= 5000) achievements.push('🏆 Big Earner');

        return achievements.length > 0 
            ? achievements.join('\n')
            : 'No achievements yet!';
    }
};