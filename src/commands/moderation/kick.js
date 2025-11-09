const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        // Validaciones
        if (!member) {
            const embed = Embeds.error('User Not Found', 'The specified user is not in this server.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (member.id === interaction.user.id) {
            const embed = Embeds.error('Invalid Action', 'You cannot kick yourself.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (member.id === client.user.id) {
            const embed = Embeds.error('Invalid Action', 'I cannot kick myself.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (!member.kickable) {
            const embed = Embeds.error('Permission Denied', 'I cannot kick this user. They may have higher permissions.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        // Ejecutar kick
        try {
            await member.kick(reason);
            
            const successEmbed = Embeds.success(
                'User Kicked', 
                `**${user.tag}** has been kicked from the server.\n**Reason:** ${reason}`,
                client
            );
            
            await interaction.editReply({ embeds: [successEmbed] });

            // Log en canal de mod logs
            const logChannel = interaction.guild.channels.cache.find(channel => 
                channel.name === 'mod-logs' || channel.name === 'logs'
            );

            if (logChannel) {
                const logEmbed = {
                    color: client.config.colors.warning,
                    title: '👢 Member Kicked',
                    fields: [
                        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                        { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Reason', value: reason, inline: false },
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
            console.error('Kick error:', error);
            const embed = Embeds.error(
                'Kick Failed', 
                'An error occurred while trying to kick the user.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};