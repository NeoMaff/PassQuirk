/**
 * 🌟 PassQuirk RPG - Datos Oficiales
 * Basado en el repositorio oficial: CioMaff/PassQuirk-RPG
 * 
 * Este archivo contiene todos los datos oficiales del juego:
 * - PassQuirks y sus clases compatibles
 * - Quirks por clase con habilidades específicas
 * - Enemigos por zona y rareza
 * - Objetos y equipamiento
 * - Sistema de rarezas
 */

// Datos oficiales de PassQuirk RPG basados en el repositorio CioMaff/PassQuirk-RPG

const PASSQUIRKS = {
    fenix: {
        id: 1,
        name: "Fénix",
        description: "Potencia habilidades de regeneración y fuego.",
        compatibleClasses: ["🔥 Fénix", "🪽 Celestial"],
        element: "Fuego",
        rarity: "Legendario",
        emoji: "🔥"
    },
    vendaval: {
        id: 2,
        name: "Vendaval",
        description: "Otorga velocidad extrema y control del viento.",
        compatibleClasses: ["⚔️🌀 Sombra", "👹 Demon"],
        element: "Viento",
        rarity: "Épico",
        emoji: "💨"
    },
    tierra: {
        id: 3,
        name: "Tierra",
        description: "Control masivo de rocas y tierra.",
        compatibleClasses: ["⚔️ Berserker", "☠️ Inmortal"],
        element: "Tierra",
        rarity: "Raro",
        emoji: "🪨"
    },
    oscuridad: {
        id: 4,
        name: "Oscuridad",
        description: "Absorbe luz y permite invisibilidad temporal.",
        compatibleClasses: ["👹 Demon", "⚔️🌀 Sombra"],
        element: "Oscuridad",
        rarity: "Épico",
        emoji: "🌑"
    },
    bestia: {
        id: 5,
        name: "Bestia",
        description: "Fuerza y resistencia física extremas.",
        compatibleClasses: ["⚔️ Berserker", "👹 Demon"],
        element: "Físico",
        rarity: "Raro",
        emoji: "🐺"
    },
    trueno: {
        id: 6,
        name: "Trueno",
        description: "Control de rayos y velocidad mejorada.",
        compatibleClasses: ["⚔️🌀 Sombra", "🔥 Fénix"],
        element: "Rayo",
        rarity: "Épico",
        emoji: "⚡"
    },
    dragon: {
        id: 7,
        name: "Dragón",
        description: "Fuerza y defensa dracónica.",
        compatibleClasses: ["☠️ Inmortal", "🔥 Fénix"],
        element: "Dragón",
        rarity: "Mítico",
        emoji: "🐲"
    },
    agua: {
        id: 8,
        name: "Agua",
        description: "Control de agua y curación de aliados.",
        compatibleClasses: ["🪽 Celestial", "☠️ Inmortal"],
        element: "Agua",
        rarity: "Raro",
        emoji: "💧"
    },
    vacio: {
        id: 9,
        name: "Vacío",
        description: "Control gravitacional y manipulación del espacio.",
        compatibleClasses: ["👹 Demon", "🪽 Celestial"],
        element: "Vacío",
        rarity: "Mítico",
        emoji: "🌌"
    },
    caos: {
        id: 10,
        name: "Caos",
        description: "Poder inestable capaz de causar destrucción masiva.",
        compatibleClasses: ["🔓 Todas las clases (Universal)"],
        element: "Caos",
        rarity: "Caos",
        emoji: "🔴"
    },
    luz: {
        id: 11,
        name: "Luz",
        description: "Energía brillante y sagrada que potencia todas las habilidades, pero puede volverse inestable si no se controla.",
        compatibleClasses: ["🔓 Todas las clases (Universal)"],
        element: "Luz",
        rarity: "Universal",
        emoji: "✨"
    }
};

