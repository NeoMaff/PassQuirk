const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { PassQuirkEmbed, CharacterCreationEmbed, BattleEmbed } = require('../utils/embedStyles');
const User = require('../models/User');

module.exports = {
    // Botón para crear personaje
    async handleCreateCharacter(interaction) {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id } });
            
            if (user && user.hasCharacter) {
                return await interaction.reply({
                    content: '❌ Ya tienes un personaje creado. Usa `/passquirkrpg` para acceder a tu aventura.',
                    ephemeral: true
                });
            }

            await this.showCharacterCreation(interaction);
        } catch (error) {
            console.error('Error en handleCreateCharacter:', error);
            await interaction.reply({
                content: '❌ Error al crear personaje. Inténtalo de nuevo.',
                ephemeral: true
            });
        }
    },

    async showCharacterCreation(interaction) {
        const embed = new CharacterCreationEmbed(
            '🌟 Creación de Personaje',
            `¡Bienvenido al mundo de **PassQuirk RPG**, ${interaction.user.displayName}!\n\n` +
            '🎭 **Elige tu clase inicial:**\n\n' +
            '⚔️ **Guerrero** - Maestro del combate cuerpo a cuerpo\n' +
            '• +5 Ataque, +3 Defensa\n' +
            '• Quirk inicial: "Golpe Devastador"\n\n' +
            '🔮 **Mago** - Dominador de las artes arcanas\n' +
            '• +5 Inteligencia, +3 MP\n' +
            '• Quirk inicial: "Bola de Fuego"\n\n' +
            '🏃‍♂️ **Explorador** - Ágil y versátil\n' +
            '• +5 Velocidad, +2 todos los stats\n' +
            '• Quirk inicial: "Paso Sombra"\n\n' +
            '💚 **Sanador** - Protector y curandero\n' +
            '• +5 HP, +5 MP, +3 Inteligencia\n' +
            '• Quirk inicial: "Curación Básica"'
        );

        const classButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_warrior')
                    .setLabel('⚔️ Guerrero')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('create_mage')
                    .setLabel('🔮 Mago')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('create_explorer')
                    .setLabel('🏃‍♂️ Explorador')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('create_healer')
                    .setLabel('💚 Sanador')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [classButtons]
        });
    },

    // Crear personaje con clase específica
    async createCharacterWithClass(interaction, characterClass) {
        try {
            const userId = interaction.user.id;
            const username = interaction.user.displayName;
            
            // Verificar si ya existe
            let user = await User.findOne({ where: { userId } });
            
            if (user && user.hasCharacter) {
                return await interaction.reply({
                    content: '❌ Ya tienes un personaje creado.',
                    ephemeral: true
                });
            }

            // Configurar stats base según la clase
            const classStats = this.getClassStats(characterClass);
            const initialQuirk = this.getInitialQuirk(characterClass);

            // Crear o actualizar usuario
                if (!user) {
                    user = await User.create({
                        userId,
                        username,
                        characterName: username,
                        characterClass,
                        hasCharacter: true,
                        rpgStats: classStats,
                        quirks: [initialQuirk]
                    });
                } else {
                user.characterName = username;
                user.characterClass = characterClass;
                user.hasCharacter = true;
                user.rpgStats = { ...user.rpgStats, ...classStats };
                user.quirks = [initialQuirk];
            }

            await user.save();

            // Mostrar confirmación
            const successEmbed = new PassQuirkEmbed()
                .setTitle('🎉 ¡Personaje Creado Exitosamente!')
                .setDescription(
                    `**¡Bienvenido a PassQuirk RPG, ${username}!**\n\n` +
                    `🎭 **Clase:** ${characterClass}\n` +
                    `⭐ **Nivel:** ${classStats.level}\n` +
                    `❤️ **HP:** ${classStats.hp}/${classStats.maxHp}\n` +
                    `💙 **MP:** ${classStats.mp}/${classStats.maxMp}\n` +
                    `⚔️ **Ataque:** ${classStats.attack}\n` +
                    `🛡️ **Defensa:** ${classStats.defense}\n` +
                    `⚡ **Velocidad:** ${classStats.speed}\n` +
                    `🧠 **Inteligencia:** ${classStats.intelligence}\n\n` +
                    `🌟 **Quirk Inicial:** ${initialQuirk.name}\n` +
                    `📍 **Ubicación:** Centro de Inicio - Plaza Principal\n\n` +
                    `¡Tu aventura épica comienza ahora! Usa \`/passquirkrpg\` para explorar el mundo.`
                )
                .setColor('#00B894')
                .setThumbnail('https://i.imgur.com/character_created.png');

            const startButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('goto_main_panel')
                    .setLabel('🚀 ¡Ir al Panel Principal!')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⭐')
                );

            await interaction.update({
                embeds: [successEmbed],
                components: [startButton]
            });

        } catch (error) {
            console.error('Error creando personaje:', error);
            await interaction.reply({
                content: '❌ Error al crear el personaje. Inténtalo de nuevo.',
                ephemeral: true
            });
        }
    },

    // Obtener stats base por clase
    getClassStats(characterClass) {
        const baseStats = {
            level: 1,
            xp: 0,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            attack: 10,
            defense: 5,
            speed: 8,
            intelligence: 7
        };

        switch (characterClass) {
            case 'Guerrero':
                return {
                    ...baseStats,
                    attack: baseStats.attack + 5,
                    defense: baseStats.defense + 3
                };
            case 'Mago':
                return {
                    ...baseStats,
                    intelligence: baseStats.intelligence + 5,
                    mp: baseStats.mp + 30,
                    maxMp: baseStats.maxMp + 30
                };
            case 'Explorador':
                return {
                    ...baseStats,
                    speed: baseStats.speed + 5,
                    attack: baseStats.attack + 2,
                    defense: baseStats.defense + 2,
                    intelligence: baseStats.intelligence + 2
                };
            case 'Sanador':
                return {
                    ...baseStats,
                    hp: baseStats.hp + 50,
                    maxHp: baseStats.maxHp + 50,
                    mp: baseStats.mp + 50,
                    maxMp: baseStats.maxMp + 50,
                    intelligence: baseStats.intelligence + 3
                };
            default:
                return baseStats;
        }
    },

    // Obtener quirk inicial por clase (basado en documentación oficial PassQuirk)
    getInitialQuirk(characterClass) {
        const quirks = {
            'Guerrero': {
                id: 'golpe_brutal',
                name: 'Golpe Brutal',
                description: 'Carga Destructiva - Embiste al enemigo, derribándolo con un golpe masivo',
                type: 'Ofensivo',
                rarity: '🔵 Raro',
                level: 1,
                cooldown: 3,
                passquirk: 'Bestia' // Compatible con Guerrero según doc oficial
            },
            'Mago': {
                id: 'luz_divina',
                name: 'Luz Divina',
                description: 'Destello Solar - Lanza un rayo de luz que ciega temporalmente y causa daño leve',
                type: 'Ofensivo',
                rarity: '🔵 Raro',
                level: 1,
                cooldown: 2,
                passquirk: 'Luz' // Compatible con Mago según doc oficial
            },
            'Explorador': {
                id: 'alas_ardientes',
                name: 'Alas Ardientes',
                description: 'Embestida Ígnea - Avanza rápidamente hacia un enemigo, dejándolo en llamas',
                type: 'Movilidad',
                rarity: '🟢 Común',
                level: 1,
                cooldown: 4,
                passquirk: 'Vendaval' // Compatible con Explorador según doc oficial
            },
            'Sanador': {
                id: 'canto_estelar',
                name: 'Canto Estelar',
                description: 'Himno de Vitalidad - Regenera vida lentamente durante varios segundos',
                type: 'Soporte',
                rarity: '🟢 Común',
                level: 1,
                cooldown: 2,
                passquirk: 'Agua' // Compatible con Sanador según doc oficial
            }
        };

        return quirks[characterClass] || quirks['Guerrero'];
    },

    // Iniciar aventura
    async startAdventure(interaction) {
        try {
            // Verificar si el usuario ya tiene un personaje
            const User = require('../models/User');
            let user = await User.findOne({ where: { userId: interaction.user.id } });
            
            if (!user || !user.hasCharacter) {
                // Si no tiene personaje, mostrar creación de personaje
                await this.showCharacterCreation(interaction);
            } else {
                // Si ya tiene personaje, mostrar panel principal
                const passquirkCommand = require('../commands/passquirkrpg');
                await passquirkCommand.showMainPanel(interaction, user);
            }
        } catch (error) {
            console.error('Error iniciando aventura:', error);
            await interaction.reply({
                content: '❌ Error al iniciar la aventura. Usa `/passquirkrpg` para continuar.',
                ephemeral: true
            });
        }
    }
};