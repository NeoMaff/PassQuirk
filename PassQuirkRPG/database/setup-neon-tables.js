// =====================================================
// SCRIPT DE CONFIGURACIÓN DE TABLAS NEON
// =====================================================

const { neonDb } = require('./neon.js');

async function setupNeonTables() {
    console.log('🔧 Configurando tablas en Neon Database...\n');
    
    try {
        // Verificar conexión
        const connectionTest = await neonDb.testConnection();
        if (!connectionTest.success) {
            console.error('❌ No se puede conectar a Neon Database');
            return false;
        }
        
        console.log('✅ Conexión establecida con Neon Database');
        
        // Crear tabla de usuarios
        console.log('📋 Creando tabla users...');
        await neonDb.pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                discord_id VARCHAR(20) UNIQUE NOT NULL,
                username VARCHAR(32) NOT NULL,
                discriminator VARCHAR(4),
                avatar_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_banned BOOLEAN DEFAULT FALSE,
                ban_reason TEXT,
                total_playtime INTEGER DEFAULT 0,
                premium_until TIMESTAMP WITH TIME ZONE,
                settings JSONB DEFAULT '{}'::jsonb
            )
        `);
        
        // Crear tabla de personajes
        console.log('📋 Creando tabla characters...');
        await neonDb.pool.query(`
            CREATE TABLE IF NOT EXISTS characters (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(50) NOT NULL,
                description TEXT,
                avatar_url TEXT,
                class VARCHAR(20) NOT NULL CHECK (class IN ('warrior', 'mage', 'archer', 'rogue', 'novato')),
                level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
                hp INTEGER DEFAULT 100,
                mp INTEGER DEFAULT 50,
                attack INTEGER DEFAULT 10,
                defense INTEGER DEFAULT 5,
                speed INTEGER DEFAULT 8,
                exp INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 100,
                quirk JSONB DEFAULT '{}'::jsonb,
                stats JSONB DEFAULT '{}'::jsonb,
                inventory JSONB DEFAULT '{}'::jsonb,
                location VARCHAR(100) DEFAULT 'Reino de Akai',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Crear tabla de inventarios
        console.log('📋 Creando tabla inventories...');
        await neonDb.pool.query(`
            CREATE TABLE IF NOT EXISTS inventories (
                id SERIAL PRIMARY KEY,
                character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
                item_id VARCHAR(50) NOT NULL,
                item_name VARCHAR(100) NOT NULL,
                item_type VARCHAR(30) NOT NULL,
                quantity INTEGER DEFAULT 1,
                rarity VARCHAR(20) DEFAULT 'common',
                stats JSONB DEFAULT '{}'::jsonb,
                description TEXT,
                is_equipped BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Crear tabla de combates
        console.log('📋 Creando tabla combats...');
        await neonDb.pool.query(`
            CREATE TABLE IF NOT EXISTS combats (
                id SERIAL PRIMARY KEY,
                character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
                enemy_name VARCHAR(100) NOT NULL,
                enemy_level INTEGER NOT NULL,
                enemy_hp INTEGER NOT NULL,
                character_hp INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                turn_count INTEGER DEFAULT 0,
                exp_reward INTEGER DEFAULT 0,
                gold_reward INTEGER DEFAULT 0,
                loot JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                finished_at TIMESTAMP WITH TIME ZONE
            )
        `);
        
        // Crear índices para optimización
        console.log('📋 Creando índices...');
        await neonDb.pool.query('CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)');
        await neonDb.pool.query('CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id)');
        await neonDb.pool.query('CREATE INDEX IF NOT EXISTS idx_inventories_character_id ON inventories(character_id)');
        await neonDb.pool.query('CREATE INDEX IF NOT EXISTS idx_combats_character_id ON combats(character_id)');
        
        console.log('\n✅ Todas las tablas han sido configuradas correctamente en Neon Database');
        return true;
        
    } catch (error) {
        console.error('❌ Error configurando tablas:', error);
        return false;
    } finally {
        await neonDb.close();
    }
}

// Ejecutar configuración si se llama directamente
if (require.main === module) {
    setupNeonTables().catch(console.error);
}

module.exports = { setupNeonTables };