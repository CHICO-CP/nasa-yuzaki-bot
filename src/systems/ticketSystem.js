const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');

class TicketSystem {
    constructor(client) {
        this.client = client;
        this.db = client.db;
    }

    async createTicketPanel(guildId, channelId, title, description, categoryId) {
        const panelData = {
            guildId,
            channelId,
            title,
            description,
            categoryId,
            createdAt: Date.now()
        };

        await this.db.set(`ticket_panel_${guildId}_${channelId}`, panelData);

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`create_ticket_${guildId}`)
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

        return { panelData, components: [button] };
    }

    async createTicket(guildId, userId, reason = 'No reason provided') {
        const guild = this.client.guilds.cache.get(guildId);
        const user = await this.client.users.fetch(userId);
        
        if (!guild || !user) throw new Error('Guild or user not found');

        // Obtener configuración del panel
        const panelData = await this.getPanelData(guildId);
        if (!panelData) throw new Error('No ticket panel configured');

        const ticketId = await this.generateTicketId(guildId);
        const channelName = `ticket-${ticketId}`;

        // Crear canal de ticket
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: panelData.categoryId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: userId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: this.client.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ManageChannels,
                    ],
                },
            ],
        });

        // Guardar datos del ticket
        const ticketData = {
            id: ticketId,
            guildId,
            channelId: channel.id,
            userId,
            reason,
            createdAt: Date.now(),
            status: 'open',
            claimedBy: null
        };

        await this.db.set(`ticket_${guildId}_${ticketId}`, ticketData);

        // Enviar mensaje inicial
        const ticketEmbed = {
            color: this.client.config.colors.info,
            title: `🎫 Ticket #${ticketId}`,
            description: `Thank you for creating a ticket! Support will be with you shortly.\n\n**Reason:** ${reason}`,
            fields: [
                { name: 'User', value: `<@${userId}>`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                { name: 'Status', value: '🟢 Open', inline: true }
            ],
            footer: { 
                text: `${this.client.config.bot.name} Ticket System`,
                iconURL: this.client.user.displayAvatarURL() 
            },
            timestamp: new Date()
        };

        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`close_ticket_${ticketId}`)
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        await channel.send({ 
            content: `<@${userId}>`,
            embeds: [ticketEmbed], 
            components: [closeButton] 
        });

        return { ticketData, channel };
    }

    async closeTicket(guildId, ticketId, closerId, reason = 'No reason provided') {
        const ticketData = await this.db.get(`ticket_${guildId}_${ticketId}`);
        if (!ticketData) throw new Error('Ticket not found');

        const guild = this.client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(ticketData.channelId);

        if (!channel) throw new Error('Ticket channel not found');

        // Actualizar datos del ticket
        ticketData.status = 'closed';
        ticketData.closedAt = Date.now();
        ticketData.closedBy = closerId;
        ticketData.closeReason = reason;

        await this.db.set(`ticket_${guildId}_${ticketId}`, ticketData);

        // Enviar mensaje de cierre
        const closeEmbed = {
            color: this.client.config.colors.warning,
            title: `🔒 Ticket Closed`,
            description: `This ticket has been closed by <@${closerId}>`,
            fields: [
                { name: 'Reason', value: reason, inline: false },
                { name: 'Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                { name: 'Ticket ID', value: `#${ticketId}`, inline: true }
            ],
            footer: { 
                text: `${this.client.config.bot.name} Ticket System`,
                iconURL: this.client.user.displayAvatarURL() 
            },
            timestamp: new Date()
        };

        await channel.send({ embeds: [closeEmbed] });

        // Eliminar permisos de escritura
        await channel.permissionOverwrites.edit(ticketData.userId, {
            SendMessages: false,
            AddReactions: false
        });

        // Renombrar canal
        await channel.setName(`closed-${ticketId}`);

        return ticketData;
    }

    async generateTicketId(guildId) {
        const tickets = await this.db.all();
        const guildTickets = tickets.filter(t => t.ID.startsWith(`ticket_${guildId}_`));
        return (guildTickets.length + 1).toString().padStart(4, '0');
    }

    async getPanelData(guildId) {
        const tickets = await this.db.all();
        const panel = tickets.find(t => t.ID.startsWith(`ticket_panel_${guildId}_`));
        return panel ? panel.data : null;
    }

    async getOpenTickets(guildId) {
        const tickets = await this.db.all();
        return tickets.filter(t => 
            t.ID.startsWith(`ticket_${guildId}_`) && 
            t.data.status === 'open'
        ).map(t => t.data);
    }

    async deleteTicket(guildId, ticketId) {
        const ticketData = await this.db.get(`ticket_${guildId}_${ticketId}`);
        if (!ticketData) throw new Error('Ticket not found');

        const guild = this.client.guilds.cache.get(guildId);
        const channel = guild.channels.cache.get(ticketData.channelId);

        if (channel) {
            await channel.delete('Ticket deleted');
        }

        await this.db.delete(`ticket_${guildId}_${ticketId}`);
        return true;
    }
}

module.exports = TicketSystem;