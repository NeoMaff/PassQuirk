-- =====================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS PASSQUIRK RPG
-- Supabase PostgreSQL Schema
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: users (Usuarios principales)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discord_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(32) NOT NULL,
    discriminator VARCHAR(4),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    total_playtime INTEGER DEFAULT 0, -- en minutos
    premium_until TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- TABLA: characters (Personajes de los jugadores)
-- =====================================================
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    class VARCHAR(20) NOT NULL CHECK (class IN ('warrior', 'mage', 'archer', 'rogue')),
    kingdom VARCHAR(20) NOT NULL CHECK (kingdom IN ('akai', 'say', 'masai')),
    country VARCHAR(50) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    
    -- Estadísticas básicas
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    experience BIGINT DEFAULT 0,
    gold BIGINT DEFAULT 100,
    emeralds INTEGER DEFAULT 0,
    
    -- Estadísticas de combate
    hp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    max_mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    
    -- Ubicación y estado
    current_zone VARCHAR(50) DEFAULT 'space_central',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    
    -- Estado del personaje
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'exploring', 'combat', 'quest', 'trading')),
    status_data JSONB DEFAULT '{}'::jsonb,
    
    -- Fechas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    UNIQUE(user_id) -- Un personaje por usuario
);

-- =====================================================
-- TABLA: quirks (Habilidades especiales)
-- =====================================================
CREATE TABLE quirks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    element VARCHAR(20),
    cooldown INTEGER DEFAULT 0, -- en segundos
    mp_cost INTEGER DEFAULT 0,
    damage_multiplier DECIMAL(3,2) DEFAULT 1.00,
    effects JSONB DEFAULT '{}'::jsonb,
    unlock_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: character_quirks (Quirks de personajes)
-- =====================================================
CREATE TABLE character_quirks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    quirk_id UUID REFERENCES quirks(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    experience INTEGER DEFAULT 0,
    is_equipped BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(character_id, quirk_id)
);

-- =====================================================
-- TABLA: items (Objetos del juego)
-- =====================================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL CHECK (type IN ('weapon', 'armor', 'consumable', 'material', 'tool', 'misc')),
    subtype VARCHAR(30),
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    
    -- Estadísticas del objeto
    stats JSONB DEFAULT '{}'::jsonb,
    effects JSONB DEFAULT '{}'::jsonb,
    
    -- Economía
    base_value INTEGER DEFAULT 0,
    max_stack INTEGER DEFAULT 1,
    
    -- Requisitos
    level_required INTEGER DEFAULT 1,
    class_required VARCHAR(20),
    
    -- Metadatos
    icon_url TEXT,
    is_tradeable BOOLEAN DEFAULT TRUE,
    is_sellable BOOLEAN DEFAULT TRUE,
    is_consumable BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: inventories (Inventarios de personajes)
-- =====================================================
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    slot_position INTEGER,
    is_equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(character_id, item_id)
);

-- =====================================================
-- TABLA: zones (Zonas de exploración)
-- =====================================================
CREATE TABLE zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) DEFAULT 'exploration',
    
    -- Requisitos de acceso
    min_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 100,
    required_items JSONB DEFAULT '[]'::jsonb,
    
    -- Configuración de zona
    weather_effects JSONB DEFAULT '{}'::jsonb,
    available_enemies JSONB DEFAULT '[]'::jsonb,
    loot_table JSONB DEFAULT '{}'::jsonb,
    
    -- Conexiones
    connected_zones JSONB DEFAULT '[]'::jsonb,
    
    -- Metadatos
    background_url TEXT,
    music_url TEXT,
    is_safe BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: enemies (Enemigos del juego)
-- =====================================================
CREATE TABLE enemies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'boss')),
    
    -- Estadísticas de combate
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 100),
    hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    
    -- Recompensas
    exp_reward INTEGER NOT NULL,
    gold_reward INTEGER NOT NULL,
    loot_table JSONB DEFAULT '{}'::jsonb,
    
    -- Habilidades
    abilities JSONB DEFAULT '[]'::jsonb,
    
    -- Metadatos
    sprite_url TEXT,
    element VARCHAR(20),
    weaknesses JSONB DEFAULT '[]'::jsonb,
    resistances JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: combats (Combates activos)
