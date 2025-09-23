const { Events } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// Importar los manejadores de comandos
const comandosHandler = require('../commands/help');
// const configuracionHandler = require('../commands/configuracion/configuracion');

// Importar gestores de paneles modulares de v0.dev
// const { createCharacterCreationEmbed } = require('../../../../character-creation-panel/character_creation_manager');
// const { createBattleEmbed } = require('../../../../battle-panel/battle_panel_manager');
// const { createDungeonEmbed } = require('../../../../dungeon-panel/dungeon_panel_manager');
// const { InventoryEmbedManager } = require('../../../../discord-embeds/inventory-panel/inventory_manager');
// const { createInventoryEmbed } = require('../../../../inventory-panel/inventory_panel_manager');

// Inicializar el gestor de inventario
// const inventoryManager = new InventoryEmbedManager();

// Importar el gestor del bot
// // const { botManager } = require('../config/botManager');
// // const { getPlayerData, savePlayerData } = require('../config/botManager');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Manejar comandos de barra (slash commands)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No se encontró el comando: ${interaction.commandName}`);
                return;
            }

            try {
                console.log(`Ejecutando comando: ${interaction.commandName} por ${interaction.user.tag}`);
                await command.execute(interaction, client);
                
                // Registrar el comando en la base de datos
                try {
                    const User = require('../models/User');
                    let user = await User.findOne({ where: { userId: interaction.user.id } });
                    
                    if (!user) {
                        user = await User.create({
                            userId: interaction.user.id,
                            username: interaction.user.username,
                            stats: { commands: 1 }
                        });
                    } else {
                        const currentStats = user.stats || {};
                        currentStats.commands = (currentStats.commands || 0) + 1;
                        user.stats = currentStats;
                        user.username = interaction.user.username;
                        await user.save();
                    }
                } catch (dbError) {
                    console.error('Error al actualizar estadísticas del usuario:', dbError);
                }
                
            } catch (error) {
                console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Error')
                    .setDescription('Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo más tarde.')
                    .setFooter({ text: 'Si el problema persiste, contacta con el soporte.' });
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
        
        // Manejar botones
        else if (interaction.isButton()) {
            // Manejar botones del gestor del bot
            /* COMMENTED OUT - botManager not available
            try {
                // Verificar si es un botón del gestor del bot
                const userId = interaction.user.id;
                const session = botManager.activeEmbeds.get(userId);
                
                if (session) {
                    // Obtener datos del jugador
                    const playerData = await getPlayerData(userId);
                    
                    // Manejar la interacción con el gestor del bot
                    await botManager.handleButtonInteraction(interaction);
                    
                    // Guardar los cambios en los datos del jugador
                    await savePlayerData(userId, playerData);
                    return;
                }
            } catch (error) {
                console.error('Error al manejar el botón del gestor del bot:', error);
            }
            */
            
            // Manejar botones de paneles modulares de v0.dev
            const buttonId = interaction.customId;
            
            // Delegar todas las interacciones de botones al Game Manager
            if (interaction.client.gameManager) {
                try {
                    await interaction.client.gameManager.handleButtonInteraction(interaction);
                    return;
                } catch (error) {
                    console.error('Error en Game Manager (botón):', error);
                    await interaction.reply({ 
                        content: '❌ Error al procesar la interacción. Intenta de nuevo.', 
                        ephemeral: true 
                    });
                    return;
                }
            }
            
            // Botones del panel de batalla
            if (buttonId === 'attack' || buttonId === 'defend' || buttonId === 'use_skill' ||
                buttonId === 'use_potion' || buttonId === 'escape') {
                try {
                    const userId = interaction.user.id;
                    const playerData = {
                        userId: userId,
                        username: interaction.user.username,
                        level: 5,
                        hp: 80,
                        maxHp: 100,
                        mp: 30,
                        maxMp: 50
                    };
                    
                    const enemyData = {
                        name: 'Goblin Salvaje',
                        hp: 60,
                        maxHp: 80,
                        level: 3
                    };
                    
                    const result = createBattleEmbed(playerData, enemyData);
                    await interaction.update(result);
                } catch (error) {
                    console.error('Error en panel de batalla:', error);
                }
                return;
            }
            
            // Botones del panel de mazmorra
            if (buttonId === 'go_left' || buttonId === 'go_straight' || buttonId === 'go_right' ||
                buttonId === 'use_potion' || buttonId === 'search_room' || buttonId === 'rest' || buttonId === 'abandon_dungeon') {
                try {
                    const userId = interaction.user.id;
                    const playerData = {
                        userId: userId,
                        username: interaction.user.username,
                        level: 7,
                        hp: 90,
                        maxHp: 120,
                        mp: 40,
                        maxMp: 60,
                        gold: 250,
                        medals: 5
                    };
                    
                    const roomData = {
                        type: 'treasure',
                        description: 'Una habitación misteriosa con cofres brillantes',
                        image: 'https://example.com/dungeon-room.jpg'
                    };
                    
                    const result = createDungeonEmbed(playerData, roomData);
                    await interaction.update(result);
                } catch (error) {
                    console.error('Error en panel de mazmorra:', error);
                }
                return;
            }
            
            // Manejar otros botones
            const button = client.buttons.get(interaction.customId);
            
            if (!button) {
                console.error(`No se encontró el botón: ${interaction.customId}`);
                return;
            }
            
            try {
                console.log(`Ejecutando botón: ${interaction.customId} por ${interaction.user.tag}`);
                await button.execute(interaction, client);
            } catch (error) {
                console.error(`Error al ejecutar el botón ${interaction.customId}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Error')
                    .setDescription('Ocurrió un error al procesar tu interacción.')
                    .setFooter({ text: 'Inténtalo de nuevo más tarde.' });
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
        
        // Manejar menús desplegables
        else if (interaction.isStringSelectMenu()) {
            // Manejar el menú de comandos principal
            if (interaction.customId === 'categoria_comandos' || interaction.customId === 'volver_menu_principal') {
                try {
                    await comandosHandler.handleSelectMenu(interaction);
                } catch (error) {
                    console.error('Error en el menú de comandos:', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al procesar el menú de comandos.');
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [errorEmbed], components: [] });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
                return;
            }
            
            // Manejar el menú de configuración
            if (interaction.customId === 'categoria_configuracion' || interaction.customId === 'volver_menu_config') {
                try {
                    // await configuracionHandler.handleSelectMenu(interaction);
                } catch (error) {
                    console.error('Error en el menú de configuración:', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al procesar el menú de configuración.');
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [errorEmbed], components: [] });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
                return;
            }
            
            // Delegar todas las interacciones de menús al Game Manager
            if (interaction.client.gameManager) {
                try {
                    await interaction.client.gameManager.handleSelectMenuInteraction(interaction);
                    return;
                } catch (error) {
                    console.error('Error en Game Manager (menú):', error);
                    await interaction.reply({ 
                        content: '❌ Error al procesar la selección. Intenta de nuevo.', 
                        ephemeral: true 
                    });
                    return;
                }
            }
            
            // Manejar menús de selección del RPG
            const rpgMenus = require('../selectMenus/rpgMenus');
            
            // Manejar menú de selección de PassQuirks
            if (interaction.customId === 'select_passquirk') {
                try {
                    const passquirkCommand = client.commands.get('passquirk');
                    if (passquirkCommand && passquirkCommand.handleSelectMenu) {
                        await passquirkCommand.handleSelectMenu(interaction);
                        return;
                    }
                } catch (error) {
                    console.error('Error en selección de PassQuirk:', error);
                    await interaction.reply({ 
                        content: '❌ Error al despertar PassQuirk. Intenta de nuevo.', 
                        ephemeral: true 
                    });
                    return;
                }
            }
            
            // Manejar menús de paneles modulares de v0.dev
            if (menuId === 'main_navigation') {
                const selectedOption = interaction.values[0];
                const userId = interaction.user.id;
                
                try {
                    if (selectedOption === 'inventory') {
                        const playerData = {
                            userId: userId,
                            username: interaction.user.username,
                            level: 5,
                            inventory: {
                                consumables: [{ name: 'Poción de Vida', quantity: 3, rarity: 'común' }],
                                equipment: [{ name: 'Espada de Hierro', equipped: true, rarity: 'raro' }],
                                materials: [{ name: 'Hierro', quantity: 10, rarity: 'común' }],
                                treasures: [{ name: 'Gema Azul', quantity: 1, rarity: 'épico' }]
                            }
                        };
                        
                        const result = inventoryManager.createInventoryEmbed(playerData);
                        await interaction.update(result);
                    } else if (selectedOption === 'combat') {
                        const playerData = {
                            userId: userId,
                            username: interaction.user.username,
                            level: 5,
                            hp: 80,
                            maxHp: 100,
                            mp: 30,
                            maxMp: 50
                        };
                        
                        const enemyData = {
                            name: 'Goblin Salvaje',
                            hp: 60,
                            maxHp: 80,
                            level: 3
                        };
                        
                        const result = createBattleEmbed(playerData, enemyData);
                        await interaction.update(result);
                    } else if (selectedOption === 'explore') {
                        const playerData = {
                            userId: userId,
                            username: interaction.user.username,
                            level: 7,
                            hp: 90,
                            maxHp: 120,
                            mp: 40,
                            maxMp: 60,
                            gold: 250,
                            medals: 5
                        };
                        
                        const roomData = {
                            type: 'entrance',
                            description: 'Te encuentras en la entrada de una mazmorra misteriosa',
                            image: 'https://example.com/dungeon-entrance.jpg'
                        };
                        
                        const result = createDungeonEmbed(playerData, roomData);
                        await interaction.update(result);
                    } else {
                        // Usar el manejador original para otras opciones
                        await rpgMenus.handleMainNavigation(interaction);
                    }
                } catch (error) {
                    console.error('Error en menú de navegación modular:', error);
                    await rpgMenus.handleMainNavigation(interaction);
                }
                return;
            }
            else if (menuId === 'select_region') {
                // Manejar selección de región con datos oficiales
                const passquirkData = require('../data/passquirkData');
                const selectedRegion = interaction.values[0];
                
                let regionInfo = '';
                let enemies = '';
                
                // Obtener información de la región seleccionada
                const regionData = passquirkData.enemies[selectedRegion];
                if (regionData) {
                    regionInfo = `🗺️ **${regionData.name}** ${regionData.emoji}\n`;
                    regionInfo += `📊 **Nivel Recomendado:** ${regionData.level_range}\n\n`;
                    regionInfo += '👹 **Enemigos en esta región:**\n';
                    
                    Object.values(regionData.enemies).forEach(enemy => {
                        enemies += `${enemy.emoji} ${enemy.name} (Nivel ${enemy.level}) - ${enemy.rarity}\n`;
                    });
                }
                
                await interaction.reply({
                    content: regionInfo + enemies + '\n⚔️ ¡Prepárate para la aventura!',
                    ephemeral: true
                });
                return;
            }
            else if (menuId === 'select_battle_type') {
                // Manejar tipo de batalla
                const battleTypes = {
                    'training': '🤖 **Entrenamiento** - Práctica segura sin riesgo de perder objetos',
                    'wild_enemies': '👹 **Enemigos Salvajes** - Caza criaturas por XP y botín',
                    'pvp_arena': '🏟️ **Arena PvP** - Lucha contra otros jugadores',
                    'tournaments': '🏆 **Torneos** - Competencias con grandes premios',
                    'dungeon_bosses': '🐉 **Jefes de Mazmorra** - Desafíos épicos y legendarios'
                };
                
                const selectedType = interaction.values[0];
                const typeInfo = battleTypes[selectedType] || 'Tipo de batalla desconocido';
                
                await interaction.reply({
                    content: `⚔️ ${typeInfo}\n\n🔧 ¡El sistema de combate estará disponible pronto!`,
                    ephemeral: true
                });
                return;
            }
            else if (menuId === 'select_shop_category') {
                // Manejar categoría de tienda con objetos oficiales
                const passquirkData = require('../data/passquirkData');
                const selectedCategory = interaction.values[0];
                
                let categoryInfo = '';
                let items = '';
                
                if (selectedCategory === 'consumibles') {
                    categoryInfo = '🧪 **Consumibles** - Objetos de un solo uso\n\n';
                    Object.values(passquirkData.items.consumibles).forEach(item => {
                        items += `${item.emoji} **${item.name}** - ${item.price} monedas\n${item.effect}\n\n`;
                    });
                } else if (selectedCategory === 'equipamiento') {
                    categoryInfo = '⚔️ **Equipamiento** - Armas y defensas\n\n';
                    Object.values(passquirkData.items.equipamiento).forEach(item => {
                        items += `${item.emoji} **${item.name}** - ${item.price} monedas\n${item.effect}\n\n`;
                    });
                } else if (selectedCategory === 'especiales') {
                    categoryInfo = '💎 **Especiales** - Objetos únicos\n\n';
                    Object.values(passquirkData.items.especiales).forEach(item => {
                        items += `${item.emoji} **${item.name}** - ${item.price} monedas\n${item.effect}\n\n`;
                    });
                } else if (selectedCategory === 'loy_especial') {
                    const loy = passquirkData.items.especiales.loy_objeto_especial;
                    categoryInfo = `🧿 **${loy.name}** - ${loy.price} monedas\n\n`;
                    items = `**Efecto:** ${loy.effect}\n`;
                    items += `**Uso:** ${loy.usage}\n`;
                    items += `**Duración:** ${loy.duration}\n`;
                    items += `**Restricciones:** ${loy.restrictions}\n`;
                    items += `**Ventajas:** ${loy.advantages}\n`;
                }
                
                await interaction.reply({
                    content: categoryInfo + items + '💰 ¡Usa `/shop buy` para comprar!',
                    ephemeral: true
                });
                return;
            }
            else if (menuId.startsWith('npc_actions_')) {
                // Manejar acciones de NPC
                const npcId = menuId.replace('npc_actions_', '');
                const action = interaction.values[0];
                await interaction.reply({
                    content: `🎭 Has seleccionado la acción: **${action}** con el NPC\n\n¡Esta función estará disponible pronto!`,
                    ephemeral: true
                });
                return;
            }
            
            // Manejar otros menús desplegables
            const selectMenu = client.selectMenus.get(interaction.customId);
            
            if (!selectMenu) return;
            
            try {
                await selectMenu.execute(interaction, client);
            } catch (error) {
                console.error(`Error al ejecutar el menú ${interaction.customId}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Ocurrió un error al procesar esta selección.');
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
        
        // Manejar botones del RPG
        else if (interaction.isButton()) {
            const buttonId = interaction.customId;
            
            // Cargar manejadores de RPG
            const rpgButtons = require('../buttons/rpgButtons');
            
            // Botones de creación de personaje
            if (buttonId === 'create_character') {
                await rpgButtons.handleCreateCharacter(interaction);
            }
            else if (buttonId.startsWith('create_')) {
                const characterClass = {
                    'create_warrior': 'Guerrero',
                    'create_mage': 'Mago',
                    'create_explorer': 'Explorador',
                    'create_healer': 'Sanador'
                }[buttonId];
                
                if (characterClass) {
                    await rpgButtons.createCharacterWithClass(interaction, characterClass);
                }
            }
            else if (buttonId === 'start_adventure') {
                // Verificar si el usuario tiene personaje
                const User = require('../models/User');
                const user = await User.findOne({ where: { userId: interaction.user.id } });
                
                if (!user || !user.hasCharacter) {
                    // No tiene personaje, mostrar creación
                    await rpgButtons.showCharacterCreation(interaction);
                } else {
                    // Ya tiene personaje, ir al panel principal
                    const passquirkCommand = client.commands.get('passquirkrpg');
                    if (passquirkCommand) {
                        await passquirkCommand.showMainPanel(interaction, user);
                    }
                }
            }
            else if (buttonId === 'goto_main_panel') {
                // Ir al panel principal después de crear personaje
                const passquirkCommand = client.commands.get('passquirkrpg');
                if (passquirkCommand) {
                    const User = require('../models/User');
                    const user = await User.findOne({ where: { userId: interaction.user.id } });
                    if (user) {
                        await passquirkCommand.showMainPanel(interaction, user);
                    } else {
                        await passquirkCommand.execute(interaction);
                    }
                }
            }
            else if (buttonId === 'reset_character') {
                // Resetear personaje para permitir recreación
                const User = require('../models/User');
                await User.destroy({ where: { userId: interaction.user.id } });
                
                const { EmbedBuilder } = require('discord.js');
                const resetEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🔄 Personaje Reseteado')
                    .setDescription('Tu personaje ha sido eliminado. Usa `/passquirkrpg` para crear uno nuevo.')
                    .setTimestamp();
                
                await interaction.reply({ embeds: [resetEmbed], ephemeral: true });
            }
            else if (buttonId === 'back_to_main') {
                // Redirigir al comando principal
                const passquirkCommand = client.commands.get('passquirkrpg');
                if (passquirkCommand) {
                    await passquirkCommand.execute(interaction);
                }
            }
            // Botones de acción rápida
            else if (buttonId === 'quick_stats') {
                const quickStatsHandler = require('../buttons/quickStats');
                await quickStatsHandler.execute(interaction, client);
            }
            else if (buttonId === 'quick_work') {
                const quickWorkHandler = require('../buttons/quickWork');
                await quickWorkHandler.execute(interaction, client);
            }
            else if (buttonId === 'quick_daily') {
                const quickDailyHandler = require('../buttons/quickDaily');
                await quickDailyHandler.execute(interaction, client);
            }
            // Botón de navegación para configuración
            else if (buttonId === 'volver_menu_config') {
                try {
                    // await configuracionHandler.handleSelectMenu(interaction);
                } catch (error) {
                    console.error('Error al volver al menú de configuración:', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('❌ No se pudo volver al menú de configuración.');
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [errorEmbed], components: [] });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            }
            // Manejar respuestas de diálogo
            else if (buttonId.startsWith('dialog_response_')) {
                const parts = buttonId.split('_');
                const npcId = parts[2];
                const responseIndex = parseInt(parts[3]);
                
                await interaction.reply({
                    content: `💬 Has respondido al NPC. ¡Esta conversación continuará pronto!`,
                    ephemeral: true
                });
            }
            // Pasar otras interacciones al gestor de diálogos si existe
            else if (client.dialogueManager) {
                await client.dialogueManager.handleInteraction(interaction);
            }
        }
        
        // Manejar envíos de modales
        else if (interaction.isModalSubmit()) {
            // Manejar el envío de formularios del sistema de diálogos
            if (interaction.customId.startsWith('dialogue_modal_')) {
                try {
                    // Inicializar el sistema de diálogos si no está inicializado
                    if (!dialogueSystem) {
                        dialogueSystem = new DialogueSystem(interaction.client);
                    }
                    
                    // Procesar el envío del modal
                    await dialogueSystem.handleModalSubmit(interaction);
                } catch (error) {
                    console.error('Error al procesar el formulario de diálogo:', error);
                    
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Error')
                        .setDescription('Ocurrió un error al procesar el formulario.');
                    
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                }
            }
        }
    },
};
