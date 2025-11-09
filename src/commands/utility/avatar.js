const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get the avatar from')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of avatar to display')
                .setRequired(false)
                .addChoices(
                    { name: 'Server Avatar', value: 'server' },
                    { name: 'Global Avatar', value: 'global' }
                )),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('user') || interaction.user;
        const avatarType = interaction.options.getString('type') || 'global';
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        let avatarUrl;
        let description;

        if (avatarType === 'server' && targetMember && targetMember.avatar) {
            avatarUrl = targetMember.displayAvatarURL({ size: 4096, dynamic: true });
            description = `**Server Avatar** of ${targetUser.tag}`;
        } else {
            avatarUrl = targetUser.displayAvatarURL({ size: 4096, dynamic: true });
            description = `**Global Avatar** of ${targetUser.tag}`;
        }

        // Crear botones para diferentes formatos
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('PNG')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarUrl.replace(/\?size=.*$/, '?size=4096&format=png')),
                new ButtonBuilder()
                    .setLabel('JPG')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarUrl.replace(/\?size=.*$/, '?size=4096&format=jpg')),
                new ButtonBuilder()
                    .setLabel('WEBP')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarUrl.replace(/\?size=.*$/, '?size=4096&format=webp'))
            );

        // Si es GIF, agregar botón GIF
        if (avatarUrl.includes('.gif')) {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel('GIF')
                    .setStyle(ButtonStyle.Link)
                    .setURL(avatarUrl.replace(/\?size=.*$/, '?size=4096&format=gif'))
            );
        }

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.primary)
            .setTitle('🖼️ User Avatar')
            .setDescription(description)
            .setImage(avatarUrl)
            .addFields(
                {
                    name: '📏 Avatar Information',
                    value: [
                        `**User:** ${targetUser.tag}`,
                        `**ID:** ${targetUser.id}`,
                        `**Type:** ${avatarType === 'server' ? 'Server Avatar' : 'Global Avatar'}`,
                        `**Animated:** ${avatarUrl.includes('.gif') ? '✅ Yes' : '❌ No'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🔗 Download Links',
                    value: 'Click the buttons below to download in different formats:',
                    inline: true
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Utility | Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
        });
    }
};