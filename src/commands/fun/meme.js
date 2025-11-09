const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme from Reddit')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('Choose a meme category')
                .setRequired(false)
                .addChoices(
                    { name: 'Popular', value: 'memes' },
                    { name: 'Dank Memes', value: 'dankmemes' },
                    { name: 'Programmer Humor', value: 'ProgrammerHumor' },
                    { name: 'Wholesome', value: 'wholesomememes' },
                    { name: 'Animemes', value: 'animemes' }
                )),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const category = interaction.options.getString('category') || 'memes';
        
        try {
            const response = await axios.get(`https://www.reddit.com/r/${category}/hot.json?limit=100`);
            const posts = response.data.data.children;
            
            // Filtrar posts que son imágenes y tienen buen score
            const validPosts = posts.filter(post => {
                const data = post.data;
                return !data.over_18 && 
                       data.post_hint === 'image' && 
                       data.url && 
                       data.score > 50;
            });

            if (validPosts.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.colors.error)
                    .setTitle('❌ No Memes Found')
                    .setDescription('Could not find any suitable memes. Try a different category!')
                    .setFooter({ 
                        text: `${client.config.bot.name} Fun`,
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed] });
            }

            // Seleccionar meme aleatorio
            const randomPost = validPosts[Math.floor(Math.random() * validPosts.length)].data;
            
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.primary)
                .setTitle(`😂 ${randomPost.title}`)
                .setURL(`https://reddit.com${randomPost.permalink}`)
                .setImage(randomPost.url)
                .addFields(
                    { name: 'Subreddit', value: `r/${randomPost.subreddit}`, inline: true },
                    { name: '👍 Upvotes', value: `${randomPost.ups.toLocaleString()}`, inline: true },
                    { name: '💬 Comments', value: `${randomPost.num_comments.toLocaleString()}`, inline: true }
                )
                .setFooter({ 
                    text: `Powered by Reddit • Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Meme command error:', error);
            
            // Meme de respaldo en caso de error
            const fallbackMemes = [
                {
                    title: "When the code finally works",
                    image: "https://i.imgflip.com/30b1gx.jpg",
                    upvotes: "999",
                    comments: "42"
                },
                {
                    title: "Programmer life",
                    image: "https://i.imgflip.com/1g8my4.jpg", 
                    upvotes: "750",
                    comments: "35"
                }
            ];
            
            const fallbackMeme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
            
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.primary)
                .setTitle(`😂 ${fallbackMeme.title}`)
                .setImage(fallbackMeme.image)
                .addFields(
                    { name: 'Subreddit', value: 'r/memes', inline: true },
                    { name: '👍 Upvotes', value: fallbackMeme.upvotes, inline: true },
                    { name: '💬 Comments', value: fallbackMeme.comments, inline: true }
                )
                .setFooter({ 
                    text: `Fallback meme • Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};