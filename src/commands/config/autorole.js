const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Configure auto-role settings for new members')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set the auto-role for new members')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to automatically assign to new members')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test the auto-role system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable auto-role'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case 'set':
                    await this.setAutoRole(interaction, client, guildId);
                    break;
                case 'test':
                    await this.testAutoRole(interaction, client, guildId);
                    break;
                case 'disable':
                    await this.disableAutoRole(interaction, client, guildId);
                    break;
            }
        } catch (error) {
            console.error('Autorole error:', error);
            const embed = Embeds.error(
                'Configuration Error', 
                'An error occurred while updating the auto-role settings.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async setAutoRole(interaction, client, guildId) {
        const role = interaction.options.getRole('role');
        
        // Verificar que el bot puede gestionar el rol
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            const embed = Embeds.error(
                'Role Too High', 
                'I cannot assign this role because it is higher than my highest role.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        // Verificar que el rol no sea administrador
        if (role.permissions.has('Administrator')) {
            const embed = Embeds.error(
                'Administrator Role', 
                'I cannot assign administrator roles automatically for security reasons.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        await client.db.set(`autorole_${guildId}`, role.id);
        
        const embed = Embeds.success(
            'Auto-Role Set', 
            `New members will automatically receive the **${role.name}** role.`,
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    },

    async testAutoRole(interaction, client, guildId) {
        const autoRoleId = await client.db.get(`autorole_${guildId}`);

        if (!autoRoleId) {
            const embed = Embeds.error(
                'No Auto-Role', 
                'Please set an auto-role first using `/autorole set`.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        const autoRole = interaction.guild.roles.cache.get(autoRoleId);
        if (!autoRole) {
            const embed = Embeds.error(
                'Role Not Found', 
                'The configured auto-role no longer exists. Please set a new one.',
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        // Verificar si el usuario ya tiene el rol
        if (interaction.member.roles.cache.has(autoRoleId)) {
            const embed = Embeds.success(
                'Auto-Role Test', 
                `You already have the **${autoRole.name}** role. The auto-role system is working correctly!`,
                client
            );
            return interaction.editReply({ embeds: [embed] });
        }

        // Intentar asignar el rol
        try {
            await interaction.member.roles.add(autoRoleId);
            
            const embed = Embeds.success(
                'Auto-Role Test Successful', 
                `The **${autoRole.name}** role has been assigned to you successfully! The auto-role system is working correctly.`,
                client
            );
            
            await interaction.editReply({ embeds: [embed] });

            // Opcional: Quitar el rol después de unos segundos
            setTimeout(async () => {
                try {
                    await interaction.member.roles.remove(autoRoleId);
                } catch (error) {
                    // Ignorar errores al quitar el rol
                }
            }, 10000);

        } catch (error) {
            const embed = Embeds.error(
                'Test Failed', 
                `Could not assign the **${autoRole.name}** role. Please check my permissions and role hierarchy.`,
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async disableAutoRole(interaction, client, guildId) {
        await client.db.delete(`autorole_${guildId}`);
        
        const embed = Embeds.success(
            'Auto-Role Disabled', 
            'Auto-role has been disabled for this server.',
            client
        );
        
        await interaction.editReply({ embeds: [embed] });
    }
};