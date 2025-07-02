// 💰 ECONOMY SYSTEM - Sistema de Economía de PassQuirk RPG
// Maneja múltiples monedas, mercados, inversiones, trabajo y comercio

const { EmbedBuilder } = require('discord.js');
const { PassQuirkEmbed } = require('../utils/embedStyles');
const { progressionSystem } = require('./progression-system');
const { inventorySystem } = require('./inventory-system');
const { classSystem } = require('./class-system');

/**
 * 💎 Tipos de monedas
 */
const CURRENCY_TYPES = {
    coins: {
        id: 'coins',
        name: 'Coins',
        emoji: '💰',
        description: 'Moneda básica de PassQuirk',
        color: 0xffd700,
        exchangeable: true,
        daily_limit: null
    },
    gems: {
        id: 'gems',
        name: 'Gemas',
        emoji: '💎',
        description: 'Moneda premium obtenida por logros especiales',
        color: 0x9370db,
        exchangeable: true,
        daily_limit: 100
    },
    pg: {
        id: 'pg',
        name: 'PG (Puntos de Gamificación)',
        emoji: '🎮',
        description: 'Puntos por actividades del mundo real',
        color: 0x00ff00,
        exchangeable: false,
        daily_limit: 1000
    },
    energy: {
        id: 'energy',
        name: 'Energía',
        emoji: '⚡',
        description: 'Energía para realizar actividades',
        color: 0xffff00,
        exchangeable: false,
        daily_limit: null,
        max_capacity: 100,
        regen_rate: 1, // por minuto
        regen_interval: 60000 // 1 minuto
    },
    reputation: {
        id: 'reputation',
        name: 'Reputación',
        emoji: '⭐',
        description: 'Prestigio ganado por buenas acciones',
        color: 0xffa500,
        exchangeable: false,
        daily_limit: null
    }
};

/**
 * 🏪 Tipos de trabajo
 */
