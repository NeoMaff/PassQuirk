/**
 * Sistema de Quirks para PassQuirk RPG
 * 
 * Este sistema maneja todas las mecánicas relacionadas con los quirks:
 * - Adquisición de quirks
 * - Mejora y evolución de quirks
 * - Efectos y habilidades especiales
 * - Compatibilidad con PassQuirks
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embedStyles');

class QuirksSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeQuirkSessions = new Map();
        
        // Probabilidades de obtención de quirks según rareza
        this.quirkRarityProbabilities = {
            común: 0.50,      // 50%
            poco_común: 0.30, // 30%
            raro: 0.15,       // 15%
            épico: 0.04,      // 4%
            legendario: 0.01  // 1%
        };
        
        // Límites de quirks por nivel de jugador
        this.quirkLimits = {
            1: 1,   // Nivel 1: 1 quirk
            5: 2,   // Nivel 5: 2 quirks
            10: 3,  // Nivel 10: 3 quirks
            20: 4,  // Nivel 20: 4 quirks
            30: 5   // Nivel 30: 5 quirks
        };
        
        // Costos de mejora de quirks
        this.upgradeCosts = {
            común: 100,
            poco_común: 250,
            raro: 500,
            épico: 1000,
            legendario: 2500,
            mítico: 5000
        };
    }
    
    /**
     * Obtiene todos los quirks disponibles para una clase específica
     * @param {string} className - Nombre de la clase
     * @returns {Array} Lista de quirks disponibles
     */
    getAvailableQuirksForClass(className) {
        const allQuirks = this.gameManager.gameData.QUIRKS || {};
        const classQuirks = [];
        
        for (const [key, quirk] of Object.entries(allQuirks)) {
            // Verificar si el quirk es compatible con la clase específica
            if (quirk.compatibleClasses && quirk.compatibleClasses.includes(className)) {
                classQuirks.push({
                    id: key,
                    ...quirk
                });
                continue;
            }
            
            // Verificar si el quirk pertenece a la clase específica
            if (quirk.class === className) {
                classQuirks.push({
                    id: key,
                    ...quirk
                });
                continue;
            }
            
            // Verificar si el quirk es universal (compatible con todas las clases)
            if (quirk.compatibleClasses && quirk.compatibleClasses.includes("🔓 Todas las clases (Universal)")) {
                classQuirks.push({
                    id: key,
                    ...quirk
                });
            }
        }
        
        return classQuirks;
    }
    
    /**
     * Verifica si un quirk es compatible con el PassQuirk del jugador
     * @param {string} quirkId - ID del quirk
     * @param {string} passquirkId - ID del PassQuirk
     * @returns {boolean} Es compatible
     */
    isQuirkCompatibleWithPassQuirk(quirkId, passquirkId) {
        const quirk = this.gameManager.gameData.QUIRKS[quirkId];
        const passquirk = this.gameManager.gameData.PASSQUIRKS[passquirkId];
        
        if (!quirk || !passquirk) return false;
        
        // Verificar compatibilidad de elemento
        if (quirk.element === passquirk.element) return true;
        
        // Verificar compatibilidades especiales
        if (quirk.compatibleElements && quirk.compatibleElements.includes(passquirk.element)) return true;
        
        // Verificar si el PassQuirk es universal (compatible con todas las clases)
        if (passquirk.element === "Universal") return true;
        
        return false;
    }
    
    /**
     * Obtiene el número máximo de quirks que un jugador puede tener según su nivel
     * @param {number} playerLevel - Nivel del jugador
     * @returns {number} Número máximo de quirks
     */
    getMaxQuirksForLevel(playerLevel) {
        let maxQuirks = 1; // Por defecto, 1 quirk
        
        for (const [level, limit] of Object.entries(this.quirkLimits)) {
            if (playerLevel >= parseInt(level)) {
                maxQuirks = limit;
            } else {
                break;
            }
        }
        
        return maxQuirks;
    }
    
    /**
     * Genera un quirk aleatorio para el jugador
     * @param {Object} player - Datos del jugador
     * @returns {Object} Quirk generado
     */
    generateRandomQuirk(player) {
        const availableQuirks = this.getAvailableQuirksForClass(player.class);
        if (!availableQuirks || availableQuirks.length === 0) {
            throw new Error(`No hay quirks disponibles para la clase ${player.class}`);
        }
        
        // Filtrar quirks que el jugador ya tiene
        const playerQuirkIds = player.quirks.map(q => q.id);
        const newQuirks = availableQuirks.filter(q => !playerQuirkIds.includes(q.id));
        
        if (newQuirks.length === 0) {
            throw new Error('Ya tienes todos los quirks disponibles para tu clase');
        }
        
        // Seleccionar rareza según probabilidades
        const rarityRoll = Math.random();
        let selectedRarity = 'común';
        let cumulativeProbability = 0;
        
        for (const [rarity, probability] of Object.entries(this.quirkRarityProbabilities)) {
            cumulativeProbability += probability;
            if (rarityRoll <= cumulativeProbability) {
                selectedRarity = rarity;
                break;
            }
        }
        
        // Filtrar por rareza seleccionada, o usar una rareza inferior si no hay disponibles
        const rarityOrder = ['común', 'poco_común', 'raro', 'épico', 'legendario', 'mítico'];
        let rarityIndex = rarityOrder.indexOf(selectedRarity);
        let quirksOfRarity = [];
        
        // Intentar encontrar quirks de la rareza seleccionada o inferior
        while (rarityIndex >= 0 && quirksOfRarity.length === 0) {
            const currentRarity = rarityOrder[rarityIndex];
            quirksOfRarity = newQuirks.filter(q => q.rarity.toLowerCase() === currentRarity);
            rarityIndex--;
        }
        
        // Si no hay quirks disponibles de ninguna rareza, usar cualquiera
        if (quirksOfRarity.length === 0) {
            quirksOfRarity = newQuirks;
        }
        
        // Seleccionar un quirk aleatorio
        const randomIndex = Math.floor(Math.random() * quirksOfRarity.length);
        const selectedQuirk = quirksOfRarity[randomIndex];
        
        // Crear instancia del quirk para el jugador
        // Obtener la primera habilidad del quirk
        let firstAbility = null;
        if (selectedQuirk.abilities) {
            // Si abilities es un array, tomar el primer elemento
            if (Array.isArray(selectedQuirk.abilities)) {
                firstAbility = selectedQuirk.abilities[0];
            } 
            // Si abilities es un objeto con propiedades, tomar la primera propiedad
            else if (typeof selectedQuirk.abilities === 'object') {
                const abilityKey = Object.keys(selectedQuirk.abilities)[0];
                if (abilityKey) {
                    firstAbility = selectedQuirk.abilities[abilityKey];
                }
            }
        }
        
        return {
            id: selectedQuirk.id,
            name: selectedQuirk.name,
            description: selectedQuirk.description,
            element: selectedQuirk.element,
            rarity: selectedQuirk.rarity,
            level: 1,
            experience: 0,
            experienceToNext: 100,
            abilities: firstAbility ? [firstAbility] : [], // Solo la primera habilidad al inicio
            discoveredAt: new Date().toISOString(),
            emoji: selectedQuirk.emoji || '✨'
        };
    }
    
    /**
     * Añade un quirk al jugador
     * @param {string} userId - ID del usuario
     * @param {Object} quirk - Datos del quirk a añadir
     * @returns {boolean} Éxito de la operación
     */
    async addQuirkToPlayer(userId, quirk) {
        const player = await this.gameManager.getPlayer(userId);
        if (!player) return false;
        
        // Verificar límite de quirks
        const maxQuirks = this.getMaxQuirksForLevel(player.level);
        if (player.quirks.length >= maxQuirks) {
            throw new Error(`Has alcanzado el límite de ${maxQuirks} quirks para tu nivel. Sube de nivel para obtener más espacios.`);
        }
        
        // Añadir quirk
        player.quirks.push(quirk);
        
        // Guardar cambios
        await this.gameManager.playerDB.savePlayer(userId, player);
        return true;
    }
    
    /**
     * Mejora un quirk del jugador
     * @param {string} userId - ID del usuario
     * @param {string} quirkId - ID del quirk a mejorar
     * @returns {Object} Resultado de la mejora
     */
    async upgradeQuirk(userId, quirkId) {
        const player = await this.gameManager.getPlayer(userId);
        if (!player) throw new Error('Jugador no encontrado');
        
        // Encontrar el quirk
        const quirkIndex = player.quirks.findIndex(q => q.id === quirkId);
        if (quirkIndex === -1) throw new Error('Quirk no encontrado');
        
        const quirk = player.quirks[quirkIndex];
        
        // Variable para almacenar la nueva habilidad desbloqueada
        let newAbility = null;
        
        // Verificar si el quirk puede mejorarse
        const baseQuirk = this.gameManager.gameData.QUIRKS[quirkId];
        if (!baseQuirk) throw new Error('Datos del quirk no encontrados');
        
        // Verificar si hay más habilidades para desbloquear
        let maxAbilities = 0;
        let nextAbility = null;
        
        // Determinar el número máximo de habilidades y la siguiente a desbloquear
        if (baseQuirk.abilities) {
            if (Array.isArray(baseQuirk.abilities)) {
                maxAbilities = baseQuirk.abilities.length;
                if (quirk.level < maxAbilities) {
                    nextAbility = baseQuirk.abilities[quirk.level];
                }
            } else if (typeof baseQuirk.abilities === 'object') {
                const abilityKeys = Object.keys(baseQuirk.abilities);
                maxAbilities = abilityKeys.length;
                if (quirk.level < maxAbilities) {
                    const nextAbilityKey = abilityKeys[quirk.level];
                    nextAbility = baseQuirk.abilities[nextAbilityKey];
                }
            }
        }
        
        if (quirk.level < maxAbilities) {
            // Calcular costo de mejora
            const upgradeCost = this.upgradeCosts[quirk.rarity.toLowerCase()] || 500;
            
            // Verificar si el jugador tiene suficiente oro
            if (player.inventory.gold < upgradeCost) {
                throw new Error(`No tienes suficiente oro para mejorar este quirk. Necesitas ${upgradeCost} oro.`);
            }
            
            // Realizar la mejora
            player.inventory.gold -= upgradeCost;
            quirk.level += 1;
            quirk.experience = 0;
            quirk.experienceToNext = quirk.level * 100;
            
            // Desbloquear nueva habilidad si corresponde
            if (nextAbility) {
                quirk.abilities.push(nextAbility);
                
                // Guardar la nueva habilidad para devolverla en el resultado
                newAbility = nextAbility;
            }
            
            // Actualizar el quirk en el jugador
            player.quirks[quirkIndex] = quirk;
            
            // Guardar cambios
            await this.gameManager.playerDB.savePlayer(userId, player);
            
            return {
                success: true,
                quirk: quirk,
                newAbility: newAbility,
                cost: upgradeCost
            };
        } else {
            throw new Error('Este quirk ya ha alcanzado su nivel máximo');
        }
    }
    
    /**
     * Muestra el menú de gestión de quirks
     * @param {Object} interaction - Interacción de Discord
     */
    async showQuirksMenu(interaction) {
        const userId = interaction.user.id;
        const player = await this.gameManager.getPlayer(userId);
        
        if (!player) {
            return interaction.reply({
                content: '⚠️ No tienes un personaje creado. Usa `/character create` primero.',
                ephemeral: true
            });
        }
        
        // Crear embed principal
        const embed = new EmbedBuilder()
            .setTitle(`✨ Quirks de ${player.username}`)
            .setDescription(
                `Tus quirks son habilidades especiales que definen tu estilo de combate.\n` +
                `Puedes tener hasta ${this.getMaxQuirksForLevel(player.level)} quirks a tu nivel actual.`
            )
            .setColor(COLORS.PRIMARY)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: 'PassQuirk', value: player.passquirk ? `${player.passquirk.emoji} ${player.passquirk.name}` : 'Ninguno', inline: true },
                { name: 'Clase', value: player.class, inline: true },
                { name: 'Quirks Activos', value: `${player.quirks.length}/${this.getMaxQuirksForLevel(player.level)}`, inline: true }
            );
        
        // Añadir información de cada quirk
        if (player.quirks.length > 0) {
            player.quirks.forEach(quirk => {
                // Formatear las habilidades del quirk
                let abilitiesText = 'Ninguna';
                if (quirk.abilities && quirk.abilities.length > 0) {
                    // Extraer los nombres de las habilidades
                    const abilityNames = quirk.abilities.map(ability => {
                        // Si la habilidad es un objeto con propiedad 'name'
                        if (ability && typeof ability === 'object' && ability.name) {
                            return ability.name;
                        }
                        // Si la habilidad es un string
                        else if (typeof ability === 'string') {
                            return ability;
                        }
                        // Caso por defecto
                        return 'Habilidad desconocida';
                    });
                    abilitiesText = abilityNames.join(', ');
                }
                
                embed.addFields({
                    name: `${quirk.emoji} ${quirk.name} (Nivel ${quirk.level})`,
                    value: `${quirk.description}\n` +
                           `**Elemento:** ${quirk.element} | **Rareza:** ${quirk.rarity}\n` +
                           `**Habilidades:** ${abilitiesText}`
                });
            });
        } else {
            embed.addFields({
                name: 'Sin Quirks',
                value: 'Aún no has descubierto ningún quirk. Explora el mundo para encontrarlos.'
            });
        }
        
        // Crear botones de acción
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('quirk_info')
                .setLabel('Ver Detalles')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(player.quirks.length === 0),
            new ButtonBuilder()
                .setCustomId('quirk_upgrade')
                .setLabel('Mejorar Quirk')
                .setStyle(ButtonStyle.Success)
                .setDisabled(player.quirks.length === 0),
            new ButtonBuilder()
                .setCustomId('quirk_discover')
                .setLabel('Buscar Quirks')
                .setStyle(ButtonStyle.Secondary)
        );
        
        // Si hay múltiples quirks, añadir menú de selección
        let selectMenu = null;
        if (player.quirks.length > 1) {
            const options = player.quirks.map(quirk => ({
                label: `${quirk.name} (Nivel ${quirk.level})`,
                description: `${quirk.element} - ${quirk.rarity}`,
                value: quirk.id,
                emoji: quirk.emoji
            }));
            
            selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('quirk_select')
                    .setPlaceholder('Selecciona un quirk para ver o mejorar')
                    .addOptions(options)
            );
        }
        
        // Enviar respuesta
        const components = selectMenu ? [row, selectMenu] : [row];
        await interaction.reply({
            embeds: [embed],
            components: components,
            ephemeral: true
        });
        
        // Iniciar sesión de quirks
        this.activeQuirkSessions.set(userId, {
            userId: userId,
            startTime: Date.now(),
            selectedQuirk: player.quirks[0]?.id || null
        });
    }
    
    /**
     * Muestra los detalles de un quirk específico
     * @param {Object} interaction - Interacción de Discord
     * @param {string} quirkId - ID del quirk a mostrar
     */
    async showQuirkDetails(interaction, quirkId) {
        const userId = interaction.user.id;
        const player = await this.gameManager.getPlayer(userId);
        
        if (!player) return;
        
        // Encontrar el quirk
        const quirk = player.quirks.find(q => q.id === quirkId);
        if (!quirk) {
            return interaction.reply({
                content: '⚠️ Quirk no encontrado.',
                ephemeral: true
            });
        }
        
        // Crear embed de detalles
        const embed = new EmbedBuilder()
            .setTitle(`${quirk.emoji} ${quirk.name} - Nivel ${quirk.level}`)
            .setDescription(quirk.description)
            .setColor(this.getColorForElement(quirk.element))
            .addFields(
                { name: 'Elemento', value: quirk.element, inline: true },
                { name: 'Rareza', value: quirk.rarity, inline: true },
                { name: 'Descubierto', value: new Date(quirk.discoveredAt).toLocaleDateString(), inline: true },
                { name: 'Progreso', value: `Experiencia: ${quirk.experience}/${quirk.experienceToNext}`, inline: false }
            );
        
        // Añadir habilidades
        if (quirk.abilities && quirk.abilities.length > 0) {
            const abilitiesText = quirk.abilities.map(ability => {
                // Si la habilidad es un objeto completo
                if (ability && typeof ability === 'object') {
                    const name = ability.name || 'Habilidad sin nombre';
                    const description = ability.description || 'Sin descripción';
                    const mpCost = ability.mpCost || 'N/A';
                    const damage = ability.damage || 'N/A';
                    const effect = ability.effect || 'Ninguno';
                    
                    return `**${name}** - ${description}\n` +
                           `Coste: ${mpCost} MP | Daño: ${damage} | Efecto: ${effect}`;
                }
                // Si la habilidad es un string
                else if (typeof ability === 'string') {
                    return `**${ability}**`;
                }
                // Caso por defecto
                return 'Habilidad desconocida';
            }).join('\n\n');
            
            embed.addFields({
                name: '🔮 Habilidades Desbloqueadas',
                value: abilitiesText
            });
        } else {
            embed.addFields({
                name: '🔮 Habilidades',
                value: 'Este quirk aún no tiene habilidades desbloqueadas.'
            });
        }
        
        // Verificar si hay más habilidades por desbloquear
        const baseQuirk = this.gameManager.gameData.QUIRKS[quirkId];
        let maxAbilities = 0;
        let nextAbility = null;
        
        // Determinar el número máximo de habilidades y la siguiente a desbloquear
        if (baseQuirk && baseQuirk.abilities) {
            if (Array.isArray(baseQuirk.abilities)) {
                maxAbilities = baseQuirk.abilities.length;
                if (quirk.level < maxAbilities) {
                    nextAbility = baseQuirk.abilities[quirk.level];
                }
            } else if (typeof baseQuirk.abilities === 'object') {
                const abilityKeys = Object.keys(baseQuirk.abilities);
                maxAbilities = abilityKeys.length;
                if (quirk.level < maxAbilities) {
                    const nextAbilityKey = abilityKeys[quirk.level];
                    nextAbility = baseQuirk.abilities[nextAbilityKey];
                }
            }
        }
        
        if (nextAbility) {
            const upgradeCost = this.upgradeCosts[quirk.rarity.toLowerCase()] || 500;
            
            // Formatear la información de la próxima habilidad
            let nextAbilityName = 'Próxima Habilidad';
            let nextAbilityDescription = 'Descripción no disponible';
            
            if (typeof nextAbility === 'string') {
                nextAbilityName = nextAbility;
            } else if (nextAbility && typeof nextAbility === 'object') {
                nextAbilityName = nextAbility.name || 'Próxima Habilidad';
                nextAbilityDescription = nextAbility.description || 'Descripción no disponible';
            }
            
            embed.addFields({
                name: '🔒 Próxima Habilidad',
                value: `**${nextAbilityName}** - ${nextAbilityDescription}\n` +
                       `Desbloquea al nivel ${quirk.level + 1} (Coste: ${upgradeCost} oro)`
            });
        } else {
            embed.addFields({
                name: '✅ Desarrollo Completo',
                value: 'Has desbloqueado todas las habilidades de este quirk.'
            });
        }
        
        // Botones de acción
        // Determinar si el botón de mejora debe estar deshabilitado
        let disableUpgradeButton = true;
        
        if (baseQuirk && baseQuirk.abilities) {
            if (Array.isArray(baseQuirk.abilities)) {
                disableUpgradeButton = baseQuirk.abilities.length <= quirk.level;
            } else if (typeof baseQuirk.abilities === 'object') {
                disableUpgradeButton = Object.keys(baseQuirk.abilities).length <= quirk.level;
            }
        }
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`quirk_upgrade_${quirkId}`)
                .setLabel('Mejorar Quirk')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disableUpgradeButton),
            new ButtonBuilder()
                .setCustomId('quirk_back')
                .setLabel('Volver')
                .setStyle(ButtonStyle.Secondary)
        );
        
        // Enviar respuesta
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
    
    /**
     * Obtiene un color basado en el elemento del quirk
     * @param {string} element - Elemento del quirk
     * @returns {string} Código de color hexadecimal
     */
    getColorForElement(element) {
        const elementColors = {
            'Fuego': '#FF4500',
            'Agua': '#1E90FF',
            'Tierra': '#8B4513',
            'Viento': '#7FFFD4',
            'Rayo': '#FFD700',
            'Hielo': '#ADD8E6',
            'Luz': '#FFFACD',
            'Oscuridad': '#483D8B',
            'Físico': '#A0522D',
            'Dragón': '#800080',
            'Vacío': '#36454F'
        };
        
        return elementColors[element] || COLORS.PRIMARY;
    }
    
    /**
     * Maneja la interacción con botones de quirks
     * @param {Object} interaction - Interacción de Discord
     */
    async handleQuirkButtonInteraction(interaction) {
        const userId = interaction.user.id;
        const customId = interaction.customId;
        
        // Verificar si hay una sesión activa
        if (!this.activeQuirkSessions.has(userId)) {
            return interaction.reply({
                content: '⚠️ Tu sesión ha expirado. Por favor, usa `/quirks` para comenzar de nuevo.',
                ephemeral: true
            });
        }
        
        const session = this.activeQuirkSessions.get(userId);
        
        // Manejar diferentes botones
        if (customId === 'quirk_info') {
            // Mostrar detalles del quirk seleccionado
            await this.showQuirkDetails(interaction, session.selectedQuirk);
        } 
        else if (customId === 'quirk_back') {
            // Volver al menú principal de quirks
            await this.showQuirksMenu(interaction);
        }
        else if (customId === 'quirk_upgrade') {
            // Mejorar el quirk seleccionado
            try {
                const result = await this.upgradeQuirk(userId, session.selectedQuirk);
                
                const embed = new EmbedBuilder()
                    .setTitle(`✨ Quirk Mejorado: ${result.quirk.name}`)
                    .setDescription(
                        `Has mejorado tu quirk al nivel ${result.quirk.level}.\n` +
                        `Coste: ${result.cost} oro`
                    )
                    .setColor(COLORS.SUCCESS);
                
                if (result.newAbility) {
                    embed.addFields({
                        name: '🔮 Nueva Habilidad Desbloqueada',
                        value: `**${result.newAbility.name}** - ${result.newAbility.description}\n` +
                               `Coste: ${result.newAbility.mpCost} MP | Daño: ${result.newAbility.damage || 'N/A'} | Efecto: ${result.newAbility.effect || 'Ninguno'}`
                    });
                }
                
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
                
                // Actualizar detalles después de la mejora
                setTimeout(() => this.showQuirkDetails(interaction, session.selectedQuirk), 3000);
                
            } catch (error) {
                await interaction.reply({
                    content: `⚠️ ${error.message}`,
                    ephemeral: true
                });
            }
        }
        else if (customId === 'quirk_discover') {
            // Iniciar búsqueda de quirks (requiere exploración)
            if (this.gameManager.systems.exploration) {
                await interaction.reply({
                    content: '🔍 Para descubrir nuevos quirks, debes explorar el mundo. Usa `/explore` para comenzar una exploración.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '⚠️ El sistema de exploración no está disponible actualmente.',
                    ephemeral: true
                });
            }
        }
        else if (customId.startsWith('quirk_upgrade_')) {
            // Mejorar un quirk específico desde la vista de detalles
            const quirkId = customId.replace('quirk_upgrade_', '');
            try {
                const result = await this.upgradeQuirk(userId, quirkId);
                
                const embed = new EmbedBuilder()
                    .setTitle(`✨ Quirk Mejorado: ${result.quirk.name}`)
                    .setDescription(
                        `Has mejorado tu quirk al nivel ${result.quirk.level}.\n` +
                        `Coste: ${result.cost} oro`
                    )
                    .setColor(COLORS.SUCCESS);
                
                if (result.newAbility) {
                    embed.addFields({
                        name: '🔮 Nueva Habilidad Desbloqueada',
                        value: `**${result.newAbility.name}** - ${result.newAbility.description}\n` +
                               `Coste: ${result.newAbility.mpCost} MP | Daño: ${result.newAbility.damage || 'N/A'} | Efecto: ${result.newAbility.effect || 'Ninguno'}`
                    });
                }
                
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
                
                // Actualizar detalles después de la mejora
                setTimeout(() => this.showQuirkDetails(interaction, quirkId), 3000);
                
            } catch (error) {
                await interaction.reply({
                    content: `⚠️ ${error.message}`,
                    ephemeral: true
                });
            }
        }
    }
    
    /**
     * Maneja la interacción con menús de selección de quirks
     * @param {Object} interaction - Interacción de Discord
     */
    async handleQuirkSelectInteraction(interaction) {
        const userId = interaction.user.id;
        const quirkId = interaction.values[0];
        
        // Verificar si hay una sesión activa
        if (!this.activeQuirkSessions.has(userId)) {
            return interaction.reply({
                content: '⚠️ Tu sesión ha expirado. Por favor, usa `/quirks` para comenzar de nuevo.',
                ephemeral: true
            });
        }
        
        // Actualizar quirk seleccionado
        const session = this.activeQuirkSessions.get(userId);
        session.selectedQuirk = quirkId;
        this.activeQuirkSessions.set(userId, session);
        
        // Mostrar detalles del quirk seleccionado
        await this.showQuirkDetails(interaction, quirkId);
    }
}

module.exports = QuirksSystem;