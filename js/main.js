/**
 * Main game logic for the Cyberpunk MMORPG game
 * Initializes and coordinates all game systems
 */

const Game = {
    // Game state
    isRunning: false,
    isPaused: false,
    lastFrameTime: 0,
    
    // Game systems
    systems: [
        Utils,
        Currency,
        Items,
        Inventory,
        Abilities,
        BuffSystem,
        CharacterSystem,
        MonsterSystem,
        MapSystem,
        GachaSystem,
        ShardSystem,
        DungeonSystem,
        AudioSystem,
        AuthenticationSystem,
        ProfileDashboard
    ],
    
    /**
     * Initialize the game
     */
    init: function() {
        console.log('Initializing Cyberpunk MMORPG...');
        
        // Initialize all game systems
        this.initSystems();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check if this is the first time playing
        const isFirstTime = !Utils.loadFromStorage('gameData');
        if (isFirstTime) {
            this.firstTimeSetup();
        }
        
        // Start the game loop
        this.start();
    },
    
    /**
     * Initialize all game systems
     */
    initSystems: function() {
        // Load saved data
        const savedData = {
            currency: Currency.loadData(),
            inventory: Utils.loadFromStorage('inventory'),
            characters: CharacterSystem.loadData(),
            gacha: GachaSystem.loadData(),
            map: Utils.loadFromStorage('map'),
            shards: ShardSystem.loadData(),
            dungeon: DungeonSystem.loadData(),
            audio: Utils.loadFromStorage('audio_settings'),
            gameData: Utils.loadFromStorage('gameData') || {}
        };
        
        // Initialize authentication system first
        if (typeof AuthenticationSystem !== 'undefined' && typeof AuthenticationSystem.init === 'function') {
            console.log('Initializing Authentication System...');
            AuthenticationSystem.init();
        }
        
        // Initialize profile dashboard after authentication
        if (typeof ProfileDashboard !== 'undefined' && typeof ProfileDashboard.init === 'function') {
            console.log('Initializing Profile Dashboard...');
            ProfileDashboard.init();
        }
        
    // Initialize systems with saved data - in a specific order to handle dependencies
        // First initialize the core systems
        [Utils, Currency, Items, Inventory].forEach(system => {
            if (typeof system.init === 'function') {
                let systemData = null;
                if (system === Currency) systemData = savedData.currency;
                else if (system === Inventory) systemData = savedData.inventory;
                system.init(systemData);
            }
        });
        
        // Then initialize character-related systems
        [CharacterSystem, GachaSystem, ShardSystem].forEach(system => {
            if (typeof system.init === 'function') {
                let systemData = null;
                if (system === CharacterSystem) systemData = savedData.characters;
                else if (system === GachaSystem) systemData = savedData.gacha;
                else if (system === ShardSystem) systemData = savedData.shards;
                system.init(systemData);
            }
        });
        
        // Then initialize map and environment systems
        [MapSystem, DungeonSystem, MonsterSystem, BuffSystem, Abilities].forEach(system => {
            if (typeof system.init === 'function') {
                let systemData = null;
                if (system === MapSystem) systemData = savedData.map;
                else if (system === DungeonSystem) systemData = savedData.dungeon;
                system.init(systemData);
            }
        });
        
        // Initialize audio system last
        if (typeof AudioSystem !== 'undefined' && typeof AudioSystem.init === 'function') {
            AudioSystem.init(savedData.audio);
            
            // Start playing the default background music
            if (DungeonSystem.currentDungeon) {
                AudioSystem.playBackgroundMusic(DungeonSystem.currentDungeon.id);
            } else {
                AudioSystem.playBackgroundMusic('lovecity');
            }
        }
    },
    
    /**
     * Set up game event listeners
     */
    setupEventListeners: function() {
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },
    
    /**
     * Handle window resize
     */
    handleResize: function() {
        // Reposition characters
        CharacterSystem.getActiveCharacters().forEach(character => {
            CharacterSystem.positionCharacter(character);
        });
    },
    
    /**
     * First time setup for new players
     */
    firstTimeSetup: function() {
        console.log('First time setup...');
        
        // Give initial currency
        Currency.addCopper(500);
        
        // Create initial character (Devin)
        const initialCharacter = GachaSystem.characterTemplates.find(char => char.id === 'devin');
        if (initialCharacter) {
            const character = CharacterSystem.createCharacter(initialCharacter);
            CharacterSystem.activateCharacter(character.id);
        }
        
        // Add starter items - one of each equipment type
        // Right Hand Weapons
        this.createAndAddStarterItem('basic_sword', 'Basic Sword', 'A simple sword for beginners.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.COMMON, 
            { damage: 10, attackSpeed: 1.0 }, 
            ['Right Hand Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.SWORD });
            
        this.createAndAddStarterItem('basic_dagger', 'Basic Dagger', 'A simple dagger for beginners.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.COMMON, 
            { damage: 7, attackSpeed: 1.3 }, 
            ['Right Hand Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.DAGGER });
            
        // Dual Wield Weapons
        this.createAndAddStarterItem('dual_daggers', 'Dual Daggers', 'A pair of matching daggers.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 15, attackSpeed: 1.5, critical: 5 }, 
            ['Dual Wield Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.DUAL_DAGGER, isDualWield: true });
            
        this.createAndAddStarterItem('dual_blades', 'Dual Blades', 'A pair of curved blades.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 18, attackSpeed: 1.3, critical: 3 }, 
            ['Dual Wield Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.DUAL_BLADE, isDualWield: true });
            
        // Ranged Weapons
        this.createAndAddStarterItem('basic_bow', 'Hunting Bow', 'A simple bow for hunting and combat.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 12, attackSpeed: 0.8, range: 120 }, 
            ['Ranged Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.BOW, isDualWield: true });
            
        this.createAndAddStarterItem('light_crossbow', 'Light Crossbow', 'A compact crossbow with good accuracy.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 15, attackSpeed: 0.7, range: 150 }, 
            ['Ranged Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.CROSSBOW, isDualWield: true });
            
        // Special Weapons
        this.createAndAddStarterItem('basic_staff', 'Apprentice Staff', 'A wooden staff imbued with magical energy.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 8, magicDamage: 15, intelligence: 5 }, 
            ['Magic Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.STAFF });
            
        this.createAndAddStarterItem('training_katana', 'Training Katana', 'A katana used for practice.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 14, attackSpeed: 1.2, critical: 8 }, 
            ['Specialized Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.KATANA, isDualWield: true });
            
        this.createAndAddStarterItem('combat_knuckles', 'Combat Knuckles', 'Metal knuckles for close combat.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 10, attackSpeed: 1.8, evasion: 5 }, 
            ['Close Combat Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.KNUCKLES, isDualWield: true });
            
        this.createAndAddStarterItem('practice_spear', 'Practice Spear', 'A training spear with good reach.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 12, attackSpeed: 0.9, range: 20 }, 
            ['Reach Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.SPEAR });
            
        this.createAndAddStarterItem('training_scythe', 'Training Scythe', 'A blunt scythe for practice.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 16, attackSpeed: 0.7, critical: 5 }, 
            ['Sweeping Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.SCYTHE });
            
        this.createAndAddStarterItem('apprentice_wand', 'Apprentice Wand', 'A simple wand for beginners.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 5, magicDamage: 12, intelligence: 3 }, 
            ['Magic Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.WAND });
            
        this.createAndAddStarterItem('novice_grimoire', 'Novice Grimoire', 'A book of basic spells.', 
            Items.CATEGORIES.WEAPON, Items.RARITIES.UNCOMMON, 
            { damage: 3, magicDamage: 18, intelligence: 8 }, 
            ['Magic Weapon'], 
            { equipmentType: Items.EQUIPMENT_TYPES.GRIMOIRE });
            
        // Armor
        this.createAndAddStarterItem('basic_armor', 'Basic Armor', 'Simple protective gear.', 
            Items.CATEGORIES.ARMOR, Items.RARITIES.COMMON, 
            { defense: 15, hp: 20 }, 
            ['Basic Protection']);
            
        this.createAndAddStarterItem('adventure_clothes', 'Adventure Clothes', 'Durable clothing for adventurers.', 
            Items.CATEGORIES.ARMOR, Items.RARITIES.COMMON, 
            { defense: 8, evasion: 5, agility: 2 }, 
            ['Lightweight Protection'], 
            { equipmentType: 'adventure_clothes' });
            
        // Gloves
        this.createAndAddStarterItem('basic_gloves', 'Basic Gloves', 'Simple hand protection.', 
            Items.CATEGORIES.GLOVES, Items.RARITIES.COMMON, 
            { defense: 5, attackSpeed: 0.1 }, 
            ['Improves grip']);
            
        // Boots
        this.createAndAddStarterItem('basic_boots', 'Basic Boots', 'Simple footwear.', 
            Items.CATEGORIES.BOOTS, Items.RARITIES.COMMON, 
            { defense: 5, evasion: 2 }, 
            ['Improves mobility']);
            
        this.createAndAddStarterItem('adventure_shoes', 'Adventure Shoes', 'Comfortable shoes for long journeys.', 
            Items.CATEGORIES.BOOTS, Items.RARITIES.COMMON, 
            { defense: 3, evasion: 4, agility: 1 }, 
            ['Comfortable walking'], 
            { equipmentType: 'shoes' });
            
        // Accessories
        this.createAndAddStarterItem('basic_ring', 'Basic Ring', 'A simple ring with minor enchantments.', 
            Items.CATEGORIES.ACCESSORY, Items.RARITIES.COMMON, 
            { magicDamage: 5, critical: 2 }, 
            ['Minor magic boost'], 
            { equipmentType: Items.EQUIPMENT_TYPES.RING });
            
        this.createAndAddStarterItem('basic_necklace', 'Basic Necklace', 'A simple necklace with a small gemstone.', 
            Items.CATEGORIES.ACCESSORY, Items.RARITIES.COMMON, 
            { magicDefense: 3, hp: 15 }, 
            ['Slight protection'], 
            { equipmentType: Items.EQUIPMENT_TYPES.NECKLACE });
            
        this.createAndAddStarterItem('basic_amulet', 'Basic Amulet', 'A simple amulet with protective properties.', 
            Items.CATEGORIES.ACCESSORY, Items.RARITIES.COMMON, 
            { magicDefense: 5, hp: 10 }, 
            ['Minor protection'], 
            { equipmentType: Items.EQUIPMENT_TYPES.AMULET });
            
        this.createAndAddStarterItem('luck_charm', 'Luck Charm', 'A small charm that brings good luck.', 
            Items.CATEGORIES.ACCESSORY, Items.RARITIES.COMMON, 
            { luck: 3, critical: 1 }, 
            ['Slight luck increase'], 
            { equipmentType: Items.EQUIPMENT_TYPES.CHARM });
            
        this.createAndAddStarterItem('basic_bracelet', 'Basic Bracelet', 'A simple bracelet with minor enchantments.', 
            Items.CATEGORIES.ACCESSORY, Items.RARITIES.COMMON, 
            { attackSpeed: 0.1, evasion: 1 }, 
            ['Slight reflex boost'], 
            { equipmentType: Items.EQUIPMENT_TYPES.BRACELET });
            
        // Consumables - health stims
        Inventory.addItem('health_stim', 3);
        
        // Add Character Shard as a utility item
        this.createAndAddStarterItem('character_shard', 'Character Shard', 'Used to upgrade characters.', 
            Items.CATEGORIES.UTILITY, Items.RARITIES.UNCOMMON, 
            {}, 
            ['Used in character upgrades'], 
            { stackable: true, maxStack: 99 });
            
        // Save initial game data
        Utils.saveToStorage('gameData', {
            firstTimeSetup: true,
            startDate: new Date().toISOString()
        });
    },
    
    /**
     * Create and add a starter item
     * @param {string} id - Item ID
     * @param {string} name - Item name
     * @param {string} description - Item description
     * @param {string} category - Item category
     * @param {Object} rarity - Item rarity
     * @param {Object} stats - Item stats
     * @param {Array} effects - Item effects
     * @param {Object} extraProps - Extra properties
     */
    createAndAddStarterItem: function(id, name, description, category, rarity, stats = {}, effects = [], extraProps = {}) {
        // Register the item first
        const itemData = {
            id: id,
            name: name,
            category: category,
            rarity: rarity,
            description: description,
            stats: stats,
            effects: effects,
            level: 1,
            ...extraProps
        };
        
        // Register with Items system
        Items.registerItem(itemData);
        
        // Add to inventory
        Inventory.addItem(id, 1);
    },
    
    /**
     * Start the game
     */
    start: function() {
        if (this.isRunning) return;
        
        console.log('Starting game...');
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        
        // Start map movement
        MapSystem.startMovement();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    /**
     * Pause the game
     */
    pause: function() {
        if (!this.isRunning || this.isPaused) return;
        
        console.log('Pausing game...');
        this.isPaused = true;
        
        // Stop map movement
        MapSystem.stopMovement();
    },
    
    /**
     * Resume the game
     */
    resume: function() {
        if (!this.isRunning || !this.isPaused) return;
        
        console.log('Resuming game...');
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        
        // Resume map movement
        MapSystem.startMovement();
        
        // Resume game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    /**
     * Stop the game
     */
    stop: function() {
        if (!this.isRunning) return;
        
        console.log('Stopping game...');
        this.isRunning = false;
        this.isPaused = false;
        
        // Stop map movement
        MapSystem.stopMovement();
        
        // Save game data
        this.saveGameData();
    },
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp
     */
    gameLoop: function(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update game state
        this.update(deltaTime);
        
        // Continue the loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    /**
     * Update game state - with performance optimizations
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update: function(deltaTime) {
        // Update map system only if needed
        if (!MapSystem.isMoving) {
            MapSystem.startMovement();
        }

        // Throttle UI updates to improve performance
        // Only update UI every 5 frames (approximately 80ms at 60fps)
        const currentFrame = Math.floor(this.lastFrameTime / 16.667); // frame count at 60fps
        const shouldUpdateUI = currentFrame % 5 === 0;

        // Update characters
        CharacterSystem.updateCharacters(deltaTime);
        
        // Update monsters
        MonsterSystem.updateMonsters(deltaTime);
        
        // Less frequent UI updates to reduce DOM operations
        if (shouldUpdateUI) {
            const activeCharacter = this.getActiveCharacter();
            if (activeCharacter && window.UIManager) {
                UIManager.updateCharacterStatsDisplay(activeCharacter);
            }
        }
    },
    
    /**
     * Save all game data
     */
    saveGameData: function() {
        // Each system should save its own data
        // This is just a convenience method to save everything at once
        Currency.saveData();
        Utils.saveToStorage('inventory', Inventory.saveData());
        CharacterSystem.saveData();
        GachaSystem.saveData();
        ShardSystem.saveData();
        DungeonSystem.saveData();
        Utils.saveToStorage('map', MapSystem.saveData());
        
        // Save general game data
        Utils.saveToStorage('gameData', {
            lastSaved: new Date().toISOString(),
            playTime: this.getPlayTime(),
            firstTimeSetup: true
        });
    },
    
    /**
     * Get total play time in seconds
     * @returns {number} Play time in seconds
     */
    getPlayTime: function() {
        const gameData = Utils.loadFromStorage('gameData') || {};
        const startDate = gameData.startDate ? new Date(gameData.startDate) : new Date();
        const playTime = gameData.playTime || 0;
        
        // Add time since last save
        return playTime + (new Date() - startDate) / 1000;
    },
    
    /**
     * Handle map completion
     * Called by MapSystem when the player reaches the end of the map
     */
    onMapCompleted: function() {
        console.log('Map completed!');
        
        // Reset buffs
        BuffSystem.resetForNewDungeon();
        
        // Award bonus currency
        Currency.addCopper(1000);
        
        // Show completion message
        Utils.createDamageText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Dungeon Completed!',
            '#ffff00'
        );
    },
    
    /**
     * Create a monster
     * @param {string} type - Monster type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} Created monster
     */
    createMonster: function(type, x, y) {
        return MonsterSystem.createMonster(type, x, y);
    },
    
    /**
     * Get the active character
     * @returns {Object|null} Active character or null if none
     */
    getActiveCharacter: function() {
        return CharacterSystem.getActiveCharacter();
    },
    
    /**
     * Get all active characters
     * @returns {Array} Array of active characters
     */
    getActiveCharacters: function() {
        return CharacterSystem.getActiveCharacters();
    },
    
    /**
     * Update character stats
     * Recalculates stats for a specific character or all active characters
     * @param {string|null} characterId - Optional character ID, if null updates all active characters
     */
    updateCharacterStats: function(characterId = null) {
        if (characterId) {
            // Update specific character
            const character = CharacterSystem.getCharacterById(characterId);
            if (character) {
                CharacterSystem.calculateDerivedStats(character);
            }
        } else {
            // Update all active characters
            CharacterSystem.getActiveCharacters().forEach(character => {
                CharacterSystem.calculateDerivedStats(character);
            });
        }
    }
};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
