const { EmbedBuilder } = require('discord.js');
const config = require('../config/settings.js');

class Embeds {
    static success(title, description, client) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ 
                text: `Nasa Yuzaki v${config.bot.version} | By ${config.bot.developer}`,
                iconURL: client?.user?.displayAvatarURL() 
            });
    }

    static error(title, description, client) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ 
                text: `Nasa Yuzaki v${config.bot.version} | By ${config.bot.developer}`,
                iconURL: client?.user?.displayAvatarURL() 
            });
    }

    static info(title, description, client) {
        return new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ 
                text: `Nasa Yuzaki v${config.bot.version} | By ${config.bot.developer}`,
                iconURL: client?.user?.displayAvatarURL() 
            });
    }

    static music(title, description, client) {
        return new EmbedBuilder()
            .setColor(config.colors.music)
            .setTitle(`🎵 ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ 
                text: `Nasa Yuzaki Music | By ${config.bot.developer}`,
                iconURL: client?.user?.displayAvatarURL() 
            });
    }

    static moderation(title, description, client) {
        return new EmbedBuilder()
            .setColor(config.colors.moderation)
            .setTitle(`🛡️ ${title}`)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ 
                text: `Nasa Yuzaki Moderation | By ${config.bot.developer}`,
                iconURL: client?.user?.displayAvatarURL() 
            });
    }
}

module.exports = Embeds;