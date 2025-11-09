const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

class MusicSystem {
    constructor() {
        this.queues = new Map();
        this.players = new Map();
        this.connections = new Map();
    }

    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                isPlaying: false,
                volume: 100,
                loop: false
            });
        }
        return this.queues.get(guildId);
    }

    addToQueue(guildId, song) {
        const queue = this.getQueue(guildId);
        queue.songs.push(song);
        return queue.songs.length;
    }

    removeFromQueue(guildId, index = 0) {
        const queue = this.getQueue(guildId);
        if (queue.songs.length === 0) return null;
        return queue.songs.splice(index, 1)[0];
    }

    clearQueue(guildId) {
        const queue = this.getQueue(guildId);
        const removed = queue.songs.length;
        queue.songs = [];
        queue.isPlaying = false;
        return removed;
    }

    skipSong(guildId) {
        const queue = this.getQueue(guildId);
        const player = this.players.get(guildId);
        
        if (player) {
            player.stop();
            return true;
        }
        return false;
    }

    setVolume(guildId, volume) {
        const queue = this.getQueue(guildId);
        queue.volume = Math.max(0, Math.min(100, volume));
        
        const player = this.players.get(guildId);
        if (player) {
            const resource = player.state.resource;
            if (resource) {
                resource.volume.setVolume(queue.volume / 100);
            }
        }
        return queue.volume;
    }

    toggleLoop(guildId) {
        const queue = this.getQueue(guildId);
        queue.loop = !queue.loop;
        return queue.loop;
    }

    async createConnection(voiceChannel) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30000);
            this.connections.set(voiceChannel.guild.id, connection);
            return connection;
        } catch (error) {
            connection.destroy();
            throw error;
        }
    }

    createPlayer(guildId) {
        const player = createAudioPlayer();
        this.players.set(guildId, player);

        player.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                this.playNext(guildId);
            }
        });

        player.on('error', error => {
            console.error('Music player error:', error);
            this.playNext(guildId);
        });

        return player;
    }

    async playNext(guildId) {
        const queue = this.getQueue(guildId);
        const connection = this.connections.get(guildId);
        const player = this.players.get(guildId);

        if (!connection || !player) {
            queue.isPlaying = false;
            return;
        }

        if (queue.songs.length === 0) {
            if (queue.loop && queue.currentSong) {
                queue.songs.push(queue.currentSong);
            } else {
                queue.isPlaying = false;
                setTimeout(() => {
                    if (!queue.isPlaying) {
                        connection.destroy();
                        this.connections.delete(guildId);
                        this.players.delete(guildId);
                    }
                }, 300000); // 5 minutes
                return;
            }
        }

        const song = queue.songs.shift();
        queue.currentSong = song;
        queue.isPlaying = true;

        try {
            const resource = createAudioResource(song.url, {
                metadata: song,
                inlineVolume: true
            });

            resource.volume.setVolume(queue.volume / 100);
            player.play(resource);
            connection.subscribe(player);

            return song;
        } catch (error) {
            console.error('Error playing song:', error);
            this.playNext(guildId);
        }
    }

    destroyConnection(guildId) {
        const connection = this.connections.get(guildId);
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
        }
        
        this.players.delete(guildId);
        this.clearQueue(guildId);
    }

    getNowPlaying(guildId) {
        const queue = this.getQueue(guildId);
        return queue.currentSong;
    }

    shuffleQueue(guildId) {
        const queue = this.getQueue(guildId);
        for (let i = queue.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
        }
        return queue.songs;
    }
}

module.exports = MusicSystem;