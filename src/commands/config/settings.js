const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View and manage bot settings for the server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current bot settings'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset all bot settings to default'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'view':
                    await this.viewSettings(interaction, client, guildId);
                    break;
                case 'reset':
                    await this.resetSettings(interaction, client, guildId);
                    break;
            }
        } catch (error) {
            console.error('Settings error:', error);
            const embed = Embeds.error(
                'Settings Error', 
                'An error occurred while managing the settings.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async viewSettings(interaction, client, guildId) {
        // Obtener todas las configuraciones
        const welcomeChannelId = await client.db.get(`welcome_channel_${guildId}`);
        const welcomeMessage = await client.db.get(`welcome_message_${guildId}`) || 'Not set (using default)';
        const welcomeBackground = await client.db.get(`welcome_background_${guildId}`) ?? true;

        const logsChannelId = await client.db.get(`logs_channel_${guildId}`);
        const logsEvents = await client.db.get(`logs_events_${guildId}`) || ['moderation'];

        const autoRoleId = await client.db.get(`autorole_${guildId}`);
        
        const prefix = await client.db.get(`prefix_${guildId}`) || client.config.defaults.prefix;
        const language = await client.db.get(`language_${guildId}`) || client.config.defaults.language;

        // Obtener nombres de canales y roles
        const welcomeChannel = welcomeChannelId ? interaction.guild.channels.cache.get(welcomeChannelId) : null;
        const logsChannel = logsChannelId ? interaction.guild.channels.cache.get(logsChannelId) : null;
        const autoRole = autoRoleId ? interaction.guild.roles.cache.get(autoRoleId) : null;

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle('⚙️ Server Settings')
            .setDescription(`Current configuration for **${interaction.guild.name}**`)
            .addFields(
                {
                    name: '👋 Welcome System',
                    value: [
                        `**Channel:** ${welcomeChannel || 'Not set'}`,
                        `**Background:** ${welcomeBackground ? '✅ Enabled' : '❌ Disabled'}`,
                        `**Message:** ${welcomeMessage.length > 50 ? welcomeMessage.substring(0, 50) + '...' : welcomeMessage}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📝 Logging System',
                    value: [
                        `**Channel:** ${logsChannel || 'Not set'}`,
                        `**Events:** ${logsEvents.length} configured`,
                        `**Status:** ${logsChannel ? '✅ Active' : '❌ Inactive'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🎯 Auto-Role',
                    value: [
                        `**Role:** ${autoRole || 'Not set'}`,
                        `**Status:** ${autoRole ? '✅ Active' : '❌ Inactive'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔧 General Settings',
                    value: [
                        `**Prefix:** ${prefix}`,
                        `**Language:** ${language}`,
                        `**Mod Logs:** ${logsChannel ? '✅ Enabled' : '❌ Disabled'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📊 Usage Statistics',
                    value: [
                        `**Commands Used:** ${await client.db.get(`commands_used_${guildId}`) || 0}`,
                        `**Warnings Issued:** ${await this.getTotalWarnings(client, guildId)}`,
                        `**Music Plays:** ${await client.db.get(`music_plays_${guildId}`) || 0}`,
                        `**Config Since:** <t:${Math.floor(await client.db.get(`config_set_${guildId}`) || Date.now() / 1000)}:R>`
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Configuration | Use individual commands to modify settings`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        // Crear menú de selección para navegación rápida
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('settings_navigation')
                    .setPlaceholder('Quick Settings Navigation')
                    .addOptions([
                        {
                            label: 'Welcome Settings',
                            description: 'Configure welcome messages',
                            value: 'welcome_settings'
                        },
                        {
                            label: 'Logging Settings',
                            description: 'Configure moderation logs',
                            value: 'logging_settings'
                        },
                        {
                            label: 'Auto-Role Settings',
                            description: 'Configure automatic roles',
                            value: 'autorole_settings'
                        },
                        {
                            label: 'Reset All Settings',
                            description: 'Reset all configurations',
                            value: 'reset_all_settings'
                        }
                    ])
            );

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
        });
    },

    async resetSettings(interaction, client, guildId) {
        // Confirmación de reset
        const confirmEmbed = new EmbedBuilder()
            .setColor(client.config.colors.warning)
            .setTitle('⚠️ Reset All Settings')
            .setDescription('Are you sure you want to reset **ALL** bot settings for this server? This action cannot be undone!')
            .addFields(
                { name: '📋 What will be reset:', value: [
                    '• Welcome channel and message',
                    '• Logging channel and events',
                    '• Auto-role configuration',
                    '• Custom prefix and language',
                    '• All moderation data',
                    '• Music queue and settings'
                ].join('\n'), inline: false },
                { name: '🔒 Protected Data:', value: [
                    '• User levels and XP',
                    '• Economy balances',
                    '• Server statistics'
                ].join('\n'), inline: false }
            )
            .setFooter({ 
                text: 'This action is irreversible!',
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('reset_confirmation')
                    .setPlaceholder('Confirm reset action...')
                    .addOptions([
                        {
                            label: '✅ Confirm Reset',
                            description: 'Reset ALL settings to default',
                            value: 'confirm_reset'
                        },
                        {
                            label: '❌ Cancel Reset',
                            description: 'Keep current settings',
                            value: 'cancel_reset'
                        }
                    ])
            );

        await interaction.editReply({ 
            embeds: [confirmEmbed], 
            components: [row] 
        });
    },

    async getTotalWarnings(client, guildId) {
        const allData = await client.db.all();
        let totalWarnings = 0;

        for (const data of allData) {
            if (data.ID.startsWith(`warnings_${guildId}_`)) {
                totalWarnings += data.data.length;
            }
        }

        return totalWarnings;
    }
};