// 🌟 PassQuirk RPG - Datos Oficiales
// ⚡ DATOS OFICIALES PASSQUIRK RPG - Basado en CioMaff/PassQuirk-RPG
// 🌟 Documentación oficial: https://github.com/CioMaff/PassQuirk-RPG/tree/main/passquirkdoc
// 🔄 Última actualización: Integración completa de sistemas oficiales

// 💸 SISTEMA DE ECONOMÍA OFICIAL
const ECONOMIA_SISTEMA = {
    monedaPrincipal: {
        nombre: '🪙 Monedas PassQuirk',
        simbolo: '🪙',
        descripcion: 'Moneda base para comprar armas, mejoras y consumibles'
    },
    mercadoGachapon: {
        nombre: '🎰 Gachapón Místico',
        descripcion: 'Sistema aleatorio para conseguir armas, quirks y objetos raros',
        costos: {
            comun: 100,
            raro: 250,
            epico: 500,
            legendario: 1000,
            mitico: 2500
        }
    },
    comercioJugadores: {
        habilitado: true,
        comision: 0.05, // 5% de comisión
        impuestos: 0.02 // 2% de impuestos
    }
};

// 📦 SISTEMA DE DROPS Y COFRES OFICIAL
const DROPS_SISTEMA = {
    cofreComun: {
        objetos: ['Poción Vida', 'Poción Energía', 'Bolsa 🪙'],
        probabilidades: { comun: 0.8, raro: 0.2 }
    },
    cofreEpico: {
        objetos: ['Quirks', 'Llaves', 'Pergaminos', 'Tickets'],
        probabilidades: { raro: 0.4, epico: 0.4, legendario: 0.2 }
    },
    jefesMapa: {
        objetos: ['Fragmentos', 'Quirks', 'Cofres especiales'],
        garantizado: 'raro_o_superior'
    },
    enemigosNormales: {
        objetos: ['Bolsas de Monedas', 'Pociones'],
        probabilidades: { comun: 0.7, raro: 0.3 }
    },
    eventoEspecial: {
        objetos: 'cualquier_item_incluido_mitico',
        probabilidades: 'segun_evento'
    }
};

// 🗡️ SISTEMA DE LUCHA OFICIAL
const LUCHA_SISTEMA = {
    ataquesBasicos: {
        disponible: 'todos_los_jugadores',
        tipos: ['Golpe', 'Patada', 'Esquivar']
    },
    usoArmas: {
        efectosUnicos: true,
        compatibilidadClase: true,
        durabilidad: true
    },
    usoQuirks: {
        tiempoRecarga: true,
        nivelesmejora: true,
        sinergias: true
    },
    defensaEscudos: {
        mitigacionDano: true,
        equipamientoInfluye: true
    },
    combos: {
        ataquesBasicos: true,
        armas: true,
        quirks: true,
        efectosAdicionales: true
    }
};

