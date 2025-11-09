const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            if (!client.musicSystem) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.colors.error)
                    .setTitle('❌ No Music Playing')
                    .setDescription('There is no music currently playing!')
                    .setFooter({ 
                        text: `${client.config.bot.name} Music`,
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const nowPlaying = client.musicSystem.getNowPlaying(interaction.guild.id);
            if (!nowPlaying) {
                const embed = new EmbedBuilder()
                    .setColor(client.config.colors.info)
                    .setTitle('🎵 Now Playing')
                    .setDescription('No song is currently playing!')
                    .setFooter({ 
                        text: `${client.config.bot.name} Music`,
                        iconURL: client.user.displayAvatarURL() 
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const queue = client.musicSystem.getQueue(interaction.guild.id);
            const player = client.musicSystem.players.get(interaction.guild.id);

            const embed = new EmbedBuilder()
                .setColor(client.config.colors.music)
                .setTitle('🎶 Now Playing')
                .setDescription(`**${nowPlaying.title}**`)
                .setThumbnail(nowPlaying.thumbnail)
                .addFields(
                    { name: 'Duration', value: nowPlaying.duration, inline: true },
                    { name: 'Requested By', value: nowPlaying.requestedBy, inline: true },
                    { name: 'Queue', value: `${queue.songs.length} songs`, inline: true },
                    { name: 'Volume', value: `${queue.volume}%`, inline: true },
                    { name: 'Status', value: player?.state.status === 'paused' ? '⏸️ Paused' : '▶️ Playing', inline: true },
                    { name: 'Loop', value: queue.loop ? '🔁 On' : '➡️ Off', inline: true }
                )
                .setFooter({ 
                    text: `${client.config.bot.name} Music | Use /queue to see upcoming songs`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('NowPlaying command error:', error);
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.error)
                .setTitle('❌ Now Playing Error')
                .setDescription('An error occurred while fetching the current song.')
                .setFooter({ 
                    text: `${client.config.bot.name} Music`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    }
};