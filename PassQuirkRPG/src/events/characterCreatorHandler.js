const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { characterCreationData } = require('../commands/slash/functional/general/character-creator');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Solo manejar interacciones relacionadas con la creación de personajes
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) {
            return;
        }

        const characterCreator = require('../commands/slash/functional/general/character-creator');

        try {
            // Manejo de modales
            if (interaction.isModalSubmit()) {
                switch (interaction.customId) {
                    case 'character_basic_info':
                        await characterCreator.handleBasicInfoSubmit(interaction);
                        break;
                    case 'avatar_upload':
                        await handleAvatarUpload(interaction);
                        break;
                }
                return;
            }

            // Manejo de botones
            if (interaction.isButton()) {
                const customId = interaction.customId;

                // Selección de clase
                if (customId.startsWith('class_')) {
                    const className = customId.replace('class_', '');
                    await characterCreator.handleClassSelection(interaction, className);
                    return;
                }

                // Selección de reino
                if (customId.startsWith('kingdom_')) {
                    const kingdom = customId.replace('kingdom_', '');
                    await characterCreator.handleKingdomSelection(interaction, kingdom);
                    return;
                }

                // Manejo de avatar
                if (customId === 'upload_avatar') {
                    await characterCreator.handleAvatarSelection(interaction, 'upload');
                    return;
                }

                if (customId === 'default_avatar') {
                    await characterCreator.handleAvatarSelection(interaction, 'default');
                    return;
                }

                if (customId === 'skip_avatar') {
                    await characterCreator.handleAvatarSelection(interaction, 'skip');
                    return;
                }

                // Confirmación final
                if (customId === 'confirm_character') {
                    await characterCreator.confirmCharacterCreation(interaction);
                    return;
                }

                if (customId === 'edit_character') {
                    await handleEditCharacter(interaction);
                    return;
                }

                if (customId === 'cancel_character') {
                    await handleCancelCharacter(interaction);
                    return;
                }

                // Botones post-creación
                if (customId === 'start_tutorial') {
                    await handleStartTutorial(interaction);
                    return;
                }

                if (customId === 'explore_world') {
                    await handleExploreWorld(interaction);
                    return;
                }

                if (customId === 'view_profile') {
                    await handleViewProfile(interaction);
                    return;
                }
            }

            // Manejo de select menus
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'passquirk_selection') {
                    const passquirkKey = interaction.values[0];
                    await characterCreator.handlePassQuirkSelection(interaction, passquirkKey);
                    return;
                }
            }

        } catch (error) {
            console.error('Error en characterCreatorHandler:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocurrió un error durante la creación del personaje. Inténtalo de nuevo.',
                    ephemeral: true
                });
            }
        }
    }
};

async function handleAvatarUpload(interaction) {
    const userData = characterCreationData.get(interaction.user.id);
    if (!userData) {
        return interaction.reply({
            content: '❌ Error: Datos de creación no encontrados.',
            ephemeral: true
        });
    }

    const avatarUrl = interaction.fields.getTextInputValue('avatar_url');
    
    if (avatarUrl) {
        // Validar URL
        try {
            new URL(avatarUrl);
            userData.avatarUrl = avatarUrl;
        } catch {
            userData.avatarUrl = interaction.user.displayAvatarURL();
        }
    } else {
        userData.avatarUrl = interaction.user.displayAvatarURL();
    }

    userData.step = 'confirmation';
    characterCreationData.set(interaction.user.id, userData);

    const characterCreator = require('../commands/slash/functional/general/character-creator');
    await characterCreator.showConfirmation(interaction);
}

