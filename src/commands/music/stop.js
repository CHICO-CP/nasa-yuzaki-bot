const { SlashCommandBuilder } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),
    
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
            const embed = Embeds.error('Not in Voice Channel', 'I need to be in your voice channel to stop music!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            if (!client.musicSystem) {
                const embed = Embeds.error('No Music Playing', 'There is no music currently playing!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            // Detener música y limpiar cola
            const queue = client.musicSystem.getQueue(interaction.guild.id);
            const songsCleared = client.musicSystem.clearQueue(interaction.guild.id);
            client.musicSystem.destroyConnection(interaction.guild.id);

            const embed = Embeds.music(
                '⏹️ Music Stopped',
                `Music has been stopped and the queue has been cleared.\n**Songs removed:** ${songsCleared}\n**Stopped by:** ${interaction.user.tag}`,
                client
            );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Stop command error:', error);
            const embed = Embeds.error(
                'Stop Failed', 
                'An error occurred while trying to stop the music.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};