const WORK_TYPES = {
    // Trabajos básicos
    delivery: {
        id: 'delivery',
        name: 'Repartidor',
        emoji: '📦',
        description: 'Entrega paquetes por la ciudad',
        requirements: { level: 1 },
        duration: 2 * 60 * 60 * 1000, // 2 horas
        energy_cost: 20,
        base_rewards: {
            coins: { min: 50, max: 100 },
            exp: { min: 25, max: 50 },
            reputation: { min: 1, max: 3 }
        },
        success_rate: 0.85,
        class_bonuses: {
            rogue: { coins: 1.2, success_rate: 0.05 }
        }
    },
    
    guard: {
        id: 'guard',
        name: 'Guardia',
        emoji: '🛡️',
        description: 'Protege establecimientos y personas',
        requirements: { level: 5, attack: 20 },
        duration: 4 * 60 * 60 * 1000, // 4 horas
        energy_cost: 30,
        base_rewards: {
            coins: { min: 100, max: 200 },
            exp: { min: 50, max: 100 },
            reputation: { min: 2, max: 5 }
        },
        success_rate: 0.80,
        class_bonuses: {
            warrior: { coins: 1.3, success_rate: 0.1 },
            healer: { reputation: 1.5 }
        }
    },
    
    scholar: {
        id: 'scholar',
        name: 'Erudito',
        emoji: '📚',
        description: 'Enseña y realiza investigaciones',
        requirements: { level: 10, intelligence: 30 },
        duration: 3 * 60 * 60 * 1000, // 3 horas
        energy_cost: 25,
        base_rewards: {
            coins: { min: 80, max: 150 },
            exp: { min: 75, max: 125 },
            gems: { min: 1, max: 3 }
        },
        success_rate: 0.90,
        class_bonuses: {
            scholar: { exp: 1.5, gems: 1.5 },
            mage: { gems: 1.2 }
        }
    },
    
    merchant: {
        id: 'merchant',
        name: 'Comerciante',
        emoji: '🏪',
        description: 'Compra y vende mercancías',
        requirements: { level: 8, charisma: 25 },
        duration: 6 * 60 * 60 * 1000, // 6 horas
        energy_cost: 35,
        base_rewards: {
            coins: { min: 150, max: 300 },
            exp: { min: 40, max: 80 },
            reputation: { min: 1, max: 4 }
        },
        success_rate: 0.75,
        class_bonuses: {
            rogue: { coins: 1.4 },
            artist: { reputation: 1.3 }
        }
    },
    
    // Trabajos avanzados
    adventurer: {
        id: 'adventurer',
        name: 'Aventurero',
        emoji: '⚔️',
        description: 'Acepta misiones peligrosas',
        requirements: { level: 15, attack: 40, defense: 30 },
        duration: 8 * 60 * 60 * 1000, // 8 horas
        energy_cost: 50,
        base_rewards: {
            coins: { min: 200, max: 400 },
            exp: { min: 100, max: 200 },
            gems: { min: 2, max: 5 },
            items: ['random_equipment']
        },
        success_rate: 0.70,
        class_bonuses: {
            warrior: { exp: 1.3, success_rate: 0.1 },
            rogue: { coins: 1.2, gems: 1.2 }
        }
    },
    
    guild_master: {
        id: 'guild_master',
        name: 'Maestro de Gremio',
        emoji: '👑',
        description: 'Lidera y organiza gremios',
        requirements: { level: 25, charisma: 50, reputation: 100 },
        duration: 12 * 60 * 60 * 1000, // 12 horas
        energy_cost: 60,
        base_rewards: {
            coins: { min: 300, max: 600 },
            exp: { min: 150, max: 300 },
            gems: { min: 5, max: 10 },
            reputation: { min: 5, max: 15 }
        },
        success_rate: 0.85,
        class_bonuses: {
            healer: { reputation: 1.5 },
            scholar: { exp: 1.3 }
        }
    },
    
    // Trabajos especiales
    artist: {
        id: 'artist',
        name: 'Artista',
        emoji: '🎨',
        description: 'Crea obras de arte y entretenimiento',
        requirements: { level: 12, creativity: 35 },
        duration: 5 * 60 * 60 * 1000, // 5 horas
        energy_cost: 40,
        base_rewards: {
            coins: { min: 120, max: 250 },
            exp: { min: 60, max: 120 },
            gems: { min: 1, max: 4 },
            reputation: { min: 3, max: 8 }
        },
        success_rate: 0.80,
        class_bonuses: {
            artist: { coins: 1.5, gems: 1.5, reputation: 1.3 }
        }
    },
    
    healer: {
        id: 'healer',
        name: 'Sanador',
        emoji: '💚',
        description: 'Cura a los heridos y enfermos',
        requirements: { level: 10, magic: 30, wisdom: 25 },
        duration: 4 * 60 * 60 * 1000, // 4 horas
        energy_cost: 35,
        base_rewards: {
            coins: { min: 100, max: 180 },
            exp: { min: 80, max: 140 },
            reputation: { min: 5, max: 12 },
            karma: { min: 3, max: 8 }
        },
        success_rate: 0.90,
        class_bonuses: {
            healer: { exp: 1.4, reputation: 1.5, karma: 1.5 }
        }
    }
};

/**
 * 📈 Mercados dinámicos
 */
const MARKET_DATA = {
    exchange_rates: {
        coins_to_gems: 100, // 100 coins = 1 gem
        gems_to_coins: 95,  // 1 gem = 95 coins (fee)
        pg_to_coins: 2,     // 1 PG = 2 coins
        reputation_value: 10 // 1 reputation = 10 coins value
    },
    
    market_trends: {
        coins: { volatility: 0.05, trend: 0 },
        gems: { volatility: 0.1, trend: 0 },
        items: { volatility: 0.15, trend: 0 }
    },
    
    daily_deals: {
        max_deals: 5,
        discount_range: { min: 0.1, max: 0.5 },
        premium_chance: 0.2
    }
};

/**
 * 🏦 Sistema de inversiones
 */
