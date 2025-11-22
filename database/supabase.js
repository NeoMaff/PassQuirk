// =====================================================
// CONFIGURACIÓN DE SUPABASE PARA PASSQUIRK RPG
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const isDevelopment = process.env.NODE_ENV === 'development';

// Verificar configuración de Supabase
let supabase = null;
let isSupabaseConfigured = false;

if (!supabaseUrl || !supabaseKey || 
    supabaseUrl === 'your_supabase_url_here' || 
    supabaseKey === 'your_supabase_anon_key_here' ||
    supabaseUrl === 'https://localhost:54321' ||
    supabaseKey === 'development_mode_local') {
    
    console.log('⚠️ Supabase configurado en modo de desarrollo local');
    isSupabaseConfigured = false;
} else {
    try {
        // Cliente de Supabase
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: false
            },
            db: {
                schema: 'public'
            }
        });
        isSupabaseConfigured = true;
        console.log('✅ Supabase configurado correctamente');
    } catch (error) {
        console.error('❌ Error configurando Supabase:', error.message);
        isSupabaseConfigured = false;
    }
}

// =====================================================
// CLASE PRINCIPAL DE GESTIÓN DE BASE DE DATOS
// =====================================================

class DatabaseManager {
    constructor() {
        this.supabase = supabase;
        this.isConfigured = isSupabaseConfigured;
        this.localData = new Map(); // Para modo de desarrollo local
    }

    // Verificar si Supabase está configurado
    checkConfiguration() {
        if (!this.isConfigured) {
            console.log('⚠️ Supabase no configurado - operación en modo local');
            return false;
        }
        return true;
    }

    // =====================================================
    // GESTIÓN DE USUARIOS
    // =====================================================

