# 📋 Referencia del Sistema de Búsqueda - PassQuirk RPG

## 🎨 Guía de Estilo Visual

Este documento contiene las referencias de estilo utilizadas para el diseño de embeds y componentes visuales del bot PassQuirk RPG.

### 🌈 Esquema de Colores PassQuirk

```javascript
const COLORES_PASSQUIRK = {
    QUIRK_PRINCIPAL: '#8A2BE2',     // Púrpura vibrante - Color principal de PassQuirk
    QUIRK_SECUNDARIO: '#9370DB',    // Púrpura medio - Para elementos secundarios
    QUIRK_ACENTO: '#DDA0DD',        // Púrpura claro - Para acentos y highlights
    EXITO: '#00FF7F',               // Verde brillante - Para éxitos y confirmaciones
    ADVERTENCIA: '#FFD700',         // Dorado - Para advertencias y alertas
    ERROR: '#FF6347',               // Rojo tomate - Para errores
    INFO: '#87CEEB',                // Azul cielo - Para información general
    NEUTRO: '#708090',              // Gris pizarra - Para elementos neutros
    ENERGIA: '#FF69B4',             // Rosa intenso - Para energía y vitalidad
    EXPERIENCIA: '#32CD32',         // Verde lima - Para experiencia y progreso
    MONEDAS: '#FFD700',             // Dorado - Para monedas y economía
    RAREZA_COMUN: '#FFFFFF',        // Blanco - Ítems comunes
    RAREZA_RARO: '#00BFFF',         // Azul profundo - Ítems raros
    RAREZA_EPICO: '#9932CC',        // Púrpura oscuro - Ítems épicos
    RAREZA_LEGENDARIO: '#FF8C00',   // Naranja oscuro - Ítems legendarios
    RAREZA_MITICO: '#FF1493'        // Rosa profundo - Ítems míticos
};
```

### ✨ Emojis Animados de Referencia

```javascript
const EMOJIS_ANIMADOS = {
    // Estrellas y Efectos
    ESTRELLAS: {
        PURPURA: '<a:star_purple:1234567890>',
        AZUL: '<a:star_blue:1234567891>',
        ROJA: '<a:star_red:1234567892>',
        AMARILLA: '<a:star_yellow:1234567893>',
        GENERICA: '<a:star:1234567894>',
        BRILLOS_VERDES: '<a:green_sparkles:1234567895>',
        ESTRELLAS_BRILLANTES: '<a:sparklestars:1234567896>'
    },
    
    // Coronas y Rangos
    CORONAS: {
        VERDE: '<a:crown_green:1234567897>'
    },
    
    // Elementos
    ELEMENTOS: {
        FUEGO_VERDE: '<a:greenfire:1234567898>',
        TIERRA: '<a:earth_minecraft:1234567899>'
    },
    
    // Celebración
    CELEBRACION: {
        REGALO: '<a:christmas_gift:1234567900>',
        GG: '<a:gg:1234567901>',
        TADA: '<a:tada:1234567902>'
    },
    
    // Utilidades
    UTILIDADES: {
        PAPELERA: '<a:bin:1234567903>'
    }
};
```

### 🛠️ Funciones Helper para Formateo

```javascript
// Función para crear títulos con emojis
function crearTituloConEmoji(emoji, texto) {
    return `${emoji} **${texto}** ${emoji}`;
}

// Función para crear campos con formato consistente
function crearCampoFormateado(nombre, valor, inline = false) {
    return {
        name: nombre,
        value: valor || 'No disponible',
        inline: inline
    };
}

// Función para crear barras de progreso
function crearBarraProgreso(actual, maximo, longitud = 10, emojiLleno = '🟩', emojiVacio = '⬜') {
    const porcentaje = Math.min(actual / maximo, 1);
    const llenoCount = Math.floor(porcentaje * longitud);
    const vacioCount = longitud - llenoCount;
    
    return emojiLleno.repeat(llenoCount) + emojiVacio.repeat(vacioCount);
}
```

### 📱 Estructura de Embeds Estándar

