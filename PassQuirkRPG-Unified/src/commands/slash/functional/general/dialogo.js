// 💬 COMANDO DIÁLOGO - Sistema de conversaciones con NPCs
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { PassQuirkEmbed, DialogEmbed } = require('../utils/embedStyles');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dialogo')
        .setDescription('Muestra un diálogo de ejemplo del sistema PassQuirk RPG')
        .addStringOption(option =>
            option.setName('npc')
                .setDescription('Selecciona el NPC con quien hablar')
                .setRequired(false)
                .addChoices(
                    { name: '🧙‍♂️ El Sabio - Mentor Principal', value: 'el_sabio' },
                    { name: '🛡️ Capitán Akai - Instructor de Combate', value: 'capitan_akai' },
                    { name: '🔮 Maga Say - Maestra de Magia', value: 'maga_say' },
                    { name: '🌿 Guardián Masai - Protector de la Naturaleza', value: 'guardian_masai' },
                    { name: '🏪 Mercader Zhen - Comerciante', value: 'mercader_zhen' }
                )
        ),

    async execute(interaction) {
        try {
            const selectedNpc = interaction.options.getString('npc') || 'el_sabio';
            
            // Verificar si el usuario existe
            let user = await User.findOne({ where: { userId: interaction.user.id } });
            const playerName = user?.characterName || interaction.user.displayName;
            
            await this.showNpcDialog(interaction, selectedNpc, playerName);
        } catch (error) {
            console.error('Error en comando dialogo:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al mostrar el diálogo. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    },

    async showNpcDialog(interaction, npcId, playerName) {
        const dialogues = this.getDialogues();
        const dialogue = dialogues[npcId] || dialogues['el_sabio'];
        
        const dialogEmbed = new DialogEmbed(
            dialogue.name,
            dialogue.message.replace('{playerName}', playerName),
            {
                npcAvatar: dialogue.avatar,
                image: dialogue.image,
                thumbnail: dialogue.thumbnail
            }
        )
        .setColor(dialogue.color)
        .addFields(...dialogue.fields);

        // Crear botones de respuesta
        const responseRow = new ActionRowBuilder()
            .addComponents(
                ...dialogue.responses.map((response, index) => 
                    new ButtonBuilder()
                        .setCustomId(`dialog_response_${npcId}_${index}`)
                        .setLabel(response.text)
                        .setStyle(response.style || ButtonStyle.Primary)
                        .setEmoji(response.emoji || '💬')
                )
            );

        // Menú de acciones adicionales
        const actionMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`npc_actions_${npcId}`)
                    .setPlaceholder('🎭 Selecciona una acción...')
                    .addOptions(dialogue.actions)
            );

        const components = [responseRow];
        if (dialogue.actions.length > 0) {
            components.push(actionMenu);
        }

        await interaction.reply({
            embeds: [dialogEmbed],
            components: components
        });
    },

    getDialogues() {
        return {
            'el_sabio': {
                name: '🧙‍♂️ El Sabio',
                avatar: 'https://i.imgur.com/el_sabio_avatar.png',
                color: '#6C5CE7',
                message: `¡Ah, {playerName}! Te estaba esperando, joven aventurero. 🌟\n\nHe observado tu potencial desde que llegaste a nuestro mundo. El destino te ha traído aquí por una razón muy especial.\n\n**¿Estás listo para descubrir tu verdadero poder?**`,
                image: 'https://i.imgur.com/el_sabio_scene.png',
                fields: [
                    {
                        name: '📚 Sabiduría del Sabio',
                        value: '"El verdadero poder no viene de la fuerza bruta, sino del conocimiento y la determinación. Cada desafío que superes te hará más fuerte."',
                        inline: false
                    },
                    {
                        name: '🎯 Consejo Actual',
                        value: 'Entrena tus habilidades básicas antes de enfrentar enemigos más poderosos. La paciencia es la clave del éxito.',
                        inline: true
                    },
                    {
                        name: '⭐ Próximo Objetivo',
                        value: 'Alcanza el nivel 5 para desbloquear tu primer Quirk especial.',
                        inline: true
                    }
                ],
                responses: [
                    { text: '✨ Quiero entrenar', emoji: '⚔️', style: ButtonStyle.Primary },
                    { text: '📖 Cuéntame más', emoji: '📚', style: ButtonStyle.Secondary },
                    { text: '🎁 ¿Tienes misiones?', emoji: '📜', style: ButtonStyle.Success }
                ],
                actions: [
                    {
                        label: '🎓 Recibir Tutorial',
                        description: 'Aprende los fundamentos del juego',
                        value: 'tutorial',
                        emoji: '🎓'
                    },
                    {
                        label: '🔮 Consultar Destino',
                        description: 'Descubre tu camino en PassQuirk',
                        value: 'destiny',
                        emoji: '🔮'
                    },
                    {
                        label: '📜 Misiones Disponibles',
                        description: 'Ver tareas que puedes completar',
                        value: 'quests',
                        emoji: '📜'
                    }
                ]
            },
            'capitan_akai': {
                name: '🛡️ Capitán Akai',
                avatar: 'https://i.imgur.com/capitan_akai_avatar.png',
                color: '#FF6B6B',
                message: `¡{playerName}! ¡Perfecto timing, soldado! 🔥\n\nHe estado esperando a alguien con tu determinación. En la región de Akai, forjamos guerreros que pueden enfrentar cualquier desafío.\n\n**¿Tienes lo que se necesita para convertirte en un verdadero guerrero?**`,
                fields: [
                    {
                        name: '⚔️ Filosofía de Combate',
                        value: '"Un guerrero no se define por sus victorias, sino por cómo se levanta después de cada derrota. ¡El fuego interior es lo que nos hace invencibles!"',
                        inline: false
                    },
                    {
                        name: '🔥 Entrenamiento Disponible',
                        value: '• Combate Básico (Nivel 1-5)\n• Técnicas de Espada (Nivel 6-10)\n• Combate Avanzado (Nivel 11+)',
                        inline: true
                    },
                    {
                        name: '🏆 Recompensas',
                        value: '• +50 XP por entrenamiento\n• Nuevas habilidades de combate\n• Equipo mejorado',
                        inline: true
                    }
                ],
                responses: [
                    { text: '⚔️ ¡Entrenar ahora!', emoji: '🔥', style: ButtonStyle.Danger },
                    { text: '🛡️ Ver mi equipo', emoji: '⚔️', style: ButtonStyle.Primary },
                    { text: '📊 Mis estadísticas', emoji: '📈', style: ButtonStyle.Secondary }
                ],
                actions: [
                    {
                        label: '⚔️ Entrenamiento de Combate',
                        description: 'Mejora tus habilidades de batalla',
                        value: 'combat_training',
                        emoji: '⚔️'
                    },
                    {
                        label: '🏟️ Arena de Práctica',
                        description: 'Lucha contra enemigos de entrenamiento',
                        value: 'practice_arena',
                        emoji: '🏟️'
                    },
                    {
                        label: '🛡️ Tienda de Armas',
                        description: 'Compra equipo de combate',
                        value: 'weapon_shop',
                        emoji: '🛡️'
                    }
                ]
            },
            'maga_say': {
                name: '🔮 Maga Say',
                avatar: 'https://i.imgur.com/maga_say_avatar.png',
                color: '#4ECDC4',
                message: `Saludos, {playerName}... Las energías mágicas me susurran tu nombre. ✨\n\nPuedo sentir el potencial mágico que fluye en tu interior. En la región de Say, cultivamos la sabiduría y el poder arcano.\n\n**¿Deseas explorar los misterios de la magia?**`,
                fields: [
                    {
                        name: '🌟 Sabiduría Arcana',
                        value: '"La magia no es solo poder, es comprensión. Quien domina su mente, domina el universo mismo."',
                        inline: false
                    },
                    {
                        name: '📚 Escuelas de Magia',
                        value: '• Elementalismo 🔥💧🌪️⛰️\n• Curación y Protección 💚\n• Ilusión y Encantamiento 🌙',
                        inline: true
                    },
                    {
                        name: '🔮 Servicios Mágicos',
                        value: '• Identificar objetos mágicos\n• Enseñar nuevos hechizos\n• Restaurar MP',
                        inline: true
                    }
                ],
                responses: [
                    { text: '✨ Aprender magia', emoji: '🔮', style: ButtonStyle.Primary },
                    { text: '🧪 Ver pociones', emoji: '⚗️', style: ButtonStyle.Secondary },
                    { text: '🌙 Meditar', emoji: '🧘‍♀️', style: ButtonStyle.Success }
                ],
                actions: [
                    {
                        label: '📖 Biblioteca Mágica',
                        description: 'Estudia hechizos y conocimiento arcano',
                        value: 'magic_library',
                        emoji: '📖'
                    },
                    {
                        label: '🧪 Laboratorio de Pociones',
                        description: 'Crea pociones y objetos mágicos',
                        value: 'potion_lab',
                        emoji: '🧪'
                    },
                    {
                        label: '🔮 Círculo de Meditación',
                        description: 'Restaura MP y mejora concentración',
                        value: 'meditation',
                        emoji: '🔮'
                    }
                ]
            },
            'guardian_masai': {
                name: '🌿 Guardián Masai',
                avatar: 'https://i.imgur.com/guardian_masai_avatar.png',
                color: '#2ECC71',
                message: `La naturaleza me ha hablado de ti, {playerName}... 🌱\n\nEres bienvenido en los dominios de Masai, donde la armonía entre todos los seres vivos es sagrada. Aquí aprenderás que la verdadera fuerza viene del equilibrio.\n\n**¿Estás preparado para conectar con la esencia de la naturaleza?**`,
                fields: [
                    {
                        name: '🌍 Filosofía Natural',
                        value: '"Todo en la naturaleza está conectado. Quien respeta esta conexión, obtiene su poder. Quien la ignora, se pierde en la oscuridad."',
                        inline: false
                    },
                    {
                        name: '🌿 Habilidades Naturales',
                        value: '• Comunicación con animales 🦅\n• Curación natural 🌸\n• Control elemental 🌊🔥',
                        inline: true
                    },
                    {
                        name: '🎋 Recursos Disponibles',
                        value: '• Hierbas medicinales\n• Cristales de energía\n• Compañeros animales',
                        inline: true
                    }
                ],
                responses: [
                    { text: '🌱 Conectar con naturaleza', emoji: '🌿', style: ButtonStyle.Success },
                    { text: '🦅 Hablar con animales', emoji: '🐾', style: ButtonStyle.Primary },
                    { text: '🌸 Recolectar hierbas', emoji: '🌺', style: ButtonStyle.Secondary }
                ],
                actions: [
                    {
                        label: '🌳 Bosque Sagrado',
                        description: 'Explora y conecta con la naturaleza',
                        value: 'sacred_forest',
                        emoji: '🌳'
                    },
                    {
                        label: '🦅 Santuario de Animales',
                        description: 'Encuentra compañeros animales',
                        value: 'animal_sanctuary',
                        emoji: '🦅'
                    },
                    {
                        label: '💎 Cueva de Cristales',
                        description: 'Recolecta cristales mágicos',
                        value: 'crystal_cave',
                        emoji: '💎'
                    }
                ]
            },
            'mercader_zhen': {
                name: '🏪 Mercader Zhen',
                avatar: 'https://i.imgur.com/mercader_zhen_avatar.png',
                color: '#F39C12',
                message: `¡Ah, {playerName}! ¡Un cliente con buen ojo para los negocios! 💰\n\nBienvenido a mi humilde establecimiento. Aquí encontrarás los mejores objetos, armas y tesoros de todo PassQuirk. ¡Calidad garantizada!\n\n**¿Qué te interesa adquirir hoy, estimado aventurero?**`,
                fields: [
                    {
                        name: '💼 Filosofía Comercial',
                        value: '"Un buen negocio beneficia a ambas partes. Yo te ofrezco calidad, tú me ofreces lealtad. ¡Así se construyen imperios!"',
                        inline: false
                    },
                    {
                        name: '🛍️ Productos Destacados',
                        value: '• Armas legendarias ⚔️\n• Pociones raras 🧪\n• Objetos únicos 💎\n• Materiales de crafting 🔨',
                        inline: true
                    },
                    {
                        name: '💰 Ofertas Especiales',
                        value: '• Descuentos por volumen\n• Programa de fidelidad\n• Intercambios especiales',
                        inline: true
                    }
                ],
                responses: [
                    { text: '🛒 Ver tienda', emoji: '🏪', style: ButtonStyle.Primary },
                    { text: '💰 Vender objetos', emoji: '💸', style: ButtonStyle.Success },
                    { text: '🔄 Intercambiar', emoji: '🔄', style: ButtonStyle.Secondary }
                ],
                actions: [
                    {
                        label: '⚔️ Armería',
                        description: 'Armas y armaduras de calidad',
                        value: 'armory',
                        emoji: '⚔️'
                    },
                    {
                        label: '🧪 Botica',
                        description: 'Pociones y objetos consumibles',
                        value: 'apothecary',
                        emoji: '🧪'
                    },
                    {
                        label: '💎 Tesoros Raros',
                        description: 'Objetos únicos y legendarios',
                        value: 'rare_treasures',
                        emoji: '💎'
                    },
                    {
                        label: '🔨 Materiales',
                        description: 'Recursos para crafting',
                        value: 'materials',
                        emoji: '🔨'
                    }
                ]
            }
        };
    }
};