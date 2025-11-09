const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Your question for the magic 8-ball')
                .setRequired(true)),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const question = interaction.options.getString('question');
        
        // Validar que es una pregunta
        if (!question.endsWith('?')) {
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.error)
                .setTitle('❌ Invalid Question')
                .setDescription('Please ask a proper question ending with a "?"')
                .setFooter({ 
                    text: `${client.config.bot.name} Fun`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();
            
            return interaction.editReply({ embeds: [embed] });
        }

        // Respuestas del magic 8-ball
        const answers = [
            // Respuestas positivas
            { response: "🎱 It is certain.", type: "positive" },
            { response: "🎱 It is decidedly so.", type: "positive" },
            { response: "🎱 Without a doubt.", type: "positive" },
            { response: "🎱 Yes - definitely.", type: "positive" },
            { response: "🎱 You may rely on it.", type: "positive" },
            { response: "🎱 As I see it, yes.", type: "positive" },
            { response: "🎱 Most likely.", type: "positive" },
            { response: "🎱 Outlook good.", type: "positive" },
            { response: "🎱 Yes.", type: "positive" },
            { response: "🎱 Signs point to yes.", type: "positive" },
            
            // Respuestas neutrales
            { response: "🎱 Reply hazy, try again.", type: "neutral" },
            { response: "🎱 Ask again later.", type: "neutral" },
            { response: "🎱 Better not tell you now.", type: "neutral" },
            { response: "🎱 Cannot predict now.", type: "neutral" },
            { response: "🎱 Concentrate and ask again.", type: "neutral" },
            
            // Respuestas negativas
            { response: "🎱 Don't count on it.", type: "negative" },
            { response: "🎱 My reply is no.", type: "negative" },
            { response: "🎱 My sources say no.", type: "negative" },
            { response: "🎱 Outlook not so good.", type: "negative" },
            { response: "🎱 Very doubtful.", type: "negative" }
        ];

        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        
        // Color basado en el tipo de respuesta
        const color = randomAnswer.type === 'positive' 
            ? client.config.colors.success 
            : randomAnswer.type === 'negative' 
            ? client.config.colors.error 
            : client.config.colors.warning;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🔮 Magic 8-Ball')
            .addFields(
                { name: '❓ Your Question', value: question, inline: false },
                { name: '🎱 Answer', value: randomAnswer.response, inline: false },
                { name: '📊 Certainty', value: this.getCertaintyLevel(randomAnswer.type), inline: true }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Fun • The magic 8-ball has spoken!`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },

    getCertaintyLevel(type) {
        const levels = {
            positive: "🟢 High",
            neutral: "🟡 Medium", 
            negative: "🔴 Low"
        };
        return levels[type];
    }
};