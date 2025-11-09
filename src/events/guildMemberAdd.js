const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Create welcome image
        const canvas = Canvas.createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        // Background
        const background = await Canvas.loadImage(path.join(__dirname, '../../assets/images/welcome-bg.png'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // User avatar
        ctx.beginPath();
        ctx.arc(150, 150, 75, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 256 }));
        ctx.drawImage(avatar, 75, 75, 150, 150);

        // Welcome text
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME', 450, 120);

        ctx.font = '30px Arial';
        ctx.fillText(member.user.username, 450, 170);

        ctx.font = '20px Arial';
        ctx.fillText(`Member #${member.guild.memberCount}`, 450, 210);

        const attachment = canvas.toBuffer();

        // Welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🚀 Welcome to Our Cosmic Community!')
            .setDescription(`**${member.user.tag}** has entered the orbit! 🌌`)
            .setImage('attachment://welcome.png')
            .addFields(
                { 
                    name: '📅 Account Created', 
                    value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true 
                },
                { 
                    name: '👥 Member Count', 
                    value: `#${member.guild.memberCount}`,
                    inline: true 
                },
                { 
                    name: '🌐 Server Join Date', 
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: true 
                }
            )
            .setThumbnail(member.guild.iconURL())
            .setFooter({ 
                text: 'Nasa Yusaki • Exploring the Discord Universe', 
                iconURL: member.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        // Welcome buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📚 Rules')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('view_rules'),
                new ButtonBuilder()
                    .setLabel('🎫 Get Roles')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('get_roles'),
                new ButtonBuilder()
                    .setLabel('🌐 Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://your-website.com')
            );

        const welcomeChannel = member.guild.channels.cache.find(
            channel => channel.name === '👋welcome' || channel.name === 'general'
        );

        if (welcomeChannel) {
            await welcomeChannel.send({
                embeds: [welcomeEmbed],
                files: [{ attachment, name: 'welcome.png' }],
                components: [row]
            });
        }

        // Send private welcome message
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`🌠 Welcome to ${member.guild.name}!`)
                .setDescription(`
Hello **${member.user.username}**! 

I'm **Nasa Yuzaki**, your guide in this cosmic community! 🚀

**Quick Start:**
• Use \`/help\` to see all commands
• Read the rules in <#rules-channel>
• Get roles in <#roles-channel>
• Explore different channels

**Need Help?**
• Contact moderators
• Use \`/support\` command
• Join our support server

**Bot Information:**
• Version: 2.0.0
• Created: <t:1672531200:R>
• Developer: Ghost Developer

**Follow Us:**
📺 Discord: [Your Channel](https://youtube.com)
📱 Telegram: [Your Group](https://t.me/yourgroup)
🐙 GitHub: [Repository](https://github.com/yourrepo)

Enjoy your stay among the stars! 🌌
                `)
                .setFooter({ 
                    text: 'Nasa Yuzaki • Professional Discord Bot',
                    iconURL: member.client.user.displayAvatarURL() 
                })
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('Could not send DM to user');
        }

        // Assign auto role
        const autoRole = member.guild.roles.cache.find(role => role.name === '🌠 Explorer');
        if (autoRole) {
            await member.roles.add(autoRole);
        }
    }
};