// 🌟 Quirks Disponibles
const QUIRKS = {
    // Quirks Celestiales
    celestial: {
        name: "Quirks Celestiales",
        emoji: "🪽",
        class: "🪽 Celestial",
        abilities: {
            luz_divina: {
                name: "Luz Divina",
                rarity: "🟡 Legendario",
                type: "Ofensivo/Curativo",
                description: "Invoca rayos de luz celestial que dañan a los enemigos oscuros y curan a los aliados. Efectividad aumentada contra enemigos de tipo Oscuro."
            },
            escudo_estelar: {
                name: "Escudo Estelar",
                rarity: "🟣 Épico",
                type: "Defensivo",
                description: "Crea un escudo de energía estelar que absorbe el daño mágico y físico. Duración aumenta con el nivel del usuario."
            },
            teletransporte_astral: {
                name: "Teletransporte Astral",
                rarity: "🔵 Raro",
                type: "Utilidad",
                description: "Permite moverse instantáneamente a través del plano astral. Puede atravesar barreras físicas."
            },
            bendicion_celestial: {
                name: "Bendición Celestial",
                rarity: "⚪ Mítico",
                type: "Soporte",
                description: "Otorga bendiciones temporales que aumentan todas las estadísticas del equipo."
            },
            juicio_divino: {
                name: "Juicio Divino",
                rarity: "🟡 Legendario",
                type: "Ofensivo",
                description: "Invoca el juicio celestial que causa daño masivo basado en la diferencia de karma entre usuario y objetivo."
            }
        }
    },
    
    // Quirks Phoenix
    phoenix: {
        name: "Quirks Phoenix",
        emoji: "🔥",
        class: "🔥 Fénix",
        abilities: {
            renacimiento: {
                name: "Renacimiento",
                rarity: "⚪ Mítico",
                type: "Supervivencia",
                description: "Al morir, renace automáticamente con el 50% de la vida y poder aumentado temporalmente. Solo una vez por combate."
            },
            llamas_eternas: {
                name: "Llamas Eternas",
                rarity: "🟡 Legendario",
                type: "Ofensivo",
                description: "Invoca llamas inmortales que no se extinguen y causan daño continuo por fuego. El daño aumenta con el tiempo."
            },
            vuelo_igneo: {
                name: "Vuelo Ígneo",
                rarity: "🟣 Épico",
                type: "Movilidad",
                description: "Permite volar dejando un rastro de fuego que daña a los enemigos terrestres. Aumenta la velocidad de movimiento."
            },
            alas_phoenix: {
                name: "Alas de Phoenix",
                rarity: "🔵 Raro",
                type: "Defensivo/Movilidad",
                description: "Despliega alas de fuego que proporcionan resistencia al daño y capacidad de vuelo limitada."
            },
            explosion_solar: {
                name: "Explosión Solar",
                rarity: "🟡 Legendario",
                type: "Ofensivo",
                description: "Crea una explosión masiva de fuego solar que daña a todos los enemigos en un área amplia."
            }
        }
    },
    
    // Quirks Berserker
    berserker: {
        name: "Quirks Berserker",
        emoji: "⚔️",
        class: "⚔️ Berserker",
        abilities: {
            furia_salvaje: {
                name: "Furia Salvaje",
                rarity: "🟡 Legendario",
                type: "Ofensivo",
                description: "Aumenta el daño exponencialmente conforme disminuye la vida. El daño puede llegar hasta 300% del daño base."
            },
            resistencia_brutal: {
                name: "Resistencia Brutal",
                rarity: "🟣 Épico",
                type: "Defensivo",
                description: "Reduce significativamente el daño recibido cuando la vida está por debajo del 30%. Inmunidad a efectos de miedo."
            },
            golpe_devastador: {
                name: "Golpe Devastador",
                rarity: "🟣 Raro",
                type: "Ofensivo",
                description: "Un ataque crítico que ignora completamente las defensas del enemigo y tiene probabilidad de aturdir."
            },
            sed_batalla: {
                name: "Sed de Batalla",
                rarity: "🟢 Común",
                type: "Pasivo",
                description: "Cada enemigo derrotado aumenta temporalmente el daño y la velocidad de ataque."
            },
            rugido_guerra: {
                name: "Rugido de Guerra",
                rarity: "🟣 Épico",
                type: "Soporte",
                description: "Emite un rugido que intimida a los enemigos reduciendo su daño y aumenta la moral de los aliados."
            }
        }
    },
    
    // Quirks Sombra
    sombra: {
        name: "Quirks Sombra",
        emoji: "🌑",
        abilities: {
            manipulacion_sombras: {
                name: "Manipulación de Sombras",
                rarity: "🟣 Épico",
                type: "Ofensivo/Utilidad",
                description: "Controla las sombras para atacar o crear herramientas temporales. Más efectivo en áreas oscuras."
            },
            invisibilidad: {
                name: "Invisibilidad",
                rarity: "🟣 Raro",
                type: "Utilidad",
                description: "Se vuelve completamente invisible por un tiempo limitado. El movimiento rápido puede romper la invisibilidad."
            },
            teletransporte_sombra: {
                name: "Teletransporte de Sombra",
                rarity: "🟡 Legendario",
                type: "Movilidad",
                description: "Se teletransporta instantáneamente a cualquier sombra visible en el campo de batalla."
            }
        }
    },
    
    // Quirks Elemental
    elemental: {
        name: "Quirks Elemental",
        emoji: "🌪️",
        abilities: {
            control_elementos: {
                name: "Control de Elementos",
                rarity: "🟡 Legendario",
                type: "Ofensivo/Utilidad",
                description: "Manipula fuego, agua, tierra y aire para crear ataques devastadores o resolver problemas ambientales."
            },
            tormenta_elemental: {
                name: "Tormenta Elemental",
                rarity: "⚪ Mítico",
                type: "Ofensivo",
                description: "Invoca una tormenta que combina todos los elementos, causando daño masivo en área."
            },
            armadura_elemental: {
                name: "Armadura Elemental",
                rarity: "🟣 Épico",
                type: "Defensivo",
                description: "Crea una armadura de elementos que proporciona resistencia específica según el elemento activo."
            }
        }
    }
};