```javascript
// Embed principal de búsqueda
const embedPrincipal = new EmbedBuilder()
    .setTitle(crearTituloConEmoji(EMOJIS_ANIMADOS.ESTRELLAS.PURPURA, 'Explorador Dimensional'))
    .setDescription('Explora las dimensiones de PassQuirk y descubre secretos ocultos.')
    .setColor(COLORES_PASSQUIRK.QUIRK_PRINCIPAL)
    .addFields(
        crearCampoFormateado(
            `${EMOJIS_ANIMADOS.ELEMENTOS.TIERRA} Dimensión Actual`,
            'Tierra Prime - Sector Alpha'
        ),
        crearCampoFormateado(
            `${EMOJIS_ANIMADOS.ESTRELLAS.AMARILLA} Nivel de Exploración`,
            '15/100'
        )
    )
    .setFooter({ 
        text: 'PassQuirk RPG • Sistema de Exploración',
        iconURL: 'https://example.com/passquirk-icon.png'
    })
    .setTimestamp();
```

### 🎮 Botones de Navegación

```javascript
// Botones principales
const botonesNavegacion = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('explorar_dimension')
            .setLabel('Explorar Dimensión')
            .setEmoji(EMOJIS_ANIMADOS.ELEMENTOS.TIERRA)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('portal_anterior')
            .setLabel('Portal Anterior')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('portal_siguiente')
            .setLabel('Portal Siguiente')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('mis_exploraciones')
            .setLabel('Exploraciones')
            .setEmoji(EMOJIS_ANIMADOS.ESTRELLAS.BRILLANTES)
            .setStyle(ButtonStyle.Success)
    );

// Botones secundarios
const botonesSecundarios = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('analizar_quirk')
            .setLabel('Analizar Quirk')
            .setEmoji(EMOJIS_ANIMADOS.ESTRELLAS.PURPURA)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('comparar_exploradores')
            .setLabel('Comparar')
            .setEmoji('⚖️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('agregar_equipo')
            .setLabel('Agregar a Equipo')
            .setEmoji(EMOJIS_ANIMADOS.CELEBRACION.REGALO)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('compartir_descubrimiento')
            .setLabel('Compartir')
            .setEmoji('📤')
            .setStyle(ButtonStyle.Secondary)
    );
```

### 📊 Escenarios de Embed

#### Sin Resultados
```javascript
const embedSinResultados = new EmbedBuilder()
    .setTitle(`${EMOJIS_ANIMADOS.UTILIDADES.PAPELERA} Sin Resultados`)
    .setDescription('No se encontraron dimensiones que coincidan con tu búsqueda.')
    .setColor(COLORES_PASSQUIRK.NEUTRO);
```

#### Múltiples Resultados
```javascript
const embedMultiplesResultados = new EmbedBuilder()
    .setTitle(crearTituloConEmoji(EMOJIS_ANIMADOS.ESTRELLAS.BRILLANTES, 'Múltiples Dimensiones Encontradas'))
    .setDescription('Se encontraron varias dimensiones. Selecciona una para explorar.')
    .setColor(COLORES_PASSQUIRK.INFO);
```

#### Resultado Único Detallado
```javascript
const embedResultadoDetallado = new EmbedBuilder()
    .setTitle(crearTituloConEmoji(EMOJIS_ANIMADOS.CORONAS.VERDE, 'Dimensión Descubierta'))
    .setDescription('Has descubierto una nueva dimensión llena de misterios.')
    .setColor(COLORES_PASSQUIRK.EXITO)
    .addFields(
        crearCampoFormateado(
            `${EMOJIS_ANIMADOS.ELEMENTOS.FUEGO_VERDE} Tipo de Dimensión`,
            'Dimensión Elemental - Fuego Verde',
            true
        ),
        crearCampoFormateado(
            `${EMOJIS_ANIMADOS.ESTRELLAS.AMARILLA} Nivel Requerido`,
            'Nivel 25+',
            true
        ),
        crearCampoFormateado(
            `${EMOJIS_ANIMADOS.CELEBRACION.TADA} Recompensas`,
            'Cristales de Fuego Verde, Experiencia Elemental',
            false
        )
    );
```

---

## 📝 Notas de Implementación

- **Consistencia Visual**: Todos los embeds deben seguir el esquema de colores PassQuirk
- **Emojis Animados**: Usar siempre que sea posible para mayor impacto visual
- **Responsive Design**: Los embeds deben verse bien en móvil y escritorio
- **Accesibilidad**: Incluir texto alternativo para elementos visuales
- **Performance**: Optimizar el uso de emojis para evitar límites de Discord

---

*Este documento sirve como referencia de estilo y no contiene código funcional del juego.*