const INVESTMENT_OPTIONS = {
    savings_account: {
        id: 'savings_account',
        name: 'Cuenta de Ahorros',
        emoji: '🏦',
        description: 'Inversión segura con retorno garantizado',
        min_investment: 1000,
        max_investment: 50000,
        duration: 7 * 24 * 60 * 60 * 1000, // 7 días
        interest_rate: 0.05, // 5%
        risk_level: 'low',
        currency: 'coins'
    },
    
    gem_fund: {
        id: 'gem_fund',
        name: 'Fondo de Gemas',
        emoji: '💎',
        description: 'Inversión en gemas con alto potencial',
        min_investment: 10,
        max_investment: 500,
        duration: 14 * 24 * 60 * 60 * 1000, // 14 días
        interest_rate: 0.15, // 15%
        risk_level: 'medium',
        currency: 'gems'
    },
    
    adventure_bonds: {
        id: 'adventure_bonds',
        name: 'Bonos de Aventura',
        emoji: '⚔️',
        description: 'Inversión de alto riesgo y alta recompensa',
        min_investment: 5000,
        max_investment: 100000,
        duration: 30 * 24 * 60 * 60 * 1000, // 30 días
        interest_rate: 0.25, // 25%
        risk_level: 'high',
        currency: 'coins',
        failure_chance: 0.2 // 20% chance de perder la inversión
    },
    
    guild_shares: {
        id: 'guild_shares',
        name: 'Acciones de Gremio',
        emoji: '🏛️',
        description: 'Inversión en el crecimiento de gremios',
        min_investment: 2000,
        max_investment: 25000,
        duration: 21 * 24 * 60 * 60 * 1000, // 21 días
        interest_rate: 0.12, // 12%
        risk_level: 'medium',
        currency: 'coins',
        guild_bonus: true // Bonus si el jugador está en un gremio activo
    }
};

/**
 * 💰 Clase principal del sistema de economía
 */
class EconomySystem {
    constructor() {
        this.currencyTypes = CURRENCY_TYPES;
        this.workTypes = WORK_TYPES;
        this.marketData = MARKET_DATA;
        this.investmentOptions = INVESTMENT_OPTIONS;
        this.activeJobs = new Map();
        this.activeInvestments = new Map();
        this.marketHistory = new Map();
        this.dailyDeals = new Map();
    }

    /**
     * 🚀 Inicializar sistema de economía
     */
    initialize() {
        this.updateMarketTrends();
        this.generateDailyDeals();
        this.startEnergyRegeneration();
        
        // Actualizar mercado cada hora
        setInterval(() => {
            this.updateMarketTrends();
        }, 60 * 60 * 1000);
        
        // Generar ofertas diarias
        setInterval(() => {
            this.generateDailyDeals();
        }, 24 * 60 * 60 * 1000);
        
        console.log('💰 Sistema de economía inicializado');
    }

    /**
     * 💳 Inicializar monedas del jugador
     */
    initializePlayerCurrencies(playerData) {
        if (!playerData.currencies) {
            playerData.currencies = {
                coins: 100,
                gems: 0,
                pg: 0,
                energy: 100,
                reputation: 0
            };
        }
        
        // Asegurar que todas las monedas existan
        Object.keys(this.currencyTypes).forEach(currency => {
            if (playerData.currencies[currency] === undefined) {
                playerData.currencies[currency] = 0;
            }
        });
        
        return playerData.currencies;
    }

    /**
     * 💰 Añadir moneda
     */
    addCurrency(playerData, currencyType, amount, source = 'unknown') {
        const currencies = this.initializePlayerCurrencies(playerData);
        const currency = this.currencyTypes[currencyType];
        
        if (!currency) {
            return { success: false, reason: 'invalid_currency' };
        }
        
        // Verificar límite diario
        if (currency.daily_limit) {
            const dailyEarned = this.getDailyEarnings(playerData, currencyType);
            if (dailyEarned + amount > currency.daily_limit) {
                amount = Math.max(0, currency.daily_limit - dailyEarned);
                if (amount === 0) {
                    return { success: false, reason: 'daily_limit_reached' };
                }
            }
        }
        
        // Verificar capacidad máxima (para energía)
        if (currency.max_capacity) {
            const newAmount = currencies[currencyType] + amount;
            if (newAmount > currency.max_capacity) {
                amount = currency.max_capacity - currencies[currencyType];
                if (amount <= 0) {
                    return { success: false, reason: 'max_capacity_reached' };
                }
            }
        }
        
        currencies[currencyType] += amount;
        
        // Registrar ganancia diaria
        this.recordDailyEarning(playerData, currencyType, amount, source);
        
        console.log(`💰 ${playerData.username} ganó ${amount} ${currency.name} (${source})`);
        
        return { success: true, amount, newBalance: currencies[currencyType] };
    }