module.exports = {
    // 🌟 PassQuirks Oficiales (11 PassQuirks Únicos)
    passquirks: {
        1: {
            id: 'fenix',
            name: 'Fénix',
            description: 'Potencia habilidades de regeneración y fuego. Permite renacer de las cenizas con mayor poder.',
            compatibleClasses: ['🧙‍♂️ Mago', '🛡️ Guerrero'],
            rarity: '🟠 Legendario',
            abilities: ['Regeneración Avanzada', 'Llamas Fénix', 'Renacimiento']
        },
        2: {
            id: 'vendaval',
            name: 'Vendaval',
            description: 'Otorga velocidad extrema y control total del viento. Permite movimientos supersónicos.',
            compatibleClasses: ['🏹 Arquero', '🥷 Ninja'],
            rarity: '🟣 Épico',
            abilities: ['Velocidad Extrema', 'Ráfagas de Viento', 'Vuelo Temporal']
        },
        3: {
            id: 'tierra',
            name: 'Tierra',
            description: 'Control masivo de rocas y tierra. Manipula el terreno a voluntad.',
            compatibleClasses: ['⚔️ Espadachín', '🛡️ Guerrero'],
            rarity: '🟣 Épico',
            abilities: ['Manipulación Terrestre', 'Armadura de Roca', 'Terremotos']
        },
        4: {
            id: 'oscuridad',
            name: 'Oscuridad',
            description: 'Absorbe luz y permite invisibilidad total. Controla las sombras.',
            compatibleClasses: ['🥷 Ninja', '🧙‍♂️ Mago'],
            rarity: '🔴 Mítico',
            abilities: ['Invisibilidad', 'Manipulación de Sombras', 'Absorción de Luz']
        },
        5: {
            id: 'bestia',
            name: 'Bestia',
            description: 'Fuerza y resistencia física extremas. Despierta instintos animales.',
            compatibleClasses: ['🛡️ Guerrero', '⚔️ Espadachín'],
            rarity: '🟣 Épico',
            abilities: ['Fuerza Sobrehumana', 'Instintos Bestiales', 'Resistencia Extrema']
        },
        6: {
            id: 'trueno',
            name: 'Trueno',
            description: 'Control absoluto de rayos y electricidad. Velocidad mejorada.',
            compatibleClasses: ['🏹 Arquero', '🧙‍♂️ Mago'],
            rarity: '🟣 Épico',
            abilities: ['Control de Rayos', 'Velocidad Eléctrica', 'Tormenta Personal']
        },
        7: {
            id: 'dragon',
            name: 'Dragón',
            description: 'Fuerza y defensa dracónica. Escamas impenetrables y aliento de fuego.',
            compatibleClasses: ['🛡️ Guerrero', '⚔️ Espadachín'],
            rarity: '🔴 Mítico',
            abilities: ['Escamas Dracónicas', 'Aliento de Fuego', 'Fuerza Ancestral']
        },
        8: {
            id: 'agua',
            name: 'Agua',
            description: 'Control total del agua y habilidades de curación avanzadas.',
            compatibleClasses: ['🧙‍♂️ Mago', '🏹 Arquero'],
            rarity: '🔵 Raro',
            abilities: ['Manipulación Acuática', 'Curación Avanzada', 'Tsunamis']
        },
        9: {
            id: 'vacio',
            name: 'Vacío',
            description: 'Control gravitacional y manipulación del espacio-tiempo.',
            compatibleClasses: ['🥷 Ninja', '🧙‍♂️ Mago'],
            rarity: '🔴 Mítico',
            abilities: ['Control Gravitacional', 'Teletransporte', 'Distorsión Espacial']
        },
        10: {
            id: 'caos',
            name: 'Caos',
            description: 'Poder inestable capaz de causar destrucción masiva. Impredecible pero devastador.',
            compatibleClasses: ['🔓 Todas las clases (Universal)'],
            rarity: '🔴 Caos',
            abilities: ['Destrucción Aleatoria', 'Poder Impredecible', 'Caos Total']
        },
        11: {
            id: 'luz',
            name: 'Luz',
            description: 'Poder celestial de luz pura. Energía divina que puede purificar o destruir.',
            compatibleClasses: ['🔓 Todas las clases (Universal)'],
            rarity: '✨ Celestial',
            abilities: ['Luz Divina', 'Purificación', 'Juicio Celestial']
        }
    },

    // ✨ Quirks Oficiales por Clase (Basado en documentación oficial)
    quirks: {
        // 🌟 Quirks Celestiales
        celestial: {
            juicio_celestial: {
                name: 'Juicio Celestial',
                rarity: '🔴 Mítico',
                type: 'Ofensivo',
                description: 'Invoca rayos múltiples desde el cielo que causan daño masivo en área.',
                abilities: ['Rayos Celestiales', 'Daño Masivo', 'Área de Efecto']
            },
            himno_vitalidad: {
                name: 'Himno de Vitalidad',
                rarity: '🟣 Épico',
                type: 'Soporte',
                description: 'Regenera vida lentamente durante varios segundos.',
                abilities: ['Regeneración Continua', 'Curación de Área', 'Buff de Vitalidad']
            }
        },
        // 🔥 Quirks Fénix
        fenix: {
            llama_sanadora: {
                name: 'Llama Sanadora',
                rarity: '🟠 Legendario',
                type: 'Soporte',
                description: 'Cura al usuario un 30% de su vida y lo rodea de fuego protector.',
                abilities: ['Curación Instantánea', 'Escudo de Fuego', 'Protección Temporal']
            },
            renacimiento: {
                name: 'Renacimiento',
                rarity: '🔴 Mítico',
                type: 'Defensivo',
                description: 'Al morir, renace con el 50% de vida y poder aumentado.',
                abilities: ['Resurrección Automática', 'Boost de Poder', 'Inmunidad Temporal']
            }
        },
        // ⚡ Quirks Berserker
        berserker: {
            ira_total: {
                name: 'Ira Total',
                rarity: '🟣 Épico',
                type: 'Ofensivo',
                description: 'Aumenta el daño basado en el daño recibido.',
                abilities: ['Daño Escalable', 'Furia Creciente', 'Contraataque Potenciado']
            },
            sed_batalla: {
                name: 'Sed de Batalla',
                rarity: '🔵 Raro',
                type: 'Mixto',
                description: 'Cada enemigo derrotado aumenta velocidad de ataque y movimiento.',
                abilities: ['Velocidad Creciente', 'Combo Infinito', 'Momentum de Batalla']
            }
        },
        fenix: {
            llama_vital: {
                name: 'Llama Vital',
                rarity: '🟠 Legendario',
                abilities: {
                    llama_sanadora: {
                        name: 'Llama Sanadora',
                        rarity: '🔵 Raro',
                        type: 'Soporte',
                        description: 'Cura al usuario un 30% de su vida y lo rodea de fuego protector.'
                    },
                    llama_voraz: {
                        name: 'Llama Voraz',
                        rarity: '🟣 Épico',
                        type: 'Ofensivo',
                        description: 'Ataque de fuego en línea recta que causa quemadura persistente.'
                    },
                    explosion_vital: {
                        name: 'Explosión Vital',
                        rarity: '🔴 Mítico',
                        type: 'Mixto',
                        description: 'Daño en área + cura a aliados cercanos.'
                    }
                }
            },
            alas_ardientes: {
                name: 'Alas Ardientes',
                rarity: '🔵 Raro',
                abilities: {
                    embestida_ignea: {
                        name: 'Embestida Ígnea',
                        rarity: '🟢 Común',
                        type: 'Movilidad',
                        description: 'Avanza rápidamente hacia un enemigo, dejándolo en llamas.'
                    },
                    vuelo_llamigero: {
                        name: 'Vuelo Llamígero',
                        rarity: '🔵 Raro',
                        type: 'Movilidad',
                        description: 'Permite volar temporalmente y esquivar ataques.'
                    },
                    circulo_fuego: {
                        name: 'Círculo de Fuego',
                        rarity: '🟣 Épico',
                        type: 'Defensivo',
                        description: 'Crea una zona en llamas que bloquea el paso a enemigos.'
                    }
                }
            },
            renacer_infernal: {
                name: 'Renacer Infernal',
                rarity: '🔴 Mítico',
                abilities: {
                    ultimo_aliento: {
                        name: 'Último Aliento',
                        rarity: '🟠 Legend',
                        type: 'Pasiva',
                        description: 'Al morir, explota e inflige daño masivo alrededor.'
                    },
                    renacimiento: {
                        name: 'Renacimiento',
                        rarity: '🔴 Mítico',
                        type: 'Pasiva',
                        description: 'Revive automáticamente con el 50% de vida tras 10 segundos.'
                    },
                    alas_juicio: {
                        name: 'Alas del Juicio',
                        rarity: '🔴 Mítico',
                        type: 'Ofensivo',
                        description: 'Golpe masivo desde el aire con una onda ígnea devastadora.'
                    }
                }
            }
        },
        berserker: {
            ira_total: {
                name: 'Ira Total',
                rarity: '🔴 Mítico',
                abilities: {
                    locura_sanguinaria: {
                        name: 'Locura Sanguinaria',
                        rarity: '🟠 Legend',
                        type: 'Pasiva',
                        description: 'Aumenta daño conforme recibe daño (hasta 50%).'
                    },
                    furia_imparable: {
                        name: 'Furia Imparable',
                        rarity: '🔴 Mítico',
                        type: 'Ofensivo',
                        description: 'Golpes en cadena con velocidad extrema, pero sin posibilidad de esquivar.'
                    },
                    rugido_infernal: {
                        name: 'Rugido Infernal',
                        rarity: '🔴 Mítico',
                        type: 'Soporte',
                        description: 'Potencia al grupo aumentando su ataque, pero reduce defensa.'
                    }
                }
            },
            grito_guerra: {
                name: 'Grito de Guerra',
                rarity: '🔵 Raro',
                abilities: {
                    intimidacion: {
                        name: 'Intimidación',
                        rarity: '🟢 Común',
                        type: 'Soporte',
                        description: 'Reduce el ataque enemigo un 20% durante 10 seg.'
                    },
                    eco_atronador: {
                        name: 'Eco Atronador',
                        rarity: '🔵 Raro',
                        type: 'Defensivo',
                        description: 'Repele enemigos cercanos con un grito sónico.'
                    },
                    alma_indomable: {
                        name: 'Alma Indomable',
                        rarity: '🟣 Épico',
                        type: 'Mixto',
                        description: 'Previene la muerte una vez y deja al usuario con 1 de vida.'
                    }
                }
            },
            golpe_brutal: {
                name: 'Golpe Brutal',
                rarity: '🟣 Épico',
                abilities: {
                    carga_destructiva: {
                        name: 'Carga Destructiva',
                        rarity: '🔵 Raro',
                        type: 'Ofensivo',
                        description: 'Embiste al enemigo, derribándolo con un golpe masivo.'
                    },
                    martillo_rabia: {
                        name: 'Martillo de Rabia',
                        rarity: '🟣 Épico',
                        type: 'Ofensivo',
                        description: 'Aplasta el suelo, dañando a todos los enemigos cercanos.'
                    },
                    impacto_final: {
                        name: 'Impacto Final',
                        rarity: '🔴 Mítico',
                        type: 'Ofensivo',
                        description: 'Golpe que duplica el daño si el jugador está con menos del 30% de vida.'
                    }
                }
            }
        }
    },

    // 🍬 Objetos Oficiales (Basado en documentación oficial)
    items: {
        // 💊 Consumibles
        consumibles: {
            health_potion: {
                name: 'Health Potion',
                emoji: '🧪',
                type: 'Consumible',
                rarity: '⚪ Común',
                effect: 'Restaura salud del jugador.',
                description: 'Poción básica que restaura puntos de vida.',
                price: 50
            },
            energy_potion: {
                name: 'Energy Potion',
                emoji: '⚗️',
                type: 'Consumible',
                rarity: '⚪ Común',
                effect: 'Restaura energía para usar habilidades.',
                description: 'Poción que restaura puntos de energía/maná.',
                price: 75
            }
        },
        // ⚔️ Equipamiento
        equipamiento: {
            rare_weapons: {
                name: 'Rare Weapons',
                emoji: '⚔️',
                type: 'Equipamiento Ofensivo',
                rarity: '🔵 Raro',
                effect: 'Armas con habilidades especiales.',
                description: 'Espadas, arcos y otras armas con poderes únicos.',
                price: 500
            },
            magic_shields: {
                name: 'Magic Shields',
                emoji: '🛡️',
                type: 'Equipamiento Defensivo',
                rarity: '🔵 Raro',
                effect: 'Protección mágica mejorada.',
                description: 'Escudos encantados con resistencias especiales.',
                price: 450
            }
        },
        // ✨ Objetos Especiales
        especiales: {
            enchanted_gems: {
                name: 'Enchanted Gems',
                emoji: '💎',
                type: 'Objeto de Mejora',
                rarity: '🟣 Épico',
                effect: 'Mejoran habilidades temporalmente.',
                description: 'Gemas mágicas que potencian las habilidades del usuario.',
                price: 1000
            },
            legendary_artifacts: {
                name: 'Legendary Artifacts',
                emoji: '🏺',
                type: 'Artefacto Permanente',
                rarity: '🟡 Legendario',
                effect: 'Mejoras permanentes de estadísticas.',
                description: 'Artefactos antiguos con poderes permanentes.',
                price: 5000
            },
            loy_adaptive_artifact: {
                name: 'LOY (Artefacto Adaptativo)',
                emoji: '🧿',
                type: 'Artefacto Único',
                rarity: '🟡 Legendario',
                effect: 'Iguala las estadísticas del enemigo (excepto habilidades únicas).',
                description: 'Artefacto legendario que adapta las estadísticas del portador.',
                usage: 'Una vez cada 72 horas en exploración',
                duration: '10 minutos en combate',
                restrictions: 'No funciona contra enemigos Caos 🔴 o Celestiales ✨',
                advantages: 'Permite enfrentar enemigos élite. Aumenta probabilidad de Quirks únicos y loot raro.',
                price: 10000
            }
        }
    },

    // 👺 Enemigos Oficiales por Zona (Basado en documentación oficial)
    enemies: {
        reino_akai: {
            name: 'Reino de Akai',
            emoji: '🌟',
            level_range: '1-10',
            enemies: {
                duendecillos_fuego: { name: 'Duendecillos de Fuego', emoji: '🔥', level: '1-10', rarity: '🔵 Normal' },
                ladrones_mercado: { name: 'Ladrones del Mercado', emoji: '🥷', level: '1-10', rarity: '🔵 Normal' },
                serpientes_viento: { name: 'Serpientes de Viento', emoji: '🐍', level: '1-10', rarity: '🟢 Común' },
                guardianes_piedra: { name: 'Guardianes de Piedra', emoji: '🪨', level: '1-10', rarity: '🟢 Común' },
                bestias_salvajes: { name: 'Bestias Salvajes', emoji: '🐺', level: '1-10', rarity: '🟢 Común' },
                ciervos_encantados: { name: 'Ciervos Encantados', emoji: '🦌', level: '1-10', rarity: '🟣 Raro' },
                espectros_pasado: { name: 'Espectros del Pasado', emoji: '👻', level: '1-10', rarity: '🟣 Raro' }
            }
        },
        reino_say: {
            name: 'Reino de Say',
            emoji: '🌟',
            level_range: '1-10',
            enemies: {
                gatos_magicos: { name: 'Gatos Mágicos', emoji: '🐱', level: '1-10', rarity: '🔵 Normal' },
                elementales_agua: { name: 'Elementales de Agua', emoji: '💧', level: '1-10', rarity: '🟢 Común' },
                arboles_vivientes: { name: 'Árboles Vivientes', emoji: '🌳', level: '1-10', rarity: '🟢 Común' },
                espectros_luminosos: { name: 'Espectros Luminosos', emoji: '✨', level: '1-10', rarity: '🟣 Raro' },
                guardianes_naturaleza: { name: 'Guardianes de la Naturaleza', emoji: '🌿', level: '1-10', rarity: '🟣 Raro' },
                serpientes_gigantes: { name: 'Serpientes Gigantes Elementales', emoji: '🐍⚡', level: '1-10', rarity: '🟡 Legendario' }
            }
        },
        reino_masai: {
            name: 'Reino de Masai',
            emoji: '🌟',
            level_range: '1-10',
            enemies: {
                ratas_gigantes: { name: 'Ratas Gigantes', emoji: '🐀', level: '1-10', rarity: '🔵 Normal' },
                mercenarios_renegados: { name: 'Mercenarios Renegados', emoji: '🗡️', level: '1-10', rarity: '🟢 Común' },
                mercenarios_desierto: { name: 'Mercenarios del Desierto', emoji: '🏜️', level: '1-10', rarity: '🟢 Común' },
                escorpiones_gigantes: { name: 'Escorpiones Gigantes', emoji: '🦂', level: '1-10', rarity: '🟣 Raro' },
                elementales_arena: { name: 'Elementales de Arena', emoji: '🌪️', level: '1-10', rarity: '🟡 Legendario' }
            }
        },
        montanas_heladas: {
            name: 'Montañas Heladas',
            emoji: '❄️',
            level_range: '10-15',
            enemies: {
                golems_hielo: { name: 'Golems de Hielo', emoji: '❄️', level: '10-15', rarity: '🔵 Común' },
                trolls_hielo: { name: 'Trolls de Hielo', emoji: '🧌', level: '10-15', rarity: '🟣 Raro' },
                yeti: { name: 'Yeti', emoji: '☃️', level: '10-15', rarity: '🟡 Legendario' }
            }
        },
        desierto_ilusiones: {
            name: 'Desierto de las Ilusiones',
            emoji: '🔥',
            level_range: '15-20',
            enemies: {
                dragones_fuego: { name: 'Dragones de Fuego', emoji: '🐉🔥', level: '15-20', rarity: '🟡 Legendario' },
                dragones_arena: { name: 'Dragones de Arena', emoji: '🐉🌪️', level: '15-20', rarity: '🟡 Legendario' },
                hidras_desierto: { name: 'Hidras del Desierto', emoji: '🐉🧠', level: '15-20', rarity: '🟡 Legendario' }
            }
        },
        isla_rey_demonio: {
            name: 'Isla del Rey Demonio',
            emoji: '👹',
            level_range: '30+',
            enemies: {
                dragones_clase_baja: { name: 'Dragones: Clase Baja', emoji: '🐲', level: '30+', rarity: '🟡 Legendario' },
                dragones_clase_alta: { name: 'Dragones: Clase Alta', emoji: '🐲', level: '30+', rarity: '🟡 Legendario' },
                dragones_oscuros: { name: 'Dragones Oscuros', emoji: '🐲🌑', level: '30+', rarity: '⚫ Oscuro' },
                dragones_ancestrales: { name: 'Dragones Ancestrales', emoji: '🐲⛩️', level: '30+', rarity: '🟣 Ancestral' },
                dragones_miticos: { name: 'Dragones Míticos', emoji: '🐲⚪', level: '30+', rarity: '⚪ Mítico' },
                dragones_celestiales: { name: 'Dragones Celestiales', emoji: '🐲🌌', level: '30+', rarity: '✨ Celestial' },
                dragones_caos: { name: 'Dragones del Caos', emoji: '🐲🔴', level: '30+', rarity: '🔴 Caos' }
            }
        },
        reino_masai: {
            name: 'Reino de Masai',
            emoji: '🌟',
            level_range: '1-10',
            enemies: {
                ratas_gigantes: { name: 'Ratas Gigantes', emoji: '🐀', level: '1-10', rarity: '🔵 Normal' },
                mercenarios_renegados: { name: 'Mercenarios Renegados', emoji: '🗡️', level: '1-10', rarity: '🟢 Común' },
                mercenarios_desierto: { name: 'Mercenarios del Desierto', emoji: '🏜️', level: '1-10', rarity: '🟢 Común' },
                escorpiones_gigantes: { name: 'Escorpiones Gigantes', emoji: '🦂', level: '1-10', rarity: '🟣 Raro' },
                elementales_arena: { name: 'Elementales de Arena', emoji: '🌪️', level: '1-10', rarity: '🟡 Legendario' }
            }
        },
        montanas_heladas: {
            name: 'Montañas Heladas',
            emoji: '❄️',
            level_range: '10-15',
            enemies: {
                golems_hielo: { name: 'Golems de Hielo', emoji: '❄️', level: '10-15', rarity: '🔵 Común' },
                trolls_hielo: { name: 'Trolls de Hielo', emoji: '🧌', level: '10-15', rarity: '🟣 Raro' },
                yeti: { name: 'Yeti', emoji: '☃️', level: '10-15', rarity: '🟡 Legendario' }
            }
        },
        desierto_ilusiones: {
            name: 'Desierto de las Ilusiones',
            emoji: '🔥',
            level_range: '15-20',
            enemies: {
                dragones_fuego: { name: 'Dragones de Fuego', emoji: '🐉🔥', level: '15-20', rarity: '🟡 Legendario' },
                dragones_arena: { name: 'Dragones de Arena', emoji: '🐉🌪️', level: '15-20', rarity: '🟡 Legendario' },
                hidras_desierto: { name: 'Hidras del Desierto', emoji: '🐉🧠', level: '15-20', rarity: '🟡 Legendario' }
            }
        },
        isla_rey_demonio: {
            name: 'Isla del Rey Demonio',
            emoji: '👹',
            level_range: '30+',
            enemies: {
                dragones_clase_baja: { name: 'Dragones: Clase Baja', emoji: '🐲', level: '30+', rarity: '🟡 Legendario' },
                dragones_clase_alta: { name: 'Dragones: Clase Alta', emoji: '🐲', level: '30+', rarity: '🟡 Legendario' },
                dragones_oscuros: { name: 'Dragones Oscuros', emoji: '🐲🌑', level: '30+', rarity: '⚫ Oscuro' },
                dragones_ancestrales: { name: 'Dragones Ancestrales', emoji: '🐲⛩️', level: '30+', rarity: '🟣 Ancestral' },
                dragones_miticos: { name: 'Dragones Míticos', emoji: '🐲⚪', level: '30+', rarity: '⚪ Mítico' },
                dragones_celestiales: { name: 'Dragones Celestiales', emoji: '🐲🌌', level: '30+', rarity: '✨ Celestial' },
                dragones_caos: { name: 'Dragones del Caos', emoji: '🐲🔴', level: '30+', rarity: '🔴 Caos' }
            }
        }
    },

    // 🎭 Clases Oficiales del Juego
    classes: {
        mago: {
            name: '🧙‍♂️ Mago',
            emoji: '🧙‍♂️',
            description: 'Maestro de las artes arcanas y la magia elemental.',
            stats: {
                fuerza: 2,
                defensa: 2,
                velocidad: 3,
                magia: 5,
                energia: 4
            },
            compatiblePassQuirks: ['Fénix', 'Oscuridad', 'Trueno', 'Agua', 'Vacío', 'Caos', 'Luz'],
            specialties: ['Magia Elemental', 'Hechizos de Área', 'Curación Mágica']
        },
        guerrero: {
            name: '🛡️ Guerrero',
            emoji: '🛡️',
            description: 'Tanque resistente especializado en defensa y combate cuerpo a cuerpo.',
            stats: {
                fuerza: 4,
                defensa: 5,
                velocidad: 2,
                magia: 1,
                energia: 3
            },
            compatiblePassQuirks: ['Fénix', 'Tierra', 'Bestia', 'Dragón', 'Caos', 'Luz'],
            specialties: ['Defensa Superior', 'Resistencia', 'Combate Cuerpo a Cuerpo']
        },
        arquero: {
            name: '🏹 Arquero',
            emoji: '🏹',
            description: 'Especialista en ataques a distancia con precisión letal.',
            stats: {
                fuerza: 3,
                defensa: 2,
                velocidad: 4,
                magia: 2,
                energia: 4
            },
            compatiblePassQuirks: ['Vendaval', 'Trueno', 'Agua', 'Caos', 'Luz'],
            specialties: ['Precisión Extrema', 'Ataques a Distancia', 'Velocidad de Disparo']
        },
        ninja: {
            name: '🥷 Ninja',
            emoji: '🥷',
            description: 'Asesino sigiloso con velocidad y agilidad sobrenaturales.',
            stats: {
                fuerza: 3,
                defensa: 2,
                velocidad: 5,
                magia: 3,
                energia: 2
            },
            compatiblePassQuirks: ['Vendaval', 'Oscuridad', 'Vacío', 'Caos', 'Luz'],
            specialties: ['Sigilo', 'Velocidad Extrema', 'Ataques Críticos']
        },
        espadachin: {
            name: '⚔️ Espadachín',
            emoji: '⚔️',
            description: 'Maestro de la espada con técnicas de combate refinadas.',
            stats: {
                fuerza: 4,
                defensa: 3,
                velocidad: 4,
                magia: 1,
                energia: 3
            },
            compatiblePassQuirks: ['Tierra', 'Bestia', 'Dragón', 'Caos', 'Luz'],
            specialties: ['Maestría con Espada', 'Combos Devastadores', 'Técnicas Especiales']
        }
    },

    // 🌟 Sistema de Rarezas Oficial
    rarities: {
        comun: { name: '⚪ Común', color: '#FFFFFF', chance: 45 },
        raro: { name: '🔵 Raro', color: '#0099FF', chance: 30 },
        epico: { name: '🟣 Épico', color: '#9933FF', chance: 15 },
        legendario: { name: '🟡 Legendario', color: '#FFD700', chance: 7 },
        mitico: { name: '🔴 Mítico', color: '#FF0000', chance: 2.5 },
        celestial: { name: '✨ Celestial', color: '#FFFF99', chance: 0.4 },
        caos: { name: '🔴 Caos', color: '#990000', chance: 0.1 }
    },

    // 🎯 Funciones de utilidad
    utils: {
        getRandomQuirk(rarity = null) {
            const allQuirks = [];
            Object.values(this.quirks).forEach(category => {
                Object.values(category).forEach(quirk => {
                    if (!rarity || quirk.rarity === rarity) {
                        allQuirks.push(quirk);
                    }
                });
            });
            return allQuirks[Math.floor(Math.random() * allQuirks.length)];
        },

        getRandomEnemy(zone = null, level = null) {
            let availableEnemies = [];
            
            Object.values(this.enemies).forEach(zoneData => {
                if (!zone || zoneData.name.toLowerCase().includes(zone.toLowerCase())) {
                    Object.values(zoneData.enemies).forEach(enemy => {
                        if (!level || this.isLevelInRange(level, enemy.level)) {
                            availableEnemies.push({ ...enemy, zone: zoneData.name });
                        }
                    });
                }
            });
            
            return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        },

        isLevelInRange(playerLevel, enemyLevelRange) {
            if (enemyLevelRange.includes('+')) {
                const minLevel = parseInt(enemyLevelRange.replace('+', ''));
                return playerLevel >= minLevel;
            }
            
            const [min, max] = enemyLevelRange.split('-').map(Number);
            return playerLevel >= min && playerLevel <= max;
        },

        getItemByRarity(rarity) {
            const items = [];
            Object.values(this.items).forEach(category => {
                Object.values(category).forEach(item => {
                    if (item.rarity === rarity) {
                        items.push(item);
                    }
                });
            });
            return items[Math.floor(Math.random() * items.length)];
        },

        getPassQuirkById(id) {
            return Object.values(this.passquirks).find(pq => pq.id === id);
        },

        getCompatiblePassQuirks(characterClass) {
            return Object.values(this.passquirks).filter(pq => 
                pq.compatibleClasses.includes(characterClass) || 
                pq.compatibleClasses.includes('🔓 Todas las clases (Universal)')
            );
        }
    },

    // 🆕 SISTEMAS OFICIALES INTEGRADOS
    economia: ECONOMIA_SISTEMA,
    drops: DROPS_SISTEMA,
    lucha: LUCHA_SISTEMA,

    // 🎰 Funciones del Sistema de Gachapón
    calcularCostoGachapon: (rareza) => {
        return ECONOMIA_SISTEMA.mercadoGachapon.costos[rareza] || 100;
    },

    // 📦 Funciones del Sistema de Drops
    calcularDropProbabilidad: (fuente, rareza) => {
        const sistema = DROPS_SISTEMA[fuente];
        if (!sistema) return 0;
        return sistema.probabilidades[rareza] || 0;
    },

    // 💰 Funciones de Economía
    calcularComision: (precio) => {
        return Math.floor(precio * ECONOMIA_SISTEMA.comercioJugadores.comision);
    },

    calcularImpuestos: (precio) => {
        return Math.floor(precio * ECONOMIA_SISTEMA.comercioJugadores.impuestos);
    },

    // 🗡️ Funciones de Combate
    verificarCompatibilidadArma: (arma, clase) => {
        // Lógica para verificar si un arma es compatible con una clase
        return true; // Placeholder
    },

    calcularDañoCombo: (ataqueBasico, arma, quirk) => {
        // Lógica para calcular daño de combos
        let dañoBase = 10;
        if (arma) dañoBase += 15;
        if (quirk) dañoBase += 25;
        return dañoBase;
    }
};