async function handleEditCharacter(interaction) {
    const userData = characterCreationData.get(interaction.user.id);
    if (!userData) {
        return interaction.reply({
            content: '❌ Error: Datos de creación no encontrados.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setColor('#fcd34d')
        .setTitle('https://emoji.gg/emoji/58229-sparklestars ✏️ Editar Personaje https://emoji.gg/emoji/58229-sparklestars')
        .setDescription(`
https://emoji.gg/emoji/47232-crown-green **¿Qué quieres editar?**

Selecciona el aspecto que deseas modificar de tu personaje.

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

📝 **Datos Básicos** - Nombre, descripción, país
🎭 **Clase** - Cambiar tu clase de personaje
🏰 **Reino** - Seleccionar otro reino
🔮 **PassQuirk** - Elegir diferente habilidad
🖼️ **Avatar** - Cambiar foto de perfil

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**
`)
        .setFooter({ 
            text: 'PassQuirk RPG • Edición de Personaje',
            iconURL: 'https://emoji.gg/emoji/42684-star-r'
        })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('edit_basic_info')
            .setLabel('📝 Datos Básicos')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('edit_class')
            .setLabel('🎭 Clase')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('edit_kingdom')
            .setLabel('🏰 Reino')
            .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('edit_passquirk')
            .setLabel('🔮 PassQuirk')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('edit_avatar')
            .setLabel('🖼️ Avatar')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('back_to_confirmation')
            .setLabel('⬅️ Volver')
            .setStyle(ButtonStyle.Success)
    );

    await interaction.update({ embeds: [embed], components: [row1, row2] });
}

async function handleCancelCharacter(interaction) {
    characterCreationData.delete(interaction.user.id);

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Creación Cancelada')
        .setDescription(`
https://emoji.gg/emoji/58229-sparklestars **Creación de personaje cancelada**

No se han guardado cambios. Puedes volver a iniciar el proceso cuando quieras.

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

https://emoji.gg/emoji/7384-greenfire **¡Usa \`/character-creator\` para intentarlo de nuevo!**
`)
        .setFooter({ 
            text: 'PassQuirk RPG • Hasta la próxima',
            iconURL: 'https://emoji.gg/emoji/42684-star-r'
        })
        .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
}

async function handleStartTutorial(interaction) {
    // Redirigir al sistema de tutorial existente
    const tutorialSabio = interaction.client.tutorialSabio;
    if (tutorialSabio && tutorialSabio.startTutorial) {
        await tutorialSabio.startTutorial(interaction);
    } else {
        await interaction.reply({
            content: '📚 Tutorial iniciado. ¡Prepárate para aprender sobre PassQuirk!',
            ephemeral: true
        });
    }
}

async function handleExploreWorld(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('https://emoji.gg/emoji/58229-sparklestars 🌍 Explorar PassQuirk https://emoji.gg/emoji/58229-sparklestars')
        .setDescription(`
https://emoji.gg/emoji/47232-crown-green **¡Bienvenido al mundo de PassQuirk!**

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

🏰 **Explorar Reinos** - Visita Akai, Say y Masai
⚔️ **Buscar Combates** - Encuentra enemigos y desafíos
🛒 **Visitar Tiendas** - Compra equipo y objetos
👥 **Conocer NPCs** - Habla con personajes del mundo
📜 **Aceptar Misiones** - Completa tareas épicas

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

https://emoji.gg/emoji/7384-greenfire **¡Tu aventura te espera!**
`)
        .setFooter({ 
            text: 'PassQuirk RPG • Mundo Abierto',
            iconURL: 'https://emoji.gg/emoji/42684-star-r'
        })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('explore_kingdoms')
            .setLabel('🏰 Explorar Reinos')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('find_battles')
            .setLabel('⚔️ Buscar Combates')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('visit_shops')
            .setLabel('🛒 Tiendas')
            .setStyle(ButtonStyle.Success)
    );

    await interaction.update({ embeds: [embed], components: [row] });
}

async function handleViewProfile(interaction) {
    // Redirigir al comando de perfil existente
    const playerDb = interaction.client.playerDatabase;
    const player = playerDb.getPlayer(interaction.user.id);

    if (!player) {
        return interaction.reply({
            content: '❌ No se encontró tu personaje.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setColor('#fcd34d')
        .setTitle(`https://emoji.gg/emoji/58229-sparklestars 👤 Perfil de ${player.name} https://emoji.gg/emoji/58229-sparklestars`)
        .setDescription(`
**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

🎭 **Clase:** ${player.class}
🏰 **Reino:** ${player.kingdom.toUpperCase()}
🔮 **PassQuirk:** ${player.passquirk}
📊 **Nivel:** ${player.level}
❤️ **Vida:** ${player.health}/${player.maxHealth}
⚡ **Energía:** ${player.energy}/${player.maxEnergy}
💰 **Oro:** ${player.inventory.gold}

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**

📝 **Descripción:** ${player.description}
🌍 **País:** ${player.country}
`)
        .setThumbnail(player.avatarUrl || interaction.user.displayAvatarURL())
        .setFooter({ 
            text: `PassQuirk RPG • Creado el ${new Date(player.createdAt).toLocaleDateString()}`,
            iconURL: 'https://emoji.gg/emoji/42684-star-r'
        })
        .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
}