    /**
     * 💸 Gastar moneda
     */
    spendCurrency(playerData, currencyType, amount, purpose = 'unknown') {
        const currencies = this.initializePlayerCurrencies(playerData);
        const currency = this.currencyTypes[currencyType];
        
        if (!currency) {
            return { success: false, reason: 'invalid_currency' };
        }
        
        if (currencies[currencyType] < amount) {
            return { success: false, reason: 'insufficient_funds', 
                    required: amount, available: currencies[currencyType] };
        }
        
        currencies[currencyType] -= amount;
        
        console.log(`💸 ${playerData.username} gastó ${amount} ${currency.name} (${purpose})`);
        
        return { success: true, amount, newBalance: currencies[currencyType] };
    }

    /**
     * 🔄 Intercambiar monedas
     */
    exchangeCurrency(playerData, fromCurrency, toCurrency, amount) {
        const fromCurrencyData = this.currencyTypes[fromCurrency];
        const toCurrencyData = this.currencyTypes[toCurrency];
        
        if (!fromCurrencyData || !toCurrencyData) {
            return { success: false, reason: 'invalid_currency' };
        }
        
        if (!fromCurrencyData.exchangeable || !toCurrencyData.exchangeable) {
            return { success: false, reason: 'currency_not_exchangeable' };
        }
        
        // Obtener tasa de cambio
        const exchangeKey = `${fromCurrency}_to_${toCurrency}`;
        const rate = this.marketData.exchange_rates[exchangeKey];
        
        if (!rate) {
            return { success: false, reason: 'exchange_rate_not_found' };
        }
        
        // Calcular cantidad a recibir
        let receivedAmount;
        if (fromCurrency === 'coins' && toCurrency === 'gems') {
            receivedAmount = Math.floor(amount / rate);
        } else if (fromCurrency === 'gems' && toCurrency === 'coins') {
            receivedAmount = amount * rate;
        } else {
            receivedAmount = Math.floor(amount * rate);
        }
        
        if (receivedAmount <= 0) {
            return { success: false, reason: 'insufficient_amount_for_exchange' };
        }
        
        // Realizar intercambio
        const spendResult = this.spendCurrency(playerData, fromCurrency, amount, 'currency_exchange');
        if (!spendResult.success) {
            return spendResult;
        }
        
        const addResult = this.addCurrency(playerData, toCurrency, receivedAmount, 'currency_exchange');
        if (!addResult.success) {
            // Revertir gasto si no se puede añadir
            this.addCurrency(playerData, fromCurrency, amount, 'exchange_revert');
            return addResult;
        }
        
        console.log(`🔄 ${playerData.username} intercambió ${amount} ${fromCurrencyData.name} por ${receivedAmount} ${toCurrencyData.name}`);
        
        return {
            success: true,
            spent: amount,
            received: receivedAmount,
            rate: rate
        };
    }

    /**
     * 💼 Comenzar trabajo
     */
    startWork(playerData, workType) {
        const work = this.workTypes[workType];
        if (!work) {
            return { success: false, reason: 'work_type_not_found' };
        }
        
        // Verificar si ya está trabajando
        if (this.activeJobs.has(playerData.userId)) {
            return { success: false, reason: 'already_working' };
        }
        
        // Verificar requisitos
        const requirementCheck = this.checkWorkRequirements(playerData, work);
        if (!requirementCheck.success) {
            return requirementCheck;
        }
        
        // Verificar energía
        const currencies = this.initializePlayerCurrencies(playerData);
        if (currencies.energy < work.energy_cost) {
            return { success: false, reason: 'insufficient_energy', 
                    required: work.energy_cost, available: currencies.energy };
        }
        
        // Gastar energía
        this.spendCurrency(playerData, 'energy', work.energy_cost, 'work');
        
        // Crear trabajo activo
        const job = {
            workType: workType,
            playerId: playerData.userId,
            startTime: Date.now(),
            endTime: Date.now() + work.duration,
            energyCost: work.energy_cost
        };
        
        this.activeJobs.set(playerData.userId, job);
        
        console.log(`💼 ${playerData.username} comenzó a trabajar como ${work.name}`);
        
        return { success: true, job, endTime: job.endTime };
    }

