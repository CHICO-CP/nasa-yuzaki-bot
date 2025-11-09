const { SlashCommandBuilder } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    
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
            const embed = Embeds.error('Not in Voice Channel', 'I need to be in your voice channel to skip music!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            if (!client.musicSystem) {
                const embed = Embeds.error('No Music Playing', 'There is no music currently playing!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            const nowPlaying = client.musicSystem.getNowPlaying(interaction.guild.id);
            if (!nowPlaying) {
                const embed = Embeds.error('No Song Playing', 'There is no song currently playing to skip!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            // Saltar canción
            const skipped = client.musicSystem.skipSong(interaction.guild.id);
            
            if (skipped) {
                const embed = Embeds.music(
                    '⏭️ Song Skipped',
                    `**${nowPlaying.title}** has been skipped.\n**Skipped by:** ${interaction.user.tag}`,
                    client
                );
                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = Embeds.error('Skip Failed', 'Could not skip the current song.', client);
                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Skip command error:', error);
            const embed = Embeds.error(
                'Skip Failed', 
                'An error occurred while trying to skip the song.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};