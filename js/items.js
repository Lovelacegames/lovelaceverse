/**
 * Item system for the Cyberpunk MMORPG game
 * Defines item types, properties, and effects
 */

const Items = {
    // Item registry
    registry: {},
    
    // Item categories
    CATEGORIES: {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        GLOVES: 'gloves',
        BOOTS: 'boots',
        ACCESSORY: 'accessory',
        CONSUMABLE: 'consumable',
        MATERIAL: 'material',
        UTILITY: 'utility',
        QUEST: 'quest'
    },
    
    // Equipment types
    EQUIPMENT_TYPES: {
        // Right hand weapons
        SWORD: 'sword',
        DAGGER: 'dagger', 
        DUAL_DAGGER: 'dual_dagger',
        DUAL_BLADE: 'dual_blade',
        BOW: 'bow',
        CROSSBOW: 'crossbow',
        STAFF: 'staff',
        KATANA: 'katana',
        KNUCKLES: 'knuckles',
        SPEAR: 'spear',
        SCYTHE: 'scythe',
        WAND: 'wand',
        GRIMOIRE: 'grimoire',
        
        // Armor types
        LIGHT_ARMOR: 'light_armor',
        MEDIUM_ARMOR: 'medium_armor',
        HEAVY_ARMOR: 'heavy_armor',
        
        // Glove types
        LIGHT_GLOVES: 'light_gloves',
        HEAVY_GLOVES: 'heavy_gloves',
        
        // Boot types
        LIGHT_BOOTS: 'light_boots',
        HEAVY_BOOTS: 'heavy_boots',
        
        // Accessory types
        RING: 'ring',
        NECKLACE: 'necklace',
        AMULET: 'amulet',
        CHARM: 'charm',
        BRACELET: 'bracelet'
    },
    
    // Dual wield weapon types
    DUAL_WIELD_TYPES: ['dual_dagger', 'dual_blade', 'bow', 'crossbow', 'katana', 'knuckles'],
    
    // Item rarities
    RARITIES: {
        COMMON: {
            name: 'Common',
            color: '#aaaaaa',
            statMultiplier: 1.0
        },
        UNCOMMON: {
            name: 'Uncommon',
            color: '#00ff66',
            statMultiplier: 1.2
        },
        RARE: {
            name: 'Rare',
            color: '#00f3ff',
            statMultiplier: 1.5
        },
        EPIC: {
            name: 'Epic',
            color: '#ff00ff',
            statMultiplier: 2.0
        },
        LEGENDARY: {
            name: 'Legendary',
            color: '#f7ff00',
            statMultiplier: 3.0
        }
    },
    
    /**
     * Initialize the item system
     */
    init: function() {
        this.registerItems();
    },
    
    /**
     * Register all game items
     */
    registerItems: function() {
        // =============== WEAPONS ===============
        
        // SWORD
        this.registerItem({
            id: 'cyber_blade',
            name: 'Cyber Blade',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.SWORD,
            rarity: this.RARITIES.UNCOMMON,
            description: 'A sharp blade with neon edges.',
            stats: {
                damage: 15,
                attackSpeed: 1.2
            },
            effects: ['Deals 5 bonus damage to robotic enemies'],
            icon: 'img/items/cyber_blade.png',
            level: 1
        });
        
        // DAGGER
        this.registerItem({
            id: 'quantum_dagger',
            name: 'Quantum Dagger',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.DAGGER,
            rarity: this.RARITIES.RARE,
            description: 'A dagger that can phase through armor.',
            stats: {
                damage: 12,
                attackSpeed: 1.5,
                critical: 10
            },
            effects: ['15% chance to ignore target defense'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 5
        });
        
        // DUAL_DAGGER
        this.registerItem({
            id: 'twin_fangs',
            name: 'Twin Fangs',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.DUAL_DAGGER,
            rarity: this.RARITIES.EPIC,
            description: 'A pair of venomous daggers that strike like serpents.',
            stats: {
                damage: 10,
                attackSpeed: 1.8,
                critical: 15
            },
            effects: ['Each hit has 10% chance to poison target'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 15
        });
        
        // DUAL_BLADE
        this.registerItem({
            id: 'binary_blades',
            name: 'Binary Blades',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.DUAL_BLADE,
            rarity: this.RARITIES.LEGENDARY,
            description: 'Twin energy blades that cut through code and matter alike.',
            stats: {
                damage: 25,
                attackSpeed: 1.4,
                critical: 8
            },
            effects: ['Attacks hit twice, with the second hit dealing 50% damage'],
            icon: 'img/items/cyber_blade.png', // Reusing existing icon
            level: 20
        });
        
        // BOW
        this.registerItem({
            id: 'pulse_bow',
            name: 'Pulse Bow',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.BOW,
            rarity: this.RARITIES.RARE,
            description: 'A bow that fires concentrated energy pulses.',
            stats: {
                damage: 18,
                attackSpeed: 1.0,
                range: 200
            },
            effects: ['Arrows penetrate through up to 3 targets'],
            icon: 'img/items/plasma_pistol.png', // Reusing existing icon
            level: 12
        });
        
        // CROSSBOW
        this.registerItem({
            id: 'auto_crossbow',
            name: 'Auto-Crossbow',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.CROSSBOW,
            rarity: this.RARITIES.EPIC,
            description: 'An automated crossbow with rapid-fire capability.',
            stats: {
                damage: 16,
                attackSpeed: 1.3,
                range: 180
            },
            effects: ['25% chance to fire an additional bolt'],
            icon: 'img/items/plasma_pistol.png', // Reusing existing icon
            level: 18
        });
        
        // STAFF
        this.registerItem({
            id: 'data_staff',
            name: 'Data Staff',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.STAFF,
            rarity: this.RARITIES.RARE,
            description: 'A staff channeling digital energies.',
            stats: {
                magicDamage: 25,
                attackSpeed: 0.8,
                intelligence: 10
            },
            effects: ['Spells cost 15% less energy'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 14
        });
        
        // KATANA
        this.registerItem({
            id: 'neon_katana',
            name: 'Neon Katana',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.KATANA,
            rarity: this.RARITIES.EPIC,
            description: 'A razor-sharp blade with neon edge technology.',
            stats: {
                damage: 22,
                attackSpeed: 1.2,
                critical: 12
            },
            effects: ['Critical hits cause bleeding for 3 seconds'],
            icon: 'img/items/cyber_blade.png', // Reusing existing icon
            level: 16
        });
        
        // KNUCKLES
        this.registerItem({
            id: 'shock_knuckles',
            name: 'Shock Knuckles',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.KNUCKLES,
            rarity: this.RARITIES.UNCOMMON,
            description: 'Electrified knuckles that deliver stunning punches.',
            stats: {
                damage: 8,
                attackSpeed: 1.8,
                evasion: 5
            },
            effects: ['15% chance to stun target for 1 second'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 8
        });
        
        // SPEAR
        this.registerItem({
            id: 'volt_lance',
            name: 'Volt Lance',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.SPEAR,
            rarity: this.RARITIES.RARE,
            description: 'A spear charged with electrical energy.',
            stats: {
                damage: 20,
                attackSpeed: 1.0,
                range: 80
            },
            effects: ['Attacks chain to nearby enemies for 30% damage'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 12
        });
        
        // SCYTHE
        this.registerItem({
            id: 'data_reaper',
            name: 'Data Reaper',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.SCYTHE,
            rarity: this.RARITIES.LEGENDARY,
            description: 'A scythe that harvests digital souls.',
            stats: {
                damage: 30,
                attackSpeed: 0.7,
                critical: 15
            },
            effects: ['Defeated enemies explode, dealing damage to nearby foes'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 25
        });
        
        // WAND
        this.registerItem({
            id: 'code_wand',
            name: 'Code Wand',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.WAND,
            rarity: this.RARITIES.UNCOMMON,
            description: 'A wand that manipulates code structures.',
            stats: {
                magicDamage: 15,
                attackSpeed: 1.2,
                intelligence: 8
            },
            effects: ['10% chance to temporarily disable enemy abilities'],
            icon: 'img/items/neural_whip.png', // Reusing existing icon
            level: 10
        });
        
        // GRIMOIRE
        this.registerItem({
            id: 'algorithm_grimoire',
            name: 'Algorithm Grimoire',
            category: this.CATEGORIES.WEAPON,
            equipmentType: this.EQUIPMENT_TYPES.GRIMOIRE,
            rarity: this.RARITIES.EPIC,
            description: 'A tome containing powerful algorithms and spells.',
            stats: {
                magicDamage: 28,
                attackSpeed: 0.9,
                intelligence: 15
            },
            effects: ['Spells have 20% increased area of effect'],
            icon: 'img/items/quantum_core.png', // Reusing existing icon
            level: 20
        });
        
        // Legacy weapons (kept for compatibility)
        this.registerItem({
            id: 'plasma_pistol',
            name: 'Plasma Pistol',
            category: this.CATEGORIES.WEAPON,
            rarity: this.RARITIES.RARE,
            description: 'A pistol that fires concentrated plasma bolts.',
            stats: {
                damage: 20,
                attackSpeed: 1.0,
                range: 150
            },
            effects: ['20% chance to apply a burn effect'],
            icon: 'img/items/plasma_pistol.png',
            level: 5
        });
        
        this.registerItem({
            id: 'neural_whip',
            name: 'Neural Whip',
            category: this.CATEGORIES.WEAPON,
            rarity: this.RARITIES.EPIC,
            description: 'A whip that disrupts neural pathways.',
            stats: {
                damage: 30,
                attackSpeed: 0.8,
                range: 100
            },
            effects: ['30% chance to stun enemies for 2 seconds'],
            icon: 'img/items/neural_whip.png',
            level: 10
        });
        
        // =============== ARMOR ===============
        
        // LIGHT_ARMOR
        this.registerItem({
            id: 'synth_vest',
            name: 'Synthetic Vest',
            category: this.CATEGORIES.ARMOR,
            equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
            rarity: this.RARITIES.COMMON,
            description: 'Basic protection made from synthetic fibers.',
            stats: {
                defense: 10,
                hp: 20
            },
            effects: [],
            icon: 'img/items/synth_vest.png',
            level: 1
        });
        
        // MEDIUM_ARMOR
        this.registerItem({
            id: 'nano_armor',
            name: 'Nano Armor',
            category: this.CATEGORIES.ARMOR,
            equipmentType: this.EQUIPMENT_TYPES.MEDIUM_ARMOR,
            rarity: this.RARITIES.RARE,
            description: 'Armor made from nanobots that adapt to damage.',
            stats: {
                defense: 25,
                hp: 50,
                magicDefense: 15
            },
            effects: ['Regenerates 1 HP per second'],
            icon: 'img/items/nano_armor.png',
            level: 8
        });
        
        // HEAVY_ARMOR
        this.registerItem({
            id: 'cybernetic_plate',
            name: 'Cybernetic Plate',
            category: this.CATEGORIES.ARMOR,
            equipmentType: this.EQUIPMENT_TYPES.HEAVY_ARMOR,
            rarity: this.RARITIES.EPIC,
            description: 'Heavy armor augmented with cybernetic enhancements.',
            stats: {
                defense: 40,
                hp: 80,
                strength: 10
            },
            effects: ['Reduces physical damage by 15%'],
            icon: 'img/items/nano_armor.png', // Reusing existing icon
            level: 12
        });
        
        // SHIELD
        this.registerItem({
            id: 'quantum_shield',
            name: 'Quantum Shield',
            category: this.CATEGORIES.ARMOR,
            equipmentType: 'shield', // Using string directly for backward compatibility
            rarity: this.RARITIES.LEGENDARY,
            description: 'A shield that exists in multiple dimensions simultaneously.',
            stats: {
                defense: 50,
                hp: 100,
                magicDefense: 50,
                evasion: 10
            },
            effects: ['15% chance to completely negate damage'],
            icon: 'img/items/quantum_shield.png',
            level: 15
        });
        
        // =============== GLOVES ===============
        
        // LIGHT_GLOVES
        this.registerItem({
            id: 'cyber_gloves',
            name: 'Cyber Gloves',
            category: this.CATEGORIES.GLOVES,
            equipmentType: this.EQUIPMENT_TYPES.LIGHT_GLOVES,
            rarity: this.RARITIES.UNCOMMON,
            description: 'Lightweight gloves with enhanced grip and dexterity.',
            stats: {
                dexterity: 8,
                attackSpeed: 0.1,
                critical: 5
            },
            effects: ['Increases critical hit damage by 10%'],
            icon: 'img/items/agi_gloves.png',
            level: 5
        });
        
        // HEAVY_GLOVES
        this.registerItem({
            id: 'power_gauntlets',
            name: 'Power Gauntlets',
            category: this.CATEGORIES.GLOVES,
            equipmentType: this.EQUIPMENT_TYPES.HEAVY_GLOVES,
            rarity: this.RARITIES.RARE,
            description: 'Heavy-duty gauntlets that enhance physical strength.',
            stats: {
                strength: 12,
                damage: 15,
                defense: 8
            },
            effects: ['Melee attacks deal 5% splash damage to nearby enemies'],
            icon: 'img/items/agi_gloves.png', // Reusing existing icon
            level: 10
        });
        
        // =============== BOOTS ===============
        
        // LIGHT_BOOTS
        this.registerItem({
            id: 'speed_runners',
            name: 'Speed Runners',
            category: this.CATEGORIES.BOOTS,
            equipmentType: this.EQUIPMENT_TYPES.LIGHT_BOOTS,
            rarity: this.RARITIES.UNCOMMON,
            description: 'Lightweight boots that enhance movement speed.',
            stats: {
                agility: 10,
                evasion: 8,
                attackSpeed: 0.1
            },
            effects: ['Increases movement speed by 15%'],
            icon: 'img/items/reflex_booster.png', // Reusing existing icon
            level: 6
        });
        
        // HEAVY_BOOTS
        this.registerItem({
            id: 'gravity_stompers',
            name: 'Gravity Stompers',
            category: this.CATEGORIES.BOOTS,
            equipmentType: this.EQUIPMENT_TYPES.HEAVY_BOOTS,
            rarity: this.RARITIES.RARE,
            description: 'Heavy boots that manipulate gravity for powerful kicks.',
            stats: {
                strength: 8,
                defense: 12,
                damage: 10
            },
            effects: ['Jump attacks deal 30% increased damage'],
            icon: 'img/items/reflex_booster.png', // Reusing existing icon
            level: 12
        });
        
        // =============== ACCESSORIES ===============
        
        // RING
        this.registerItem({
            id: 'neural_implant',
            name: 'Neural Implant',
            category: this.CATEGORIES.ACCESSORY,
            equipmentType: this.EQUIPMENT_TYPES.RING,
            rarity: this.RARITIES.UNCOMMON,
            description: 'An implant that enhances cognitive functions.',
            stats: {
                intelligence: 10,
                magicDamage: 15
            },
            effects: ['Reduces skill cooldowns by 10%'],
            icon: 'img/items/neural_implant.png',
            level: 3
        });
        
        // BRACELET
        this.registerItem({
            id: 'reflex_booster',
            name: 'Reflex Booster',
            category: this.CATEGORIES.ACCESSORY,
            equipmentType: this.EQUIPMENT_TYPES.BRACELET,
            rarity: this.RARITIES.RARE,
            description: 'A device that enhances reflexes and reaction time.',
            stats: {
                agility: 15,
                attackSpeed: 0.2,
                evasion: 5
            },
            effects: ['20% chance to dodge attacks'],
            icon: 'img/items/reflex_booster.png',
            level: 7
        });
        
        // AMULET
        this.registerItem({
            id: 'chrono_amulet',
            name: 'Chrono Amulet',
            category: this.CATEGORIES.ACCESSORY,
            equipmentType: this.EQUIPMENT_TYPES.AMULET,
            rarity: this.RARITIES.LEGENDARY,
            description: 'An amulet that manipulates the flow of time.',
            stats: {
                attackSpeed: 0.5,
                cooldownReduction: 25,
                evasion: 15
            },
            effects: ['5% chance to reset skill cooldowns after use'],
            icon: 'img/items/chrono_amulet.png',
            level: 20
        });
        
        // NECKLACE
        this.registerItem({
            id: 'neural_necklace',
            name: 'Neural Necklace',
            category: this.CATEGORIES.ACCESSORY,
            equipmentType: this.EQUIPMENT_TYPES.NECKLACE,
            rarity: this.RARITIES.EPIC,
            description: 'A necklace embedded with neural interface chips.',
            stats: {
                intelligence: 18,
                magicDamage: 20,
                magicDefense: 15
            },
            effects: ['Spells have 15% chance to critically hit'],
            icon: 'img/items/chrono_amulet.png', // Reusing existing icon
            level: 15
        });
        
        // CHARM
        this.registerItem({
            id: 'luck_charm',
            name: 'Digital Fortune Charm',
            category: this.CATEGORIES.ACCESSORY,
            equipmentType: this.EQUIPMENT_TYPES.CHARM,
            rarity: this.RARITIES.RARE,
            description: 'A charm that manipulates probability algorithms in your favor.',
            stats: {
                luck: 20,
                critical: 10,
                evasion: 8
            },
            effects: ['10% chance to find additional loot'],
            icon: 'img/items/neural_implant.png', // Reusing existing icon
            level: 10
        });
        
        // Consumables
        this.registerItem({
            id: 'health_stim',
            name: 'Health Stimulator',
            category: this.CATEGORIES.CONSUMABLE,
            rarity: this.RARITIES.COMMON,
            description: 'A stimulant that restores health.',
            stats: {},
            effects: ['Restores 50 HP'],
            icon: 'img/items/health_stim.png',
            level: 1,
            stackable: true,
            maxStack: 10,
            useEffect: function(character) {
                character.heal(50);
                return true; // Item was consumed
            }
        });
        
        this.registerItem({
            id: 'energy_drink',
            name: 'Neon Energy Drink',
            category: this.CATEGORIES.CONSUMABLE,
            rarity: this.RARITIES.UNCOMMON,
            description: 'A drink that temporarily boosts energy and reflexes.',
            stats: {},
            effects: ['Increases attack speed by 50% for 30 seconds'],
            icon: 'img/items/energy_drink.png',
            level: 5,
            stackable: true,
            maxStack: 5,
            useEffect: function(character) {
                character.addBuff('attackSpeed', 0.5, 30);
                return true; // Item was consumed
            }
        });
        
        this.registerItem({
            id: 'nano_repair',
            name: 'Nano Repair Kit',
            category: this.CATEGORIES.CONSUMABLE,
            rarity: this.RARITIES.RARE,
            description: 'A kit that deploys nanobots to repair damage over time.',
            stats: {},
            effects: ['Restores 10 HP per second for 10 seconds'],
            icon: 'img/items/nano_repair.png',
            level: 10,
            stackable: true,
            maxStack: 3,
            useEffect: function(character) {
                character.addHealOverTime(10, 10);
                return true; // Item was consumed
            }
        });
        
        // Materials
        this.registerItem({
            id: 'scrap_metal',
            name: 'Scrap Metal',
            category: this.CATEGORIES.MATERIAL,
            rarity: this.RARITIES.COMMON,
            description: 'Common metal scraps used for crafting.',
            stats: {},
            effects: [],
            icon: 'img/items/scrap_metal.png',
            stackable: true,
            maxStack: 99
        });
        
        this.registerItem({
            id: 'circuit_board',
            name: 'Circuit Board',
            category: this.CATEGORIES.MATERIAL,
            rarity: this.RARITIES.UNCOMMON,
            description: 'Electronic components used for advanced crafting.',
            stats: {},
            effects: [],
            icon: 'img/items/circuit_board.png',
            stackable: true,
            maxStack: 50
        });
        
        this.registerItem({
            id: 'quantum_core',
            name: 'Quantum Core',
            category: this.CATEGORIES.MATERIAL,
            rarity: this.RARITIES.EPIC,
            description: 'A rare material that can manipulate quantum states.',
            stats: {},
            effects: [],
            icon: 'img/items/quantum_core.png',
            stackable: true,
            maxStack: 10
        });
    },
    
    /**
     * Register a new item
     * @param {Object} itemData - Item data
     */
    registerItem: function(itemData) {
        this.registry[itemData.id] = itemData;
    },
    
    /**
     * Get an item by ID
     * @param {string} id - Item ID
     * @returns {Object|null} Item data or null if not found
     */
    getItem: function(id) {
        return this.registry[id] || null;
    },
    
    /**
     * Get an item's icon URL, falling back to a placeholder
     * @param {string} id - Item ID
     * @returns {string} Icon URL or placeholder data URL
     */
    getItemIcon: function(id) {
        const item = this.getItem(id);
        if (!item) return null;
        
        // Create placeholder regardless to avoid network errors
        const placeholderUrl = this.createPlaceholderImage(id);
        
        // Return the placeholder image URL
        return placeholderUrl;
    },
    
    /**
     * Create a new item instance
     * @param {string} id - Item ID
     * @param {number} quantity - Item quantity (for stackable items)
     * @returns {Object|null} Item instance or null if item not found
     */
    createItem: function(id, quantity = 1) {
        const itemData = this.getItem(id);
        if (!itemData) {
            return null;
        }
        
        const item = Object.assign({}, itemData);
        
        if (item.stackable) {
            item.quantity = Math.min(quantity, item.maxStack);
        } else {
            item.quantity = 1;
        }
        
        // Generate a unique instance ID
        item.instanceId = Utils.generateId();
        
        return item;
    },
    
    /**
     * Check if an item is equippable
     * @param {Object} item - Item data
     * @returns {boolean} True if item is equippable
     */
    isEquippable: function(item) {
        return item.category === this.CATEGORIES.WEAPON || 
               item.category === this.CATEGORIES.ARMOR || 
               item.category === this.CATEGORIES.ACCESSORY;
    },
    
    /**
     * Check if an item is usable
     * @param {Object} item - Item data
     * @returns {boolean} True if item is usable
     */
    isUsable: function(item) {
        return item.category === this.CATEGORIES.CONSUMABLE && typeof item.useEffect === 'function';
    },
    
    /**
     * Use an item on a character
     * @param {Object} item - Item data
     * @param {Object} character - Character to use item on
     * @returns {boolean} True if item was used successfully
     */
    useItem: function(item, character) {
        if (!this.isUsable(item)) {
            return false;
        }
        
        return item.useEffect(character);
    },
    
    /**
     * Get items by category
     * @param {string} category - Item category
     * @returns {Array} Array of items in the category
     */
    getItemsByCategory: function(category) {
        return Object.values(this.registry).filter(item => item.category === category);
    },
    
    /**
     * Get items by rarity
     * @param {Object} rarity - Item rarity
     * @returns {Array} Array of items with the rarity
     */
    getItemsByRarity: function(rarity) {
        return Object.values(this.registry).filter(item => item.rarity === rarity);
    },
    
    /**
     * Get items by level range
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Array} Array of items in the level range
     */
    getItemsByLevelRange: function(minLevel, maxLevel) {
        return Object.values(this.registry).filter(item => 
            item.level >= minLevel && item.level <= maxLevel
        );
    },
    
    /**
     * Get a random item
     * @param {Object} options - Filter options (category, rarity, minLevel, maxLevel)
     * @returns {Object|null} Random item or null if no items match
     */
    getRandomItem: function(options = {}) {
        let items = Object.values(this.registry);
        
        if (options.category) {
            items = items.filter(item => item.category === options.category);
        }
        
        if (options.rarity) {
            items = items.filter(item => item.rarity === options.rarity);
        }
        
        if (options.minLevel !== undefined) {
            items = items.filter(item => item.level >= options.minLevel);
        }
        
        if (options.maxLevel !== undefined) {
            items = items.filter(item => item.level <= options.maxLevel);
        }
        
        if (items.length === 0) {
            return null;
        }
        
        return items[Utils.randomInt(0, items.length - 1)];
    },
    
    /**
     * Create a placeholder image for an item
     * @param {string} itemId - Item ID
     * @returns {string} Data URL for the placeholder image
     */
    createPlaceholderImage: function(itemId) {
        const item = this.getItem(itemId);
        if (!item) return null;
        
        // Create a canvas to draw the placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Background color based on rarity
        ctx.fillStyle = item.rarity.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Item name (first letter)
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.name.charAt(0), canvas.width / 2, canvas.height / 2);
        
        // Category icon
        let categorySymbol = '';
        switch (item.category) {
            case this.CATEGORIES.WEAPON: categorySymbol = '⚔️'; break;
            case this.CATEGORIES.ARMOR: categorySymbol = '🛡️'; break;
            case this.CATEGORIES.ACCESSORY: categorySymbol = '💍'; break;
            case this.CATEGORIES.CONSUMABLE: categorySymbol = '🧪'; break;
            case this.CATEGORIES.MATERIAL: categorySymbol = '⚙️'; break;
            case this.CATEGORIES.QUEST: categorySymbol = '📜'; break;
        }
        
        ctx.font = '16px Arial';
        ctx.fillText(categorySymbol, canvas.width / 2, canvas.height - 12);
        
        return canvas.toDataURL();
    }
};