    /**
     * ✅ Completar trabajo
     */
    completeWork(playerData) {
        const job = this.activeJobs.get(playerData.userId);
        if (!job) {
            return { success: false, reason: 'no_active_job' };
        }
        
        if (Date.now() < job.endTime) {
            return { success: false, reason: 'work_not_finished', 
                    timeRemaining: job.endTime - Date.now() };
        }
        
        const work = this.workTypes[job.workType];
        const rewards = this.calculateWorkRewards(playerData, work);
        
        // Otorgar recompensas
        const grantedRewards = this.grantWorkRewards(playerData, rewards);
        
        // Remover trabajo activo
        this.activeJobs.delete(playerData.userId);
        
        console.log(`✅ ${playerData.username} completó el trabajo como ${work.name}`);
        
        return { success: true, rewards: grantedRewards, work };
    }

    /**
     * ❌ Cancelar trabajo
     */
    cancelWork(playerData) {
        const job = this.activeJobs.get(playerData.userId);
        if (!job) {
            return { success: false, reason: 'no_active_job' };
        }
        
        // Devolver parte de la energía (50%)
        const energyRefund = Math.floor(job.energyCost * 0.5);
        this.addCurrency(playerData, 'energy', energyRefund, 'work_cancel');
        
        this.activeJobs.delete(playerData.userId);
        
        console.log(`❌ ${playerData.username} canceló su trabajo`);
        
        return { success: true, energyRefund };
    }

    /**
     * 📊 Obtener estado del trabajo
     */
    getWorkStatus(playerData) {
        const job = this.activeJobs.get(playerData.userId);
        if (!job) {
            return { working: false };
        }
        
        const work = this.workTypes[job.workType];
        const timeRemaining = Math.max(0, job.endTime - Date.now());
        const progress = Math.min(100, ((Date.now() - job.startTime) / work.duration) * 100);
        
        return {
            working: true,
            work: work,
            startTime: job.startTime,
            endTime: job.endTime,
            timeRemaining: timeRemaining,
            progress: progress,
            canComplete: timeRemaining === 0
        };
    }

    /**
     * 💎 Crear inversión
     */
    createInvestment(playerData, investmentType, amount) {
        const investment = this.investmentOptions[investmentType];
        if (!investment) {
            return { success: false, reason: 'investment_type_not_found' };
        }
        
        // Verificar límites
        if (amount < investment.min_investment || amount > investment.max_investment) {
            return { success: false, reason: 'invalid_investment_amount',
                    min: investment.min_investment, max: investment.max_investment };
        }
        
        // Verificar fondos
        const spendResult = this.spendCurrency(playerData, investment.currency, amount, 'investment');
        if (!spendResult.success) {
            return spendResult;
        }
        
        // Crear inversión
        const investmentId = `${playerData.userId}_${Date.now()}`;
        const investmentData = {
            id: investmentId,
            type: investmentType,
            playerId: playerData.userId,
            amount: amount,
            currency: investment.currency,
            startTime: Date.now(),
            endTime: Date.now() + investment.duration,
            interestRate: investment.interest_rate,
            riskLevel: investment.risk_level
        };
        
        this.activeInvestments.set(investmentId, investmentData);
        
        console.log(`💎 ${playerData.username} invirtió ${amount} ${investment.currency} en ${investment.name}`);
        
        return { success: true, investment: investmentData };
    }

