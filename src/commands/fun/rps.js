const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors against the bot')
        .addStringOption(option =>
            option
                .setName('choice')
                .setDescription('Your choice')
                .setRequired(true)
                .addChoices(
                    { name: '🪨 Rock', value: 'rock' },
                    { name: '📄 Paper', value: 'paper' },
                    { name: '✂️ Scissors', value: 'scissors' }
                )),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const userChoice = interaction.options.getString('choice');
        const botChoice = this.getRandomChoice();
        
        const result = this.determineWinner(userChoice, botChoice);
        
        const embed = new EmbedBuilder()
            .setColor(this.getResultColor(result))
            .setTitle('🎮 Rock Paper Scissors')
            .setDescription(`Let's see who wins!`)
            .addFields(
                { name: '👤 Your Choice', value: this.getChoiceEmoji(userChoice), inline: true },
                { name: '🤖 My Choice', value: this.getChoiceEmoji(botChoice), inline: true },
                { name: '🎯 Result', value: this.getResultMessage(result), inline: true }
            )
            .addFields(
                { name: '📊 Statistics', value: await this.updateStats(interaction.user.id, result, client), inline: false }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Fun • Best of luck next time!`,
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        // Botones para jugar otra vez
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rps_rock')
                    .setLabel('🪨 Rock')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rps_paper')
                    .setLabel('📄 Paper')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rps_scissors')
                    .setLabel('✂️ Scissors')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
        });
    },

    getRandomChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        return choices[Math.floor(Math.random() * choices.length)];
    },

    determineWinner(user, bot) {
        if (user === bot) return 'tie';
        
        const winningConditions = {
            'rock': 'scissors',
            'paper': 'rock', 
            'scissors': 'paper'
        };
        
        return winningConditions[user] === bot ? 'win' : 'lose';
    },

    getChoiceEmoji(choice) {
        const emojis = {
            'rock': '🪨 Rock',
            'paper': '📄 Paper', 
            'scissors': '✂️ Scissors'
        };
        return emojis[choice];
    },

    getResultMessage(result) {
        const messages = {
            'win': '🎉 You win!',
            'lose': '😞 You lose!',
            'tie': '🤝 It\'s a tie!'
        };
        return messages[result];
    },

    getResultColor(result) {
        const colors = {
            'win': client.config.colors.success,
            'lose': client.config.colors.error,
            'tie': client.config.colors.warning
        };
        return colors[result];
    },

    async updateStats(userId, result, client) {
        const stats = await client.db.get(`rps_stats_${userId}`) || { wins: 0, losses: 0, ties: 0, total: 0 };
        
        stats.total++;
        if (result === 'win') stats.wins++;
        if (result === 'lose') stats.losses++;
        if (result === 'tie') stats.ties++;
        
        await client.db.set(`rps_stats_${userId}`, stats);
        
        const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;
        
        return [
            `🏆 Wins: ${stats.wins}`,
            `💔 Losses: ${stats.losses}`,
            `🤝 Ties: ${stats.ties}`,
            `📈 Win Rate: ${winRate}%`
        ].join('\n');
    }
};