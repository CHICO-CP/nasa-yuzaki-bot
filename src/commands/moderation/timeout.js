const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user for a specified duration')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('Duration of timeout (e.g., 1h, 30m, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        // Validaciones
        if (!member) {
            const embed = Embeds.error('User Not Found', 'The specified user is not in this server.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (member.id === interaction.user.id) {
            const embed = Embeds.error('Invalid Action', 'You cannot timeout yourself.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (member.id === client.user.id) {
            const embed = Embeds.error('Invalid Action', 'I cannot timeout myself.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (!member.moderatable) {
            const embed = Embeds.error('Permission Denied', 'I cannot timeout this user. They may have higher permissions.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        // Convertir duración a milisegundos
        let timeoutDuration;
        try {
            timeoutDuration = ms(duration);
            if (!timeoutDuration || timeoutDuration < 10000 || timeoutDuration > 2419200000) { // 10s to 28 days
                throw new Error('Invalid duration');
            }
        } catch (error) {
            const embed = Embeds.error(
                'Invalid Duration', 
                'Please provide a valid duration between 10 seconds and 28 days (e.g., 1h, 30m, 1d).',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        // Aplicar timeout
        try {
            const timeoutUntil = new Date(Date.now() + timeoutDuration);
            await member.timeout(timeoutDuration, reason);
            
            const successEmbed = Embeds.success(
                'User Timed Out', 
                `**${user.tag}** has been timed out for **${duration}**.\n**Reason:** ${reason}\n**Until:** <t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`,
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
                    title: '⏰ Member Timed Out',
                    fields: [
                        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                        { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Duration', value: duration, inline: true },
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Until', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true }
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
            console.error('Timeout error:', error);
            const embed = Embeds.error(
                'Timeout Failed', 
                'An error occurred while trying to timeout the user.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};