    /**
     * 💰 Cobrar inversión
     */
    claimInvestment(playerData, investmentId) {
        const investment = this.activeInvestments.get(investmentId);
        if (!investment) {
            return { success: false, reason: 'investment_not_found' };
        }
        
        if (investment.playerId !== playerData.userId) {
            return { success: false, reason: 'not_your_investment' };
        }
        
        if (Date.now() < investment.endTime) {
            return { success: false, reason: 'investment_not_mature',
                    timeRemaining: investment.endTime - Date.now() };
        }
        
        const investmentOption = this.investmentOptions[investment.type];
        let finalAmount = investment.amount;
        let success = true;
        
        // Verificar riesgo de fallo
        if (investmentOption.failure_chance && Math.random() < investmentOption.failure_chance) {
            finalAmount = 0;
            success = false;
        } else {
            // Calcular retorno
            const interest = investment.amount * investment.interestRate;
            finalAmount = investment.amount + interest;
            
            // Bonus de gremio
            if (investmentOption.guild_bonus && playerData.guildId) {
                finalAmount *= 1.1; // 10% bonus
            }
        }
        
        // Otorgar recompensa
        if (finalAmount > 0) {
            this.addCurrency(playerData, investment.currency, Math.floor(finalAmount), 'investment_return');
        }
        
        // Remover inversión
        this.activeInvestments.delete(investmentId);
        
        console.log(`💰 ${playerData.username} cobró inversión: ${finalAmount} ${investment.currency}`);
        
        return { 
            success: true, 
            investmentSuccess: success,
            originalAmount: investment.amount,
            finalAmount: Math.floor(finalAmount),
            profit: Math.floor(finalAmount - investment.amount)
        };
    }

    /**
     * 📈 Actualizar tendencias del mercado
     */
    updateMarketTrends() {
        Object.keys(this.marketData.market_trends).forEach(market => {
            const trend = this.marketData.market_trends[market];
            const change = (Math.random() - 0.5) * trend.volatility * 2;
            trend.trend = Math.max(-0.5, Math.min(0.5, trend.trend + change));
            
            // Aplicar cambios a las tasas de cambio
            if (market === 'coins' || market === 'gems') {
                this.adjustExchangeRates(market, trend.trend);
            }
        });
        
        console.log('📈 Tendencias del mercado actualizadas');
    }

    /**
     * 🎯 Generar ofertas diarias
     */
    generateDailyDeals() {
        this.dailyDeals.clear();
        
        const dealCount = Math.floor(Math.random() * this.marketData.daily_deals.max_deals) + 1;
        
        for (let i = 0; i < dealCount; i++) {
            const deal = this.generateRandomDeal();
            this.dailyDeals.set(deal.id, deal);
        }
        
        console.log(`🎯 ${dealCount} ofertas diarias generadas`);
    }

    /**
     * ⚡ Iniciar regeneración de energía
     */
    startEnergyRegeneration() {
        setInterval(() => {
            // Regenerar energía para todos los jugadores activos
            // Esto se implementaría con acceso a la base de datos
            console.log('⚡ Regeneración de energía ejecutada');
        }, this.currencyTypes.energy.regen_interval);
    }

    // MÉTODOS DE UTILIDAD

    /**
     * ✅ Verificar requisitos de trabajo
     */
    checkWorkRequirements(playerData, work) {
        const requirements = work.requirements;
        
        // Verificar nivel
        if (requirements.level && (playerData.level || 1) < requirements.level) {
            return { success: false, reason: 'level_too_low', 
                    required: requirements.level, current: playerData.level || 1 };
        }
        
        // Verificar estadísticas
        const stats = ['attack', 'defense', 'speed', 'magic', 'intelligence', 'charisma', 'wisdom', 'creativity'];
        for (const stat of stats) {
            if (requirements[stat] && (playerData[stat] || 0) < requirements[stat]) {
                return { success: false, reason: 'stat_too_low',
                        stat: stat, required: requirements[stat], current: playerData[stat] || 0 };
            }
        }
        
        // Verificar reputación
        if (requirements.reputation) {
            const currencies = this.initializePlayerCurrencies(playerData);
            if (currencies.reputation < requirements.reputation) {
                return { success: false, reason: 'reputation_too_low',
                        required: requirements.reputation, current: currencies.reputation };
            }
        }
        
        return { success: true };
    }

