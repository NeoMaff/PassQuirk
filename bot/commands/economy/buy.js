const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { formatNumber } = require('../../utils/helpers');
const shopCommand = require('./shop');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comprar')
        .setDescription('Compra un objeto de la tienda')
        .addStringOption(option =>
            option.setName('objeto')
                .setDescription('ID del objeto que deseas comprar')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad a comprar')
                .setRequired(false)
                .setMinValue(1)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const items = [];
        
        // Obtener todos los ítems de la tienda
        for (const category of Object.values(shopCommand.categories)) {
            items.push(...category.items);
        }
        
        // Filtrar ítems que coincidan con la búsqueda
        const filtered = items
            .filter(item => 
                item.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
                item.id.toLowerCase().includes(focusedValue.toLowerCase())
            )
            .slice(0, 25); // Discord limita a 25 opciones
        
        await interaction.respond(
            filtered.map(item => ({
                name: `${item.name} ($${formatNumber(item.price)})`,
                value: item.id
            }))
        );
    },

    async execute(interaction) {
        const itemId = interaction.options.getString('objeto');
        const amount = interaction.options.getInteger('cantidad') || 1;
        
        // Validar la cantidad
        if (amount < 1 || amount > 1000) {
            return interaction.reply({
                content: '❌ La cantidad debe estar entre 1 y 1000.',
                ephemeral: true
            });
        }
        
        try {
            // Obtener el ítem de la tienda
            const item = shopCommand.getItemById(itemId);
            if (!item) {
                return interaction.reply({
                    content: '❌ No se encontró el objeto especificado.',
                    ephemeral: true
                });
            }
            
            // Calcular costo total
            const totalCost = item.price * amount;
            
            // Obtener o crear el usuario
            let user = await User.findOne({ userId: interaction.user.id });
            if (!user) {
                user = new User({
                    userId: interaction.user.id,
                    username: interaction.user.username,
                    balance: 1000,
                    inventory: []
                });
            }
            
            // Verificar si el usuario tiene suficiente dinero
            if (user.balance < totalCost) {
                const needed = totalCost - user.balance;
                return interaction.reply({
                    content: `❌ No tienes suficiente dinero. Necesitas $${formatNumber(needed)} más.`,
                    ephemeral: true
                });
            }
            
            // Realizar la compra
            user.balance -= totalCost;
            
            // Agregar el ítem al inventario
            const existingItem = user.inventory.find(i => i.itemId === item.id);
            
            if (existingItem) {
                existingItem.amount += amount;
            } else {
                user.inventory.push({
                    itemId: item.id,
                    name: item.name,
                    description: item.description,
                    type: item.type,
                    value: item.price,
                    amount: amount,
                    emoji: item.emoji,
                    purchasedAt: new Date()
                });
            }
            
            await user.save();
            
            // Crear embed de confirmación
            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Compra Exitosa')
                .setDescription(`Has comprado **${amount}x ${item.emoji} ${item.name}** por **$${formatNumber(totalCost)}**.`)
                .addFields(
                    { name: 'Saldo Anterior', value: `$${formatNumber(user.balance + totalCost)}`, inline: true },
                    { name: 'Saldo Actual', value: `$${formatNumber(user.balance)}`, inline: true },
                    { name: 'Cantidad', value: `${amount}x`, inline: true },
                    { name: 'Precio Unitario', value: `$${formatNumber(item.price)}`, inline: true },
                    { name: 'Total Gastado', value: `$${formatNumber(totalCost)}`, inline: true }
                )
                .setFooter({ text: `Usa /inventario para ver tus objetos` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error en el comando comprar:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al procesar tu compra. Por favor, inténtalo de nuevo más tarde.');
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
