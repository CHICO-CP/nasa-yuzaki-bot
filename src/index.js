const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');
const quickdb = require('quick.db');

// Configurar variables de entorno
config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Colecciones globales
client.commands = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.db = quickdb;
client.config = require('./config/settings.js');

// Cargar handlers
const loadHandlers = async () => {
    const handlersPath = path.join(__dirname, 'handlers');
    const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
    
    for (const file of handlerFiles) {
        try {
            const handler = require(path.join(handlersPath, file));
            await handler(client);
            console.log(`✅ Handler loaded: ${file}`);
        } catch (error) {
            console.error(`❌ Error loading handler ${file}:`, error);
        }
    }
};

// Inicializar bot
const initializeBot = async () => {
    try {
        await loadHandlers();
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        process.exit(1);
    }
};

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down Nasa Yusaki gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

initializeBot();