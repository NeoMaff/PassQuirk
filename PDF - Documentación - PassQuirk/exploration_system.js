const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Sistema de Exploración con Eventos Dinámicos
class ExplorationSystem {
    constructor() {
        this.explorationEvents = [
            {
                type: 'nothing',
                emoji: '❌',
                title: 'Sin Resultados',
                description: 'No has encontrado nada interesante en esta área.',
                probability: 0.35
            },
            {
                type: 'item',
                emoji: '🎒',
                title: 'Ítem Encontrado',
                description: 'Has encontrado un objeto útil en tu exploración.',
                probability: 0.30
            },
            {
                type: 'enemy',
                emoji: '💥',
                title: 'Enemigo Encontrado',
                description: 'Te has topado con un enemigo durante tu exploración.',
                probability: 0.20
            },
            {
                type: 'quirk',
                emoji: '✨',
                title: 'Quirk Raro',
                description: 'Has descubierto algo extraordinario y único.',
                probability: 0.10
            },
            {
                type: 'treasure',
                emoji: '💎',
                title: 'Tesoro Oculto',
                description: 'Has encontrado un tesoro valioso bien escondido.',
                probability: 0.05
            }
        ];

        this.items = [
            'Poción de Curación', 'Cristal de Energía', 'Fragmento Misterioso',
            'Amuleto Antiguo', 'Piedra Rúnica', 'Elixir Mágico',
            'Artefacto Perdido', 'Gema Brillante', 'Reliquia Antigua'
        ];

        this.enemies = [
            'Sombra Errante', 'Bestia Salvaje', 'Guardián Corrupto',
            'Espíritu Maligno', 'Golem de Piedra', 'Lobo Sombrío',
            'Esqueleto Guerrero', 'Araña Gigante', 'Orco Salvaje'
        ];

        this.quirks = [
            'Portal Dimensional', 'Fuente de Poder', 'Altar Misterioso',
            'Árbol Sagrado', 'Cristal Resonante', 'Ruinas Antiguas',
            'Grieta Temporal', 'Nexo de Energía', 'Santuario Oculto'
        ];

        this.treasures = [
            'Cofre del Tesoro Perdido', 'Corona de los Antiguos', 'Espada Legendaria',
            'Libro de Hechizos Antiguos', 'Anillo del Poder', 'Collar de Diamantes',
            'Báculo Mágico', 'Armadura Celestial', 'Cáliz Dorado'
        ];
    }

    // Generar evento aleatorio basado en probabilidades
    generateRandomEvent(weatherEffects = null) {
        let events = [...this.explorationEvents];
        
        // Aplicar efectos del clima si se proporcionan
        if (weatherEffects) {
            events = events.map(event => {
                if (event.type === 'item' || event.type === 'treasure') {
                    return {
                        ...event,
                        probability: event.probability * weatherEffects.lootBonus
                    };
                }
                if (event.type === 'enemy') {
                    return {
                        ...event,
                        probability: event.probability * weatherEffects.enemySpawn
                    };
                }
                return event;
            });
        }

        const random = Math.random();
        let accumulated = 0;
        
        for (const event of events) {
            accumulated += event.probability;
            if (random <= accumulated) {
                return this.generateEventDetails(event);
            }
        }
        
        return this.generateEventDetails(events[0]); // Fallback
    }

    // Generar detalles específicos del evento
    generateEventDetails(eventType) {
        const event = { ...eventType };
        
        switch (event.type) {
            case 'item':
                event.foundItem = this.items[Math.floor(Math.random() * this.items.length)];
                event.description = `Has encontrado: **${event.foundItem}**`;
                break;
                
            case 'enemy':
                event.foundEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                event.description = `Te enfrentas a: **${event.foundEnemy}**`;
                break;
                
            case 'quirk':
                event.foundQuirk = this.quirks[Math.floor(Math.random() * this.quirks.length)];
                event.description = `Has descubierto: **${event.foundQuirk}**`;
                break;
                
            case 'treasure':
                event.foundTreasure = this.treasures[Math.floor(Math.random() * this.treasures.length)];
                event.description = `¡Has encontrado: **${event.foundTreasure}**!`;
                break;
        }
        
        return event;
    }

