const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const User = require('../../models/User');
const { formatNumber, createProgressBar } = require('../../utils/helpers');

// Categorías de la tienda
const SHOP_CATEGORIES = {
    consumibles: {
        name: '🍎 Consumibles',
        description: 'Objetos que se consumen al usarlos',
        emoji: '🍎',
        items: [
            { id: 'pocion_vida', name: 'Poción de Vida', description: 'Restaura 50 HP', price: 100, emoji: '❤️', type: 'consumible' },
            { id: 'pocion_mana', name: 'Poción de Maná', description: 'Restaura 30 MP', price: 120, emoji: '🔵', type: 'consumible' },
            { id: 'elixir', name: 'Elixir', description: 'Restaura 30 HP y 20 MP', price: 180, emoji: '🧪', type: 'consumible' },
            { id: 'pan', name: 'Pan', description: 'Restaura 20 HP', price: 50, emoji: '🍞', type: 'consumible' },
            { id: 'agua', name: 'Agua Bendita', description: 'Cura estados alterados', price: 150, emoji: '💧', type: 'consumible' },
        ]
    },
    equipo: {
        name: '⚔️ Equipo',
        description: 'Armas y armaduras para tu personaje',
        emoji: '⚔️',
        items: [
            { id: 'espada_hierro', name: 'Espada de Hierro', description: 'Ataque +15', price: 500, emoji: '⚔️', type: 'arma' },
            { id: 'armadura_cuero', name: 'Armadura de Cuero', description: 'Defensa +10', price: 400, emoji: '🛡️', type: 'armadura' },
            { id: 'arco_madera', name: 'Arco de Madera', description: 'Ataque +12, Alcance +1', price: 450, emoji: '🏹', type: 'arma' },
            { id: 'casco_hierro', name: 'Casco de Hierro', description: 'Defensa +8', price: 350, emoji: '⛑️', type: 'casco' },
            { id: 'botas_cuero', name: 'Botas de Cuero', description: 'Velocidad +5', price: 300, emoji: '👢', type: 'botas' },
        ]
    },
    objetos: {
        name: '🎒 Objetos',
        description: 'Objetos varios para tu aventura',
        emoji: '🎒',
        items: [
            { id: 'llave_hierro', name: 'Llave de Hierro', description: 'Abre cofres comunes', price: 200, emoji: '🔑', type: 'llave' },
            { id: 'mapa', name: 'Mapa del Tesoro', description: 'Muestra tesoros cercanos', price: 350, emoji: '🗺️', type: 'especial' },
            { id: 'brujula', name: 'Brújula Mágica', description: 'Te guía a tu objetivo', price: 250, emoji: '🧭', type: 'especial' },
            { id: 'linterna', name: 'Linterna', description: 'Ilumina áreas oscuras', price: 150, emoji: '🔦', type: 'utilidad' },
            { id: 'tienda', name: 'Tienda de Campaña', description: 'Descansa y recupera HP/MP', price: 800, emoji: '⛺', type: 'utilidad' },
        ]
    },
    especial: {
        name: '💎 Especial',
        description: 'Objetos raros y poderosos',
        emoji: '💎',
        items: [
            { id: 'pocion_legendaria', name: 'Poción Legendaria', description: 'Restaura todo HP y MP', price: 1000, emoji: '✨', type: 'consumible' },
            { id: 'huevo_dragon', name: 'Huevo de Dragón', description: 'Un misterioso huevo...', price: 5000, emoji: '🥚', type: 'especial' },
            { id: 'anillo_poder', name: 'Anillo de Poder', description: 'Aumenta todo el daño en 10%', price: 2500, emoji: '💍', type: 'accesorio' },
            { id: 'espejo_verdad', name: 'Espejo de la Verdad', description: 'Revela secretos ocultos', price: 3500, emoji: '🪞', type: 'especial' },
            { id: 'gema_eterna', name: 'Gema Eterna', description: 'Brilla con energía mágica', price: 10000, emoji: '💎', type: 'especial' },
        ]
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tienda')
        .setDescription('Abre la tienda para comprar objetos')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría de la tienda')
                .setRequired(false)
                .addChoices(
                    { name: 'Consumibles', value: 'consumibles' },
                    { name: 'Equipo', value: 'equipo' },
                    { name: 'Objetos', value: 'objetos' },
                    { name: 'Especial', value: 'especial' }
                )
        ),

    async execute(interaction) {
        const category = interaction.options.getString('categoria') || 'consumibles';
        const selectedCategory = SHOP_CATEGORIES[category] || SHOP_CATEGORIES.consumibles;
        
        // Crear el embed principal de la tienda
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`🛒 Tienda de ${interaction.guild.name}`)
            .setDescription(`**${selectedCategory.name}**\n${selectedCategory.description}`)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: `Usa los menús desplegables para navegar por la tienda` })
            .setTimestamp();

        // Añadir los objetos de la categoría seleccionada
        selectedCategory.items.forEach(item => {
            embed.addFields({
                name: `${item.emoji} ${item.name} - $${formatNumber(item.price)}`,
                value: `${item.description}\n*ID: ${item.id}*`,
                inline: true
            });
        });

        // Crear menú desplegable de categorías
        const categorySelect = new StringSelectMenuBuilder()
            .setCustomId('shop_category')
            .setPlaceholder('Selecciona una categoría')
            .addOptions(
                Object.entries(SHOP_CATEGORIES).map(([key, cat]) => ({
                    label: cat.name,
                    description: cat.description,
                    value: key,
                    emoji: cat.emoji
                }))
            );

        // Crear botones de navegación
        const row1 = new ActionRowBuilder().addComponents(categorySelect);
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_buy')
                    .setLabel('Comprar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🛒'),
                new ButtonBuilder()
                    .setCustomId('shop_inventory')
                    .setLabel('Mi Inventario')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎒'),
                new ButtonBuilder()
                    .setLabel('Ver Precios')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://ejemplo.com/precios')
                    .setEmoji('📊')
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: [row1, row2] 
        });
    },

    // Método para obtener un ítem por su ID
    getItemById(itemId) {
        for (const category of Object.values(SHOP_CATEGORIES)) {
            const item = category.items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    },

    // Obtener todas las categorías
    get categories() {
        return SHOP_CATEGORIES;
    }
};
