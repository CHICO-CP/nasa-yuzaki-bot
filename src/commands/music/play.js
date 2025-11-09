const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, StreamType, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const Embeds = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube')
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('Song name or URL to play')
                .setRequired(true)),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            const embed = Embeds.error('Voice Channel Required', 'You need to be in a voice channel to play music!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        const songQuery = interaction.options.getString('song');
        
        // Verificar permisos del bot
        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            const embed = Embeds.error('Missing Permissions', 'I need **Connect** and **Speak** permissions in your voice channel!', client);
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            // Simular búsqueda de música (en un bot real aquí iría la integración con YouTube/Spotify)
            const song = await this.searchMusic(songQuery);
            
            // Inicializar sistema de música si no existe
            if (!client.musicSystem) {
                const MusicSystem = require('../../systems/musicSystem');
                client.musicSystem = new MusicSystem();
            }

            // Conectar al canal de voz
            let connection = client.musicSystem.connections.get(interaction.guild.id);
            if (!connection) {
                connection = await client.musicSystem.createConnection(voiceChannel);
            }

            // Crear reproductor si no existe
            let player = client.musicSystem.players.get(interaction.guild.id);
            if (!player) {
                player = client.musicSystem.createPlayer(interaction.guild.id);
            }

            // Agregar canción a la cola
            const queuePosition = client.musicSystem.addToQueue(interaction.guild.id, song);
            
            const embed = Embeds.music(
                '🎵 Added to Queue',
                `**${song.title}** has been added to the queue.\n**Position:** #${queuePosition}\n**Duration:** ${song.duration}\n**Requested by:** ${interaction.user.tag}`,
                client
            );

            await interaction.editReply({ embeds: [embed] });

            // Reproducir si no hay nada sonando
            const queue = client.musicSystem.getQueue(interaction.guild.id);
            if (!queue.isPlaying) {
                await client.musicSystem.playNext(interaction.guild.id);
            }

        } catch (error) {
            console.error('Play command error:', error);
            const embed = Embeds.error(
                'Playback Failed', 
                'An error occurred while trying to play the music. Please try again.',
                client
            );
            await interaction.editReply({ embeds: [embed] });
        }
    },

    async searchMusic(query) {
        // Simulación de búsqueda de música
        // En un bot real, aquí integrarías con YouTube API, Spotify, etc.
        const mockSongs = [
            {
                title: "Astronaut in the Ocean",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                duration: "2:45",
                thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                requestedBy: "User"
            },
            {
                title: "Space Song - Beach House",
                url: "https://www.youtube.com/watch?v=6TgQ3oUGgR4",
                duration: "5:21",
                thumbnail: "https://i.ytimg.com/vi/6TgQ3oUGgR4/hqdefault.jpg",
                requestedBy: "User"
            },
            {
                title: "Starboy - The Weeknd",
                url: "https://www.youtube.com/watch?v=34Na4j8AVgA",
                duration: "3:50",
                thumbnail: "https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg",
                requestedBy: "User"
            }
        ];

        // Simular búsqueda aleatoria
        const randomSong = mockSongs[Math.floor(Math.random() * mockSongs.length)];
        randomSong.title = `${query} - ${randomSong.title}`;
        randomSong.requestedBy = "User";
        
        return randomSong;
    }
};