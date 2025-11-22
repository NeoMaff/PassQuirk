/**
 * interactionHandler.js
 * Manejador central de todas las interacciones del bot PassQuirk RPG
 * Incluye el sistema completo del tutorial según el diagrama oficial
 */

// const TutorialCompleto = require('../systems/tutorial-completo');

class InteractionHandler {
    constructor(client) {
        this.client = client;
        // this.tutorialCompleto = new TutorialCompleto();

        // IDs de interacciones del tutorial
        this.TUTORIAL_INTERACTIONS = [
            'iniciar_aventura_tutorial',
            'crear_personaje_datos',
            'clase_celestial',
            'clase_fenix',
            'clase_berserker',
            'clase_inmortal',
            'clase_demon',
            'clase_sombra',
            'elegir_reino_inicial',
            'seleccionar_reino',
            'iniciar_combate_tutorial',
            'combate_atacar',
            'combate_defender',
            'combate_usar_pocion',
            'combate_ataque_final',
            'ir_space_central',
            'modal_datos_personaje',
            'ver_personaje',
            'explorar_mundo',
            'ayuda_comandos'
        ];
    }

    /**
     * Inicializa el manejador de interacciones
     */
    init() {
        this.client.on('interactionCreate', async (interaction) => {
            try {
                await this.handleInteraction(interaction);
            } catch (error) {
                console.error('Error en interactionHandler:', error);

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
                        ephemeral: true
                    });
                }
            }
        });

        console.log('✅ InteractionHandler inicializado correctamente');
    }

    /**
     * Maneja todas las interacciones del bot
     */
    async handleInteraction(interaction) {
        // Solo maneja comandos slash; botones/modales/selects
        // se gestionan en bot/events/interactionCreate.js
        if (interaction.isChatInputCommand()) {
            await this.handleSlashCommand(interaction);
        }
    }

    /**
     * Verifica si la interacción pertenece al tutorial
     */
    isTutorialInteraction(interaction) {
        const customId = interaction.customId;

        if (!customId) return false;

        return this.TUTORIAL_INTERACTIONS.includes(customId);
    }

    /**
     * Maneja comandos slash
     */
    async handleSlashCommand(interaction) {
        const { commandName } = interaction;

        // El comando /passquirkrpg ya está manejado en su propio archivo
        // Aquí se pueden agregar otros comandos slash

        console.log(`Comando ejecutado: ${commandName}`);
    }

    /**
     * Maneja otras interacciones (botones, modales, menús)
     * Nota: La mayoría se manejan en interactionCreate.js, esto es un respaldo
     */
    async handleOtherInteractions(interaction) {
        // Verificar si es una interacción del tutorial
        if (this.isTutorialInteraction(interaction)) {
            // Delegar al sistema de tutorial completo
            await this.tutorialCompleto.handleInteraction(interaction);
            return;
        }
        console.log(`Interacción no manejada: ${interaction.customId || 'Sin customId'}`);
    }
}

module.exports = InteractionHandler;