    /**
     * 🧮 Calcular recompensas de trabajo
     */
    calculateWorkRewards(playerData, work) {
        const rewards = {};
        const playerClass = classSystem.getPlayerClass(playerData);
        const classBonuses = work.class_bonuses?.[playerClass?.id] || {};
        
        // Determinar éxito
        let successRate = work.success_rate + (classBonuses.success_rate || 0);
        const isSuccess = Math.random() < successRate;
        
        if (!isSuccess) {
            // Fallo - recompensas reducidas
            Object.keys(work.base_rewards).forEach(currency => {
                if (typeof work.base_rewards[currency] === 'object') {
                    const min = work.base_rewards[currency].min;
                    rewards[currency] = Math.floor(min * 0.3); // 30% de la recompensa mínima
                }
            });
            return { rewards, success: false };
        }
        
        // Éxito - calcular recompensas completas
        Object.keys(work.base_rewards).forEach(currency => {
            const baseReward = work.base_rewards[currency];
            let amount;
            
            if (typeof baseReward === 'object') {
                // Rango de recompensa
                amount = Math.floor(Math.random() * (baseReward.max - baseReward.min + 1)) + baseReward.min;
            } else {
                // Cantidad fija
                amount = baseReward;
            }
            
            // Aplicar bonus de clase
            if (classBonuses[currency]) {
                amount = Math.floor(amount * classBonuses[currency]);
            }
            
            // Aplicar bonus de nivel
            const levelBonus = 1 + ((playerData.level || 1) - 1) * 0.02; // 2% por nivel
            amount = Math.floor(amount * levelBonus);
            
            rewards[currency] = amount;
        });
        
        // Objetos especiales
        if (work.base_rewards.items) {
            rewards.items = this.generateWorkItems(work.base_rewards.items, playerData);
        }
        
        return { rewards, success: true };
    }

    /**
     * 🎁 Otorgar recompensas de trabajo
     */
    grantWorkRewards(playerData, rewardData) {
        const grantedRewards = [];
        const rewards = rewardData.rewards;
        
        // Otorgar monedas
        Object.keys(rewards).forEach(currency => {
            if (currency !== 'items' && rewards[currency] > 0) {
                const result = this.addCurrency(playerData, currency, rewards[currency], 'work');
                if (result.success) {
                    grantedRewards.push({
                        type: 'currency',
                        currency: currency,
                        amount: result.amount
                    });
                }
            }
        });
        
        // Otorgar experiencia
        if (rewards.exp) {
            const expResult = progressionSystem.awardExperience(playerData, 'work', rewards.exp);
            grantedRewards.push({
                type: 'exp',
                amount: expResult.expGained
            });
        }
        
        // Otorgar objetos
        if (rewards.items) {
            rewards.items.forEach(item => {
                const addResult = inventorySystem.addItem(playerData, item.id, item.quantity || 1);
                if (addResult.success) {
                    grantedRewards.push({
                        type: 'item',
                        item: inventorySystem.getItem(item.id),
                        quantity: item.quantity || 1
                    });
                }
            });
        }
        
        return grantedRewards;
    }

    /**
     * 📦 Generar objetos de trabajo
     */
    generateWorkItems(itemTypes, playerData) {
        const items = [];
        
        itemTypes.forEach(itemType => {
            if (itemType === 'random_equipment') {
                // Generar equipo aleatorio basado en el nivel del jugador
                const equipment = this.generateRandomEquipment(playerData.level || 1);
                if (equipment) {
                    items.push(equipment);
                }
            }
        });
        
        return items;
    }

    /**
     * ⚔️ Generar equipo aleatorio
     */
    generateRandomEquipment(playerLevel) {
        // Implementar generación de equipo aleatorio
        const equipmentTypes = ['sword', 'shield', 'armor', 'boots', 'ring', 'amulet'];
        const randomType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
        
        return {
            id: `random_${randomType}_${playerLevel}`,
            quantity: 1
        };
    }

    /**
     * 💱 Ajustar tasas de cambio
     */
    adjustExchangeRates(market, trend) {
        const adjustment = 1 + (trend * 0.1); // Máximo 5% de cambio
        
        if (market === 'coins') {
            this.marketData.exchange_rates.coins_to_gems = Math.floor(
                this.marketData.exchange_rates.coins_to_gems * adjustment
            );
        } else if (market === 'gems') {
            this.marketData.exchange_rates.gems_to_coins = Math.floor(
                this.marketData.exchange_rates.gems_to_coins * adjustment
            );
        }
    }

