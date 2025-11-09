const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user for inappropriate behavior')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        // Validaciones
        if (!member) {
            const embed = Embeds.error('User Not Found', 'The specified user is not in this server.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (member.id === interaction.user.id) {
            const embed = Embeds.error('Invalid Action', 'You cannot warn yourself.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        if (member.id === client.user.id) {
            const embed = Embeds.error('Invalid Action', 'I cannot warn myself.', client);
            return interaction.editReply({ embeds: [embed] });
        }

        // Guardar advertencia en la base de datos
        try {
            const warnId = Date.now().toString();
            const warningData = {
                id: warnId,
                userId: user.id,
                moderatorId: interaction.user.id,
                reason: reason,
                timestamp: Date.now(),
                guildId: interaction.guild.id
            };

            // Guardar en la base de datos
            const userWarnings = await client.db.get(`warnings_${interaction.guild.id}_${user.id}`) || [];
            userWarnings.push(warningData);
            await client.db.set(`warnings_${interaction.guild.id}_${user.id}`, userWarnings);

            const successEmbed = Embeds.success(
                'User Warned', 
                `**${user.tag}** has been warned.\n**Reason:** ${reason}\n**Warnings:** ${userWarnings.length}`,
                client
            );
            
            await interaction.editReply({ embeds: [successEmbed] });

            // Notificar al usuario
            try {
                const dmEmbed = {
                    color: client.config.colors.warning,
                    title: '⚠️ You have been warned',
                    description: `You have received a warning in **${interaction.guild.name}**`,
                    fields: [
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: interaction.user.tag, inline: true },
                        { name: 'Total Warnings', value: `${userWarnings.length}`, inline: true },
                        { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    ],
                    footer: { 
                        text: 'Please follow the server rules to avoid further action',
                        iconURL: interaction.guild.iconURL() 
                    },
                    timestamp: new Date()
                };

                await user.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${user.tag}`);
            }

            // Log en canal de mod logs
            const logChannel = interaction.guild.channels.cache.find(channel => 
                channel.name === 'mod-logs' || channel.name === 'logs'
            );

            if (logChannel) {
                const logEmbed = {
                    color: client.config.colors.warning,
                    title: '⚠️ Member Warned',
                    fields: [
                        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                        { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Warning ID', value: warnId, inline: true },
                        { name: 'Total Warnings', value: `${userWarnings.length}`, inline: true }
                    ],
                    footer: { 
                        text: `${client.config.bot.name} Moderation`,
                        iconURL: client.user.displayAvatarURL() 
                    },
                    timestamp: new Date()
                };

                await logChannel.send({ embeds: [logEmbed] });
            }

            // Verificar si se alcanzó el límite de advertencias
            const maxWarnings = client.config.settings.maxWarnings || 3;
            if (userWarnings.length >= maxWarnings) {
                const autoActionEmbed = Embeds.info(
                    'Auto-Moderation', 
                    `User **${user.tag}** has reached ${maxWarnings} warnings. Consider taking further action.`,
                    client
                );
                await interaction.followUp({ embeds: [autoActionEmbed], ephemeral: true });
            }

        } catch (error) {
            console.error('Warn error:', error);
            const embed = Embeds.error(
                'Warning Failed', 
                'An error occurred while trying to warn the user.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    }
};