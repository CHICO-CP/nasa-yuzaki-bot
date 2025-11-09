const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for the current channel')
        .addIntegerOption(option =>
            option
                .setName('seconds')
                .setDescription('Slowmode duration in seconds (0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)) // 6 horas máximo
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to set slowmode for (default: current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const seconds = interaction.options.getInteger('seconds');
        const channelOption = interaction.options.getChannel('channel');
        const channel = channelOption || interaction.channel;

        // Validar que el canal es de texto
        if (!channel.isTextBased()) {
            const embed = Embeds.error('Invalid Channel', 'Slowmode can only be set for text channels.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            await channel.setRateLimitPerUser(seconds);

            let description;
            if (seconds === 0) {
                description = `Slowmode has been **disabled** in ${channel}.`;
            } else {
                const timeFormatted = this.formatTime(seconds);
                description = `Slowmode set to **${timeFormatted}** in ${channel}.`;
            }

            const successEmbed = Embeds.success('Slowmode Updated', description, client);
            await interaction.editReply({ embeds: [successEmbed] });

            // Log en canal de mod logs
            const logChannel = interaction.guild.channels.cache.find(channel => 
                channel.name === 'mod-logs' || channel.name === 'logs'
            );

            if (logChannel) {
                const logEmbed = {
                    color: client.config.colors.info,
                    title: '🐢 Slowmode Updated',
                    fields: [
                        { name: 'Channel', value: `${channel}`, inline: true },
                        { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Duration', value: seconds === 0 ? 'Disabled' : this.formatTime(seconds), inline: true },
                        { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    ],
                    footer: { 
                        text: `${client.config.bot.name} Moderation`,
                        iconURL: client.user.displayAvatarURL() 
                    },
                    timestamp: new Date()
                };

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('Slowmode error:', error);
            const embed = Embeds.error(
                'Slowmode Failed', 
                'An error occurred while trying to set slowmode.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(seconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    }
};