const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = async (client) => {
    client.commands = new Collection();
    client.slashCommands = new Collection();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    let totalCommands = 0;

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // Verificar si es directorio
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            
            try {
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.slashCommands.set(command.data.name, command);
                    totalCommands++;
                    console.log(`✅ Command loaded: ${command.data.name} (${folder})`);
                } else if ('name' in command && 'execute' in command) {
                    client.commands.set(command.name, command);
                    totalCommands++;
                    console.log(`✅ Command loaded: ${command.name} (${folder})`);
                } else {
                    console.log(`⚠️  Command in ${filePath} is missing required properties`);
                }
            } catch (error) {
                console.error(`❌ Error loading command ${filePath}:`, error);
            }
        }
    }

    console.log(`🎯 Total commands loaded: ${totalCommands}`);
};