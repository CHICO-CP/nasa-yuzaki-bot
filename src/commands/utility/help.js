const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with all bot commands')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('Specific category to get help for')
                .setRequired(false)
                .addChoices(
                    { name: 'Moderation', value: 'moderation' },
                    { name: 'Music', value: 'music' },
                    { name: 'Utility', value: 'utility' },
                    { name: 'Fun', value: 'fun' },
                    { name: 'Configuration', value: 'config' }
                )),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getString('category');

        if (category) {
            await this.showCategoryHelp(interaction, client, category);
        } else {
            await this.showMainHelp(interaction, client);
        }
    },

    async showMainHelp(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle('🚀 Nasa Yuzaki - Help Center')
            .setDescription(`
Hello **${interaction.user.username}**! I'm **${client.config.bot.name}**, a professional Discord bot with advanced features for your server.

**Quick Navigation:**
Use the buttons below to browse different command categories or use \`/help [category]\` for specific help.
            `)
            .addFields(
                {
                    name: '🛡️ Moderation',
                    value: 'Server management and moderation tools',
                    inline: true
                },
                {
                    name: '🎵 Music',
                    value: 'Music playback and queue system',
                    inline: true
                },
                {
                    name: '🔧 Utility',
                    value: 'Useful server and user utilities',
                    inline: true
                },
                {
                    name: '🎯 Fun & Games',
                    value: 'Entertainment and fun commands',
                    inline: true
                },
                {
                    name: '⚙️ Configuration',
                    value: 'Bot and server configuration',
                    inline: true
                },
                {
                    name: '💰 Economy',
                    value: 'Virtual currency and economy system',
                    inline: true
                }
            )
            .addFields(
                {
                    name: '📖 Getting Started',
                    value: [
                        '• Use slash commands (/) to interact with me',
                        '• Most commands have detailed options and descriptions',
                        '• Need help with a specific command? Use the buttons below!',
                        '• Join our support server for additional help'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🌐 Support & Links',
                    value: [
                        `[GitHub](${client.config.bot.github}) - Source code`,
                        `[Telegram Channel](${client.config.bot.telegramChannel}) - Updates`,
                        `[Telegram Group](${client.config.bot.telegramGroup}) - Community`,
                        `[Support Server](${client.config.bot.supportServer}) - Help`
                    ].join(' • '),
                    inline: false
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} v${client.config.bot.version} | Total Commands: ${client.slashCommands.size}`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_moderation')
                    .setLabel('🛡️ Moderation')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_music')
                    .setLabel('🎵 Music')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_utility')
                    .setLabel('🔧 Utility')
                    .setStyle(ButtonStyle.Primary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_fun')
                    .setLabel('🎯 Fun')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('help_config')
                    .setLabel('⚙️ Config')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setLabel('🌐 GitHub')
                    .setStyle(ButtonStyle.Link)
                    .setURL(client.config.bot.github)
            );

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row, row2] 
        });
    },

    async showCategoryHelp(interaction, client, category) {
        const categories = {
            moderation: {
                name: '🛡️ Moderation Commands',
                description: 'Server management and moderation tools',
                commands: [
                    '`/ban` - Ban a user from the server',
                    '`/kick` - Kick a user from the server',
                    '`/timeout` - Timeout a user temporarily',
                    '`/clear` - Clear messages in a channel',
                    '`/warn` - Warn a user for rule violations',
                    '`/slowmode` - Set slowmode in a channel',
                    '`/warnings` - View user warnings'
                ]
            },
            music: {
                name: '🎵 Music Commands',
                description: 'Music playback and queue system',
                commands: [
                    '`/play` - Play music from YouTube',
                    '`/stop` - Stop music and clear queue',
                    '`/skip` - Skip the current song',
                    '`/queue` - Show the music queue',
                    '`/volume` - Adjust music volume',
                    '`/pause` - Pause/resume music',
                    '`/nowplaying` - Show current song'
                ]
            },
            utility: {
                name: '🔧 Utility Commands',
                description: 'Useful server and user utilities',
                commands: [
                    '`/userinfo` - Get user information',
                    '`/serverinfo` - Get server information',
                    '`/botinfo` - Get bot information',
                    '`/avatar` - Get user avatar',
                    '`/ping` - Check bot latency',
                    '`/help` - Show this help menu'
                ]
            },
            fun: {
                name: '🎯 Fun Commands',
                description: 'Entertainment and fun commands',
                commands: [
                    '`/meme` - Get random memes',
                    '`/quote` - Get inspirational quotes',
                    '`/8ball` - Ask the magic 8-ball',
                    '`/rps` - Play rock paper scissors',
                    '`/coinflip` - Flip a coin',
                    '`/dice` - Roll dice'
                ]
            },
            config: {
                name: '⚙️ Configuration Commands',
                description: 'Bot and server configuration',
                commands: [
                    '`/setwelcome` - Set welcome channel and message',
                    '`/setlogs` - Set moderation logs channel',
                    '`/settings` - Configure bot settings',
                    '`/autorole` - Set auto role for new members'
                ]
            }
        };

        const categoryData = categories[category];
        if (!categoryData) {
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.error)
                .setTitle('❌ Category Not Found')
                .setDescription('The specified category was not found.')
                .setFooter({ 
                    text: `${client.config.bot.name} Help`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();
            
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle(categoryData.name)
            .setDescription(categoryData.description)
            .addFields(
                {
                    name: '📋 Available Commands',
                    value: categoryData.commands.join('\n'),
                    inline: false
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Help | Use /help for main menu`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};