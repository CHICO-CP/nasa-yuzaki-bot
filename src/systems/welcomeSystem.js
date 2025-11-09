const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');

class WelcomeSystem {
    static async createWelcomeImage(member) {
        try {
            const canvas = Canvas.createCanvas(800, 300);
            const ctx = canvas.getContext('2d');

            // Fondo gradient (puedes reemplazar con imagen)
            const gradient = ctx.createLinearGradient(0, 0, 800, 300);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Avatar circular
            ctx.beginPath();
            ctx.arc(150, 150, 75, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 256 }));
            ctx.drawImage(avatar, 75, 75, 150, 150);

            // Restaurar clip
            ctx.restore();

            // Borde del avatar
            ctx.beginPath();
            ctx.arc(150, 150, 75, 0, Math.PI * 2, true);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#0099ff';
            ctx.stroke();

            // Texto de bienvenida
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('WELCOME', 450, 120);

            ctx.font = '30px Arial';
            ctx.fillStyle = '#0099ff';
            ctx.fillText(member.user.username, 450, 170);

            ctx.font = '20px Arial';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`Member #${member.guild.memberCount}`, 450, 210);

            return canvas.toBuffer();
        } catch (error) {
            console.error('Error creating welcome image:', error);
            return null;
        }
    }

    static async sendWelcomeMessage(member, client) {
        const welcomeChannel = member.guild.channels.cache.find(
            channel => channel.name === 'welcome' || channel.name === 'bienvenidas' || channel.name === '👋-welcome'
        );

        if (!welcomeChannel) return;

        const welcomeImage = await this.createWelcomeImage(member);
        
        const welcomeEmbed = new EmbedBuilder()
            .setColor(client.config.colors.success)
            .setTitle('🚀 Welcome to Our Cosmic Community!')
            .setDescription(`**${member.user.tag}** has entered the orbit! 🌌\nWe're now **${member.guild.memberCount}** members exploring together!`)
            .addFields(
                { 
                    name: '📅 Account Created', 
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true 
                },
                { 
                    name: '👥 Member Number', 
                    value: `#${member.guild.memberCount}`,
                    inline: true 
                },
                { 
                    name: '🌐 Server Join', 
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: true 
                }
            )
            .setFooter({ 
                text: `${client.config.bot.name} • Explore the universe with us!`,
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📚 Read Rules')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('view_rules'),
                new ButtonBuilder()
                    .setLabel('🎫 Get Roles')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('get_roles'),
                new ButtonBuilder()
                    .setLabel('⭐ GitHub')
                    .setStyle(ButtonStyle.Link)
                    .setURL(client.config.bot.github)
            );

        const messageData = {
            embeds: [welcomeEmbed],
            components: [buttons]
        };

        if (welcomeImage) {
            messageData.files = [{ attachment: welcomeImage, name: 'welcome.png' }];
            welcomeEmbed.setImage('attachment://welcome.png');
        }

        await welcomeChannel.send(messageData);
    }

    static async sendPrivateWelcome(member, client) {
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(client.config.colors.primary)
                .setTitle(`🌠 Welcome to ${member.guild.name}!`)
                .setDescription(`
Hello **${member.user.username}**! 

I'm **${client.config.bot.name}**, your guide in this cosmic community! 🚀

**Quick Start Guide:**
• Use \`/help\` to see all available commands
• Read the server rules in the rules channel
• Get your roles in the roles channel
• Explore different channels and have fun!

**Need Help?**
• Contact server moderators
• Use \`/support\` command for assistance
• Join our support community

**Bot Information:**
• Version: ${client.config.bot.version}
• Developer: ${client.config.bot.developer}
• GitHub: [Click Here](${client.config.bot.github})
• Telegram: [Channel](${client.config.bot.telegramChannel})

Enjoy your stay among the stars! 🌌
                `)
                .setFooter({ 
                    text: `${client.config.bot.name} v${client.config.bot.version} | By ${client.config.bot.developer}`,
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log(`Could not send DM to ${member.user.tag}`);
        }
    }
}

module.exports = WelcomeSystem;