// 🎭 Quirks por Clase
const QUIRKS_BY_CLASS = {
    "CELESTIAL": {
        "Luz Divina": {
            rarity: "🟣 Épico",
            abilities: {
                "Destello Solar": { rarity: "🔵 Raro", type: "Ofensivo", description: "Lanza un rayo de luz que ciega temporalmente y causa daño leve." },
                "Cúpula Sagrada": { rarity: "🟣 Épico", type: "Defensivo", description: "Crea una barrera de luz que bloquea daño y cura ligeramente a aliados." },
                "Juicio Celestial": { rarity: "🔴 Mítico", type: "Ofensivo", description: "Invoca rayos múltiples desde el cielo que causan daño masivo en área." }
            }
        },
        "Canto Estelar": {
            rarity: "🔵 Raro",
            abilities: {
                "Himno de Vitalidad": { rarity: "🟢 Común", type: "Soporte", description: "Regenera vida lentamente durante varios segundos." },
                "Eco de Estrellas": { rarity: "🔵 Raro", type: "Soporte", description: "Aumenta el poder de habilidades aliadas durante 10 segundos." },
                "Armonía Universal": { rarity: "🟣 Épico", type: "Soporte", description: "Reduce cooldowns y otorga inmunidad temporal a efectos negativos." }
            }
        },
        "Trascendencia": {
            rarity: "🔴 Mítico",
            abilities: {
                "Estado Elevado": { rarity: "🟠 Legendario", type: "Mixto", description: "Aumenta todas las estadísticas del jugador por 15 segundos." },
                "Aura Intocable": { rarity: "🔴 Mítico", type: "Defensivo", description: "Inmunidad total a daño durante 3 segundos." },
                "Trance de Luz": { rarity: "🔴 Mítico", type: "Ofensivo", description: "Golpe en cadena automático a todos los enemigos en pantalla." }
            }
        }
    },
    "FÉNIX": {
        "Llama Vital": {
            rarity: "🟠 Legendario",
            abilities: {
                "Llama Sanadora": { rarity: "🔵 Raro", type: "Soporte", description: "Cura al usuario un 30% de su vida y lo rodea de fuego protector." },
                "Llama Voraz": { rarity: "🟣 Épico", type: "Ofensivo", description: "Ataque de fuego en línea recta que causa quemadura persistente." },
                "Explosión Vital": { rarity: "🔴 Mítico", type: "Mixto", description: "Daño en área + cura a aliados cercanos." }
            }
        },
        "Alas Ardientes": {
            rarity: "🔵 Raro",
            abilities: {
                "Embestida Ígnea": { rarity: "🟢 Común", type: "Movilidad", description: "Avanza rápidamente hacia un enemigo, dejándolo en llamas." },
                "Vuelo Llamígero": { rarity: "🔵 Raro", type: "Movilidad", description: "Permite volar temporalmente y esquivar ataques." },
                "Círculo de Fuego": { rarity: "🟣 Épico", type: "Defensivo", description: "Crea una zona en llamas que bloquea el paso a enemigos." }
            }
        },
        "Renacer Infernal": {
            rarity: "🔴 Mítico",
            abilities: {
                "Último Aliento": { rarity: "🟠 Legendario", type: "Pasiva", description: "Al morir, explota e inflige daño masivo alrededor." },
                "Renacimiento": { rarity: "🔴 Mítico", type: "Pasiva", description: "Revive automáticamente con el 50% de vida tras 10 segundos." },
                "Alas del Juicio": { rarity: "🔴 Mítico", type: "Ofensivo", description: "Golpe masivo desde el aire con una onda ígnea devastadora." }
            }
        }
    },
    "BERSERKER": {
        "Ira Total": {
            rarity: "🔴 Mítico",
            abilities: {
                "Locura Sanguinaria": { rarity: "🟠 Legendario", type: "Pasiva", description: "Aumenta daño conforme recibe daño (hasta 50%)." },
                "Furia Imparable": { rarity: "🔴 Mítico", type: "Ofensivo", description: "Golpes en cadena con velocidad extrema, pero sin posibilidad de esquivar." },
                "Rugido Infernal": { rarity: "🔴 Mítico", type: "Soporte", description: "Potencia al grupo aumentando su ataque, pero reduce defensa." }
            }
        },
        "Grito de Guerra": {
            rarity: "🔵 Raro",
            abilities: {
                "Intimidación": { rarity: "🟢 Común", type: "Soporte", description: "Reduce el ataque enemigo un 20% durante 10 seg." },
                "Eco Atronador": { rarity: "🔵 Raro", type: "Defensivo", description: "Repele enemigos cercanos con un grito sónico." },
                "Alma Indomable": { rarity: "🟣 Épico", type: "Mixto", description: "Previene la muerte una vez y deja al usuario con 1 de vida." }
            }
        },
        "Golpe Brutal": {
            rarity: "🟣 Épico",
            abilities: {
                "Carga Destructiva": { rarity: "🔵 Raro", type: "Ofensivo", description: "Embiste al enemigo, derribándolo con un golpe masivo." },
                "Martillo de Rabia": { rarity: "🟣 Épico", type: "Ofensivo", description: "Aplasta el suelo, dañando a todos los enemigos cercanos." },
                "Impacto Final": { rarity: "🔴 Mítico", type: "Ofensivo", description: "Golpe que duplica el daño si el jugador está con menos del 30% de vida." }
            }
        }
    },
    "INMORTAL": {
        "Regeneración Eterna": {
            rarity: "🔴 Mítico",
            abilities: {
                "Curación Acelerada": { rarity: "🔵 Raro", type: "Pasiva", description: "Regenera vida constantemente durante el combate." },
                "Resistencia Mortal": { rarity: "🟣 Épico", type: "Defensivo", description: "Reduce el daño recibido cuando la vida está baja." },
                "Renacimiento": { rarity: "🔴 Mítico", type: "Pasiva", description: "Revive automáticamente una vez por combate con 25% de vida." }
            }
        },
        "Alma Indestructible": {
            rarity: "🟠 Legendario",
            abilities: {
                "Barrera Espiritual": { rarity: "🟣 Épico", type: "Defensivo", description: "Crea una barrera que absorbe daño mágico." },
                "Esencia Vital": { rarity: "🟠 Legendario", type: "Soporte", description: "Transfiere vida a aliados o la absorbe de enemigos." },
                "Trascendencia": { rarity: "🔴 Mítico", type: "Mixto", description: "Inmunidad temporal a todos los efectos negativos." }
            }
        },
        "Longevidad Ancestral": {
            rarity: "🟣 Épico",
            abilities: {
                "Sabiduría Milenaria": { rarity: "🔵 Raro", type: "Soporte", description: "Aumenta la experiencia ganada en combate." },
                "Resistencia Temporal": { rarity: "🟣 Épico", type: "Defensivo", description: "Reduce el cooldown de todas las habilidades." },
                "Memoria Eterna": { rarity: "🟠 Legendario", type: "Utilidad", description: "Permite usar habilidades de otras clases temporalmente." }
            }
        }
    },
    "DEMON": {
        "Poder Infernal": {
            rarity: "🔴 Mítico",
            abilities: {
                "Llamas del Infierno": { rarity: "🟣 Épico", type: "Ofensivo", description: "Ataque de fuego que causa daño continuo por quemadura." },
                "Invocación Demoníaca": { rarity: "🟠 Legendario", type: "Soporte", description: "Invoca un demonio menor que lucha junto al usuario." },
                "Pacto Oscuro": { rarity: "🔴 Mítico", type: "Mixto", description: "Sacrifica vida para duplicar el daño del próximo ataque." }
            }
        },
        "Corrupción": {
            rarity: "🟠 Legendario",
            abilities: {
                "Miasma Tóxico": { rarity: "🟣 Épico", type: "Ofensivo", description: "Crea una zona tóxica que daña a enemigos en el área." },
                "Maldición": { rarity: "🟠 Legendario", type: "Debuff", description: "Reduce permanentemente las estadísticas del enemigo." },
                "Absorción Vital": { rarity: "🔴 Mítico", type: "Ofensivo", description: "Roba vida del enemigo y la convierte en poder." }
            }
        },
        "Forma Demoníaca": {
            rarity: "🔴 Mítico",
            abilities: {
                "Transformación Parcial": { rarity: "🟣 Épico", type: "Buff", description: "Aumenta temporalmente todas las estadísticas." },
                "Alas Demoníacas": { rarity: "🟠 Legendario", type: "Movilidad", description: "Permite volar y realizar ataques aéreos devastadores." },
                "Forma Verdadera": { rarity: "🔴 Mítico", type: "Transformación", description: "Se transforma completamente, multiplicando su poder por 3." }
            }
        }
    },
    "SOMBRA": {
        "Manipulación de Sombras": {
            rarity: "🟠 Legendario",
            abilities: {
                "Tentáculos de Sombra": { rarity: "🟣 Épico", type: "Ofensivo", description: "Ataca con tentáculos de sombra que inmovilizan al enemigo." },
                "Clon de Sombra": { rarity: "🟠 Legendario", type: "Soporte", description: "Crea un clon temporal que copia los ataques del usuario." },
                "Portal Sombrío": { rarity: "🔴 Mítico", type: "Utilidad", description: "Abre portales para teletransportarse o atacar desde múltiples ángulos." }
            }
        },
        "Sigilo Absoluto": {
            rarity: "🟣 Épico",
            abilities: {
                "Invisibilidad": { rarity: "🔵 Raro", type: "Utilidad", description: "Se vuelve invisible temporalmente, evitando ataques." },
                "Paso Fantasmal": { rarity: "🟣 Épico", type: "Movilidad", description: "Atraviesa enemigos y obstáculos como un fantasma." },
                "Asesino Silencioso": { rarity: "🟠 Legendario", type: "Ofensivo", description: "Ataque crítico garantizado desde la invisibilidad." }
            }
        },
        "Dominio Nocturno": {
            rarity: "🔴 Mítico",
            abilities: {
                "Oscuridad Total": { rarity: "🟣 Épico", type: "Debuff", description: "Ciega a todos los enemigos en el área de combate." },
                "Pesadilla": { rarity: "🟠 Legendario", type: "Debuff", description: "Causa miedo y confusión, haciendo que enemigos se ataquen entre sí." },
                "Señor de las Sombras": { rarity: "🔴 Mítico", type: "Transformación", description: "Controla todas las sombras del campo de batalla como extensiones de sí mismo." }
            }
        }
    }
};