    async createUser(discordUser) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([
                    {
                        discord_id: discordUser.id,
                        username: discordUser.username,
                        discriminator: discordUser.discriminator,
                        avatar_url: discordUser.displayAvatarURL()
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            return { success: false, error: error.message };
        }
    }

    async getUser(discordId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('discord_id', discordId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserActivity(discordId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update({ last_active: new Date().toISOString() })
                .eq('discord_id', discordId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error actualizando actividad:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // GESTIÓN DE PERSONAJES
    // =====================================================

    async createCharacter(userId, characterData) {
        try {
            // Estadísticas base según la clase
            const baseStats = this.getBaseStats(characterData.class);
            
            const { data, error } = await this.supabase
                .from('characters')
                .insert([
                    {
                        user_id: userId,
                        name: characterData.name,
                        description: characterData.description,
                        class: characterData.class,
                        kingdom: characterData.kingdom,
                        country: characterData.country,
                        timezone: characterData.timezone,
                        ...baseStats
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error creando personaje:', error);
            return { success: false, error: error.message };
        }
    }

    async getCharacter(userId) {
        try {
            const { data, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo personaje:', error);
            return { success: false, error: error.message };
        }
    }

    async updateCharacter(characterId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('characters')
                .update(updates)
                .eq('id', characterId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error actualizando personaje:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // GESTIÓN DE INVENTARIO
    // =====================================================

    async getInventory(characterId) {
        try {
            const { data, error } = await this.supabase
                .from('inventories')
                .select(`
                    *,
                    items (
                        id,
                        name,
                        description,
                        type,
                        rarity,
                        stats,
                        icon_url
                    )
                `)
                .eq('character_id', characterId)
                .order('slot_position');

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('❌ Error obteniendo inventario:', error);
            return { success: false, error: error.message };
        }
    }

    async addItemToInventory(characterId, itemId, quantity = 1) {
        try {
            // Verificar si el item ya existe en el inventario
            const { data: existing } = await this.supabase
                .from('inventories')
                .select('*')
                .eq('character_id', characterId)
                .eq('item_id', itemId)
                .single();

            if (existing) {
                // Actualizar cantidad
                const { data, error } = await this.supabase
                    .from('inventories')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            } else {
                // Crear nueva entrada
                const { data, error } = await this.supabase
                    .from('inventories')
                    .insert([
                        {
                            character_id: characterId,
                            item_id: itemId,
                            quantity: quantity
                        }
                    ])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data };
            }
        } catch (error) {
            console.error('❌ Error añadiendo item al inventario:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // GESTIÓN DE COMBATE
    // =====================================================

    async createCombat(characterId, enemyId, zoneId) {
        try {
            // Obtener datos del personaje y enemigo
            const character = await this.getCharacter(characterId);
            const enemy = await this.getEnemy(enemyId);

            if (!character.success || !enemy.success) {
                throw new Error('No se pudo obtener datos del combate');
            }

            const { data, error } = await this.supabase
                .from('combats')
                .insert([
                    {
                        character_id: characterId,
                        enemy_id: enemyId,
                        zone_id: zoneId,
                        character_hp: character.data.hp,
                        character_mp: character.data.mp,
                        enemy_hp: enemy.data.hp,
                        enemy_mp: enemy.data.mp
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error creando combate:', error);
            return { success: false, error: error.message };
        }
    }

    async getCombat(characterId) {
        try {
            const { data, error } = await this.supabase
                .from('combats')
                .select(`
                    *,
                    enemies (
                        id,
                        name,
                        type,
                        rarity,
                        level,
                        hp,
                        mp,
                        attack,
                        defense,
                        speed,
                        sprite_url
                    )
                `)
                .eq('character_id', characterId)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo combate:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // GESTIÓN DE EXPLORACIÓN
    // =====================================================

    async createExploration(characterId, zoneId) {
        try {
            const { data, error } = await this.supabase
                .from('explorations')
                .insert([
                    {
                        character_id: characterId,
                        zone_id: zoneId
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error creando exploración:', error);
            return { success: false, error: error.message };
        }
    }

    async getActiveExploration(characterId) {
        try {
            const { data, error } = await this.supabase
                .from('explorations')
                .select(`
                    *,
                    zones (
                        id,
                        name,
                        description,
                        type,
                        min_level,
                        max_level
                    )
                `)
                .eq('character_id', characterId)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo exploración:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // FUNCIONES DE UTILIDAD
    // =====================================================

    getBaseStats(characterClass) {
        const baseStats = {
            warrior: { hp: 120, max_hp: 120, mp: 50, max_mp: 50, attack: 15, defense: 12, speed: 8 },
            mage: { hp: 80, max_hp: 80, mp: 120, max_mp: 120, attack: 18, defense: 6, speed: 10 },
            archer: { hp: 100, max_hp: 100, mp: 80, max_mp: 80, attack: 16, defense: 8, speed: 14 },
            rogue: { hp: 90, max_hp: 90, mp: 70, max_mp: 70, attack: 17, defense: 7, speed: 16 }
        };

        return baseStats[characterClass] || baseStats.warrior;
    }

    async getEnemy(enemyId) {
        try {
            const { data, error } = await this.supabase
                .from('enemies')
                .select('*')
                .eq('id', enemyId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo enemigo:', error);
            return { success: false, error: error.message };
        }
    }

    async getZone(zoneId) {
        try {
            const { data, error } = await this.supabase
                .from('zones')
                .select('*')
                .eq('id', zoneId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo zona:', error);
            return { success: false, error: error.message };
        }
    }

    async logAction(characterId, actionType, actionData, result) {
        try {
            const { data, error } = await this.supabase
                .from('game_logs')
                .insert([
                    {
                        character_id: characterId,
                        action_type: actionType,
                        action_data: actionData,
                        result: result
                    }
                ]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('❌ Error registrando acción:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // VERIFICACIÓN DE CONEXIÓN
    // =====================================================

    async testConnection() {
        try {
            if (!this.isConfigured) {
                console.log('⚠️ Supabase no configurado - modo de desarrollo local activo');
                return { 
                    success: true, 
                    message: 'Modo de desarrollo local - Supabase no configurado',
                    mode: 'local'
                };
            }

            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);

            if (error) throw error;
            
            console.log('✅ Conexión a Supabase exitosa');
            return { 
                success: true, 
                message: 'Conexión a Supabase establecida',
                mode: 'supabase'
            };
        } catch (error) {
            console.error('❌ Error de conexión a Supabase:', error);
            return { 
                success: false, 
                error: error.message,
                mode: 'error'
            };
        }
    }
}

// Exportar instancia única
const db = new DatabaseManager();

module.exports = {
    supabase,
    db,
    DatabaseManager,
    isSupabaseConfigured
};