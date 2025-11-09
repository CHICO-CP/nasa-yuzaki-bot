const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configure welcome settings for the server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Set the welcome channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel for welcome messages')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Set the welcome message')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Welcome message (use {user} for username, {server} for server name)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('background')
                .setDescription('Enable/disable welcome background images')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable welcome background images')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test the welcome message'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable welcome messages'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'channel':
                    await this.setWelcomeChannel(interaction, client, guildId);
                    break;
                case 'message':
                    await this.setWelcomeMessage(interaction, client, guildId);
                    break;
                case 'background':
                    await this.setWelcomeBackground(interaction, client, guildId);
                    break;
                case 'test':
                    await this.testWelcome(interaction, client, guildId);
                    break;
                case 'disable':
                    await this.disableWelcome(interaction, client, guildId);
                    break;
            }
        } catch (error) {
            console.error('Setwelcome error:', error);
            const embed = Embeds.error(
                'Configuration Error', 
                'An error occurred while updating the welcome settings.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async setWelcomeChannel(interaction, client, guildId) {
        const channel = interaction.options.getChannel('channel');
        
        // Verificar permisos del bot en el canal
        const botPermissions = channel.permissionsFor(client.user);
        if (!botPermissions.has('SendMessages') || !botPermissions.has('EmbedLinks')) {
            const embed = Embeds.error(
                'Missing Permissions', 
                `I need **Send Messages** and **Embed Links** permissions in ${channel}.`,
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        await client.db.set(`welcome_channel_${guildId}`, channel.id);
        
        const embed = Embeds.success(
            'Welcome Channel Set', 
            `Welcome messages will now be sent in ${channel}.`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async setWelcomeMessage(interaction, client, guildId) {
        const message = interaction.options.getString('message');
        
        // Validar longitud del mensaje
        if (message.length > 1000) {
            const embed = Embeds.error(
                'Message Too Long', 
                'Welcome message cannot exceed 1000 characters.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        await client.db.set(`welcome_message_${guildId}`, message);
        
        const embed = Embeds.success(
            'Welcome Message Set', 
            `Welcome message has been updated.\n\n**Preview:**\n${message.replace(/{user}/g, interaction.user.username).replace(/{server}/g, interaction.guild.name)}`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async setWelcomeBackground(interaction, client, guildId) {
        const enabled = interaction.options.getBoolean('enabled');
        
        await client.db.set(`welcome_background_${guildId}`, enabled);
        
        const status = enabled ? 'enabled' : 'disabled';
        const embed = Embeds.success(
            'Welcome Background Updated', 
            `Welcome background images have been **${status}**.`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async testWelcome(interaction, client, guildId) {
        const welcomeChannelId = await client.db.get(`welcome_channel_${guildId}`);
        const welcomeMessage = await client.db.get(`welcome_message_${guildId}`) || client.config.defaults.welcomeMessage;
        const welcomeBackground = await client.db.get(`welcome_background_${guildId}`) ?? true;

        if (!welcomeChannelId) {
            const embed = Embeds.error(
                'No Welcome Channel', 
                'Please set a welcome channel first using `/setwelcome channel`.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        const welcomeChannel = interaction.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            const embed = Embeds.error(
                'Channel Not Found', 
                'The configured welcome channel no longer exists. Please set a new one.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        // Simular mensaje de bienvenida
        const testMessage = welcomeMessage
            .replace(/{user}/g, interaction.user.toString())
            .replace(/{server}/g, interaction.guild.name);

        const embed = Embeds.success(
            'Welcome Test', 
            `Sending test welcome message to ${welcomeChannel}...`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });

        // Enviar mensaje de prueba al canal de bienvenidas
        try {
            const welcomeEmbed = {
                color: client.config.colors.success,
                title: '👋 Welcome to the Server!',
                description: testMessage,
                thumbnail: { url: interaction.user.displayAvatarURL() },
                fields: [
                    { name: 'Member Count', value: `#${interaction.guild.memberCount}`, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Server Join', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                ],
                footer: { 
                    text: `${client.config.bot.name} Welcome System`,
                    iconURL: client.user.displayAvatarURL() 
                },
                timestamp: new Date()
            };

            await welcomeChannel.send({ 
                content: `🎉 **Welcome Test** - ${interaction.user}`,
                embeds: [welcomeEmbed] 
            });

            const successEmbed = Embeds.success(
                'Test Successful', 
                `Test welcome message sent to ${welcomeChannel}!`,
                client
            );
            
            await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

        } catch (error) {
            const embed = Embeds.error(
                'Test Failed', 
                `Could not send test message to ${welcomeChannel}. Please check my permissions.`,
                client
            );
            await interaction.followUp({ embeds: [embed], ephemeral: true });
        }
    },

    async disableWelcome(interaction, client, guildId) {
        await client.db.delete(`welcome_channel_${guildId}`);
        await client.db.delete(`welcome_message_${guildId}`);
        await client.db.delete(`welcome_background_${guildId}`);
        
        const embed = Embeds.success(
            'Welcome System Disabled', 
            'Welcome messages have been disabled for this server.',
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    }
};