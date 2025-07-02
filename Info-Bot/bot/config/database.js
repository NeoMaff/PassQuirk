// 🗄️ CONFIGURACIÓN DE BASE DE DATOS - SQLite local
const { Sequelize } = require('sequelize');
const path = require('path');

// Configurar SQLite como base de datos local
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'passquirk.db'), // Base de datos local
    logging: false, // Desactivar logs SQL (puedes activarlo con console.log para debug)
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
    }
});

// Función para conectar y sincronizar la base de datos
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos SQLite local');
        
        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada');
        
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        return false;
    }
};

// Función para cerrar la conexión
const closeDatabase = async () => {
    try {
        await sequelize.close();
        console.log('✅ Conexión a la base de datos cerrada');
    } catch (error) {
        console.error('❌ Error al cerrar la base de datos:', error);
    }
};

module.exports = sequelize;
module.exports.connectDatabase = connectDatabase;
module.exports.closeDatabase = closeDatabase;