    /**
     * 🎲 Generar oferta aleatoria
     */
    generateRandomDeal() {
        const dealTypes = ['currency_exchange', 'item_discount', 'energy_boost', 'exp_bonus'];
        const randomType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
        
        const discount = Math.random() * 
            (this.marketData.daily_deals.discount_range.max - this.marketData.daily_deals.discount_range.min) + 
            this.marketData.daily_deals.discount_range.min;
        
        return {
            id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: randomType,
            discount: discount,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
            premium: Math.random() < this.marketData.daily_deals.premium_chance
        };
    }

    /**
     * 📊 Registrar ganancia diaria
     */
    recordDailyEarning(playerData, currency, amount, source) {
        if (!playerData.dailyEarnings) {
            playerData.dailyEarnings = {};
        }
        
        const today = new Date().toDateString();
        if (!playerData.dailyEarnings[today]) {
            playerData.dailyEarnings[today] = {};
        }
        
        if (!playerData.dailyEarnings[today][currency]) {
            playerData.dailyEarnings[today][currency] = 0;
        }
        
        playerData.dailyEarnings[today][currency] += amount;
    }

    /**
     * 📈 Obtener ganancias diarias
     */
    getDailyEarnings(playerData, currency) {
        if (!playerData.dailyEarnings) {
            return 0;
        }
        
        const today = new Date().toDateString();
        return playerData.dailyEarnings[today]?.[currency] || 0;
    }

    /**
     * 🎨 Generar embed de estado económico
     */
    generateEconomyStatusEmbed(playerData) {
        const currencies = this.initializePlayerCurrencies(playerData);
        
        const embed = new PassQuirkEmbed()
            .setTitle('💰 Estado Económico')
            .setDescription(`Resumen de tus finanzas en PassQuirk`);
        
        // Mostrar monedas
        Object.keys(this.currencyTypes).forEach(currencyId => {
            const currency = this.currencyTypes[currencyId];
            const amount = currencies[currencyId] || 0;
            
            let displayText = amount.toLocaleString();
            
            // Mostrar capacidad para energía
            if (currency.max_capacity) {
                displayText += ` / ${currency.max_capacity}`;
            }
            
            // Mostrar límite diario
            if (currency.daily_limit) {
                const dailyEarned = this.getDailyEarnings(playerData, currencyId);
                displayText += `\n(Hoy: ${dailyEarned}/${currency.daily_limit})`;
            }
            
            embed.addField(
                `${currency.emoji} ${currency.name}`,
                displayText,
                true
            );
        });
        
        // Estado del trabajo
        const workStatus = this.getWorkStatus(playerData);
        if (workStatus.working) {
            const timeLeft = Math.ceil(workStatus.timeRemaining / (60 * 1000)); // minutos
            embed.addField(
                '💼 Trabajo Activo',
                `${workStatus.work.emoji} ${workStatus.work.name}\nTiempo restante: ${timeLeft}m`,
                false
            );
        }
        
        return embed;
    }

    /**
     * 🎨 Generar embed de trabajos disponibles
     */
    generateWorkListEmbed(playerData) {
        const embed = new PassQuirkEmbed()
            .setTitle('💼 Trabajos Disponibles')
            .setDescription('Elige un trabajo para ganar monedas y experiencia');
        
        Object.values(this.workTypes).forEach(work => {
            const requirementCheck = this.checkWorkRequirements(playerData, work);
            const canWork = requirementCheck.success;
            
            const status = canWork ? '✅' : '❌';
            const duration = Math.floor(work.duration / (60 * 60 * 1000)); // horas
            
            let rewardText = '';
            Object.keys(work.base_rewards).forEach(currency => {
                const reward = work.base_rewards[currency];
                if (typeof reward === 'object') {
                    rewardText += `${this.currencyTypes[currency]?.emoji || '💰'} ${reward.min}-${reward.max}\n`;
                }
            });
            
            embed.addField(
                `${status} ${work.emoji} ${work.name}`,
                `${work.description}\n**Duración:** ${duration}h\n**Energía:** ${work.energy_cost}\n**Recompensas:**\n${rewardText}`,
                false
            );
        });
        
        return embed;
    }
}

// Crear instancia singleton del sistema de economía
const economySystem = new EconomySystem();

module.exports = {
    EconomySystem,
    economySystem,
    CURRENCY_TYPES,
    WORK_TYPES,
    MARKET_DATA,
    INVESTMENT_OPTIONS
};