// 👺 Enemigos por Zona
const ENEMIES_BY_ZONE = {
    akai: {
        name: "Reino de Akai",
        emoji: "🌟",
        level_range: "1-10",
        enemies: {
            duendecillos_fuego: { name: "Duendecillos de Fuego", level: "1-10", rarity: "🔵 Normal", emoji: "🔥" },
            ladrones_mercado: { name: "Ladrones del Mercado", level: "1-10", rarity: "🔵 Normal", emoji: "🥷" },
            serpientes_viento: { name: "Serpientes de Viento", level: "1-10", rarity: "🟢 Común", emoji: "🐍" },
            guardianes_piedra: { name: "Guardianes de Piedra", level: "1-10", rarity: "🟢 Común", emoji: "🪨" },
            bestias_salvajes: { name: "Bestias Salvajes", level: "1-10", rarity: "🟢 Común", emoji: "🐺" },
            ciervos_encantados: { name: "Ciervos Encantados", level: "1-10", rarity: "🟣 Raro", emoji: "🦌" },
            espectros_pasado: { name: "Espectros del Pasado", level: "1-10", rarity: "🟣 Raro", emoji: "👻" }
        }
    },
    say: {
        name: "Reino de Say",
        emoji: "🌟",
        level_range: "1-10",
        enemies: {
            gatos_magicos: { name: "Gatos Mágicos", level: "1-10", rarity: "🔵 Normal", emoji: "🐱" },
            elementales_agua: { name: "Elementales de Agua", level: "1-10", rarity: "🟢 Común", emoji: "💧" },
            arboles_vivientes: { name: "Árboles Vivientes", level: "1-10", rarity: "🟢 Común", emoji: "🌳" },
            espectros_luminosos: { name: "Espectros Luminosos", level: "1-10", rarity: "🟣 Raro", emoji: "✨" },
            guardianes_naturaleza: { name: "Guardianes de la Naturaleza", level: "1-10", rarity: "🟣 Raro", emoji: "🌿" },
            serpientes_gigantes: { name: "Serpientes Gigantes Elementales", level: "1-10", rarity: "🟡 Legendario", emoji: "🐍⚡" }
        }
    },
    masai: {
        name: "Reino de Masai",
        emoji: "🌟",
        level_range: "1-10",
        enemies: {
            ratas_gigantes: { name: "Ratas Gigantes", level: "1-10", rarity: "🔵 Normal", emoji: "🐀" },
            mercenarios_renegados: { name: "Mercenarios Renegados", level: "1-10", rarity: "🟢 Común", emoji: "🗡️" },
            mercenarios_desierto: { name: "Mercenarios del Desierto", level: "1-10", rarity: "🟢 Común", emoji: "🏜️" },
            escorpiones_gigantes: { name: "Escorpiones Gigantes", level: "1-10", rarity: "🟣 Raro", emoji: "🦂" },
            elementales_arena: { name: "Elementales de Arena", level: "1-10", rarity: "🟡 Legendario", emoji: "🌪️" }
        }
    },
    montanas_heladas: {
        name: "Montañas Heladas",
        emoji: "❄️",
        level_range: "10-15",
        enemies: {
            golems_hielo: { name: "Golems de Hielo", level: "10-15", rarity: "🔵 Común", emoji: "❄️" },
            trolls_hielo: { name: "Trolls de Hielo", level: "10-15", rarity: "🟣 Raro", emoji: "🧌" },
            yeti: { name: "Yeti", level: "10-15", rarity: "🟡 Legendario", emoji: "☃️" }
        }
    },
    desierto_ilusiones: {
        name: "Desierto de las Ilusiones",
        emoji: "🔥",
        level_range: "15-20",
        enemies: {
            dragones_fuego: { name: "Dragones de Fuego", level: "15-20", rarity: "🟡 Legendario", emoji: "🐉🔥" },
            dragones_arena: { name: "Dragones de Arena", level: "15-20", rarity: "🟡 Legendario", emoji: "🐉🌪️" },
            hidras_desierto: { name: "Hidras del Desierto", level: "15-20", rarity: "🟡 Legendario", emoji: "🐉🧠" }
        }
    },
    isla_rey_demonio: {
        name: "Isla del Rey Demonio",
        emoji: "👹",
        level_range: "30+",
        enemies: {
            dragones_clase_baja: { name: "Dragones: Clase Baja", level: "30+", rarity: "🟡 Legendario", emoji: "🐲" },
            dragones_clase_alta: { name: "Dragones: Clase Alta", level: "30+", rarity: "🟡 Legendario", emoji: "🐲" },
            dragones_oscuros: { name: "Dragones Oscuros", level: "30+", rarity: "⚫ Oscuro", emoji: "🐲🌑" },
            dragones_ancestrales: { name: "Dragones Ancestrales", level: "30+", rarity: "🟣 Ancestral", emoji: "🐲⛩️" },
            dragones_miticos: { name: "Dragones Míticos", level: "30+", rarity: "⚪ Mítico", emoji: "🐲⚪" },
            dragones_celestiales: { name: "Dragones Celestiales", level: "30+", rarity: "✨ Celestial", emoji: "🐲🌌" },
            dragones_caos: { name: "Dragones del Caos", level: "30+", rarity: "🔴 Caos", emoji: "🐲🔴" }
        }
    }
};

