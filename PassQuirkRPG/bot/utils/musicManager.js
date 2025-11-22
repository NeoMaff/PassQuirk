const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

console.log('[MUSIC] FFmpeg path:', ffmpegPath);

class MusicManager {
    constructor() {
        this.player = createAudioPlayer();
        this.connection = null;
        this.currentFile = null;
        this.isLooping = false;
        this.idleListenerAdded = false;
    }

    async joinChannel(channel) {
        if (!channel) return false;

        try {
            console.log(`[MUSIC] Conectando al canal: ${channel.name}`);
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfMute: false,
                selfDeaf: false,
            });

            this.connection.subscribe(this.player);
            console.log(`[MUSIC] Suscrito al player`);

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log('[MUSIC] Desconectado del canal de voz');
                this.connection.destroy();
                this.connection = null;
            });

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('[MUSIC] Conexión de voz lista');
            });

            this.connection.on('error', error => {
                console.error('[MUSIC ERROR] Connection error emitted:', error);
            });

            return true;
        } catch (error) {
            console.error('[MUSIC ERROR] Error joining voice channel:', error);
            return false;
        }
    }

    playFile(filePath, loop = false) {
        try {
            console.log(`[MUSIC] Intentando reproducir: ${filePath}`);
            console.log(`[MUSIC] Loop activado: ${loop}`);

            this.currentFile = filePath;
            this.isLooping = loop;

            if (!require('fs').existsSync(filePath)) {
                console.error(`[MUSIC ERROR] File not found: ${filePath}`);
                return false;
            }

            // Crear recurso de audio con metadata apropiada
            const resource = createAudioResource(filePath, {
                inlineVolume: true,
                metadata: {
                    title: filePath.split(/[/\\\\]/).pop()
                }
            });
            resource.volume.setVolume(1.0); // Asegurar volumen al 100%
            console.log(`[MUSIC] Recurso de audio creado exitosamente. Volumen: 1.0`);

            this.player.play(resource);
            console.log(`[MUSIC] Reproducción iniciada`);
            this.saveState();

            // Listener para errores del player
            this.player.on('error', error => {
                console.error(`[MUSIC ERROR] Error en el player:`, error);
            });

            if (!this.idleListenerAdded) {
                this.player.on(AudioPlayerStatus.Idle, () => {
                    console.log(`[MUSIC] Player Idle detectado. Loop: ${this.isLooping}`);
                    if (this.isLooping && this.currentFile) {
                        console.log(`[MUSIC] Reiniciando reproducción en bucle: ${this.currentFile}`);
                        try {
                            const res = createAudioResource(this.currentFile, {
                                inlineVolume: true,
                                metadata: {
                                    title: this.currentFile.split(/[/\\\\]/).pop()
                                }
                            });
                            this.player.play(res);
                        } catch (loopError) {
                            console.error('[MUSIC ERROR] Error al reiniciar bucle:', loopError);
                        }
                    }
                });
                this.idleListenerAdded = true;
                console.log(`[MUSIC] Listener de bucle configurado`);
            }
            return true;
        } catch (error) {
            console.error('[MUSIC ERROR] Error playing file:', error);
            console.error('[MUSIC ERROR] Stack:', error.stack);
            return false;
        }
    }

    saveState() {
        try {
            const state = {
                guildId: this.connection?.joinConfig?.guildId,
                channelId: this.connection?.joinConfig?.channelId,
                currentFile: this.currentFile,
                isLooping: this.isLooping,
                isPlaying: !!this.connection
            };
            require('fs').writeFileSync(path.join(__dirname, 'musicState.json'), JSON.stringify(state, null, 2));
        } catch (e) {
            console.error('[MUSIC] Error saving state:', e);
        }
    }

    loadState() {
        try {
            const statePath = path.join(__dirname, 'musicState.json');
            if (require('fs').existsSync(statePath)) {
                return JSON.parse(require('fs').readFileSync(statePath, 'utf8'));
            }
        } catch (e) {
            console.error('[MUSIC] Error loading state:', e);
        }
        return null;
    }

    async resumeState(client) {
        const state = this.loadState();
        if (state && state.isPlaying && state.guildId && state.channelId && state.currentFile) {
            console.log('[MUSIC] Resuming previous session...');
            try {
                const guild = await client.guilds.fetch(state.guildId);
                if (guild) {
                    const channel = await guild.channels.fetch(state.channelId);
                    if (channel) {
                        await this.joinChannel(channel);
                        this.playFile(state.currentFile, state.isLooping);
                        console.log('[MUSIC] Session resumed successfully.');
                    }
                }
            } catch (e) {
                console.error('[MUSIC] Failed to resume session:', e);
            }
        }
    }

    stop() {
        console.log('[MUSIC] Deteniendo reproducción');
        this.player.stop();
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
        this.saveState(); // Save empty/stopped state
    }
}

module.exports = new MusicManager();
