const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to view warnings for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const userWarnings = await client.db.get(`warnings_${interaction.guild.id}_${user.id}`) || [];

        if (userWarnings.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(client.config.colors.success)
                .setTitle('✅ No Warnings')
                .setDescription(`**${user.tag}** has no warnings in this server.`)
                .setFooter({ 
                    text: `${client.config.bot.name} Moderation`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        // Formatear advertencias para embed
        const warningsList = userWarnings.slice(0, 10).map((warning, index) => {
            return `**${index + 1}.** <t:${Math.floor(warning.timestamp / 1000)}:R> - ${warning.reason} (by <@${warning.moderatorId}>)`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor(client.config.colors.warning)
            .setTitle(`⚠️ Warnings for ${user.tag}`)
            .setDescription(`Total Warnings: **${userWarnings.length}**\n\n${warningsList}`)
            .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'First Warning', value: `<t:${Math.floor(userWarnings[0].timestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ 
                text: `${client.config.bot.name} Moderation | Showing ${Math.min(userWarnings.length, 10)} of ${userWarnings.length} warnings`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        if (userWarnings.length > 10) {
            embed.addFields({
                name: 'Note',
                value: `Showing 10 most recent warnings out of ${userWarnings.length} total.`
            });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};