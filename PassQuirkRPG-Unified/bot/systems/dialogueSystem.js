const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

class DialogueSystem {
    constructor(client) {
        this.client = client;
        this.dialogues = new Map();
        this.characterData = new Map(); // Almacena temporalmente los datos del personaje
        this.loadDialogues();
    }

    loadDialogues() {
        try {
            // ===== DIÁLOGO DE BIENVENIDA =====
            this.dialogues.set('welcome', {
                id: 'welcome',
                title: '🌟 ¡Bienvenido a PassQuirk RPG! 🌟',
                description: '¡Saludos, joven aventurero! Soy El Sabio, tu guía en este mundo lleno de misterios y aventuras.\n\nJuntos aprenderás todo lo necesario para convertirte en un héroe legendario.',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'BUTTONS',
                        buttons: [
                            { id: 'start_creation', label: 'Comenzar Aventura', emoji: '▶️', style: 'Primary' }
                        ]
                    }
                ]
            });

            // ===== CREACIÓN DE PERSONAJE =====
            // 1. Nombre del personaje
            this.dialogues.set('character_name', {
                id: 'character_name',
                title: '👤 Creación de Personaje',
                description: 'Antes de comenzar, necesito saber tu nombre, joven aventurero.\n\n¿Cómo te llamarás en este mundo?',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'MODAL',
                        customId: 'character_name_modal',
                        title: 'Elige tu nombre',
                        label: 'Nombre del personaje',
                        placeholder: 'Escribe tu nombre aquí...',
                        style: 'SHORT',
                        minLength: 3,
                        maxLength: 20
                    }
                ]
            });

            // 2. Género del personaje
            this.dialogues.set('character_gender', {
                id: 'character_gender',
                title: '👤 Género del Personaje',
                description: 'Ahora, ¿con qué género te identificas?',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'BUTTONS',
                        buttons: [
                            { id: 'gender_male', label: 'Masculino', emoji: '♂️', style: 'Primary' },
                            { id: 'gender_female', label: 'Femenino', emoji: '♀️', style: 'Primary' },
                            { id: 'gender_other', label: 'Otro', emoji: '❔', style: 'Secondary' }
                        ]
                    }
                ]
            });

            // 3. Clase del personaje
            this.dialogues.set('character_class', {
                id: 'character_class',
                title: '🎯 Clase del Personaje',
                description: 'Elige la clase que mejor se adapte a tu estilo de juego. Cada una tiene habilidades únicas.\n\n*Selecciona una para ver sus detalles.*',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'SELECT_MENU',
                        customId: 'class_select',
                        placeholder: 'Selecciona una clase',
                        options: [
                            { label: 'Arquero 🎯', value: 'archer', description: 'Especialista en ataques a distancia' },
                            { label: 'Ninja 🥷', value: 'ninja', description: 'Ágil y letal en combate cuerpo a cuerpo' },
                            { label: 'Espadachín 🗡️', value: 'swordsman', description: 'Maestro de la espada' },
                            { label: 'Guerrero 🛡️', value: 'warrior', description: 'Fuerte y resistente' },
                            { label: 'Mago 🧙‍♂️', value: 'mage', description: 'Poderoso en artes arcanas' }
                        ]
                    }
                ]
            });

            // 4. Región de inicio
            this.dialogues.set('start_region', {
                id: 'start_region',
                title: '🌍 Región de Inicio',
                description: 'Elige la región donde comenzará tu aventura. Cada una ofrece experiencias únicas.\n\n*Selecciona una para ver sus detalles.*',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'SELECT_MENU',
                        customId: 'region_select',
                        placeholder: 'Selecciona una región',
                        options: [
                            { label: 'Reino Rojo: Akai 🌋', value: 'akai', description: 'Tierras volcánicas de guerreros' },
                            { label: 'Reino Verde: Say 🌲', value: 'say', description: 'Bosques encantados de magia' },
                            { label: 'Reino Amarillo: Masai 🏜️', value: 'masai', description: 'Desiertos de comercio y misterio' },
                            { label: 'Bosque Misterioso 🌑', value: 'forest', description: 'Lleno de secretos por descubrir' },
                            { label: 'Cueva Oscura 🕳️', value: 'cave', description: 'Para los más valientes' }
                        ]
                    }
                ]
            });

            // ===== TUTORIAL DE COMBATE =====
            this.dialogues.set('combat_tutorial', {
                id: 'combat_tutorial',
                title: '⚔️ ¡Un Slime Salvaje Aparece! ⚔️',
                description: '¡Cuidado! Un Slime salvaje te ha encontrado.\n\n**Vida del Slime: 20/20**\n\n*Elige una acción:*',
                image: 'slime_tutorial.png',
                components: [
                    {
                        type: 'BUTTONS',
                        buttons: [
                            { id: 'attack', label: 'Atacar', emoji: '⚔️', style: 'Danger' },
                            { id: 'defend', label: 'Defender', emoji: '🛡️', style: 'Secondary' },
                            { id: 'ability', label: 'Habilidad', emoji: '✨', style: 'Primary', disabled: true },
                            { id: 'item', label: 'Objeto', emoji: '🎒', style: 'Secondary' }
                        ]
                    }
                ]
            });

            // ===== DIÁLOGO DE VICTORIA =====
            this.dialogues.set('tutorial_victory', {
                id: 'tutorial_victory',
                title: '🎉 ¡Victoria! 🎉',
                description: '¡Felicidades! Has derrotado al Slime salvaje.\n\n**¡Has ganado 10 de experiencia y 5 monedas de oro!**\n\n*El Slime soltó un objeto raro: \'Gel de Slime brillante\'.*',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'BUTTONS',
                        buttons: [
                            { id: 'continue', label: 'Continuar', emoji: '➡️', style: 'Success' }
                        ]
                    }
                ]
            });

            // ===== MENSAJE FINAL DEL TUTORIAL =====
            this.dialogues.set('tutorial_complete', {
                id: 'tutorial_complete',
                title: '🏆 ¡Tutorial Completado! 🏆',
                description: '¡Excelente trabajo, {name}! Has completado el tutorial básico de PassQuirk RPG.\n\nAhora estás listo para explorar el mundo y vivir increíbles aventuras.\n\n**¡Tu viaje acaba de comenzar!**',
                image: 'tutorial_sabio.png',
                components: [
                    {
                        type: 'BUTTONS',
                        buttons: [
                            { id: 'go_to_town', label: 'Ir a la Ciudad', emoji: '🏙️', style: 'Primary' },
                            { id: 'view_profile', label: 'Ver Perfil', emoji: '📋', style: 'Secondary' }
                        ]
                    }
                ]
            });

        } catch (error) {
            console.error('Error al cargar los diálogos:', error);
        }
    }

    async showDialogue(interaction, dialogueId = 'welcome', data = {}) {
        const dialogue = this.dialogues.get(dialogueId);
        if (!dialogue) return null;

        // Reemplazar variables en el texto
        let description = dialogue.description;
        if (data.name) description = description.replace(/{name}/g, data.name);
        if (data.gender) description = description.replace(/{gender}/g, data.gender);

        const embed = new EmbedBuilder()
            .setTitle(dialogue.title)
            .setDescription(description)
            .setColor('#6C63FF');

        // Agregar imagen si existe
        if (dialogue.image) {
            embed.setImage(`attachment://${dialogue.image}`);
        }

        const components = [];
        
        // Procesar componentes del diálogo
        for (const component of dialogue.components || []) {
            if (component.type === 'BUTTONS') {
                const row = new ActionRowBuilder();
                
                for (const btn of component.buttons) {
                    const button = new ButtonBuilder()
                        .setCustomId(`dialogue_${dialogue.id}_${btn.id}`)
                        .setLabel(btn.label)
                        .setStyle(ButtonStyle[btn.style] || ButtonStyle.Primary);
                    
                    if (btn.emoji) button.setEmoji(btn.emoji);
                    if (btn.disabled) button.setDisabled(btn.disabled);
                    if (btn.description) button.setDescription(btn.description);
                    
                    row.addComponents(button);
                }
                
                components.push(row);
            }
            else if (component.type === 'SELECT_MENU') {
                const row = new ActionRowBuilder();
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`dialogue_${dialogue.id}_${component.customId}`)
                    .setPlaceholder(component.placeholder);
                
                for (const option of component.options) {
                    const selectOption = {
                        label: option.label,
                        value: option.value,
                        description: option.description || '',
                    };
                    
                    if (option.emoji) selectOption.emoji = option.emoji;
                    
                    selectMenu.addOptions(selectOption);
                }
                
                row.addComponents(selectMenu);
                components.push(row);
            }
            else if (component.type === 'MODAL' && interaction) {
                // Los modales se manejan de manera diferente
                const modal = new ModalBuilder()
                    .setCustomId(component.customId)
                    .setTitle(component.title);

                const input = new TextInputBuilder()
                    .setCustomId('input')
                    .setLabel(component.label)
                    .setStyle(TextInputStyle[component.style] || TextInputStyle.Short)
                    .setRequired(component.required !== false);

                if (component.placeholder) input.setPlaceholder(component.placeholder);
                if (component.minLength) input.setMinLength(component.minLength);
                if (component.maxLength) input.setMaxLength(component.maxLength);

                const firstActionRow = new ActionRowBuilder().addComponents(input);
                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);
                return null; // No devolver mensaje ya que mostramos un modal
            }
        }

        // Obtener la ruta de la imagen
        const imagePath = path.join(__dirname, '..', 'assets', 'images', 'npcs', dialogue.image);
        
        // Verificar si la imagen existe
        let files = [];
        try {
            if (fs.existsSync(imagePath)) {
                files = [{
                    attachment: imagePath,
                    name: dialogue.image
                }];
            } else {
                console.warn(`No se encontró la imagen: ${imagePath}`);
            }
        } catch (err) {
            console.error('Error al cargar la imagen:', err);
        }
        
        return { 
            embeds: [embed], 
            components,
            files
        };
    }

    async handleButton(interaction) {
        const buttonId = interaction.customId.replace('dialogue_', '');
        const userId = interaction.user.id;

        try {
            // Obtener o inicializar los datos del personaje
            if (!this.characterData.has(userId)) {
                this.characterData.set(userId, {});
            }
            const character = this.characterData.get(userId);

            // Manejar el botón presionado
            switch (buttonId) {
                case 'start_creation':
                    return await this.showNextDialogue(interaction, 'character_name', character);
                    
                case 'confirm_name':
                    // Mostrar el modal para ingresar el nombre
                    const modal = new ModalBuilder()
                        .setCustomId('character_name_modal')
                        .setTitle('Nombre de tu personaje');
                    
                    const nameInput = new TextInputBuilder()
                        .setCustomId('character_name_input')
                        .setLabel("¿Cómo te llamarás en este mundo?")
                        .setStyle(1) // 1 = SHORT
                        .setMinLength(3)
                        .setMaxLength(20)
                        .setRequired(true);
                    
                    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
                    modal.addComponents(firstActionRow);
                    
                    await interaction.showModal(modal);
                    break;
                    
                case 'start_combat':
                    // Inicializar estadísticas de combate
                    character.combat = {
                        playerHp: 30,
                        slimeHp: 20,
                        playerMana: 15,
                        isPlayerTurn: true
                    };
                    return await this.showNextDialogue(interaction, 'combat_tutorial', character);
                    
                case 'combat_tutorial_attack':
                    // Lógica de ataque en el tutorial
                    if (!character.combat) character.combat = { playerHp: 30, slimeHp: 20 };
                    
                    await interaction.deferUpdate();
                    const damage = Math.floor(Math.random() * 8) + 3; // 3-10 de daño
                    character.combat.slimeHp -= damage;
                    
                    if (character.combat.slimeHp <= 0) {
                        character.combat.slimeHp = 0;
                        const victoryEmbed = new EmbedBuilder()
                            .setTitle('🎉 ¡Victoria! 🎉')
                            .setDescription(`¡Has derrotado al Slime!\n` +
                                          '¡Felicidades! Has completado el tutorial de combate.')
                            .setColor('#55FF55');
                        
                        await interaction.editReply({
                            embeds: [victoryEmbed],
                            components: [new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('dialogue_end_tutorial')
                                    .setLabel('Continuar')
                                    .setStyle(ButtonStyle.Success)
                            )]
                        });
                        return;
                    }
                    
                    // Turno del Slime
                    const slimeDamage = Math.floor(Math.random() * 5) + 1; // 1-5 de daño
                    character.combat.playerHp = Math.max(0, character.combat.playerHp - slimeDamage);
                    
                    if (character.combat.playerHp <= 0) {
                        character.combat.playerHp = 0;
                        const defeatEmbed = new EmbedBuilder()
                            .setTitle('💀 ¡Derrota! 💀')
                            .setDescription('El Slime te ha vencido. ¡No te rindas! Inténtalo de nuevo.')
                            .setColor('#FF5555');
                        
                        await interaction.editReply({
                            embeds: [defeatEmbed],
                            components: [new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('dialogue_combat_tutorial_retry')
                                    .setLabel('Reintentar')
                                    .setStyle(ButtonStyle.Danger)
                            )]
                        });
                        return;
                    }
                    
                    // Mostrar resultado del turno
                    const resultEmbed = new EmbedBuilder()
                        .setTitle('⚔️ ¡Ataque exitoso! ⚔️')
                        .setDescription(
                            `¡Le has quitado ${damage} de vida al Slime!\n` +
                            `**Vida del Slime: ${character.combat.slimeHp}/20**\n` +
                            `El Slime te ha quitado ${slimeDamage} de vida.\n` +
                            `**Tu vida: ${character.combat.playerHp}/30**`
                        )
                        .setColor('#FFAA55');
                    
                    await interaction.editReply({
                        embeds: [resultEmbed],
                        components: [new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('dialogue_combat_tutorial_attack')
                                .setLabel('Atacar')
                                .setEmoji('⚔️')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('dialogue_combat_tutorial_defend')
                                .setLabel('Defender')
                                .setEmoji('🛡️')
                                .setStyle(ButtonStyle.Secondary)
                        )]
                    });
                    break;
                    
                case 'combat_tutorial_defend':
                    // Lógica de defensa en el tutorial
                    if (!character.combat) character.combat = { playerHp: 30, slimeHp: 20 };
                    
                    await interaction.deferUpdate();
                    const defense = Math.floor(Math.random() * 4) + 2; // 2-5 de defensa
                    
                    // Turno del Slime con defensa
                    const slimeDamageReduced = Math.max(1, Math.floor(Math.random() * 5) + 1 - defense);
                    character.combat.playerHp = Math.max(0, character.combat.playerHp - slimeDamageReduced);
                    
                    const defendEmbed = new EmbedBuilder()
                        .setTitle('🛡️ ¡Te has defendido! 🛡️')
                        .setDescription(
                            `Has reducido el daño en ${defense} puntos.\n` +
                            `El Slime solo te ha quitado ${slimeDamageReduced} de vida.\n` +
                            `**Tu vida: ${character.combat.playerHp}/30**\n` +
                            `**Vida del Slime: ${character.combat.slimeHp}/20**`
                        )
                        .setColor('#55AAFF');
                    
                    await interaction.editReply({
                        embeds: [defendEmbed],
                        components: [new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('dialogue_combat_tutorial_attack')
                                .setLabel('Atacar')
                                .setEmoji('⚔️')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('dialogue_combat_tutorial_defend')
                                .setLabel('Defender')
                                .setEmoji('🛡️')
                                .setStyle(ButtonStyle.Secondary)
                        )]
                    });
                    break;
                    
                case 'combat_tutorial_retry':
                    // Reiniciar combate
                    character.combat = {
                        playerHp: 30,
                        slimeHp: 20,
                        playerMana: 15,
                        isPlayerTurn: true
                    };
                    return await this.showNextDialogue(interaction, 'combat_tutorial', character);
                    
                case 'end_tutorial':
                    return await this.completeTutorial(interaction, character);
                    
                default:
                    console.warn(`Botón no reconocido: ${buttonId}`);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content: '❌ Acción no reconocida. Por favor, intenta de nuevo.',
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: '❌ Acción no reconocida. Por favor, intenta de nuevo.',
                            ephemeral: true
                        });
                    }
            }
        } catch (error) {
            console.error('Error en handleButton:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
                    ephemeral: true
                });
            } else {
                await interaction.followUp({
                    content: '❌ Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
                    ephemeral: true
                });
            }
        }
    }
    
    async handleSelectMenu(interaction) {
        const [_, dialogueId, action] = interaction.customId.split('_');
        const selectedValue = interaction.values[0];
        const userId = interaction.user.id;
        
        try {
            if (!this.characterData.has(userId)) {
                this.characterData.set(userId, {});
            }
            const character = this.characterData.get(userId);
            
            switch (action) {
                case 'gender':
                    character.gender = selectedValue;
                    return await this.showNextDialogue(interaction, 'character_class', character);
                    
                case 'class':
                    character.class = selectedValue;
                    return await this.showNextDialogue(interaction, 'character_region', character);
                    
                case 'region':
                    character.region = selectedValue;
                    return await this.showNextDialogue(interaction, 'character_summary', character);
                    
                default:
                    console.log(`Acción de menú no manejada: ${action}`);
                    return null;
            }
        } catch (error) {
            console.error('Error al manejar el botón:', error);
            await interaction.reply({
                content: '¡Ups! Ocurrió un error al procesar tu acción. Por favor, inténtalo de nuevo.',
                ephemeral: true
            });
            return null;
        }
    }
    
    async handleSelectMenu(interaction) {
        const [_, dialogueId, action] = interaction.customId.split('_');
        const selectedValue = interaction.values[0];
        const userId = interaction.user.id;
        
        if (!this.characterData.has(userId)) {
            this.characterData.set(userId, {});
        }
        const userData = this.characterData.get(userId);
        
        try {
            switch (action) {
                case 'class_select':
                    userData.class = selectedValue;
                    // Mostrar detalles de la clase seleccionada
                    const classInfo = {
                        'archer': '🏹 **Arquero**: Especialista en ataques a distancia. Excelente precisión y velocidad.',
                        'ninja': '🥷 **Ninja**: Ágil y letal en combate cuerpo a cuerpo. Puede atacar dos veces por turno.',
                        'swordsman': '⚔️ **Espadachín**: Maestro de la espada. Ataques poderosos y precisos.',
                        'warrior': '🛡️ **Guerrero**: Fuerte y resistente. Puede soportar más daño que las demás clases.',
                        'mage': '🧙‍♂️ **Mago**: Poderoso en artes arcanas. Ataques mágicos devastadores.'
                    };
                    
                    const classEmbed = new EmbedBuilder()
                        .setTitle(`¡Has elegido ser un ${selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)}!`)
                        .setDescription(classInfo[selectedValue] || '¡Clase misteriosa!')
                        .setColor('#6C63FF');
                    
                    await interaction.reply({
                        embeds: [classEmbed],
                        ephemeral: true
                    });
                    
                    // Continuar con la selección de región
                    return await this.showDialogue(interaction, 'start_region', userData);
                    
                case 'region_select':
                    userData.region = selectedValue;
                    // Mostrar detalles de la región seleccionada
                    const regionInfo = {
                        'akai': '🌋 **Reino Rojo: Akai**\nTierras volcánicas habitadas por guerreros feroces. El calor es intenso y los desafíos son muchos.',
                        'say': '🌲 **Reino Verde: Say**\nBosques encantados donde la magia fluye en el aire. Hogar de criaturas mágicas y secretos ancestrales.',
                        'masai': '🏜️ **Reino Amarillo: Masai**\nDesiertos dorados llenos de ciudades comerciantes y misterios enterrados en la arena.',
                        'forest': '🌑 **Bosque Misterioso**\nUn lugar oscuro y enigmático. Pocos entran y menos salen con vida.',
                        'cave': '🕳️ **Cueva Oscura**\nProfundidades inexploradas llenas de peligros y tesoros ocultos.'
                    };
                    
                    const regionEmbed = new EmbedBuilder()
                        .setTitle(`¡Has elegido comenzar en ${interaction.values[0].split(':')[0]}!`)
                        .setDescription(regionInfo[selectedValue] || '¡Región misteriosa!')
                        .setColor('#6C63FF');
                    
                    await interaction.reply({
                        embeds: [regionEmbed],
                        ephemeral: true
                    });
                    
                    // Iniciar el tutorial de combate
                    userData.playerHp = 30;
                    userData.slimeHp = 20;
                    return await this.showDialogue(interaction, 'combat_tutorial', userData);
                    
                default:
                    console.log(`Menú no manejado: ${action}`);
                    return null;
            }
        } catch (error) {
            console.error('Error al manejar el menú desplegable:', error);
            await interaction.reply({
                content: '¡Ups! Ocurrió un error al procesar tu selección. Por favor, inténtalo de nuevo.',
                ephemeral: true
            });
            return null;
        }
    }
    
    async handleModalSubmit(interaction) {
        const { customId } = interaction;
        const userId = interaction.user.id;
        
        if (!this.characterData.has(userId)) {
            this.characterData.set(userId, {});
        }
        const userData = this.characterData.get(userId);
        
        try {
            if (customId === 'character_name_modal') {
                const name = interaction.fields.getTextInputValue('input');
                
                // Validar el nombre
                if (name.length < 3 || name.length > 20) {
                    return await interaction.reply({
                        content: 'El nombre debe tener entre 3 y 20 caracteres.',
                        ephemeral: true
                    });
                }
                
                // Guardar el nombre
                userData.name = name;
                
                // Mostrar confirmación
                await interaction.reply({
                    content: `¡Perfecto, ${name}! Ahora, ¿cómo te identificas?`,
                    ephemeral: true
                });
                
                // Mostrar diálogo de selección de género
                return await this.showDialogue(interaction, 'character_gender', userData);
            }
            
            // Agregar más casos para otros modales aquí
            
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            await interaction.reply({
                content: '¡Ups! Ocurrió un error al procesar tu formulario. Por favor, inténtalo de nuevo.',
                ephemeral: true
            });
            return null;
        }
    }
    
    async handleInteraction(interaction) {
        try {
            if (interaction.isButton()) {
                return await this.handleButton(interaction);
            } else if (interaction.isStringSelectMenu()) {
                return await this.handleSelectMenu(interaction);
            } else if (interaction.isModalSubmit()) {
                return await this.handleModalSubmit(interaction);
            }
        } catch (error) {
            console.error('Error en handleInteraction:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
                    ephemeral: true
                });
            } else {
                await interaction.followUp({
                    content: '❌ Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
                    ephemeral: true
                });
            }
        }
        return null;
    }
}

module.exports = DialogueSystem;
