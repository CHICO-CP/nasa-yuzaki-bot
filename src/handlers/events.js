const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    let totalEvents = 0;

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        
        try {
            const event = require(filePath);
            
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            
            totalEvents++;
            console.log(`✅ Event loaded: ${event.name}`);
        } catch (error) {
            console.error(`❌ Error loading event ${filePath}:`, error);
        }
    }

    console.log(`🎯 Total events loaded: ${totalEvents}`);
};