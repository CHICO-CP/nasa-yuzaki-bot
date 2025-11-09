const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a specified number of messages')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to clear (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Clear messages from a specific user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');
        
        let messages = await interaction.channel.messages.fetch({ limit: 100 });
        
        // Filtrar mensajes si se especifica un usuario
        if (user) {
            messages = messages.filter(msg => msg.author.id === user.id);
        }

        // Filtrar mensajes que no se pueden eliminar (muy viejos)
        messages = messages.filter(msg => msg.createdTimestamp > Date.now() - (14 * 24 * 60 * 60 * 1000)); // 14 días
        
        const messagesToDelete = messages.first(amount);

        if (messagesToDelete.length === 0) {
            const embed = Embeds.error('No Messages Found', 'No messages found to delete in the specified criteria.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            // Eliminar mensajes en lotes de 100
            if (messagesToDelete.length === 1) {
                await messagesToDelete[0].delete();
            } else {
                await interaction.channel.bulkDelete(messagesToDelete, true);
            }

            const successEmbed = Embeds.success(
                'Messages Cleared', 
                `Successfully deleted **${messagesToDelete.length}** messages${user ? ` from **${user.tag}**` : ''}.`,
                client
            );
            
            await interaction.editReply({ embeds: [successEmbed] });

            // Log en canal de mod logs
            const logChannel = interaction.guild.channels.cache.find(channel => 
                channel.name === 'mod-logs' || channel.name === 'logs'
            );

            if (logChannel) {
                const logEmbed = {
                    color: client.config.colors.info,
                    title: '🧹 Messages Cleared',
                    fields: [
                        { name: 'Channel', value: `${interaction.channel}`, inline: true },
                        { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Messages Deleted', value: `${messagesToDelete.length}`, inline: true },
                        { name: 'Target User', value: user ? `${user.tag}` : 'All Users', inline: true },
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

            // Auto-eliminar mensaje de confirmación después de 5 segundos
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    // Ignorar error si el mensaje ya fue eliminado
                }
            }, 5000);

        } catch (error) {
            console.error('Clear messages error:', error);
            const embed = Embeds.error(
                'Clear Failed', 
                'An error occurred while trying to clear messages. Some messages may be too old to delete.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};