const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('weapon', 'armor', 'consumable', 'accessory'),
        allowNull: false
    },
    rarity: {
        type: DataTypes.ENUM('common', 'uncommon', 'rare', 'legendary', 'mythic', 'celestial'),
        defaultValue: 'common'
    },
    value: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stats: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    effect: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emoji: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'items',
    timestamps: true
});

module.exports = Item;