// 🎒 Items y Objetos
const ITEMS = {
    // Consumibles
    pocion_vida_pequena: {
        name: "Poción de Vida Pequeña",
        type: "consumible",
        rarity: "🔵 Normal",
        effect: "Restaura 50 HP",
        price: 25,
        emoji: "🧪"
    },
    pocion_vida_mediana: {
        name: "Poción de Vida Mediana",
        type: "consumible",
        rarity: "🟢 Común",
        effect: "Restaura 100 HP",
        price: 50,
        emoji: "🧪"
    },
    pocion_vida_grande: {
        name: "Poción de Vida Grande",
        type: "consumible",
        rarity: "🟣 Raro",
        effect: "Restaura 200 HP",
        price: 100,
        emoji: "🧪"
    },
    pocion_mana_pequena: {
        name: "Poción de Maná Pequeña",
        type: "consumible",
        rarity: "🔵 Normal",
        effect: "Restaura 30 MP",
        price: 20,
        emoji: "💙"
    },
    pocion_mana_mediana: {
        name: "Poción de Maná Mediana",
        type: "consumible",
        rarity: "🟢 Común",
        effect: "Restaura 60 MP",
        price: 40,
        emoji: "💙"
    },
    pocion_mana_grande: {
        name: "Poción de Maná Grande",
        type: "consumible",
        rarity: "🟣 Raro",
        effect: "Restaura 120 MP",
        price: 80,
        emoji: "💙"
    },
    elixir_fuerza: {
        name: "Elixir de Fuerza",
        type: "consumible",
        rarity: "🟣 Raro",
        effect: "+15 ATK por 1 hora",
        price: 150,
        emoji: "💪"
    },
    elixir_velocidad: {
        name: "Elixir de Velocidad",
        type: "consumible",
        rarity: "🟣 Raro",
        effect: "+15 SPD por 1 hora",
        price: 150,
        emoji: "💨"
    },
    elixir_resistencia: {
        name: "Elixir de Resistencia",
        type: "consumible",
        rarity: "🟣 Raro",
        effect: "+15 DEF por 1 hora",
        price: 150,
        emoji: "🛡️"
    },
    
    // Equipamiento - Armas
    espada_madera: {
        name: "Espada de Madera",
        type: "arma",
        rarity: "🔵 Normal",
        effect: "+5 ATK",
        price: 50,
        emoji: "🗡️"
    },
    espada_hierro: {
        name: "Espada de Hierro",
        type: "arma",
        rarity: "🟢 Común",
        effect: "+15 ATK",
        price: 150,
        emoji: "⚔️"
    },
    espada_acero: {
        name: "Espada de Acero",
        type: "arma",
        rarity: "🟣 Raro",
        effect: "+25 ATK",
        price: 300,
        emoji: "⚔️"
    },
    espada_mithril: {
        name: "Espada de Mithril",
        type: "arma",
        rarity: "🟡 Legendario",
        effect: "+40 ATK, +10 SPD",
        price: 800,
        emoji: "⚔️"
    },
    
    // Equipamiento - Armaduras
    armadura_tela: {
        name: "Armadura de Tela",
        type: "armadura",
        rarity: "🔵 Normal",
        effect: "+3 DEF",
        price: 30,
        emoji: "👕"
    },
    armadura_cuero: {
        name: "Armadura de Cuero",
        type: "armadura",
        rarity: "🟢 Común",
        effect: "+10 DEF",
        price: 120,
        emoji: "🛡️"
    },
    armadura_hierro: {
        name: "Armadura de Hierro",
        type: "armadura",
        rarity: "🟣 Raro",
        effect: "+20 DEF",
        price: 250,
        emoji: "🛡️"
    },
    armadura_dragon: {
        name: "Armadura de Dragón",
        type: "armadura",
        rarity: "🟡 Legendario",
        effect: "+35 DEF, +15 HP",
        price: 750,
        emoji: "🛡️"
    },
    
    // Accesorios
    anillo_fuerza: {
        name: "Anillo de Fuerza",
        type: "accesorio",
        rarity: "🟣 Raro",
        effect: "+10 ATK",
        price: 200,
        emoji: "💍"
    },
    anillo_velocidad: {
        name: "Anillo de Velocidad",
        type: "accesorio",
        rarity: "🟣 Raro",
        effect: "+10 SPD",
        price: 200,
        emoji: "💍"
    },
    anillo_poder: {
        name: "Anillo de Poder",
        type: "accesorio",
        rarity: "🟡 Legendario",
        effect: "+20 ATK, +10 MP",
        price: 500,
        emoji: "💍"
    },
    collar_mana: {
        name: "Collar de Maná",
        type: "accesorio",
        rarity: "🟣 Raro",
        effect: "+25 MP",
        price: 180,
        emoji: "📿"
    },
    
    // Especiales
    cristal_experiencia: {
        name: "Cristal de Experiencia",
        type: "especial",
        rarity: "🟣 Raro",
        effect: "+500 EXP",
        price: 200,
        emoji: "💎"
    },
    cristal_experiencia_grande: {
        name: "Cristal de Experiencia Grande",
        type: "especial",
        rarity: "🟡 Legendario",
        effect: "+1500 EXP",
        price: 500,
        emoji: "💎"
    },
    pergamino_teletransporte: {
        name: "Pergamino de Teletransporte",
        type: "especial",
        rarity: "🟡 Legendario",
        effect: "Viaje instantáneo a cualquier zona desbloqueada",
        price: 300,
        emoji: "📜"
    },
    llave_maestra: {
        name: "Llave Maestra",
        type: "especial",
        rarity: "🟡 Legendario",
        effect: "Desbloquea zonas secretas",
        price: 1000,
        emoji: "🗝️"
    },
    
    // Item Especial LOY
    loy: {
        name: "LOY",
        type: "especial",
        rarity: "⚪ Mítico",
        effect: "Objeto misterioso con poderes desconocidos. Se rumorea que puede alterar la realidad misma.",
        price: 9999,
        emoji: "🌟",
        description: "Un artefacto legendario de origen desconocido. Los antiguos textos hablan de su poder para trascender las limitaciones del mundo. Solo los más dignos pueden desbloquear sus secretos."
    }
};