    // Crear embed inicial de exploración
    createInitialExplorationEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('🗺️ Sistema de Exploración')
            .setDescription('¡Explora el mundo y descubre lo que te aguarda!')
            .setColor('#2ECC71')
            .addFields(
                {
                    name: '🔍 Exploración',
                    value: 'Haz clic en **Explorar** para comenzar tu aventura',
                    inline: false
                },
                {
                    name: '📊 Posibilidades',
                    value: '• 35% - Sin resultados\n• 30% - Encontrar ítem\n• 20% - Encontrar enemigo\n• 10% - Quirk raro\n• 5% - Tesoro oculto',
                    inline: false
                }
            )
            .setFooter({ text: '⚡ Los resultados pueden verse afectados por el clima' })
            .setTimestamp();

        return embed;
    }

    // Crear embed de búsqueda (mientras explora)
    createSearchingEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('🔎 Explorando...')
            .setDescription('Buscando en el área... ¡Espera un momento!')
            .setColor('#F39C12')
            .addFields({
                name: '⏱️ Estado',
                value: '🔄 Explorando la zona...',
                inline: false
            })
            .setTimestamp();

        return embed;
    }

    // Crear embed de resultado de exploración
    createResultEmbed(event, weatherInfo = null) {
        let color = '#95A5A6'; // Gris por defecto
        
        switch (event.type) {
            case 'nothing':
                color = '#95A5A6';
                break;
            case 'item':
                color = '#3498DB';
                break;
            case 'enemy':
                color = '#E74C3C';
                break;
            case 'quirk':
                color = '#9B59B6';
                break;
            case 'treasure':
                color = '#F1C40F';
                break;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${event.emoji} ${event.title}`)
            .setDescription(event.description)
            .setColor(color)
            .setTimestamp();

        // Añadir información adicional según el tipo de evento
        if (event.type !== 'nothing') {
            embed.addFields({
                name: '🎯 Resultado',
                value: this.getEventActionText(event),
                inline: false
            });
        }

        // Añadir información del clima si está disponible
        if (weatherInfo) {
            embed.addFields({
                name: '🌤️ Efecto del Clima',
                value: weatherInfo.description,
                inline: false
            });
        }

        return embed;
    }

    // Obtener texto de acción para cada tipo de evento
    getEventActionText(event) {
        switch (event.type) {
            case 'item':
                return '🎒 El ítem ha sido añadido a tu inventario.';
            case 'enemy':
                return '⚔️ ¡Prepárate para el combate!';
            case 'quirk':
                return '✨ Este descubrimiento podría ser muy útil.';
            case 'treasure':
                return '💰 ¡Has obtenido un tesoro muy valioso!';
            default:
                return '➡️ Continúa explorando para encontrar algo interesante.';
        }
    }

    // Crear botones de exploración
    createExplorationButtons(isSearching = false, hasHistory = false) {
        const row = new ActionRowBuilder();

        // Botón de explorar
        const exploreButton = new ButtonBuilder()
            .setCustomId('explore_action')
            .setLabel(isSearching ? 'Explorando...' : 'Explorar')
            .setEmoji('🔍')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(isSearching);

        row.addComponents(exploreButton);

        // Botón de atrás (solo si hay historial)
        if (hasHistory) {
            const backButton = new ButtonBuilder()
                .setCustomId('explore_back')
                .setLabel('Atrás')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Secondary);
            
            row.addComponents(backButton);
        }

        // Botón de stats/inventario
        const statsButton = new ButtonBuilder()
            .setCustomId('explore_stats')
            .setLabel('Stats')
            .setEmoji('📊')
            .setStyle(ButtonStyle.Secondary);

        row.addComponents(statsButton);

        return row;
    }
}

// Manejador del sistema de exploración
class ExplorationHandler {
    constructor(explorationSystem, timeWeatherSystem = null) {
        this.explorationSystem = explorationSystem;
        this.timeWeatherSystem = timeWeatherSystem;
        this.explorationHistory = new Map(); // userId -> array de eventos
        this.explorationCooldowns = new Map(); // userId -> timestamp
    }

    // Iniciar exploración
    async handleExplorationStart(interaction, userData) {
        const embed = this.explorationSystem.createInitialExplorationEmbed();
        const buttons = this.explorationSystem.createExplorationButtons();

        await interaction.reply({
            embeds: [embed],
            components: [buttons],
            ephemeral: false
        });
    }

    // Manejar acción de explorar
    async handleExploreAction(interaction, userData) {
        const userId = interaction.user.id;
        
        // Verificar cooldown (opcional)
        if (this.explorationCooldowns.has(userId)) {
            const lastExploration = this.explorationCooldowns.get(userId);
            const cooldownTime = 3000; // 3 segundos
            
            if (Date.now() - lastExploration < cooldownTime) {
                await interaction.reply({
                    content: '⏱️ Espera un momento antes de explorar de nuevo.',
                    ephemeral: true
                });
                return;
            }
        }

        // Mostrar estado de búsqueda
        const searchingEmbed = this.explorationSystem.createSearchingEmbed();
        const searchingButtons = this.explorationSystem.createExplorationButtons(true, this.hasExplorationHistory(userId));

        await interaction.update({
            embeds: [searchingEmbed],
            components: [searchingButtons]
        });

        // Simular tiempo de exploración
        await this.delay(2000 + Math.random() * 2000); // 2-4 segundos

        // Generar evento
        let weatherEffects = null;
        if (this.timeWeatherSystem) {
            weatherEffects = this.timeWeatherSystem.getWeatherEffects();
        }

        const event = this.explorationSystem.generateRandomEvent(weatherEffects);
        
        // Guardar en historial
        this.addToExplorationHistory(userId, event);
        
        // Actualizar cooldown
        this.explorationCooldowns.set(userId, Date.now());

        // Crear embed de resultado
        const resultEmbed = this.explorationSystem.createResultEmbed(event, weatherEffects);
        const resultButtons = this.explorationSystem.createExplorationButtons(false, true);

        try {
            await interaction.editReply({
                embeds: [resultEmbed],
                components: [resultButtons]
            });
            
            // Aquí puedes añadir lógica para actualizar inventario, stats, etc.
            await this.processEventReward(interaction, event, userData);
            
        } catch (error) {
            console.error('Error updating exploration result:', error);
        }
    }

    // Manejar botón de atrás
    async handleExploreBack(interaction, userData) {
        const userId = interaction.user.id;
        const history = this.explorationHistory.get(userId) || [];
        
        if (history.length < 2) {
            await interaction.reply({
                content: '❌ No hay eventos anteriores para mostrar.',
                ephemeral: true
            });
            return;
        }

        // Mostrar el evento anterior (penúltimo)
        const previousEvent = history[history.length - 2];
        let weatherEffects = null;
        if (this.timeWeatherSystem) {
            weatherEffects = this.timeWeatherSystem.getWeatherEffects();
        }

        const embed = this.explorationSystem.createResultEmbed(previousEvent, weatherEffects);
        const buttons = this.explorationSystem.createExplorationButtons(false, true);

        await interaction.update({
            embeds: [embed],
            components: [buttons]
        });
    }

    // Funciones auxiliares
    hasExplorationHistory(userId) {
        const history = this.explorationHistory.get(userId) || [];
        return history.length > 0;
    }

    addToExplorationHistory(userId, event) {
        if (!this.explorationHistory.has(userId)) {
            this.explorationHistory.set(userId, []);
        }
        
        const history = this.explorationHistory.get(userId);
        history.push(event);
        
        // Mantener solo los últimos 10 eventos
        if (history.length > 10) {
            history.shift();
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Procesar recompensas del evento (implementar según tu sistema)
    async processEventReward(interaction, event, userData) {
        // Aquí añades la lógica para:
        // - Añadir ítems al inventario
        // - Iniciar combate si es un enemigo
        // - Dar experiencia o monedas
        // - Activar quirks especiales
        // etc.
        
        console.log(`Procesando evento ${event.type} para usuario ${interaction.user.id}`);
        
        // Ejemplo básico de notificación
        if (event.type === 'treasure') {
            setTimeout(async () => {
                try {
                    await interaction.followUp({
                        content: `🎉 ¡Felicidades! Has obtenido un tesoro excepcional.`,
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Error sending follow-up:', error);
                }
            }, 1000);
        }
    }
}

module.exports = { ExplorationSystem, ExplorationHandler };