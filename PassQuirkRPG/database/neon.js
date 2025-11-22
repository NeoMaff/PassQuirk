// =====================================================
// CONFIGURACIÓN DE NEON DATABASE PARA PASSQUIRK RPG
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

// Configuración de Neon Database
const neonDatabaseUrl = process.env.NEON_DATABASE_URL;
const neonProjectId = process.env.NEON_PROJECT_ID;
const isDevelopment = process.env.NODE_ENV === 'development';

// Configurar conexión a Neon
let pool = null;
let isNeonConfigured = false;

// URL de conexión completa para PostgreSQL
const connectionString = process.env.NEON_DATABASE_URL || 
    `postgresql://${process.env.NEON_USERNAME}:${process.env.NEON_PASSWORD}@${process.env.NEON_HOST}:${process.env.NEON_PORT}/${process.env.NEON_DATABASE}?sslmode=require`;

if (!neonDatabaseUrl || !neonProjectId) {
    console.log('⚠️ Neon Database configurado en modo de desarrollo local');
    isNeonConfigured = false;
} else {
    try {
        // Cliente de Neon (PostgreSQL)
        pool = new Pool({
            connectionString: connectionString,
            ssl: {
                rejectUnauthorized: false
            },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        isNeonConfigured = true;
        console.log('✅ Neon Database configurado correctamente');
    } catch (error) {
        console.error('❌ Error configurando Neon Database:', error.message);
        isNeonConfigured = false;
    }
}

// =====================================================
// CLASE PRINCIPAL DE GESTIÓN DE BASE DE DATOS NEON
// =====================================================

class NeonDatabaseManager {
    constructor() {
        this.pool = pool;
        this.isConfigured = isNeonConfigured;
        this.localData = new Map(); // Para modo de desarrollo local
    }

    // Verificar si Neon está configurado
    checkConfiguration() {
        if (!this.isConfigured) {
            console.log('⚠️ Neon Database no configurado - operación en modo local');
            return false;
        }
        return true;
    }

    // =====================================================
    // GESTIÓN DE USUARIOS
    // =====================================================

    async createUser(discordUser) {
        try {
            if (!this.checkConfiguration()) {
                // Modo local - simular creación
                const userData = {
                    id: `local_${discordUser.id}`,
                    discord_id: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator,
                    avatar_url: discordUser.displayAvatarURL()
                };
                this.localData.set(`user_${discordUser.id}`, userData);
                return { success: true, data: userData };
            }

            const query = `
                INSERT INTO users (discord_id, username, discriminator, avatar_url)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const values = [
                discordUser.id,
                discordUser.username,
                discordUser.discriminator,
                discordUser.displayAvatarURL()
            ];

            const result = await this.pool.query(query, values);
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserByDiscordId(discordId) {
        try {
            if (!this.checkConfiguration()) {
                // Modo local
                const userData = this.localData.get(`user_${discordId}`);
                return userData ? { success: true, data: userData } : { success: false, error: 'Usuario no encontrado' };
            }

            const query = 'SELECT * FROM users WHERE discord_id = $1';
            const result = await this.pool.query(query, [discordId]);
            
            if (result.rows.length === 0) {
                return { success: false, error: 'Usuario no encontrado' };
            }
            
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // GESTIÓN DE PERSONAJES
    // =====================================================

    async createCharacter(userId, characterData) {
        try {
            if (!this.checkConfiguration()) {
                // Modo local
                const charData = {
                    id: `local_char_${Date.now()}`,
                    user_id: userId,
                    ...characterData,
                    created_at: new Date()
                };
                this.localData.set(`character_${charData.id}`, charData);
                return { success: true, data: charData };
            }

            const query = `
                INSERT INTO characters (user_id, name, description, class, level, hp, mp, attack, defense, speed, exp, gold)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `;
            
            const values = [
                userId,
                characterData.name,
                characterData.description || '',
                characterData.class,
                characterData.level || 1,
                characterData.hp || 100,
                characterData.mp || 50,
                characterData.attack || 10,
                characterData.defense || 5,
                characterData.speed || 8,
                characterData.exp || 0,
                characterData.gold || 100
            ];

            const result = await this.pool.query(query, values);
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('❌ Error creando personaje:', error);
            return { success: false, error: error.message };
        }
    }

    async getCharacterByUserId(userId) {
        try {
            if (!this.checkConfiguration()) {
                // Modo local - buscar personaje
                for (const [key, value] of this.localData.entries()) {
                    if (key.startsWith('character_') && value.user_id === userId) {
                        return { success: true, data: value };
                    }
                }
                return { success: false, error: 'Personaje no encontrado' };
            }

            const query = 'SELECT * FROM characters WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
            const result = await this.pool.query(query, [userId]);
            
            if (result.rows.length === 0) {
                return { success: false, error: 'Personaje no encontrado' };
            }
            
            return { success: true, data: result.rows[0] };
        } catch (error) {
            console.error('❌ Error obteniendo personaje:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // VERIFICACIÓN DE CONEXIÓN
    // =====================================================

    async testConnection() {
        try {
            if (!this.isConfigured) {
                console.log('⚠️ Neon Database no configurado - modo de desarrollo local activo');
                return { 
                    success: true, 
                    message: 'Modo de desarrollo local - Neon Database no configurado',
                    mode: 'local'
                };
            }

            const result = await this.pool.query('SELECT NOW() as current_time');
            
            console.log('✅ Conexión a Neon Database exitosa');
            return { 
                success: true, 
                message: 'Conexión a Neon Database establecida',
                mode: 'neon',
                timestamp: result.rows[0].current_time
            };
        } catch (error) {
            console.error('❌ Error de conexión a Neon Database:', error);
            return { 
                success: false, 
                error: error.message,
                mode: 'error'
            };
        }
    }

    // Cerrar conexión
    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

// Exportar instancia única
const neonDb = new NeonDatabaseManager();

module.exports = {
    pool,
    neonDb,
    NeonDatabaseManager,
    isNeonConfigured
};