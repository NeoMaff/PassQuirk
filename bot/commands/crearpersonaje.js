const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { MenuEmbed, SuccessEmbed, ErrorEmbed, COLORS } = require('../utils/embedStyles');
const User = require('../models/User');

const CLASSES = {
    warrior: {
        name: '⚔️ Guerrero',
        description: 'Maestro del combate cuerpo a cuerpo. Alta defensa y daño físico.',
        emoji: '⚔️',
        stats: { fuerza: 8, destreza: 5, inteligencia: 3, constitucion: 9, suerte: 5 },
        skills: ['Golpe Poderoso', 'Defensa Férrea', 'Grito de Guerra'],
        color: '#FF6B6B'
    },
    mage: {
        name: '🔮 Mago',
        description: 'Domina las artes arcanas. Alto daño mágico y control del campo.',
        emoji: '🔮',
        stats: { fuerza: 3, destreza: 5, inteligencia: 10, constitucion: 4, suerte: 8 },
        skills: ['Bola de Fuego', 'Rayo de Hielo', 'Escudo Arcano'],
        color: '#4ECDC4'
    },
    archer: {
        name: '🏹 Arquero',
        description: 'Experto en combate a distancia. Alta precisión y velocidad.',
        emoji: '🏹',
        stats: { fuerza: 6, destreza: 10, inteligencia: 5, constitucion: 5, suerte: 6 },
        skills: ['Disparo Rápido', 'Flecha Perforante', 'Trampa de Red'],
        color: '#95E1D3'
    },
    rogue: {
        name: '🗡️ Ladrón',
        description: 'Ágil y sigiloso. Altos críticos y evasión.',
        emoji: '🗡️',
        stats: { fuerza: 6, destreza: 9, inteligencia: 6, constitucion: 5, suerte: 10 },
        skills: ['Ataque Furtivo', 'Evasión', 'Robo'],
        color: '#F38181'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crearpersonaje')
        .setDescription('Crea tu personaje y comienza tu aventura en PassQuirk RPG'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Verificar si el usuario ya tiene un personaje
        const user = await User.findOne({ discordId: userId });

        if (user && user.character) {
            return interaction.reply({
                embeds: [new ErrorEmbed('Ya tienes un personaje creado. Usa `/personaje` para ver tu información.')],
                ephemeral: true
            });
        }

        // Mostrar el paso 1: Introducción
        await this.showIntroduction(interaction);
    },

    async showIntroduction(interaction) {
        const embed = new MenuEmbed(
            '🐉 Creación de Personaje',
            '**¡Bienvenido, futuro aventurero!**\n\n' +
            'Estás a punto de crear tu personaje y comenzar una épica aventura ' +
            'en el mundo de PassQuirk.\n\n' +
            'El proceso consta de los siguientes pasos:\n\n' +
            '**1️⃣ Nombre del Personaje**\n' +
            '**2️⃣ Selección de Género**\n' +
            '**3️⃣ Elección de Clase**\n' +
            '**4️⃣ Confirmación**\n\n' +
            '¿Estás listo para comenzar?',
            {
                footer: 'PassQuirk RPG • Creación de Personaje'
            }
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('character_start')
                    .setLabel('¡Comenzar!')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✨'),
                new ButtonBuilder()
                    .setCustomId('character_cancel')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async showNameInput(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('character_name_modal')
            .setTitle('Nombre del Personaje');

        const nameInput = new TextInputBuilder()
            .setCustomId('character_name')
            .setLabel('¿Cómo se llamará tu personaje?')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ej: Aragorn, Gandalf, Legolas...')
            .setMinLength(2)
            .setMaxLength(20)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(nameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },

    async showGenderSelection(interaction, characterName) {
        const embed = new MenuEmbed(
            '👤 Selección de Género',
            `**Nombre:** ${characterName}\n\n` +
            'Ahora elige el género de tu personaje. Esta elección es principalmente ' +
            'cosmética y no afecta las estadísticas del juego.',
            {
                footer: 'PassQuirk RPG • Paso 2/4'
            }
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`gender_male_${characterName}`)
                    .setLabel('Masculino')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('♂️'),
                new ButtonBuilder()
                    .setCustomId(`gender_female_${characterName}`)
                    .setLabel('Femenino')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('♀️'),
                new ButtonBuilder()
                    .setCustomId(`gender_other_${characterName}`)
                    .setLabel('Otro')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚧️')
            );

        const backRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('character_back')
                    .setLabel('Atrás')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({ embeds: [embed], components: [row, backRow] });
    },

    async showClassSelection(interaction, characterName, gender) {
        const embed = new MenuEmbed(
            '🎭 Selección de Clase',
            `**Nombre:** ${characterName}\n` +
            `**Género:** ${gender}\n\n` +
            '**Elige tu clase:**\n\n' +
            'Cada clase tiene estadísticas y habilidades únicas. ' +
            'Elige sabiamente, ¡tu elección definirá tu estilo de juego!',
            {
                footer: 'PassQuirk RPG • Paso 3/4'
            }
        );

        // Añadir información de cada clase
        for (const [key, classData] of Object.entries(CLASSES)) {
            embed.addFields({
                name: classData.name,
                value: `${classData.description}\n` +
                       `**Habilidades:** ${classData.skills.join(', ')}`,
                inline: false
            });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`class_select_${characterName}_${gender}`)
            .setPlaceholder('Selecciona tu clase')
            .addOptions(
                Object.entries(CLASSES).map(([key, classData]) => ({
                    label: classData.name,
                    description: classData.description.substring(0, 100),
                    value: key,
                    emoji: classData.emoji
                }))
            );

        const row1 = new ActionRowBuilder().addComponents(selectMenu);
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`character_back_gender_${characterName}`)
                    .setLabel('Atrás')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({ embeds: [embed], components: [row1, row2] });
    },

    async showConfirmation(interaction, characterData) {
        const { name, gender, class: className } = characterData;
        const classInfo = CLASSES[className];

        const embed = new MenuEmbed(
            '✅ Confirmación de Personaje',
            '**¡Tu personaje está listo!**\n\n' +
            'Revisa la información y confirma si todo está correcto:',
            {
                footer: 'PassQuirk RPG • Paso 4/4'
            }
        );

        embed.setColor(classInfo.color);
        embed.setThumbnail(interaction.user.displayAvatarURL());

        embed.addFields(
            {
                name: '📝 Información Básica',
                value: `**Nombre:** ${name}\n` +
                       `**Género:** ${gender}\n` +
                       `**Clase:** ${classInfo.name}`,
                inline: false
            },
            {
                name: '📊 Estadísticas Iniciales',
                value: `⚔️ Fuerza: **${classInfo.stats.fuerza}**\n` +
                       `🎯 Destreza: **${classInfo.stats.destreza}**\n` +
                       `🧠 Inteligencia: **${classInfo.stats.inteligencia}**\n` +
                       `❤️ Constitución: **${classInfo.stats.constitucion}**\n` +
                       `🍀 Suerte: **${classInfo.stats.suerte}**`,
                inline: true
            },
            {
                name: '✨ Habilidades Iniciales',
                value: classInfo.skills.map(skill => `• ${skill}`).join('\n'),
                inline: true
            }
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`character_confirm_${name}_${gender}_${className}`)
                    .setLabel('¡Confirmar y Comenzar!')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('character_cancel')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },

    async createCharacter(interaction, characterData) {
        const userId = interaction.user.id;
        const { name, gender, class: className } = characterData;
        const classInfo = CLASSES[className];

        try {
            // Crear o actualizar el usuario con el personaje
            const user = await User.findOneAndUpdate(
                { discordId: userId },
                {
                    discordId: userId,
                    username: interaction.user.username,
                    character: {
                        name: name,
                        gender: gender,
                        class: className,
                        level: 1,
                        xp: 0,
                        xpToNext: 100,
                        stats: {
                            ...classInfo.stats,
                            hp: classInfo.stats.constitucion * 10,
                            maxHp: classInfo.stats.constitucion * 10,
                            pa: 10,
                            maxPa: 10
                        },
                        skills: classInfo.skills,
                        inventory: [
                            { name: 'Poción de Salud', type: 'potion', amount: 3, emoji: '🧪' }
                        ],
                        balance: 100,
                        gems: 0,
                        pg: 0
                    }
                },
                { upsert: true, new: true }
            );

            const embed = new SuccessEmbed(
                `**¡Bienvenido al mundo de PassQuirk, ${name}!**\n\n` +
                'Tu personaje ha sido creado exitosamente. Tu aventura comienza ahora.\n\n' +
                '🎁 **Objetos iniciales recibidos:**\n' +
                '• Poción de Salud ×3\n' +
                '• 100 PassCoins\n\n' +
                '**Comandos útiles:**\n' +
                '• `/personaje` - Ver tu información\n' +
                '• `/aventura` - Comenzar una aventura\n' +
                '• `/ayuda` - Ver todos los comandos\n\n' +
                '¡Que tu viaje esté lleno de gloria y fortuna!',
                {
                    title: '🎉 ¡Personaje Creado!'
                }
            );

            embed.setColor(classInfo.color);
            embed.setThumbnail(interaction.user.displayAvatarURL());

            await interaction.editReply({ embeds: [embed], components: [] });

        } catch (error) {
            console.error('Error creating character:', error);
            await interaction.editReply({
                embeds: [new ErrorEmbed('Hubo un error al crear tu personaje. Por favor, intenta de nuevo.')],
                components: []
            });
        }
    },

    async handleButton(interaction) {
        const customId = interaction.customId;

        if (customId === 'character_start') {
            await interaction.deferUpdate();
            await this.showNameInput(interaction);
        } else if (customId === 'character_cancel') {
            await interaction.update({
                embeds: [new ErrorEmbed('Creación de personaje cancelada.')],
                components: []
            });
        } else if (customId.startsWith('gender_')) {
            const [, genderType, ...nameParts] = customId.split('_');
            const characterName = nameParts.join('_');
            const genderMap = { male: 'Masculino', female: 'Femenino', other: 'Otro' };
            await interaction.deferUpdate();
            await this.showClassSelection(interaction, characterName, genderMap[genderType]);
        } else if (customId.startsWith('character_confirm_')) {
            const [, , ...parts] = customId.split('_');
            const className = parts.pop();
            const gender = parts.pop();
            const name = parts.join('_');

            await interaction.deferUpdate();
            await this.createCharacter(interaction, { name, gender, class: className });
        }
    },

    async handleSelectMenu(interaction) {
        const [, , ...parts] = interaction.customId.split('_');
        const gender = parts.pop();
        const name = parts.join('_');
        const selectedClass = interaction.values[0];

        await interaction.deferUpdate();
        await this.showConfirmation(interaction, { name, gender, class: selectedClass });
    },

    async handleModal(interaction) {
        const characterName = interaction.fields.getTextInputValue('character_name');

        await interaction.deferUpdate();
        await this.showGenderSelection(interaction, characterName);
    }
};