// 🌟 Sistema de Rarezas
const RARITY_SYSTEM = {
    "⚪ Común": { color: "#FFFFFF", dropRate: 60, power: 1 },
    "🟢 Común": { color: "#00FF00", dropRate: 50, power: 1.2 },
    "🔵 Raro": { color: "#0080FF", dropRate: 25, power: 1.5 },
    "🟣 Épico": { color: "#8000FF", dropRate: 10, power: 2 },
    "🟡 Legendario": { color: "#FFD700", dropRate: 3, power: 3 },
    "🟠 Legendario": { color: "#FF8000", dropRate: 2, power: 3.5 },
    "🔴 Mítico": { color: "#FF0000", dropRate: 1, power: 5 },
    "⚫ Oscuro": { color: "#000000", dropRate: 0.5, power: 7 },
    "⚪ Mítico": { color: "#F0F0F0", dropRate: 0.3, power: 8 },
    "✨ Celestial": { color: "#FFFF80", dropRate: 0.1, power: 10 },
    "🔴 Caos": { color: "#800000", dropRate: 0.05, power: 15 }
};

// 🎮 Clases Base del Juego (Actualizadas)
const BASE_CLASSES = {
    "🪽 Celestial": {
        emoji: "🪽",
        description: "Ser de luz con habilidades curativas y ataques sagrados de área.",
        baseStats: { hp: 90, mp: 130, attack: 75, defense: 70, speed: 80 },
        specialties: ["Curación", "Ataques sagrados", "Soporte de área"]
    },
    "🔥 Fénix": {
        emoji: "🔥",
        description: "Renace tras ser derrotado; domina el fuego y el resurgir explosivo.",
        baseStats: { hp: 100, mp: 100, attack: 90, defense: 75, speed: 85 },
        specialties: ["Regeneración", "Fuego", "Resurrección"]
    },
    "⚔️ Berserker": {
        emoji: "⚔️",
        description: "Guerrero desatado con fuerza bruta creciente cuanto más daño recibe.",
        baseStats: { hp: 130, mp: 60, attack: 100, defense: 80, speed: 70 },
        specialties: ["Fuerza bruta", "Resistencia al daño", "Furia creciente"]
    },
    "☠️ Inmortal": {
        emoji: "☠️",
        description: "No puede morir fácilmente; regenera y resiste efectos mortales.",
        baseStats: { hp: 150, mp: 80, attack: 70, defense: 100, speed: 60 },
        specialties: ["Inmortalidad", "Regeneración", "Resistencia a efectos"]
    },
    "👹 Demon": {
        emoji: "👹",
        description: "Poder oscuro, drenaje de vida y habilidades infernales.",
        baseStats: { hp: 110, mp: 110, attack: 85, defense: 70, speed: 75 },
        specialties: ["Poder oscuro", "Drenaje de vida", "Habilidades infernales"]
    },
    "⚔️🌀 Sombra": {
        emoji: "⚔️🌀",
        description: "Ninja silencioso y letal; experto en clones, humo y ataques críticos.",
        baseStats: { hp: 85, mp: 95, attack: 80, defense: 60, speed: 120 },
        specialties: ["Sigilo", "Clones", "Ataques críticos"]
    }
};

// Alias para compatibilidad
const CLASSES = BASE_CLASSES;
const RARITIES = RARITY_SYSTEM;

module.exports = {
    PASSQUIRKS,
    QUIRKS,
    QUIRKS_BY_CLASS,
    ENEMIES_BY_ZONE,
    ITEMS,
    CLASSES,
    RARITIES,
    RARITY_SYSTEM,
    BASE_CLASSES
};