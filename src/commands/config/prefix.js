const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Set a custom prefix for the server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new prefix')
                .addStringOption(option =>
                    option
                        .setName('prefix')
                        .setDescription('The new prefix (1-5 characters)')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(5)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset to default prefix'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'set':
                    await this.setPrefix(interaction, client, guildId);
                    break;
                case 'reset':
                    await this.resetPrefix(interaction, client, guildId);
                    break;
            }
        } catch (error) {
            console.error('Prefix error:', error);
            const embed = Embeds.error(
                'Prefix Error', 
                'An error occurred while updating the prefix.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async setPrefix(interaction, client, guildId) {
        const newPrefix = interaction.options.getString('prefix');
        
        // Validar el prefix
        if (newPrefix.includes(' ')) {
            const embed = Embeds.error(
                'Invalid Prefix', 
                'Prefix cannot contain spaces.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        if (newPrefix === '/') {
            const embed = Embeds.error(
                'Invalid Prefix', 
                'Cannot set prefix to "/" as it conflicts with slash commands.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        await client.db.set(`prefix_${guildId}`, newPrefix);
        
        const embed = Embeds.success(
            'Prefix Updated', 
            `Server prefix has been set to: \`${newPrefix}\`\n\n**Example usage:**\n\`${newPrefix}help\` - Show help menu\n\`${newPrefix}ping\` - Check bot latency`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async resetPrefix(interaction, client, guildId) {
        await client.db.delete(`prefix_${guildId}`);
        
        const embed = Embeds.success(
            'Prefix Reset', 
            `Server prefix has been reset to default: \`${client.config.defaults.prefix}\``,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    }
};