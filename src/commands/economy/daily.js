const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily coins reward'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        
        const economyData = await this.getEconomyData(userId, guildId, client);
        const now = Date.now();
        const lastDaily = economyData.lastDaily;
        
        // Verificar si ya reclamó hoy
        if (lastDaily) {
            const lastDailyDate = new Date(lastDaily);
            const currentDate = new Date(now);
            
            // Verificar si es el mismo día
            if (lastDailyDate.toDateString() === currentDate.toDateString()) {
                const nextDaily = new Date(lastDailyDate);
                nextDaily.setDate(nextDaily.getDate() + 1);
                nextDaily.setHours(0, 0, 0, 0);
                
                const embed = new EmbedBuilder()
                    .setColor(client.config.colors.error)
                    .setTitle('❌ Already Claimed')
                    .setDescription(`You've already claimed your daily reward today!\n\n**Next daily available:** <t:${Math.floor(nextDaily.getTime() / 1000)}:R>`)
                    .setFooter({ 
                        text: `${client.config.bot.name} Economy`,
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed] });
            }
            
            // Verificar streak
            const yesterday = new Date(currentDate);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDailyDate.toDateString() === yesterday.toDateString()) {
                // Streak continuo
                economyData.dailyStreak++;
            } else if (lastDailyDate.toDateString() !== currentDate.toDateString()) {
                // Streak roto
                economyData.dailyStreak = 1;
            }
        } else {
            // Primera vez
            economyData.dailyStreak = 1;
        }
        
        // Calcular recompensa
        const baseReward = 100;
        const streakBonus = Math.min(economyData.dailyStreak * 10, 200); // Máximo 200 de bonus por streak
        const randomBonus = Math.floor(Math.random() * 51); // 0-50 bonus aleatorio
        const totalReward = baseReward + streakBonus + randomBonus;
        
        // Actualizar datos
        economyData.cash += totalReward;
        economyData.lastDaily = now;
        economyData.totalEarned += totalReward;
        
        await client.db.set(`economy_${guildId}_${userId}`, economyData);
        
        const embed = new EmbedBuilder()
            .setColor(client.config.colors.success)
            .setTitle('🎉 Daily Reward Claimed!')
            .setDescription(`You've received your daily reward!`)
            .addFields(
                {
                    name: '💰 Reward Breakdown',
                    value: [
                        `**Base Reward:** ${baseReward.toLocaleString()} coins`,
                        `**Streak Bonus:** ${streakBonus.toLocaleString()} coins (${economyData.dailyStreak} days)`,
                        `**Lucky Bonus:** ${randomBonus.toLocaleString()} coins`,
                        `**Total:** ${totalReward.toLocaleString()} coins`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📊 Updated Balance',
                    value: [
                        `**Cash:** ${economyData.cash.toLocaleString()} coins`,
                        `**Bank:** ${economyData.bank.toLocaleString()} coins`,
                        `**Net Worth:** ${(economyData.cash + economyData.bank).toLocaleString()} coins`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔥 Streak Info',
                    value: [
                        `**Current Streak:** ${economyData.dailyStreak} days`,
                        `**Next Daily:** <t:${Math.floor(now + 86400000) / 1000}:R>`,
                        `**Max Streak Bonus:** 200 coins`
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Economy • Come back tomorrow for more rewards!`,
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
    }
};