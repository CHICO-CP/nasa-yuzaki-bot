module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            console.log(`🔧 Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Error executing command ${interaction.commandName}:`, error);
            
            const errorEmbed = {
                color: client.config.colors.error,
                title: '❌ Command Error',
                description: 'There was an error while executing this command!',
                fields: [
                    { name: 'Command', value: `\`/${interaction.commandName}\``, inline: true },
                    { name: 'Error', value: '```' + error.message.substring(0, 1000) + '```' }
                ],
                footer: { 
                    text: 'Please contact support if this continues',
                    iconURL: client.user.displayAvatarURL() 
                },
                timestamp: new Date()
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    embeds: [errorEmbed], 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    embeds: [errorEmbed], 
                    ephemeral: true 
                });
            }
        }
    }
};