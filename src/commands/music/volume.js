const { SlashCommandBuilder } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the music volume')
        .addIntegerOption(option =>
            option
                .setName('level')
                .setDescription('Volume level (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    
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
            const embed = Embeds.error('Not in Voice Channel', 'I need to be in your voice channel to adjust volume!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        const volumeLevel = interaction.options.getInteger('level');

        try {
            if (!client.musicSystem) {
                const embed = Embeds.error('No Music Playing', 'There is no music currently playing!', client);
                return interaction.editReply({ embeds: [embed] });
            }

            // Ajustar volumen
            const newVolume = client.musicSystem.setVolume(interaction.guild.id, volumeLevel);
            
            const embed = Embeds.music(
                '🔊 Volume Adjusted',
                `Music volume has been set to **${newVolume}%**\n**Adjusted by:** ${interaction.user.tag}`,
                client
            );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Volume command error:', error);
            const embed = Embeds.error(
                'Volume Adjustment Failed', 
                'An error occurred while trying to adjust the volume.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};