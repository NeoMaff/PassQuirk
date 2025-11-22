# Modelos y Base de Datos

## Tecnología
- SQLite local con Sequelize. Opcional Supabase mediante adaptador.

## User
- `userId` pk string
- `username`
- `hasCharacter` bool
- `rpgStats` JSON y otros campos de economía y progreso

## Character
- `id` pk auto
- `userId` fk User
- `name`, `description`
- `class` ENUM: Celestial, Fenix, Berserker, Inmortal, Demon, Sombra
- `region` ENUM: Akai, Say, Masai
- `level`, `experience`
- `health`, `maxHealth`, `mana`, `maxMana`
- `attack`, `defense`, `speed`, `intelligence`
- `inventory` JSON, `equipment` JSON, `quests` JSON
- `tutorialCompleted`, `tutorialStep`

## Enemy
- Datos base, rareza, recompensas, habilidades.

## Relaciones
- `User.hasOne(Character)` y `Character.belongsTo(User)`.

## Semilla
- Slime Verde para tutorial.