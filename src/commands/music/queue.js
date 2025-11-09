const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            if (!client.musicSystem) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.colors.error)
                    .setTitle('❌ No Music Queue')
                    .setDescription('There is no music queue currently active!')
                    .setFooter({ 
                        text: `${client.config.bot.name} Music`,
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const queue = client.musicSystem.getQueue(interaction.guild.id);
            const nowPlaying = client.musicSystem.getNowPlaying(interaction.guild.id);

            if (queue.songs.length === 0 && !nowPlaying) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.colors.info)
                    .setTitle('🎵 Music Queue')
                    .setDescription('The queue is currently empty!')
                    .setFooter({ 
                        text: `${client.config.bot.name} Music`,
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor(client.config.colors.music)
                .setTitle('🎵 Music Queue')
                .setFooter({ 
                    text: `${client.config.bot.name} Music | ${queue.songs.length} songs in queue`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            // Canción actual
            if (nowPlaying) {
                embed.addFields({
                    name: '🎶 Now Playing',
                    value: `**${nowPlaying.title}**\nDuration: ${nowPlaying.duration}\nRequested by: ${nowPlaying.requestedBy}`,
                    inline: false
                });
            }

            // Próximas canciones (máximo 10)
            if (queue.songs.length > 0) {
                const queueList = queue.songs.slice(0, 10).map((song, index) => {
                    return `**${index + 1}.** ${song.title} • ${song.duration} • ${song.requestedBy}`;
                }).join('\n');

                embed.addFields({
                    name: `📜 Up Next ${queue.songs.length > 10 ? `(Showing 10 of ${queue.songs.length})` : ''}`,
                    value: queueList || 'No songs in queue',
                    inline: false
                });
            }

            // Información adicional
            const queueInfo = [];
            if (queue.loop) queueInfo.push('🔁 Loop: Enabled');
            queueInfo.push(`🔊 Volume: ${queue.volume}%`);
            queueInfo.push(`🎵 Total Songs: ${queue.songs.length + (nowPlaying ? 1 : 0)}`);

            embed.addFields({
                name: '⚙️ Queue Settings',
                value: queueInfo.join(' • '),
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Queue command error:', error);
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.error)
                .setTitle('❌ Queue Error')
                .setDescription('An error occurred while fetching the queue.')
                .setFooter({ 
                    text: `${client.config.bot.name} Music`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};