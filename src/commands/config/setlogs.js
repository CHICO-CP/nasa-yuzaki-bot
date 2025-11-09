const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configure logging settings for the server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Set the moderation logs channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel for moderation logs')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('events')
                .setDescription('Configure which events to log')
                .addStringOption(option =>
                    option
                        .setName('events')
                        .setDescription('Events to log (comma separated)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'All Events', value: 'all' },
                            { name: 'Moderation Only', value: 'moderation' },
                            { name: 'Members Only', value: 'members' },
                            { name: 'Messages Only', value: 'messages' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test the logging system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable logging'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'channel':
                    await this.setLogsChannel(interaction, client, guildId);
                    break;
                case 'events':
                    await this.setLogsEvents(interaction, client, guildId);
                    break;
                case 'test':
                    await this.testLogs(interaction, client, guildId);
                    break;
                case 'disable':
                    await this.disableLogs(interaction, client, guildId);
                    break;
            }
        } catch (error) {
            console.error('Setlogs error:', error);
            const embed = Embeds.error(
                'Configuration Error', 
                'An error occurred while updating the logging settings.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async setLogsChannel(interaction, client, guildId) {
        const channel = interaction.options.getChannel('channel');
        
        // Verificar permisos del bot en el canal
        const botPermissions = channel.permissionsFor(client.user);
        if (!botPermissions.has('SendMessages') || !botPermissions.has('EmbedLinks') || !botPermissions.has('ViewChannel')) {
            const embed = Embeds.error(
                'Missing Permissions', 
                `I need **Send Messages**, **Embed Links**, and **View Channel** permissions in ${channel}.`,
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        await client.db.set(`logs_channel_${guildId}`, channel.id);
        
        const embed = Embeds.success(
            'Logs Channel Set', 
            `Moderation logs will now be sent to ${channel}.`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async setLogsEvents(interaction, client, guildId) {
        const events = interaction.options.getString('events');
        
        const eventConfigs = {
            'all': ['message_delete', 'message_edit', 'member_join', 'member_leave', 'member_ban', 'member_kick', 'role_changes', 'channel_changes'],
            'moderation': ['member_ban', 'member_kick', 'member_timeout', 'member_warn'],
            'members': ['member_join', 'member_leave', 'member_ban', 'member_kick'],
            'messages': ['message_delete', 'message_edit', 'message_bulk_delete']
        };

        const selectedEvents = eventConfigs[events] || eventConfigs.all;
        await client.db.set(`logs_events_${guildId}`, selectedEvents);
        
        const embed = Embeds.success(
            'Log Events Configured', 
            `Logging events have been set to: **${events}**\n\n**Events being logged:**\n${selectedEvents.map(event => `• ${event.replace(/_/g, ' ')}`).join('\n')}`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async testLogs(interaction, client, guildId) {
        const logsChannelId = await client.db.get(`logs_channel_${guildId}`);

        if (!logsChannelId) {
            const embed = Embeds.error(
                'No Logs Channel', 
                'Please set a logs channel first using `/setlogs channel`.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        const logsChannel = interaction.guild.channels.cache.get(logsChannelId);
        if (!logsChannel) {
            const embed = Embeds.error(
                'Channel Not Found', 
                'The configured logs channel no longer exists. Please set a new one.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = Embeds.success(
            'Logs Test', 
            `Sending test log message to ${logsChannel}...`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });

        // Enviar mensaje de prueba al canal de logs
        try {
            const testLogEmbed = {
                color: client.config.colors.info,
                title: '📝 Log System Test',
                description: 'This is a test message to verify that the logging system is working correctly.',
                fields: [
                    { name: 'Test Type', value: 'Configuration Test', inline: true },
                    { name: 'Initiated By', value: interaction.user.tag, inline: true },
                    { name: 'Channel', value: logsChannel.toString(), inline: true },
                    { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: 'Bot Version', value: client.config.bot.version, inline: true },
                    { name: 'Server', value: interaction.guild.name, inline: true }
                ],
                footer: { 
                    text: `${client.config.bot.name} Logging System`,
                    iconURL: client.user.displayAvatarURL() 
                },
                timestamp: new Date()
            };

            await logsChannel.send({ embeds: [testLogEmbed] });

            const successEmbed = Embeds.success(
                'Test Successful', 
                `Test log message sent to ${logsChannel}! The logging system is working correctly.`,
                client
            );
            
            await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

        } catch (error) {
            const embed = Embeds.error(
                'Test Failed', 
                `Could not send test message to ${logsChannel}. Please check my permissions.`,
                client
            );
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        }
    },

    async disableLogs(interaction, client, guildId) {
        await client.db.delete(`logs_channel_${guildId}`);
        await client.db.delete(`logs_events_${guildId}`);
        
        const embed = Embeds.success(
            'Logging Disabled', 
            'Moderation logs have been disabled for this server.',
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    }
};