-- =====================================================
CREATE TABLE combats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    enemy_id UUID REFERENCES enemies(id),
    
    -- Estado del combate
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'victory', 'defeat', 'fled')),
    turn_count INTEGER DEFAULT 1,
    current_turn VARCHAR(20) DEFAULT 'player' CHECK (current_turn IN ('player', 'enemy')),
    
    -- HP actual de los participantes
    character_hp INTEGER NOT NULL,
    enemy_hp INTEGER NOT NULL,
    character_mp INTEGER NOT NULL,
    enemy_mp INTEGER NOT NULL,
    
    -- Datos del combate
    combat_log JSONB DEFAULT '[]'::jsonb,
    zone_id VARCHAR(50) REFERENCES zones(id),
    
    -- Fechas
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_action TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: explorations (Exploraciones activas)
-- =====================================================
CREATE TABLE explorations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    zone_id VARCHAR(50) REFERENCES zones(id),
    
    -- Estado de la exploración
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    events_found INTEGER DEFAULT 0,
    
    -- Historial de eventos
    event_history JSONB DEFAULT '[]'::jsonb,
    
    -- Fechas
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_event TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: guilds (Gremios)
-- =====================================================
CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    tag VARCHAR(10) UNIQUE,
    
    -- Configuración del gremio
    max_members INTEGER DEFAULT 20,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    treasury BIGINT DEFAULT 0,
    
    -- Metadatos
    banner_url TEXT,
    color VARCHAR(7) DEFAULT '#7289DA',
    is_recruiting BOOLEAN DEFAULT TRUE,
    
    -- Fechas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: guild_members (Miembros de gremios)
-- =====================================================
CREATE TABLE guild_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    
    -- Rol en el gremio
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
    
    -- Contribuciones
    contribution_points INTEGER DEFAULT 0,
    
    -- Fechas
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(character_id) -- Un personaje solo puede estar en un gremio
);

-- =====================================================
-- TABLA: daily_rewards (Recompensas diarias)
-- =====================================================
CREATE TABLE daily_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    reward_date DATE NOT NULL,
    streak_count INTEGER DEFAULT 1,
    rewards_claimed JSONB DEFAULT '{}'::jsonb,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(character_id, reward_date)
);

-- =====================================================
-- TABLA: weather_system (Sistema climático)
-- =====================================================
CREATE TABLE weather_system (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_weather VARCHAR(30) NOT NULL,
    weather_effects JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    global_effects JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- TABLA: game_logs (Logs del juego)
-- =====================================================
CREATE TABLE game_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para users
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_last_active ON users(last_active);

-- Índices para characters
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_level ON characters(level);
CREATE INDEX idx_characters_zone ON characters(current_zone);
CREATE INDEX idx_characters_status ON characters(status);

-- Índices para inventories
CREATE INDEX idx_inventories_character_id ON inventories(character_id);
CREATE INDEX idx_inventories_item_id ON inventories(item_id);
CREATE INDEX idx_inventories_equipped ON inventories(is_equipped);

-- Índices para combats
CREATE INDEX idx_combats_character_id ON combats(character_id);
CREATE INDEX idx_combats_status ON combats(status);
CREATE INDEX idx_combats_started_at ON combats(started_at);

-- Índices para explorations
CREATE INDEX idx_explorations_character_id ON explorations(character_id);
CREATE INDEX idx_explorations_zone_id ON explorations(zone_id);
CREATE INDEX idx_explorations_status ON explorations(status);

-- Índices para guild_members
CREATE INDEX idx_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX idx_guild_members_character_id ON guild_members(character_id);

-- Índices para game_logs
CREATE INDEX idx_game_logs_character_id ON game_logs(character_id);
CREATE INDEX idx_game_logs_action_type ON game_logs(action_type);
CREATE INDEX idx_game_logs_created_at ON game_logs(created_at);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar zonas iniciales
INSERT INTO zones (id, name, description, min_level, max_level) VALUES
('space_central', 'Space Central', 'La ciudad central del universo PassQuirk donde comienzan todas las aventuras.', 1, 100),
('bosque_inicial', 'Bosque Inicial', 'Un bosque tranquilo perfecto para aventureros novatos.', 1, 10),
('colinas_verdes', 'Colinas Verdes', 'Colinas ondulantes con criaturas más desafiantes.', 8, 20),
('montanas_rocosas', 'Montañas Rocosas', 'Montañas traicioneras con enemigos peligrosos.', 18, 35),
('desierto_ardiente', 'Desierto Ardiente', 'Un desierto abrasador lleno de criaturas del fuego.', 30, 50),
('bosque_sombrio', 'Bosque Sombrío', 'Un bosque oscuro donde la magia siniestra prospera.', 45, 70),
('reino_cristal', 'Reino de Cristal', 'Un reino mágico hecho de cristales brillantes.', 65, 85),
('abismo_eterno', 'Abismo Eterno', 'El lugar más peligroso conocido por los aventureros.', 80, 100);

-- Insertar clima inicial
INSERT INTO weather_system (current_weather, ends_at) VALUES
('sunny', NOW() + INTERVAL '6 hours');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE combats ENABLE ROW LEVEL SECURITY;
ALTER TABLE explorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (se pueden personalizar según necesidades)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = discord_id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = discord_id);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este esquema proporciona:
-- 1. Sistema completo de usuarios y personajes
-- 2. Sistema de inventario y objetos
-- 3. Sistema de combate en tiempo real
-- 4. Sistema de exploración
-- 5. Sistema de gremios
-- 6. Sistema climático global
-- 7. Sistema de logs y auditoría
-- 8. Optimización con índices
-- 9. Seguridad con RLS
-- 10. Triggers automáticos

COMMENT ON SCHEMA public IS 'Esquema completo para PassQuirk RPG - Bot de Discord';