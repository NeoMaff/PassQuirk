// 📚 COMANDO HELP - Sistema de ayuda completo
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PassQuirkEmbed } = require('../utils/embedStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 Guía completa de comandos y ayuda de PassQuirk RPG')
        .addStringOption(option =>
            option.setName('comando')
                .setDescription('Comando específico del que quieres información')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría de comandos a mostrar')
                .setRequired(false)
                .addChoices(
                    { name: '🎮 Juego Principal', value: 'juego' },
                    { name: '💰 Economía', value: 'economia' },
                    { name: '⚙️ Administración', value: 'admin' },
                    { name: '🔧 Utilidades', value: 'utilidades' }
                )
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const commands = [
            'passquirkrpg', 'tienda', 'inventario', 'balance', 'work', 'pagar',
            'transacciones', 'config', 'configurar-tiempo', 'cambiar-zona', 'dialogo'
        ];
        
        const filtered = commands
            .filter(cmd => cmd.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25);
        
        await interaction.respond(
            filtered.map(cmd => ({ name: `/${cmd}`, value: cmd }))
        );
    },

    async execute(interaction) {
        const specificCommand = interaction.options.getString('comando');
        const category = interaction.options.getString('categoria');
        
        // Si se solicita ayuda de un comando específico
        if (specificCommand) {
            return await this.showSpecificCommandHelp(interaction, specificCommand);
        }
        
        // Si se solicita una categoría específica
        if (category) {
            return await this.showCategoryHelp(interaction, category);
        }
        // Crear el menú de selección de categorías
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('categoria_comandos')
                    .setPlaceholder('Selecciona una categoría')
                    .addOptions([
                        {
                            label: '⚙️ Configuración',
                            description: 'Configura el servidor y el bot',
                            value: 'configuracion',
                            emoji: '⚙️'
                        },
                        {
                            label: '🎮 Juego',
                            description: 'Comandos principales del juego',
                            value: 'juego',
                            emoji: '🎮'
                        },
                        {
                            label: '🔧 Utilidades',
                            description: 'Herramientas útiles',
                            value: 'utilidades',
                            emoji: '🔧'
                        },
                        {
                            label: '❓ Ayuda',
                            description: 'Obtén ayuda sobre el bot',
                            value: 'ayuda',
                            emoji: '❓'
                        }
                    ])
            );

        // Crear el embed principal
        const embed = new PassQuirkEmbed()
            .setTitle('🎮 Panel de Comandos - PassQuirk RPG')
            .setDescription(
                '**¡Bienvenido al centro de comandos, aventurero!** ⚔️\n\n' +
                'Selecciona una categoría para descubrir todos los comandos disponibles en tu épica aventura.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                '*Usa los menús desplegables para navegar entre las diferentes secciones.*'
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setImage('https://cdn.discordapp.com/attachments/placeholder/commands_banner.png')
            .setFooter({ 
                text: '¡Tu aventura te espera! • PassQuirk RPG',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        // Enviar el mensaje con el menú
        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: false 
        });
    },

    async showSpecificCommandHelp(interaction, commandName) {
        const commandHelp = {
            'passquirkrpg': {
                name: '/passquirkrpg',
                description: 'Comando principal del juego RPG',
                usage: '/passquirkrpg',
                examples: ['Inicia tu aventura en PassQuirk']
            },
            'tienda': {
                name: '/tienda',
                description: 'Abre la tienda mágica',
                usage: '/tienda [categoria] [comprar] [cantidad]',
                examples: ['/tienda categoria:consumibles', '/tienda comprar:pocion_vida cantidad:5']
            },
            'config': {
                name: '/config',
                description: 'Panel de configuración del servidor',
                usage: '/config [subcomando]',
                examples: ['/config panel', '/config tiempo']
            }
        };
        
        const help = commandHelp[commandName];
        if (!help) {
            return interaction.reply({
                content: `❌ No se encontró ayuda para el comando \`${commandName}\`.`,
                ephemeral: true
            });
        }
        
        const embed = new PassQuirkEmbed()
            .setTitle(`📖 Ayuda: ${help.name}`)
            .setDescription(help.description)
            .addFields(
                { name: '📝 Uso', value: `\`${help.usage}\``, inline: false },
                { name: '💡 Ejemplos', value: help.examples.map(ex => `\`${ex}\``).join('\n'), inline: false }
            );
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async showCategoryHelp(interaction, category) {
        const categories = {
            'juego': {
                title: '🎮 Comandos de Juego Principal',
                commands: [
                    '`/passquirkrpg` - Inicia tu aventura RPG',
                    '`/dialogo` - Interactúa con NPCs del mundo'
                ]
            },
            'economia': {
                title: '💰 Comandos de Economía',
                commands: [
                    '`/tienda` - Compra objetos y equipo',
                    '`/inventario` - Ve tu inventario',
                    '`/balance` - Consulta tu saldo',
                    '`/work` - Trabaja para ganar dinero',
                    '`/pagar` - Transfiere dinero a otros',
                    '`/transacciones` - Historial de transacciones'
                ]
            },
            'admin': {
                title: '⚙️ Comandos de Administración',
                commands: [
                    '`/config` - Panel de configuración',
                    '`/configurar-tiempo` - Configura canales de tiempo',
                    '`/cambiar-zona` - Cambia zona horaria'
                ]
            },
            'utilidades': {
                title: '🔧 Comandos de Utilidades',
                commands: [
                    '`/help` - Muestra esta ayuda'
                ]
            }
        };
        
        const cat = categories[category];
        if (!cat) {
            return interaction.reply({
                content: '❌ Categoría no encontrada.',
                ephemeral: true
            });
        }
        
        const embed = new PassQuirkEmbed()
            .setTitle(cat.title)
            .setDescription(cat.commands.join('\n'));
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    // Manejador de interacciones para el menú de selección
    async handleSelectMenu(interaction) {
        if (interaction.customId === 'categoria_comandos') {
            const categoria = interaction.values[0];
            
            // Crear botón para volver al menú principal
            const backButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('volver_menu_principal')
                        .setLabel('← Volver al menú principal')
                        .setStyle(ButtonStyle.Secondary)
                );

            let embed;

            switch (categoria) {
                case 'configuracion':
                    embed = new PassQuirkEmbed()
                        .setTitle('⚙️ Comandos de Configuración')
                        .setDescription(
                            '**Comandos para configurar el servidor y el bot:**\n\n' +
                            '`/configuracion` - Panel principal de configuración\n' +
                            '`/configurar-tiempo` - Configura el sistema de tiempo\n' +
                            '`/cambiar-zona` - Cambia la zona del mundo (Admin)\n\n' +
                            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                            '*Solo los administradores pueden usar estos comandos.*'
                        )
                        .setColor('#FFA500');
                    break;

                case 'juego':
                    embed = new PassQuirkEmbed()
                        .setTitle('🎮 Comandos de Juego')
                        .setDescription(
                            '**Comandos principales del RPG:**\n\n' +
                            '`/passquirkrpg` - Panel principal del juego\n' +
                            '`/dialogo` - Interactúa con NPCs del mundo\n\n' +
                            '**Comandos de Economía:**\n\n' +
                            '`/balance` - Ver tu dinero actual\n' +
                            '`/work` - Trabaja para ganar dinero\n' +
                            '`/daily` - Recompensa diaria\n' +
                            '`/inventory` - Gestiona tu inventario\n' +
                            '`/shop` - Tienda de objetos\n' +
                            '`/transfer` - Transfiere dinero\n' +
                            '`/leaderboard` - Tabla de clasificación\n\n' +
                            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                            '*¡Comienza tu aventura épica!*'
                        )
                        .setColor('#00FF00');
                    break;

                case 'utilidades':
                    embed = new PassQuirkEmbed()
                        .setTitle('🔧 Comandos de Utilidades')
                        .setDescription(
                            '**Herramientas útiles:**\n\n' +
                            '`/ping` - Verifica la latencia del bot\n' +
                            '`/comandos` - Muestra este menú de comandos\n\n' +
                            '**Comandos Administrativos:**\n\n' +
                            '`/econ` - Gestión de economía (Admin)\n\n' +
                            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                            '*Comandos útiles para la comunidad.*'
                        )
                        .setColor('#00BFFF');
                    break;

                case 'ayuda':
                    embed = new PassQuirkEmbed()
                        .setTitle('❓ Comandos de Ayuda')
                        .setDescription(
                            '**Obtén ayuda y soporte:**\n\n' +
                            '`/comandos` - Este menú de comandos\n' +
                            '`/passquirkrpg` - Comienza tu aventura\n' +
                            '`/dialogo` - Habla con NPCs para obtener ayuda\n\n' +
                            '**Información del Sistema:**\n\n' +
                            '• Usa `/passquirkrpg` para crear tu personaje\n' +
                            '• Interactúa con NPCs usando `/dialogo`\n' +
                            '• Gestiona tu economía con los comandos de dinero\n\n' +
                            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                            '*¿Necesitas ayuda? ¡Estamos aquí para ti!*'
                        )
                        .setColor('#FF69B4');
                    break;

                default:
                    embed = new PassQuirkEmbed()
                        .setTitle('❌ Categoría no encontrada')
                        .setDescription('La categoría seleccionada no existe.')
                        .setColor('#FF0000');
                    break;
            }

            await interaction.update({ embeds: [embed], components: [backButton] });
        }
        
        // Manejar el botón de volver
        else if (interaction.customId === 'volver_menu_principal') {
            // Recrear el menú principal
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('categoria_comandos')
                        .setPlaceholder('Selecciona una categoría')
                        .addOptions([
                            {
                                label: '⚙️ Configuración',
                                description: 'Configura el servidor y el bot',
                                value: 'configuracion',
                                emoji: '⚙️'
                            },
                            {
                                label: '🎮 Juego',
                                description: 'Comandos principales del juego',
                                value: 'juego',
                                emoji: '🎮'
                            },
                            {
                                label: '🔧 Utilidades',
                                description: 'Herramientas útiles',
                                value: 'utilidades',
                                emoji: '🔧'
                            },
                            {
                                label: '❓ Ayuda',
                                description: 'Obtén ayuda sobre el bot',
                                value: 'ayuda',
                                emoji: '❓'
                            }
                        ])
                );

            const embed = new PassQuirkEmbed()
                .setTitle('🎮 Panel de Comandos - PassQuirk RPG')
                .setDescription(
                    '**¡Bienvenido al centro de comandos, aventurero!** ⚔️\n\n' +
                    'Selecciona una categoría para descubrir todos los comandos disponibles en tu épica aventura.\n\n' +
                    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                    '*Usa los menús desplegables para navegar entre las diferentes secciones.*'
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setImage('https://cdn.discordapp.com/attachments/placeholder/commands_banner.png')
                .setFooter({ 
                    text: '¡Tu aventura te espera! • PassQuirk RPG',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.update({ 
                embeds: [embed], 
                components: [row] 
            });
        }
    }
};
