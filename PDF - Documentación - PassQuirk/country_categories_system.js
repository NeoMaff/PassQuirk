const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Sistema de Categorías de Países para Creación de Personaje
class CountryCategoriesSystem {
    constructor() {
        // Mapa de países a zonas horarias (mismo que TimeWeatherSystem)
        this.timezoneMap = {
            'España': 'Europe/Madrid',
            'México': 'America/Mexico_City',
            'Argentina': 'America/Argentina/Buenos_Aires',
            'Colombia': 'America/Bogota',
            'Chile': 'America/Santiago',
            'Perú': 'America/Lima',
            'Venezuela': 'America/Caracas',
            'Estados Unidos': 'America/New_York',
            'Brasil': 'America/Sao_Paulo',
            'Reino Unido': 'Europe/London',
            'Francia': 'Europe/Paris',
            'Alemania': 'Europe/Berlin',
            'Italia': 'Europe/Rome',
            'Japón': 'Asia/Tokyo',
            'China': 'Asia/Shanghai',
            'India': 'Asia/Kolkata',
            'Australia': 'Australia/Sydney',
            'Canadá': 'America/Toronto'
        };

        // Categorías geográficas organizadas
        this.countryCategories = {
            'europa': {
                name: '🇪🇺 Europa',
                emoji: '🏰',
                description: 'Países del continente europeo',
                countries: [
                    { name: 'España', flag: '🇪🇸', timezone: 'Europe/Madrid' },
                    { name: 'Reino Unido', flag: '🇬🇧', timezone: 'Europe/London' },
                    { name: 'Francia', flag: '🇫🇷', timezone: 'Europe/Paris' },
                    { name: 'Alemania', flag: '🇩🇪', timezone: 'Europe/Berlin' },
                    { name: 'Italia', flag: '🇮🇹', timezone: 'Europe/Rome' }
                ]
            },
            'america_norte': {
                name: '🇺🇸 América del Norte',
                emoji: '🗽',
                description: 'Estados Unidos y Canadá',
                countries: [
                    { name: 'Estados Unidos', flag: '🇺🇸', timezone: 'America/New_York' },
                    { name: 'Canadá', flag: '🇨🇦', timezone: 'America/Toronto' }
                ]
            },
            'america_latina': {
                name: '🌎 América Latina',
                emoji: '🌮',
                description: 'Países de habla hispana y portuguesa',
                countries: [
                    { name: 'México', flag: '🇲🇽', timezone: 'America/Mexico_City' },
                    { name: 'Argentina', flag: '🇦🇷', timezone: 'America/Argentina/Buenos_Aires' },
                    { name: 'Colombia', flag: '🇨🇴', timezone: 'America/Bogota' },
                    { name: 'Chile', flag: '🇨🇱', timezone: 'America/Santiago' },
                    { name: 'Perú', flag: '🇵🇪', timezone: 'America/Lima' },
                    { name: 'Venezuela', flag: '🇻🇪', timezone: 'America/Caracas' },
                    { name: 'Brasil', flag: '🇧🇷', timezone: 'America/Sao_Paulo' }
                ]
            },
            'asia': {
                name: '🌏 Asia',
                emoji: '🏯',
                description: 'Países del continente asiático',
                countries: [
                    { name: 'Japón', flag: '🇯🇵', timezone: 'Asia/Tokyo' },
                    { name: 'China', flag: '🇨🇳', timezone: 'Asia/Shanghai' },
                    { name: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata' }
                ]
            },
            'oceania': {
                name: '🇦🇺 Oceanía',
                emoji: '🦘',
                description: 'Australia y región oceánica',
                countries: [
                    { name: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney' }
                ]
            }
        };

        // Estados de la creación de personaje
        this.creationStates = {
            CATEGORY_SELECTION: 'category_selection',
            COUNTRY_SELECTION: 'country_selection',
            CONFIRMATION: 'confirmation'
        };
    }

    // Crear embed inicial de selección de categorías
    createCategorySelectionEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('🌍 Selección de Región')
            .setDescription('**Paso 2/5:** Elige tu región geográfica para configurar tu zona horaria')
            .setColor('#3498DB')
            .addFields(
                {
                    name: '📍 ¿Por qué necesitamos tu región?',
                    value: '• Para mostrar tu hora local correcta\n• El clima y periodo del día afectan al gameplay\n• Eventos especiales según tu zona horaria',
                    inline: false
                },
                {
                    name: '🌎 Regiones Disponibles',
                    value: this.getRegionsList(),
                    inline: false
                }
            )
            .setFooter({ 
                text: '⏰ Tu zona horaria afectará la experiencia de juego',
                iconURL: 'https://cdn.discordapp.com/emojis/123456789.png' 
            })
            .setTimestamp();

        return embed;
    }

    // Crear embed de selección de país dentro de una categoría
    createCountrySelectionEmbed(categoryKey) {
        const category = this.countryCategories[categoryKey];
        
        if (!category) {
            throw new Error(`Categoría ${categoryKey} no encontrada`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`${category.name}`)
            .setDescription(`**Paso 2/5:** Selecciona tu país específico\n\n${category.description}`)
            .setColor('#2ECC71')
            .addFields(
                {
                    name: '🗺️ Países Disponibles',
                    value: category.countries.map(country => 
                        `${country.flag} **${country.name}**`
                    ).join('\n'),
                    inline: false
                },
                {
                    name: '⚡ Efectos de la Zona Horaria',
                    value: '• Tu hora local determinará eventos diarios\n• El clima global afecta las probabilidades\n• Algunos eventos son exclusivos por horario',
                    inline: false
                }
            )
            .setFooter({ 
                text: '⬅️ Puedes volver atrás para cambiar de región',
                iconURL: 'https://cdn.discordapp.com/emojis/123456789.png' 
            })
            .setTimestamp();

        return embed;
    }

    // Crear embed de confirmación
    createConfirmationEmbed(selectedCountry) {
        const countryData = this.findCountryData(selectedCountry);
        
        if (!countryData) {
            throw new Error(`País ${selectedCountry} no encontrado`);
        }

        // Obtener hora actual del país seleccionado
        const now = new Date();
        const timeOptions = { 
            timeZone: countryData.timezone, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        };
        const currentTime = now.toLocaleTimeString('es-ES', timeOptions);

        const embed = new EmbedBuilder()
            .setTitle('✅ Confirmación de País')
            .setDescription(`**Paso 2/5:** Confirma tu selección`)
            .setColor('#F39C12')
            .addFields(
                {
                    name: '📍 País Seleccionado',
                    value: `${countryData.flag} **${countryData.name}**`,
                    inline: true
                },
                {
                    name: '🕐 Tu Hora Actual',
                    value: `⏰ ${currentTime}`,
                    inline: true
                },
                {
                    name: '🌍 Zona Horaria',
                    value: `📍 ${countryData.timezone}`,
                    inline: true
                },
                {
                    name: '🎮 Impacto en el Juego',
                    value: '• **Eventos Diarios:** Basados en tu hora local\n• **Clima Global:** Afecta probabilidades\n• **Periodo del Día:** Influye en enemigos y loot',
                    inline: false
                }
            )
            .setFooter({ 
                text: '⚠️ Podrás cambiar tu país más tarde en configuración',
                iconURL: 'https://cdn.discordapp.com/emojis/123456789.png' 
            })
            .setTimestamp();

        return embed;
    }

    // Crear menú de selección de categorías
    createCategorySelectMenu() {
        const options = Object.entries(this.countryCategories).map(([key, category]) => ({
            label: category.name.replace(/🇪🇺|🇺🇸|🌎|🌏|🇦🇺/g, '').trim(),
            value: `category_${key}`,
            description: category.description,
            emoji: category.emoji
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_region_category')
            .setPlaceholder('🌍 Selecciona tu región geográfica...')
            .addOptions(options);

        return new ActionRowBuilder().addComponents(selectMenu);
    }

    // Crear menú de selección de países dentro de una categoría
    createCountrySelectMenu(categoryKey) {
        const category = this.countryCategories[categoryKey];
        
        if (!category) {
            throw new Error(`Categoría ${categoryKey} no encontrada`);
        }

        const options = category.countries.map(country => ({
            label: country.name,
            value: `country_${country.name}`,
            description: `Zona horaria: ${country.timezone}`,
            emoji: country.flag
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_specific_country')
            .setPlaceholder(`${category.emoji} Selecciona tu país...`)
            .addOptions(options);

        return new ActionRowBuilder().addComponents(selectMenu);
    }

    // Crear botones de navegación
    createNavigationButtons(currentState, categoryKey = null) {
        const row = new ActionRowBuilder();

        switch (currentState) {
            case this.creationStates.CATEGORY_SELECTION:
                // Solo botón de siguiente (deshabilitado hasta seleccionar)
                const nextButton = new ButtonBuilder()
                    .setCustomId('country_next_step')
                    .setLabel('Siguiente')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true);
                
                row.addComponents(nextButton);
                break;

            case this.creationStates.COUNTRY_SELECTION:
                // Botón atrás y siguiente
                const backButton = new ButtonBuilder()
                    .setCustomId('country_back_to_categories')
                    .setLabel('Atrás')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Secondary);

                const nextButton2 = new ButtonBuilder()
                    .setCustomId('country_next_step')
                    .setLabel('Siguiente')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true);

                row.addComponents(backButton, nextButton2);
                break;

            case this.creationStates.CONFIRMATION:
                // Botones de confirmar y cambiar
                const changeButton = new ButtonBuilder()
                    .setCustomId('country_change_selection')
                    .setLabel('Cambiar')
                    .setEmoji('🔄')
                    .setStyle(ButtonStyle.Secondary);

                const confirmButton = new ButtonBuilder()
                    .setCustomId('country_confirm_selection')
                    .setLabel('Confirmar')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success);

                row.addComponents(changeButton, confirmButton);
                break;
        }

        return row;
    }

    // Funciones auxiliares
    getRegionsList() {
        return Object.values(this.countryCategories)
            .map(category => `${category.emoji} **${category.name.replace(/🇪🇺|🇺🇸|🌎|🌏|🇦🇺/g, '').trim()}**`)
            .join('\n');
    }

    findCountryData(countryName) {
        for (const category of Object.values(this.countryCategories)) {
            const country = category.countries.find(c => c.name === countryName);
            if (country) {
                return country;
            }
        }
        return null;
    }

    getCategoryFromCountry(countryName) {
        for (const [key, category] of Object.entries(this.countryCategories)) {
            if (category.countries.some(c => c.name === countryName)) {
                return key;
            }
        }
        return null;
    }

    getAllCountries() {
        const allCountries = [];
        for (const category of Object.values(this.countryCategories)) {
            allCountries.push(...category.countries);
        }
        return allCountries;
    }
}

// Manejador para el sistema de categorías de países
class CountryCategoriesHandler {
    constructor(countryCategoriesSystem) {
        this.countryCategoriesSystem = countryCategoriesSystem;
        this.userSelections = new Map(); // userId -> { state, selectedCategory, selectedCountry }
    }

    // Iniciar selección de categorías
    async handleCategorySelectionStart(interaction, userData) {
        const userId = interaction.user.id;
        
        // Inicializar estado del usuario
        this.userSelections.set(userId, {
            state: this.countryCategoriesSystem.creationStates.CATEGORY_SELECTION,
            selectedCategory: null,
            selectedCountry: null
        });

        const embed = this.countryCategoriesSystem.createCategorySelectionEmbed();
        const categoryMenu = this.countryCategoriesSystem.createCategorySelectMenu();
        const buttons = this.countryCategoriesSystem.createNavigationButtons(
            this.countryCategoriesSystem.creationStates.CATEGORY_SELECTION
        );

        await interaction.reply({
            embeds: [embed],
            components: [categoryMenu, buttons],
            ephemeral: false
        });
    }

    // Manejar selección de categoría/región
    async handleCategorySelection(interaction, userData) {
        const userId = interaction.user.id;
        const selectedCategory = interaction.values[0].replace('category_', '');
        
        // Actualizar estado del usuario
        const userState = this.userSelections.get(userId) || {};
        userState.selectedCategory = selectedCategory;
        userState.state = this.countryCategoriesSystem.creationStates.COUNTRY_SELECTION;
        this.userSelections.set(userId, userState);

        const embed = this.countryCategoriesSystem.createCountrySelectionEmbed(selectedCategory);
        const countryMenu = this.countryCategoriesSystem.createCountrySelectMenu(selectedCategory);
        const buttons = this.countryCategoriesSystem.createNavigationButtons(
            this.countryCategoriesSystem.creationStates.COUNTRY_SELECTION,
            selectedCategory
        );

        await interaction.update({
            embeds: [embed],
            components: [countryMenu, buttons]
        });
    }

    // Manejar selección de país específico
    async handleCountrySelection(interaction, userData) {
        const userId = interaction.user.id;
        const selectedCountry = interaction.values[0].replace('country_', '');
        
        // Actualizar estado del usuario
        const userState = this.userSelections.get(userId) || {};
        userState.selectedCountry = selectedCountry;
        userState.state = this.countryCategoriesSystem.creationStates.CONFIRMATION;
        this.userSelections.set(userId, userState);

        const embed = this.countryCategoriesSystem.createConfirmationEmbed(selectedCountry);
        const buttons = this.countryCategoriesSystem.createNavigationButtons(
            this.countryCategoriesSystem.creationStates.CONFIRMATION
        );

        await interaction.update({
            embeds: [embed],
            components: [buttons]
        });
    }

    // Manejar confirmación final
    async handleCountryConfirmation(interaction, userData) {
        const userId = interaction.user.id;
        const userState = this.userSelections.get(userId);
        
        if (!userState?.selectedCountry) {
            await interaction.reply({
                content: '❌ Error: No se ha seleccionado ningún país.',
                ephemeral: true
            });
            return;
        }

        const countryData = this.countryCategoriesSystem.findCountryData(userState.selectedCountry);
        
        // Actualizar userData (implementar según tu sistema)
        userData.country = userState.selectedCountry;
        userData.timezone = countryData.timezone;
        userData.countryFlag = countryData.flag;
        
        // Limpiar estado temporal
        this.userSelections.delete(userId);

        await interaction.update({
            embeds: [this.createSuccessEmbed(countryData)],
            components: []
        });

        // Continuar con el siguiente paso del tutorial
        // Aquí puedes llamar al siguiente manejador del tutorial
        return { 
            success: true, 
            country: userState.selectedCountry,
            timezone: countryData.timezone,
            flag: countryData.flag
        };
    }

    // Manejar bot