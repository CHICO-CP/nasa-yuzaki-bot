const { SlashCommandBuilder } = require('discord.js');
const Embeds = require('../../utils/embeds');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause or resume the current music'),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            const embed = Embeds.error('Voice Channel Required', 'You need to be in a voice channel to use music commands!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        // Verificar que el bot está en el mismo canal
        const botVoiceChannel = interaction.guild.members.me.voice.channel;
        if (!botVoiceChannel || botVoiceChannel.id !== voiceChannel.id) {
            const embed = Embeds.error('Not in Voice Channel', 'I need to be in your voice channel to control music!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            if (!client.musicSystem) {
                const embed = Embeds.error('No Music Playing', 'There is no music currently playing!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            const player = client.musicSystem.players.get(interaction.guild.id);
            if (!player) {
                const embed = Embeds.error('No Player Found', 'No music player is currently active!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            const nowPlaying = client.musicSystem.getNowPlaying(interaction.guild.id);
            if (!nowPlaying) {
                const embed = Embeds.error('No Song Playing', 'There is no song currently playing!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            let embed;
            if (player.state.status === AudioPlayerStatus.Playing) {
                player.pause();
                embed = Embeds.music(
                    '⏸️ Music Paused',
                    `**${nowPlaying.title}** has been paused.\n**Paused by:** ${interaction.user.tag}\n\nUse \`/pause\` again to resume.`,
                    client
                );
            } else if (player.state.status === AudioPlayerStatus.Paused) {
                player.unpause();
                embed = Embeds.music(
                    '▶️ Music Resumed',
                    `**${nowPlaying.title}** has been resumed.\n**Resumed by:** ${interaction.user.tag}`,
                    client
                );
            } else {
                embed = Embeds.error('Invalid State', 'The music player is in an invalid state.', client);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Pause command error:', error);
            const embed = Embeds.error(
                'Pause/Resume Failed', 
                'An error occurred while trying to pause/resume the music.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};