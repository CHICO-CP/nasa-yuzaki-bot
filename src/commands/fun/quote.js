const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Get an inspirational quote')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('Choose a quote category')
                .setRequired(false)
                .addChoices(
                    { name: 'Inspirational', value: 'inspirational' },
                    { name: 'Motivational', value: 'motivational' },
                    { name: 'Life', value: 'life' },
                    { name: 'Success', value: 'success' },
                    { name: 'Love', value: 'love' },
                    { name: 'Funny', value: 'funny' }
                )),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const category = interaction.options.getString('category') || 'inspirational';
        
        try {
            let quoteData;
            
            if (category === 'funny') {
                // Quotes graciosas de una API diferente
                const response = await axios.get('https://api.chucknorris.io/jokes/random');
                quoteData = {
                    content: response.data.value,
                    author: 'Chuck Norris',
                    category: 'funny'
                };
            } else {
                // Quotes inspiradoras
                const response = await axios.get('https://api.quotable.io/random');
                quoteData = {
                    content: response.data.content,
                    author: response.data.author,
                    category: response.data.tags[0] || 'inspirational'
                };
            }

            const embed = new EmbedBuilder()
                .setColor(this.getCategoryColor(category))
                .setTitle('💫 Inspirational Quote')
                .setDescription(`"${quoteData.content}"`)
                .addFields(
                    { name: '👤 Author', value: quoteData.author, inline: true },
                    { name: '📚 Category', value: this.formatCategory(quoteData.category), inline: true },
                    { name: '🌟 Share', value: 'Spread positivity today!', inline: true }
                )
                .setFooter({ 
                    text: `${client.config.bot.name} Fun • Use this quote to inspire others!`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Quote command error:', error);
            
            // Quotes de respaldo
            const fallbackQuotes = [
                {
                    content: "The only way to do great work is to love what you do.",
                    author: "Steve Jobs",
                    category: "inspirational"
                },
                {
                    content: "Innovation distinguishes between a leader and a follower.",
                    author: "Steve Jobs", 
                    category: "success"
                },
                {
                    content: "Life is what happens when you're busy making other plans.",
                    author: "John Lennon",
                    category: "life"
                }
            ];
            
            const fallbackQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            
            const embed = new EmbedBuilder()
                .setColor(this.getCategoryColor(fallbackQuote.category))
                .setTitle('💫 Inspirational Quote')
                .setDescription(`"${fallbackQuote.content}"`)
                .addFields(
                    { name: '👤 Author', value: fallbackQuote.author, inline: true },
                    { name: '📚 Category', value: this.formatCategory(fallbackQuote.category), inline: true },
                    { name: '🌟 Share', value: 'Spread positivity today!', inline: true }
                )
                .setFooter({ 
                    text: `${client.config.bot.name} Fun • Fallback quote`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },

    getCategoryColor(category) {
        const colors = {
            inspirational: 0x4CAF50,
            motivational: 0xFF9800,
            life: 0x2196F3,
            success: 0x9C27B0,
            love: 0xE91E63,
            funny: 0xFFEB3B
        };
        return colors[category] || 0x0099FF;
    },

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
};