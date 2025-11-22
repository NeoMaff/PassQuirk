const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { DialogEmbed, COLORS } = require('../utils/embedStyles');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tutorial')
        .setDescription('Inicia el tutorial interactivo de PassQuirk RPG'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar si el usuario ya tiene un personaje
        let user = await User.findOne({ discordId: userId });

        if (user && user.tutorialCompleted) {
            return interaction.reply({
                content: '¡Ya has completado el tutorial! Usa `/personaje` para ver tu información.',
                ephemeral: true
            });
        }

        // Crear o actualizar el usuario
        if (!user) {
            user = await User.create({
                discordId: userId,
                username: interaction.user.username,
                tutorialStep: 0,
                tutorialCompleted: false
            });
        }

        // Iniciar tutorial
        await this.showTutorialStep(interaction, 0);
    },

    async showTutorialStep(interaction, step) {
        const tutorialSteps = [
            {
                npc: '🧙‍♂️ El Sabio',
                image: 'https://i.imgur.com/tutorial_sabio.png', // Placeholder - reemplazar con imagen real
                dialog: '**¡Bienvenido a PassQuirk RPG!**\n\n' +
                       'Mi nombre es **El Sabio**, guardián del conocimiento ancestral de estos reinos.\n\n' +
                       'Has despertado en un mundo lleno de magia, aventuras y peligros. ' +
                       'Pero no temas, joven aventurero, yo te guiaré en tus primeros pasos.\n\n' +
                       '¿Estás listo para comenzar tu aventura?',
                buttons: [
                    { id: 'tutorial_next', label: '¡Estoy listo!', style: ButtonStyle.Success },
                    { id: 'tutorial_skip', label: 'Saltar tutorial', style: ButtonStyle.Secondary }
                ]
            },
            {
                npc: '🧙‍♂️ El Sabio',
                image: 'https://i.imgur.com/tutorial_sabio.png',
                dialog: '**El Mundo de PassQuirk**\n\n' +
                       'Este mundo está dividido en **tres grandes reinos**:\n\n' +
                       '🔴 **Reino de Akai** - El reino de los guerreros, donde la fuerza y el honor son supremos.\n\n' +
                       '🟢 **Reino de Say** - El reino de la magia, hogar de los más grandes hechiceros.\n\n' +
                       '🟡 **Reino de Masai** - El reino del comercio, donde la astucia es más valiosa que el oro.\n\n' +
                       'Cada reino tiene sus propias ciudades, mazmorras y secretos por descubrir.',
                buttons: [
                    { id: 'tutorial_next', label: 'Continuar', style: ButtonStyle.Primary },
                    { id: 'tutorial_back', label: 'Atrás', style: ButtonStyle.Secondary }
                ]
            },
            {
                npc: '🧙‍♂️ El Sabio',
                image: 'https://i.imgur.com/tutorial_sabio.png',
                dialog: '**Sistema de Combate**\n\n' +
                       'En PassQuirk, los combates son **por turnos**, similar a los grandes RPGs clásicos.\n\n' +
                       '⚔️ Cada personaje tiene **Puntos de Vida (PV)** y **Puntos de Acción (PA)**\n' +
                       '✨ Las habilidades consumen PA y tienen diferentes efectos\n' +
                       '🎯 La estrategia es clave: usa tus habilidades sabiamente\n' +
                       '💊 Los objetos pueden cambiar el rumbo de la batalla\n\n' +
                       'Más adelante tendrás tu primer combate de práctica.',
                buttons: [
                    { id: 'tutorial_next', label: 'Continuar', style: ButtonStyle.Primary },
                    { id: 'tutorial_back', label: 'Atrás', style: ButtonStyle.Secondary }
                ]
            },
            {
                npc: '🧙‍♂️ El Sabio',
                image: 'https://i.imgur.com/tutorial_sabio.png',
                dialog: '**Progresión y Recompensas**\n\n' +
                       'A medida que aventuras y derrotas enemigos, ganarás:\n\n' +
                       '✨ **Experiencia (EXP)** - Para subir de nivel\n' +
                       '💰 **PassCoins** - La moneda del reino\n' +
                       '⚔️ **Puntos de Guerra (PG)** - Reconocimiento de tu valentía\n' +
                       '🎁 **Objetos y Equipo** - Para mejorar tu poder\n\n' +
                       'Cada nivel te hará más fuerte y desbloqueará nuevas habilidades.',
                buttons: [
                    { id: 'tutorial_next', label: 'Continuar', style: ButtonStyle.Primary },
                    { id: 'tutorial_back', label: 'Atrás', style: ButtonStyle.Secondary }
                ]
            },
            {
                npc: '🧙‍♂️ El Sabio',
                image: 'https://i.imgur.com/tutorial_sabio.png',
                dialog: '**Tu Primera Misión**\n\n' +
                       'Ha llegado el momento de poner a prueba tus habilidades.\n\n' +
                       'Un **Slime de Tutorial** ha aparecido cerca de la aldea. ' +
                       'Estas criaturas son perfectas para principiantes.\n\n' +
                       '🎯 **Objetivo:** Derrota al Slime\n' +
                       '🏆 **Recompensa:** 100 EXP, 50 PassCoins\n\n' +
                       'No te preocupes, estaré aquí para guiarte durante el combate.',
                buttons: [
                    { id: 'tutorial_battle', label: '¡Al combate!', style: ButtonStyle.Danger },
                    { id: 'tutorial_back', label: 'Atrás', style: ButtonStyle.Secondary }
                ]
            }
        ];

        if (step < 0 || step >= tutorialSteps.length) {
            return;
        }

        const currentStep = tutorialSteps[step];

        // Crear el embed del diálogo
        const embed = new DialogEmbed(
            currentStep.npc,
            currentStep.dialog,
            {
                image: currentStep.image,
                npcAvatar: 'https://i.imgur.com/sabio_icon.png' // Placeholder
            }
        );

        // Crear los botones
        const row = new ActionRowBuilder();
        for (const button of currentStep.buttons) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${button.id}_${step}`)
                    .setLabel(button.label)
                    .setStyle(button.style)
            );
        }

        // Enviar o actualizar mensaje
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [embed], components: [row] });
        } else {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    },

    async handleButton(interaction) {
        const [action, stepStr] = interaction.customId.split('_').slice(1);
        const step = parseInt(stepStr);

        await interaction.deferUpdate();

        if (action === 'next') {
            await this.showTutorialStep(interaction, step + 1);
        } else if (action === 'back') {
            await this.showTutorialStep(interaction, step - 1);
        } else if (action === 'skip') {
            await this.completeTutorial(interaction, true);
        } else if (action === 'battle') {
            await this.startTutorialBattle(interaction);
        }
    },

    async startTutorialBattle(interaction) {
        const embed = new DialogEmbed(
            '🧙‍♂️ El Sabio',
            '**¡El Slime aparece!**\n\n' +
            '🟢 **Slime de Tutorial** Nv. 1\n' +
            'PV: 30/30 | PA: 10/10\n\n' +
            '⚔️ **Tu turno**\n' +
            'Elige tu acción:',
            { image: 'https://i.imgur.com/slime_tutorial.png' }
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('battle_attack')
                    .setLabel('⚔️ Ataque Básico')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('battle_skill')
                    .setLabel('✨ Habilidad')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('battle_item')
                    .setLabel('🎒 Objeto')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });

        // Aquí se integraría con el sistema de combate real
        // Por ahora, después de 3 turnos el jugador gana automáticamente
    },

    async completeTutorial(interaction, skipped = false) {
        const userId = interaction.user.id;
        const user = await User.findOne({ discordId: userId });

        if (user) {
            user.tutorialCompleted = true;
            user.tutorialStep = -1;
            await user.save();
        }

        const embed = new DialogEmbed(
            '🧙‍♂️ El Sabio',
            skipped
                ? '**Tutorial Omitido**\n\nMuy bien, veo que ya tienes experiencia. ' +
                  '¡Que los vientos del destino te sean favorables, aventurero!\n\n' +
                  'Usa `/crearpersonaje` para crear tu personaje y comenzar tu aventura.'
                : '**¡Tutorial Completado!**\n\n' +
                  '¡Excelente trabajo, joven aventurero! Has demostrado tu valía.\n\n' +
                  '🎁 **Recompensas obtenidas:**\n' +
                  '• 100 EXP\n' +
                  '• 50 PassCoins\n' +
                  '• Poción de salud ×3\n\n' +
                  'Ahora usa `/crearpersonaje` para definir tu destino.',
            { image: 'https://i.imgur.com/tutorial_complete.png' }
        );

        await interaction.editReply({ embeds: [embed], components: [] });
    }
};
