/**
 * Cyberpunk-themed Gacha System for the MMORPG game
 * Enhanced with Three.js visual effects
 */

const GachaSystem = {
    // Gacha types and rates
    gachaTypes: {
        mortal: {
            name: 'Mortal DNA',
            description: 'Common characters with basic abilities.',
            cost: {
                currency: 'copper',
                amount: 50
            },
            rates: {
                common: 0.70,    // 70%
                uncommon: 0.25,  // 25%
                rare: 0.04,      // 4%
                epic: 0.009,     // 0.9%
                legendary: 0.001 // 0.1%
            }
        },
        synthetic: {
            name: 'Synthetic DNA',
            description: 'Rare characters with enhanced abilities.',
            cost: {
                currency: 'silver',
                amount: 50
            },
            rates: {
                common: 0.40,    // 40%
                uncommon: 0.40,  // 40%
                rare: 0.15,      // 15%
                epic: 0.04,      // 4%
                legendary: 0.01  // 1%
            }
        },
        divine: {
            name: 'Divine DNA',
            description: 'Legendary characters with powerful abilities.',
            cost: {
                currency: 'gold',
                amount: 10
            },
            rates: {
                common: 0.10,    // 10%
                uncommon: 0.30,  // 30%
                rare: 0.40,      // 40%
                epic: 0.15,      // 15%
                legendary: 0.05  // 5%
            }
        }
    },
    
    // Super DNA system - tracks pulls for each gacha type
    pullCounter: {
        mortal: 0,
        synthetic: 0,
        divine: 0
    },
    
    // Super DNA threshold (after 20 pulls, get double rarity multiplier)
    superDnaThreshold: 20,
    
    // Track if Super DNA is available for each type
    superDnaAvailable: {
        mortal: false,
        synthetic: false,
        divine: false
    },
    
    // Gacha images
    gachaImages: {
        mortal: 'img/gacha/mortal.png',
        synthetic: 'img/gacha/synthetic.png',
        divine: 'img/gacha/divine.png'
    },
    
    /**
     * Initialize the gacha system
     */
    init: function(savedData = null) {
        // Reset pull counter and Super DNA availability
        this.pullCounter = {
            mortal: 0,
            synthetic: 0,
            divine: 0
        };
        
        this.superDnaAvailable = {
            mortal: false,
            synthetic: false,
            divine: false
        };
        
        // Load saved data if available
        if (savedData) {
            this.pullCounter = savedData.pullCounter || this.pullCounter;
            
            // Check if Super DNA is available based on pull count
            for (const type in this.pullCounter) {
                if (this.pullCounter[type] >= this.superDnaThreshold) {
                    this.superDnaAvailable[type] = true;
                }
            }
            
            console.log('Super DNA availability:', this.superDnaAvailable);
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize Three.js environment
        GachaThreeEnvironment.init();
        
        // Initialize marketplace
        this.initMarketplace();
        
        // Initialize skip animation checkbox
        this.initSkipAnimationCheckbox();
        
        console.log('Cyberpunk Gacha system initialized');
    },
    
    /**
     * Initialize the marketplace system
     */
    initMarketplace: function() {
        // Create marketplace UI if it doesn't exist
        let marketplaceModal = document.getElementById('marketplace-modal');
        if (!marketplaceModal) {
            marketplaceModal = document.createElement('div');
            marketplaceModal.id = 'marketplace-modal';
            marketplaceModal.className = 'modal marketplace-modal';
            
            marketplaceModal.innerHTML = `
                <div class="modal-content cyberpunk-modal">
                    <div class="modal-header">
                        <h2 class="modal-title">CYBERPUNK MARKETPLACE</h2>
                        <span class="close-modal" onclick="Utils.hideModal('marketplace-modal')">&times;</span>
                    </div>
                    <div class="modal-body">
                        <!-- Marketplace Three.js container -->
                        <div id="marketplace-three-container"></div>
                        
                        <!-- Marketplace header with balance -->
                        <div class="marketplace-header">
                            <div class="marketplace-balance">
                                <div class="balance-item">
                                    <span class="balance-icon">₵</span>
                                    <span id="marketplace-copper">0</span>
                                </div>
                                <div class="balance-item">
                                    <span class="balance-icon">Ⓢ</span>
                                    <span id="marketplace-silver">0</span>
                                </div>
                                <div class="balance-item">
                                    <span class="balance-icon">Ⓖ</span>
                                    <span id="marketplace-gold">0</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Marketplace tabs -->
                        <div id="marketplace-tabs">
                            <button class="marketplace-tab active" data-tab="junk-store">Junk Store</button>
                            <button class="marketplace-tab" data-tab="black-market">Black Market</button>
                            <button class="marketplace-tab" data-tab="neon-bazaar">Neon Bazaar</button>
                        </div>
                        
                        <!-- Marketplace tab content -->
                        <div id="marketplace-content">
                            <div id="marketplace-junk-store" class="marketplace-tab-content active">
                                <div class="marketplace-section">
                                    <h3 class="section-title">SELL YOUR ITEMS</h3>
                                    <div class="marketplace-rates">
                                        <div class="rate-info">Common/Uncommon items: <span class="rate-value">10 <span class="currency-icon">Ⓒ</span></span></div>
                                        <div class="rate-info">Rare/Epic items: <span class="rate-value">10 <span class="currency-icon">Ⓢ</span></span></div>
                                        <div class="rate-info">Legendary items: <span class="rate-value">10 <span class="currency-icon">Ⓖ</span></span></div>
                                    </div>
                                    
                                    <!-- Bulk Sell Container -->
                                    <div class="bulk-sell-container">
                                        <button class="bulk-sell-button">BULK SELL <span class="dropdown-arrow">▼</span></button>
                                        <div class="rarity-dropdown">
                                            <div class="rarity-option" data-rarity="common">Common</div>
                                            <div class="rarity-option" data-rarity="uncommon">Uncommon</div>
                                            <div class="rarity-option" data-rarity="rare">Rare</div>
                                            <div class="rarity-option" data-rarity="epic">Epic</div>
                                            <div class="rarity-option" data-rarity="legendary">Legendary</div>
                                            <div class="rarity-option" data-rarity="all">All Items</div>
                                        </div>
                                    </div>
                                    
                                    <div class="marketplace-grid" id="junk-store-items"></div>
                                </div>
                            </div>
                            <div id="marketplace-black-market" class="marketplace-tab-content">
                                <div class="marketplace-section">
                                    <h3 class="section-title">BLACK MARKET DEALS</h3>
                                    <p class="section-desc">Weapons, armor and accessories sold by underground dealers. Inventory refreshes daily.</p>
                                    <div class="marketplace-grid" id="black-market-items"></div>
                                </div>
                            </div>
                            <div id="marketplace-neon-bazaar" class="marketplace-tab-content">
                                <div class="marketplace-coming-soon">
                                    <div class="coming-soon-text">
                                        <h3>PLAYER MARKETPLACE</h3>
                                        <p>The Neon Bazaar where players can trade items will be opening soon.</p>
                                        <div class="neon-sign">COMING SOON</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(marketplaceModal);
            
            // Add event listeners for tabs
            const tabs = marketplaceModal.querySelectorAll('.marketplace-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Hide all tab content
                    const tabContents = marketplaceModal.querySelectorAll('.marketplace-tab-content');
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Show clicked tab content
                    const tabName = tab.dataset.tab;
                    const tabContent = document.getElementById(`marketplace-${tabName}`);
                    if (tabContent) {
                        tabContent.classList.add('active');
                    }
                });
            });
        }
        
        // Add marketplace button to menu if it doesn't exist
        const menuButtons = document.getElementById('menu-buttons');
        if (menuButtons && !document.getElementById('marketplace-button')) {
            const marketplaceButton = document.createElement('button');
            marketplaceButton.id = 'marketplace-button';
            marketplaceButton.className = 'menu-button';
            marketplaceButton.textContent = 'Marketplace';
            marketplaceButton.addEventListener('click', () => {
                this.openMarketplace();
            });
            
            menuButtons.appendChild(marketplaceButton);
        }
    },
    
    /**
     * Open the marketplace UI
     */
    openMarketplace: function() {
        // Initialize Three.js environment if not already initialized
        if (MarketplaceThreeEnvironment && 
            typeof MarketplaceThreeEnvironment.init === 'function' && 
            !MarketplaceThreeEnvironment.scene) {
            MarketplaceThreeEnvironment.init('marketplace-three-container');
        }
        
        // Update currency display in marketplace
        this.updateMarketplaceCurrency();
        
        // Update marketplace UI with items
        this.updateMarketplaceUI();
        
        // Show marketplace modal
        Utils.showModal('marketplace-modal');
    },
    
    /**
     * Update currency display in marketplace
     */
    updateMarketplaceCurrency: function() {
        if (typeof Currency !== 'undefined') {
            const copperDisplay = document.getElementById('marketplace-copper');
            const silverDisplay = document.getElementById('marketplace-silver');
            const goldDisplay = document.getElementById('marketplace-gold');
            
            if (copperDisplay) copperDisplay.textContent = Currency.copper || 0;
            if (silverDisplay) silverDisplay.textContent = Currency.silver || 0;
            if (goldDisplay) goldDisplay.textContent = Currency.gold || 0;
        }
    },
    
    /**
     * Update marketplace UI
     */
    updateMarketplaceUI: function() {
        // Update currency display
        this.updateMarketplaceCurrency();
        
        // Update Junk Store (for selling items)
        const junkStoreContainer = document.getElementById('junk-store-items');
        if (junkStoreContainer) {
            junkStoreContainer.innerHTML = '';
            
            // Get player's inventory items (if available)
            const playerItems = this.getPlayerInventoryItems();
            
            if (playerItems && playerItems.length > 0) {
                // Group items by rarity
                const itemsByRarity = this.groupItemsByRarity(playerItems);
                
                // Setup bulk sell dropdown functionality
                this.setupBulkSellDropdown(itemsByRarity);
                
                // Display items for selling
                for (const rarity in itemsByRarity) {
                    const items = itemsByRarity[rarity];
                    items.forEach(item => {
                        const sellValue = this.getSellValueForRarity(rarity);
                        const currencyIcon = ['common', 'uncommon'].includes(rarity.toLowerCase()) ? 'Ⓒ' : 'Ⓢ';
                        
                        const itemCard = document.createElement('div');
                        itemCard.className = 'marketplace-item';
                        itemCard.innerHTML = `
                            <div class="item-image-container">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="item-info">
                                <h3 class="item-name">${item.name}</h3>
                                <div class="item-rarity rarity-${rarity.toLowerCase()}">${rarity.toUpperCase()}</div>
                                <p class="item-description">${item.description}</p>
                                <div class="item-sell-value">
                                    <span>Sell value: ${sellValue} ${currencyIcon}</span>
                                </div>
                                <button class="sell-button" data-item-id="${item.id}" data-rarity="${rarity.toLowerCase()}">SELL</button>
                            </div>
                        `;
                        
                        junkStoreContainer.appendChild(itemCard);
                        
                        // Add event listener for sell button
                        const sellButton = itemCard.querySelector('.sell-button');
                        if (sellButton) {
                            sellButton.addEventListener('click', (e) => {
                                const itemId = e.target.dataset.itemId;
                                const rarity = e.target.dataset.rarity;
                                this.sellItem(itemId, rarity);
                            });
                        }
                    });
                }
            } else {
                junkStoreContainer.innerHTML = `
                    <div class="marketplace-message">
                        <p>Your inventory is empty. Find items while exploring to sell them here.</p>
                    </div>
                `;
            }
        }
        
        // Update Black Market (randomly generated weapons, armor, accessories)
        const blackMarketContainer = document.getElementById('black-market-items');
        if (blackMarketContainer) {
            blackMarketContainer.innerHTML = '';
            
            // Get today's black market items (randomly generated)
            const blackMarketItems = this.getBlackMarketItems();
            
            if (blackMarketItems && blackMarketItems.length > 0) {
                blackMarketItems.forEach(item => {
                    const currencyIcon = this.getCurrencyIconForCost(item.cost);
                    
                    const itemCard = document.createElement('div');
                    itemCard.className = 'marketplace-item black-market-item';
                    itemCard.innerHTML = `
                        <div class="item-image-container">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="item-info">
                            <h3 class="item-name">${item.name}</h3>
                            <div class="item-rarity rarity-${item.rarity.toLowerCase()}">${item.rarity.toUpperCase()}</div>
                            <div class="item-type">${item.type}</div>
                            <p class="item-description">${item.description}</p>
                            <div class="item-stats">
                                ${this.generateItemStatsHTML(item)}
                            </div>
                            <div class="item-cost">
                                <span class="cost-icon">${currencyIcon}</span>
                                <span class="cost-value">${item.cost.amount}</span>
                            </div>
                            <button class="purchase-button" data-item-id="${item.id}">PURCHASE</button>
                        </div>
                    `;
                    
                    blackMarketContainer.appendChild(itemCard);
                    
                    // Add event listener for purchase button
                    const purchaseButton = itemCard.querySelector('.purchase-button');
                    if (purchaseButton) {
                        purchaseButton.addEventListener('click', (e) => {
                            const itemId = e.target.dataset.itemId;
                            this.purchaseBlackMarketItem(itemId);
                        });
                    }
                });
            } else {
                blackMarketContainer.innerHTML = `
                    <div class="marketplace-message">
                        <p>No black market items available. Check back later.</p>
                    </div>
                `;
            }
        }
    },
    
    /**
     * Group items by rarity for the Junk Store
     */
    groupItemsByRarity: function(items) {
        const result = {};
        
        // For demonstration, we'll use sample items if inventory system is not available
        const sampleItems = [
            {
                id: 'item1',
                name: 'Broken Neural Chip',
                image: 'img/items/circuit_board.png',
                rarity: 'Common',
                description: 'A damaged neural chip. Barely worth anything.'
            },
            {
                id: 'item2',
                name: 'Used Energy Cell',
                image: 'img/items/energy_drink.png',
                rarity: 'Common',
                description: 'A depleted energy cell. Can be recycled for copper.'
            },
            {
                id: 'item3',
                name: 'Scrap Metal',
                image: 'img/items/scrap_metal.png',
                rarity: 'Uncommon',
                description: 'Lightweight alloy scrap. Useful for basic crafting.'
            },
            {
                id: 'item4',
                name: 'Health Stim',
                image: 'img/items/health_stim.png',
                rarity: 'Rare',
                description: 'A medical stimulant. Provides quick healing in combat.'
            }
        ];
        
        // Use actual inventory or sample items
        const itemList = items && items.length > 0 ? items : sampleItems;
        
        // Group items by rarity
        itemList.forEach(item => {
            const rarity = item.rarity || 'Common';
            if (!result[rarity]) {
                result[rarity] = [];
            }
            result[rarity].push(item);
        });
        
        return result;
    },
    
    /**
     * Get sell value based on item rarity
     */
    getSellValueForRarity: function(rarity) {
        switch(rarity.toLowerCase()) {
            case 'common':
            case 'uncommon':
                return 10; // 10 copper
            case 'rare':
            case 'epic':
                return 10; // 10 silver
            case 'legendary':
                return 10; // 10 gold
            default:
                return 1;
        }
    },
    
    /**
     * Get random Black Market items
     */
    getBlackMarketItems: function() {
        // In a real implementation, these would be randomly generated or from a server
        return [
            {
                id: 'weapon1',
                name: 'Quantum Blade',
                image: 'img/items/cyber_blade.png',
                type: 'Weapon - Melee',
                rarity: 'Epic',
                description: 'A vibrating blade that phases through armor.',
                stats: {
                    damage: 85,
                    speed: 7,
                    critical: 15
                },
                cost: {
                    currency: 'silver',
                    amount: 250
                }
            },
            {
                id: 'weapon2',
                name: 'Plasma Pistol',
                image: 'img/items/plasma_pistol.png',
                type: 'Weapon - Ranged',
                rarity: 'Rare',
                description: 'Compact energy weapon that fires superheated plasma bolts.',
                stats: {
                    damage: 62,
                    range: 30,
                    accuracy: 12
                },
                cost: {
                    currency: 'silver',
                    amount: 180
                }
            },
            {
                id: 'armor1',
                name: 'Nano-Weave Vest',
                image: 'img/items/synth_vest.png',
                type: 'Armor - Chest',
                rarity: 'Rare',
                description: 'Lightweight armor with reactive protection matrix.',
                stats: {
                    defense: 45,
                    weight: 3,
                    resistance: 12
                },
                cost: {
                    currency: 'silver',
                    amount: 150
                }
            },
            {
                id: 'armor2',
                name: 'Quantum Shield',
                image: 'img/items/quantum_shield.png',
                type: 'Armor - Shield',
                rarity: 'Epic',
                description: 'Projects a quantum barrier that absorbs incoming damage.',
                stats: {
                    defense: 70,
                    energy: 25,
                    recharge: 8
                },
                cost: {
                    currency: 'silver',
                    amount: 220
                }
            },
            {
                id: 'accessory1',
                name: 'Neuro-Reflex Implant',
                image: 'img/items/neural_implant.png',
                type: 'Accessory - Implant',
                rarity: 'Epic',
                description: 'Enhances neural response time and precision.',
                stats: {
                    agility: 15,
                    reflexes: 20,
                    accuracy: 10
                },
                cost: {
                    currency: 'gold',
                    amount: 5
                }
            },
            {
                id: 'accessory2',
                name: 'Chrono Amulet',
                image: 'img/items/chrono_amulet.png',
                type: 'Accessory - Neck',
                rarity: 'Rare',
                description: 'Ancient device that slightly bends time around the wearer.',
                stats: {
                    speed: 10,
                    cooldown: 15,
                    evasion: 8
                },
                cost: {
                    currency: 'silver',
                    amount: 175
                }
            }
        ];
    },
    
    /**
     * Generate HTML for item stats
     * @param {Object} item - The item containing stats
     * @returns {string} HTML string with the stats
     */
    generateItemStatsHTML: function(item) {
        if (!item.stats) return '';
        
        let statsHtml = '<div class="item-stats-grid">';
        
        for (const [stat, value] of Object.entries(item.stats)) {
            statsHtml += `
                <div class="stat-row">
                    <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                    <span class="stat-value">${value}</span>
                </div>
            `;
        }
        
        statsHtml += '</div>';
        return statsHtml;
    },
    
    /**
     * Get currency icon for display
     */
    getCurrencyIconForCost: function(cost) {
        if (!cost || !cost.currency) return 'Ⓒ';
        
        switch(cost.currency.toLowerCase()) {
            case 'copper': return 'Ⓒ';
            case 'silver': return 'Ⓢ';
            case 'gold': return 'Ⓖ';
            default: return '◈';
        }
    },
    
    /**
     * Setup the bulk sell dropdown functionality
     * @param {Object} itemsByRarity - Items grouped by rarity
     */
    setupBulkSellDropdown: function(itemsByRarity) {
        // Get the bulk sell button and dropdown
        const bulkSellButton = document.querySelector('.bulk-sell-button');
        const rarityDropdown = document.querySelector('.rarity-dropdown');
        
        if (!bulkSellButton || !rarityDropdown) return;
        
        // Show/hide dropdown when button is clicked
        bulkSellButton.addEventListener('click', () => {
            rarityDropdown.classList.toggle('active');
        });
        
        // Add click event to rarity options
        const rarityOptions = document.querySelectorAll('.rarity-option');
        rarityOptions.forEach(option => {
            const rarity = option.dataset.rarity;
            
            // Calculate how many items of this rarity exist
            let itemCount = 0;
            if (rarity === 'all') {
                // Count all items
                for (const r in itemsByRarity) {
                    itemCount += itemsByRarity[r].length;
                }
            } else if (itemsByRarity[rarity]) {
                itemCount = itemsByRarity[rarity].length;
            }
            
            // Add count to the option text
            option.textContent = `${option.textContent} (${itemCount})`;
            
            // Add click handler
            option.addEventListener('click', () => {
                this.bulkSellByRarity(rarity);
                rarityDropdown.classList.remove('active');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!bulkSellButton.contains(e.target) && !rarityDropdown.contains(e.target)) {
                rarityDropdown.classList.remove('active');
            }
        });
    },
    
    /**
     * Bulk sell items by rarity
     * @param {string} rarity - The rarity to sell, or 'all' for all items
     */
    bulkSellByRarity: function(rarity) {
        // Get player's inventory
        const playerItems = this.getPlayerInventoryItems();
        if (!playerItems || playerItems.length === 0) return;
        
        // Filter items by rarity
        let itemsToSell = [];
        if (rarity === 'all') {
            itemsToSell = playerItems;
        } else {
            itemsToSell = playerItems.filter(item => 
                (item.rarity || '').toLowerCase() === rarity.toLowerCase()
            );
        }
        
        if (itemsToSell.length === 0) {
            this.showMarketplaceMessage(`No ${rarity !== 'all' ? rarity : ''} items to sell`, 'error');
            return;
        }
        
        // Calculate total value
        let totalCopper = 0;
        let totalSilver = 0;
        let totalGold = 0;
        
        itemsToSell.forEach(item => {
            const itemRarity = (item.rarity || 'common').toLowerCase();
            const sellValue = this.getSellValueForRarity(itemRarity);
            
            if (['common', 'uncommon'].includes(itemRarity)) {
                totalCopper += sellValue;
            } else if (['rare', 'epic'].includes(itemRarity)) {
                totalSilver += sellValue;
            } else if (itemRarity === 'legendary') {
                totalGold += sellValue;
            }
        });
        
        // Sell the items
        if (typeof Currency !== 'undefined' && typeof Currency.add === 'function') {
            if (totalCopper > 0) Currency.add('copper', totalCopper);
            if (totalSilver > 0) Currency.add('silver', totalSilver);
            if (totalGold > 0) Currency.add('gold', totalGold);
            
            // Remove items from inventory
            if (typeof InventorySystem !== 'undefined' && typeof InventorySystem.removeItem === 'function') {
                itemsToSell.forEach(item => {
                    InventorySystem.removeItem(item.id);
                });
            }
            
            // Update UI
            this.updateMarketplaceUI();
            
            // Build success message
            let message = `Sold ${itemsToSell.length} items for `;
            const currencies = [];
            if (totalCopper > 0) currencies.push(`${totalCopper} Ⓒ`);
            if (totalSilver > 0) currencies.push(`${totalSilver} Ⓢ`);
            if (totalGold > 0) currencies.push(`${totalGold} Ⓖ`);
            
            message += currencies.join(', ');
            this.showMarketplaceMessage(message, 'success');
        } else {
            console.error('Currency system not available');
        }
    },
    
    /**
     * Sell an item from player's inventory
     */
    sellItem: function(itemId, rarity) {
        // Get the currency type and amount
        const isLowRarity = ['common', 'uncommon'].includes(rarity);
        const currencyType = isLowRarity ? 'copper' : 'silver';
        const amount = this.getSellValueForRarity(rarity);
        
        // Check if Currency system exists
        if (typeof Currency !== 'undefined' && typeof Currency.add === 'function') {
            Currency.add(currencyType, amount);
            
            // Remove item from inventory (if inventory system exists)
            if (typeof InventorySystem !== 'undefined' && typeof InventorySystem.removeItem === 'function') {
                InventorySystem.removeItem(itemId);
            }
            
            // Update UI
            this.updateMarketplaceUI();
            
            // Show success message
            this.showMarketplaceMessage(`Item sold for ${amount} ${currencyType}!`, 'success');
        } else {
            console.error('Currency system not available');
        }
    },
    
    /**
     * Purchase an item from Black Market
     */
    purchaseBlackMarketItem: function(itemId) {
        // Find the item
        const blackMarketItems = this.getBlackMarketItems();
        const item = blackMarketItems.find(item => item.id === itemId);
        
        if (!item) {
            console.error(`Item with ID ${itemId} not found`);
            return;
        }
        
        // Check if player has enough currency
        if (typeof Currency !== 'undefined' && typeof Currency.hasEnough === 'function') {
            if (!Currency.hasEnough(item.cost.currency, item.cost.amount)) {
                this.showMarketplaceMessage(`Not enough ${item.cost.currency} to purchase this item.`, 'error');
                return;
            }
            
            // Spend currency
            Currency.spend(item.cost.currency, item.cost.amount);
            
            // Add item to inventory (if inventory system exists)
            if (typeof InventorySystem !== 'undefined' && typeof InventorySystem.addItem === 'function') {
                InventorySystem.addItem(item);
            }
            
            // Update UI
            this.updateMarketplaceUI();
            
            // Show success message
            this.showMarketplaceMessage(`${item.name} purchased!`, 'success');
        } else {
            console.error('Currency system not available');
        }
    },
    
    /**
     * Show marketplace message
     */
    showMarketplaceMessage: function(message, type = 'info') {
        // Create message element if it doesn't exist
        let messageElement = document.getElementById('marketplace-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'marketplace-message';
            document.body.appendChild(messageElement);
        }
        
        // Set message content and type
        messageElement.className = `marketplace-message-popup ${type}`;
        messageElement.textContent = message;
        
        // Show message
        messageElement.classList.add('show');
        
        // Hide message after delay
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    },
    
    /**
     * Get player's inventory items
     * This is a placeholder - in a real game, it would connect to the inventory system
     */
    getPlayerInventoryItems: function() {
        // Check if inventory system exists
        if (typeof InventorySystem !== 'undefined' && typeof InventorySystem.getItems === 'function') {
            return InventorySystem.getItems();
        }
        
        // Return null to use sample items
        return null;
    },
    
    /**
     * Initialize skip animation checkbox
     */
    initSkipAnimationCheckbox: function() {
        const skipCheckbox = document.getElementById('skip-animation-checkbox');
        if (skipCheckbox) {
            // Load saved preference if available
            const savedData = this.loadData();
            if (savedData && savedData.skipAnimation !== undefined) {
                this.skipAnimation = savedData.skipAnimation;
                skipCheckbox.checked = this.skipAnimation;
            }
            
            // Add event listener
            skipCheckbox.addEventListener('change', (e) => {
                this.skipAnimation = e.target.checked;
                
                // Save preference
                this.saveData();
                
                console.log(`Animation ${this.skipAnimation ? 'disabled' : 'enabled'}`);
            });
        }
    },
    
    /**
     * Set up gacha UI event listeners
     */
    setupEventListeners: function() {
        // Gacha button
        const gachaButton = document.getElementById('gacha-button');
        if (gachaButton) {
            gachaButton.addEventListener('click', () => {
                this.openGachaUI();
            });
        }
        
        // Gacha pull buttons
        document.querySelectorAll('.gacha-pull-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const gachaType = e.target.dataset.type;
                this.pullGacha(gachaType);
            });
        });
        
        // Close result button
        const closeResultButton = document.getElementById('gacha-close-result');
        if (closeResultButton) {
            closeResultButton.addEventListener('click', () => {
                this.hideGachaResult();
            });
        }
    },
    
    /**
     * Open the gacha UI
     */
    openGachaUI: function() {
        // Update gacha UI with current information
        this.updateGachaUI();
        
        // Show gacha modal
        Utils.showModal('gacha-modal');
    },
    
    /**
     * Update the gacha UI
     */
    updateGachaUI: function() {
        // Update Super DNA counters
        for (const type in this.pullCounter) {
            // Find or update the counter element
            let counterElement = document.querySelector(`.gacha-option[data-type="${type}"] .pull-counter`);
            if (!counterElement) {
                // Create the counter element if it doesn't exist
                const gachaOption = document.querySelector(`.gacha-option[data-type="${type}"]`);
                if (gachaOption) {
                    counterElement = document.createElement('div');
                    counterElement.className = 'pull-counter';
                    gachaOption.appendChild(counterElement);
                }
            }
            
            if (counterElement) {
                counterElement.textContent = `PULLS: ${this.pullCounter[type]}/${this.superDnaThreshold}`;
            }
            
            // Check if Super DNA is available
            const isSuperDnaAvailable = this.pullCounter[type] >= this.superDnaThreshold;
            this.superDnaAvailable[type] = isSuperDnaAvailable;
            
            // Find or create the Super DNA button
            let superDnaButton = document.querySelector(`.super-dna-button[data-type="${type}"]`);
            if (!superDnaButton) {
                // Create the Super DNA button if it doesn't exist
                const gachaOption = document.querySelector(`.gacha-option[data-type="${type}"]`);
                if (gachaOption) {
                    // Create a container for the Super DNA option
                    const superDnaContainer = document.createElement('div');
                    superDnaContainer.className = 'super-dna-container';
                    
                    superDnaButton = document.createElement('button');
                    superDnaButton.className = 'super-dna-button';
                    superDnaButton.dataset.type = type;
                    superDnaButton.textContent = 'SUPER DNA';
                    
                    // Add description
                    const superDnaDesc = document.createElement('div');
                    superDnaDesc.className = 'super-dna-description';
                    superDnaDesc.textContent = 'Double rarity multiplier!';
                    
                    superDnaContainer.appendChild(superDnaButton);
                    superDnaContainer.appendChild(superDnaDesc);
                    gachaOption.appendChild(superDnaContainer);
                    
                    // Add event listener
                    superDnaButton.addEventListener('click', () => {
                        this.pullSuperDna(type);
                    });
                }
            }
            
            // Update the Super DNA button
            if (superDnaButton) {
                if (isSuperDnaAvailable) {
                    superDnaButton.disabled = false;
                    superDnaButton.classList.add('available');
                } else {
                    superDnaButton.disabled = true;
                    superDnaButton.classList.remove('available');
                }
            }
        }
        
        // Update currency amounts
        for (const type in this.gachaTypes) {
            const costElement = document.querySelector(`.gacha-option[data-type="${type}"] .gacha-cost-value`);
            if (costElement) {
                const cost = this.gachaTypes[type].cost;
                costElement.textContent = `${cost.amount}`;
                
                // Check if player has enough currency
                const hasEnough = Currency.hasEnough(cost.currency, cost.amount);
                const pullButton = document.querySelector(`.gacha-pull-button[data-type="${type}"]`);
                if (pullButton) {
                    pullButton.disabled = !hasEnough;
                }
            }
        }
    },
    
    /**
     * Pull from a gacha with animation
     */
    pullGacha: function(type, isSuper = false) {
        // Check if gacha type exists
        if (!this.gachaTypes[type]) {
            console.error(`Unknown gacha type: ${type}`);
            return null;
        }
        
        // Check if player has enough currency
        const cost = this.gachaTypes[type].cost;
        if (!Currency.hasEnough(cost.currency, cost.amount)) {
            console.error(`Not enough ${cost.currency} to pull ${type} gacha`);
            return null;
        }
        
        // Spend currency
        Currency.spend(cost.currency, cost.amount);
        
        // Increment pull counter if not using Super DNA
        if (!isSuper) {
            this.pullCounter[type]++;
            
            // Check if Super DNA is now available
            if (this.pullCounter[type] >= this.superDnaThreshold) {
                this.superDnaAvailable[type] = true;
            }
        } else {
            // Reset Super DNA availability and counter if using Super DNA
            this.superDnaAvailable[type] = false;
            this.pullCounter[type] = 0;
        }
        
        // Determine rarity based on rates and Super DNA status
        const rarity = this.determineRarity(type, isSuper);
        
        // Get a character of the determined rarity
        const characterTemplate = this.getRandomCharacterByRarity(rarity);
        
        if (!characterTemplate) {
            return null;
        }
        
        // Use Three.js for the animation
        this.playPullAnimation(type, rarity, characterTemplate);
        
        return characterTemplate;
    },
    
    /**
     * Pull using Super DNA (double rarity chances)
     */
    pullSuperDna: function(type) {
        // Check if Super DNA is available for this type
        if (!this.superDnaAvailable[type]) {
            console.error(`Super DNA not available for ${type}`);
            return null;
        }
        
        // Pull using Super DNA (double rarity chances)
        return this.pullGacha(type, true);
    },
    
    // Animation is always skipped
    skipAnimation: true,
    
    /**
     * Process pull result without animation
     * @param {string} type - Gacha type
     * @param {string} rarity - Character rarity
     * @param {Object} characterTemplate - Character template
     */
    playPullAnimation: function(type, rarity, characterTemplate) {
        console.log(`Processing ${rarity} character result`);
        
        // Process the character result directly
        this.processCharacterResult(characterTemplate);
    },
    
    /**
     * Process the character result after animation
     */
    processCharacterResult: function(characterTemplate) {
        try {
            // Check if this is a duplicate character
            const isDuplicate = ShardSystem && 
                            typeof ShardSystem.isDuplicate === 'function' && 
                            ShardSystem.isDuplicate(characterTemplate);
            
            if (isDuplicate) {
                // Convert to shards instead of creating a new character
                const shardAmount = ShardSystem.convertToShards({
                    id: characterTemplate.id,
                    name: characterTemplate.name,
                    rarity: characterTemplate.rarity
                });
                
                // Show duplicate result with shard conversion
                this.showDuplicateResult(characterTemplate, shardAmount);
            } else {
                // Create a new character using the template
                const characterData = {
                    id: characterTemplate.id,
                    name: characterTemplate.name,
                    rarity: characterTemplate.rarity,
                    description: characterTemplate.description,
                    thumbnail: characterTemplate.thumbnail || `img/thumbnail/${characterTemplate.id}.png`,
                    sitSprite: characterTemplate.sitSprite,
                    idleSprite: characterTemplate.idleSprite,
                    runningSprite: characterTemplate.runningSprite,
                    attackSprite: characterTemplate.attackSprite,
                    rangedSprite: characterTemplate.rangedSprite,
                    magicSprite: characterTemplate.magicSprite,
                    baseStats: characterTemplate.baseStats,
                    specialAbility: characterTemplate.specialAbility
                };
                
                // Create the character in the system
                const newCharacter = CharacterSystem.createCharacter(characterData);
                
                // Show gacha result
                this.showGachaResult(newCharacter);
            }
            
            // Save data
            this.saveData();
        } catch (error) {
            console.error("Error processing character result:", error);
        }
    },
    
    /**
     * Determine the rarity of a gacha pull
     * @param {string} type - The gacha type
     * @param {boolean} isSuper - Whether to use Super DNA double rarity multiplier
     * @returns {string} Determined rarity
     */
    determineRarity: function(type, isSuper = false) {
        // Get the base rates for this gacha type
        const baseRates = this.gachaTypes[type].rates;
        
        // If using Super DNA, double the chances for higher rarities
        let rates = {...baseRates};
        if (isSuper) {
            // Adjust rates to favor higher rarities (double everything except common)
            const commonRate = rates.common;
            delete rates.common; // Remove common temporarily
            
            // Calculate sum of all non-common rates
            let nonCommonSum = 0;
            for (const rate of Object.values(rates)) {
                nonCommonSum += rate;
            }
            
            // Double each non-common rate
            for (const rarity in rates) {
                rates[rarity] *= 2;
            }
            
            // Calculate the new sum of non-common rates after doubling
            let newNonCommonSum = 0;
            for (const rate of Object.values(rates)) {
                newNonCommonSum += rate;
            }
            
            // Adjust common rate to maintain total probability of 1.0
            rates.common = Math.max(0, 1 - newNonCommonSum);
            
            console.log(`Using Super DNA for ${type} gacha! Double rarity multiplier activated!`);
        }
        
        // Perform the probability roll
        const roll = Math.random();
        let cumulativeProbability = 0;
        
        // Check rarities from highest to lowest for better odds with Super DNA
        const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
        
        for (const rarity of rarityOrder) {
            if (rates[rarity]) {
                cumulativeProbability += rates[rarity];
                if (roll < cumulativeProbability) {
                    return rarity;
                }
            }
        }
        
        // Fallback to common
        return 'common';
    },
    
    // Character templates
    characterTemplates: [
        // Rare characters
        {
            id: 'devin',
            name: 'Devin',
            rarity: 'rare',
            description: 'A skilled hacker with time manipulation abilities.',
            thumbnail: 'img/thumbnail/devin.png',
            sitSprite: 'img/devinsit.png',
            idleSprite: 'img/devinidle.png',
            runningSprite: 'img/devin.png',
            attackSprite: 'img/devinattack.png',
            rangedSprite: 'img/devinranged.png',
            magicSprite: 'img/devinmagic.png',
            baseStats: {
                strength: 3,
                agility: 10,
                vitality: 4,
                dexterity: 6,
                intelligence: 8,
                luck: 4
            },
            specialAbility: 'time_warp'
        },
        // Epic characters
        {
            id: 'chad',
            name: 'Chad',
            rarity: 'common',
            description: 'A cybernetically enhanced soldier with devastating firepower.',
            thumbnail: 'img/thumbnail/chad.png',
            sitSprite: 'img/chadsit.png',
            idleSprite: 'img/chadidle.png',
            runningSprite: 'img/chad.png',
            attackSprite: 'img/chadattack.png',
            rangedSprite: 'img/chadranged.png',
            magicSprite: 'img/chadmagic.png',
            baseStats: {
                strength: 8,
                agility: 6,
                vitality: 7,
                dexterity: 9,
                intelligence: 5,
                luck: 3
            },
            specialAbility: 'overcharge'
        },
        // Common characters
        {
            id: 'echo',
            name: 'Echo',
            rarity: 'common',
            description: 'A sound technician with sonic manipulation abilities.',
            thumbnail: 'img/thumbnail/devin.png', // Placeholder using Devin's thumbnail
            sitSprite: 'img/devinsit.png',
            idleSprite: 'img/devinidle.png',
            runningSprite: 'img/devin.png',
            attackSprite: 'img/devinattack.png',
            rangedSprite: 'img/devinranged.png',
            magicSprite: 'img/devinmagic.png',
            baseStats: {
                strength: 3,
                agility: 6,
                vitality: 4,
                dexterity: 5,
                intelligence: 7,
                luck: 4
            },
            specialAbility: 'sonic_blast'
        },
        // Uncommon characters
        {
            id: 'spark',
            name: 'Spark',
            rarity: 'uncommon',
            description: 'An electricity-infused runner with lightning reflexes.',
            thumbnail: 'img/thumbnail/devin.png', // Placeholder using Devin's thumbnail
            sitSprite: 'img/devinsit.png',
            idleSprite: 'img/devinidle.png',
            runningSprite: 'img/devin.png',
            attackSprite: 'img/devinattack.png',
            rangedSprite: 'img/devinranged.png',
            magicSprite: 'img/devinmagic.png',
            baseStats: {
                strength: 4,
                agility: 8,
                vitality: 3,
                dexterity: 7,
                intelligence: 5,
                luck: 6
            },
            specialAbility: 'volt_dash'
        },
        {
            id: 'gowdie',
            name: 'Gowdie',
            rarity: 'common',
            description: 'A skilled hacker with time manipulation abilities.',
            thumbnail: 'img/thumbnail/gowdie.png',
            sitSprite: 'img/gowdiesit.png',
            idleSprite: 'img/gowdieidle.png',
            runningSprite: 'img/gowdie.png',
            attackSprite: 'img/gowdieattack.png',
            rangedSprite: 'img/gowdieranged.png',
            magicSprite: 'img/gowdiemagic.png',
            baseStats: {
                strength: 3,
                agility: 5,
                vitality: 4,
                dexterity: 6,
                intelligence: 8,
                luck: 4
            },
            specialAbility: 'time_warp'
        },
        // Legendary characters
        {
            id: 'nexus',
            name: 'Nexus',
            rarity: 'legendary',
            description: 'A network hub entity that connects to all digital systems.',
            thumbnail: 'img/thumbnail/devin.png', // Placeholder using Devin's thumbnail
            sitSprite: 'img/devinsit.png',
            idleSprite: 'img/devinidle.png',
            runningSprite: 'img/devin.png',
            attackSprite: 'img/devinattack.png',
            rangedSprite: 'img/devinranged.png',
            magicSprite: 'img/devinmagic.png',
            baseStats: {
                strength: 5,
                agility: 5,
                vitality: 7,
                dexterity: 7,
                intelligence: 10,
                luck: 9
            },
            specialAbility: 'system_override'
        }
    ],

    /**
     * Get a random character template by rarity
     */
    getRandomCharacterByRarity: function(rarity) {
        // Filter characters by rarity
        const characters = this.characterTemplates.filter(char => char.rarity === rarity);
        
        if (characters.length === 0) {
            console.error(`No characters found with rarity: ${rarity}`);
            return null;
        }
        
        // Return a random character
        return characters[Math.floor(Math.random() * characters.length)];
    },
    
    /**
     * Show the gacha result for a new character
     */
    showGachaResult: function(character) {
        const resultContainer = document.getElementById('gacha-result');
        const characterResult = document.getElementById('gacha-character-result');
        const optionsContainer = document.getElementById('gacha-options');
        
        if (!resultContainer || !characterResult || !optionsContainer) return;
        
        // Hide options, show result
        optionsContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Clear previous result
        characterResult.innerHTML = '';
        
        // Build character info display
        const charInfoHTML = `
            <div class="character-image-container">
                <img class="character-image" src="${character.thumbnail}" alt="${character.name}">
            </div>
            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                <div class="character-rarity rarity-${character.rarity}">${character.rarity.toUpperCase()}</div>
                <div class="character-description">${character.description}</div>
                
                <div class="character-stats-container">
                    <div class="character-stats">
                        ${Object.entries(character.stats).map(([stat, value]) => `
                            <div class="stat-item">
                                <div class="stat-name">${stat.toUpperCase()}</div>
                                <div class="stat-value">${value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="character-ability">
                    <div class="ability-name">${this.getAbilityName(character.specialAbility)}</div>
                    <div class="ability-description">${this.getAbilityDescription(character.specialAbility)}</div>
                </div>
            </div>
        `;
        
        characterResult.innerHTML = charInfoHTML;
    },
    
    /**
     * Show duplicate character result with shard conversion
     */
    showDuplicateResult: function(character, shardAmount) {
        const resultContainer = document.getElementById('gacha-result');
        const characterResult = document.getElementById('gacha-character-result');
        const optionsContainer = document.getElementById('gacha-options');
        
        if (!resultContainer || !characterResult || !optionsContainer) return;
        
        // Hide options, show result
        optionsContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Clear previous result
        characterResult.innerHTML = '';
        
        // Build duplicate character info
        const dupInfoHTML = `
            <div class="character-image-container">
                <img class="character-image" src="${character.thumbnail}" alt="${character.name}">
            </div>
            <div class="character-info">
                <h3 class="character-name">${character.name}</h3>
                <div class="character-rarity rarity-${character.rarity}">${character.rarity.toUpperCase()}</div>
                <div class="duplicate-message">DUPLICATE CHARACTER</div>
                <div class="shard-conversion">Converted to ${shardAmount} character shards</div>
            </div>
        `;
        
        characterResult.innerHTML = dupInfoHTML;
    },
    
    /**
     * Hide the gacha result
     */
    hideGachaResult: function() {
        const resultContainer = document.getElementById('gacha-result');
        const optionsContainer = document.getElementById('gacha-options');
        
        if (!resultContainer || !optionsContainer) return;
        
        // Hide result, show options
        resultContainer.style.display = 'none';
        optionsContainer.style.display = 'flex';
        
        // Update gacha UI
        this.updateGachaUI();
    },
    
    /**
     * Get ability name from special ability ID
     */
    getAbilityName: function(abilityId) {
        const specialAbilities = {
            time_warp: { name: "Time Warp" },
            overcharge: { name: "Overcharge" },
            reality_hack: { name: "Reality Hack" },
            nanite_surge: { name: "Nanite Surge" },
            phase_shift: { name: "Phase Shift" },
            kinetic_overload: { name: "Kinetic Overload" },
            sonic_blast: { name: "Sonic Blast" },
            volt_dash: { name: "Volt Dash" },
            probability_manipulation: { name: "Probability Manipulation" },
            targeting_system: { name: "Targeting System" },
            gravity_well: { name: "Gravity Well" },
            inferno_surge: { name: "Inferno Surge" },
            cryo_field: { name: "Cryo Field" },
            digital_possession: { name: "Digital Possession" },
            data_surge: { name: "Data Surge" },
            system_override: { name: "System Override" },
            power_surge: { name: "Power Surge" },
            system_crash: { name: "System Crash" },
            quick_process: { name: "Quick Process" },
            encryption_field: { name: "Encryption Field" }
        };
        
        return specialAbilities[abilityId]?.name || abilityId;
    },
    
    /**
     * Get ability description from special ability ID
     */
    getAbilityDescription: function(abilityId) {
        const specialAbilities = {
            time_warp: { description: "Manipulates temporal flow to gain additional actions or revert harmful effects." },
            overcharge: { description: "Temporarily boosts all cybernetic systems for massively increased damage output." },
            reality_hack: { description: "Alters the fundamental code of reality to create advantageous anomalies." },
            nanite_surge: { description: "Deploys repair nanites to heal allies and enhance their physical capabilities." },
            phase_shift: { description: "Temporarily shifts out of normal spacetime to avoid damage and pass through obstacles." },
            kinetic_overload: { description: "Concentrates enormous physical force into devastating melee attacks." },
            sonic_blast: { description: "Emits focused sound waves that stun enemies and disrupt electronics." },
            volt_dash: { description: "Transforms into pure electrical energy to move at incredible speed." },
            probability_manipulation: { description: "Subtly alters chance outcomes to favor allies and hinder enemies." },
            targeting_system: { description: "Advanced combat algorithms that significantly increase accuracy." },
            gravity_well: { description: "Creates localized gravitational distortions to control battlefield movement." },
            inferno_surge: { description: "Generates intense heat that damages enemies and melts obstacles." },
            cryo_field: { description: "Creates an area of extreme cold that slows enemies and reduces their effectiveness." },
            digital_possession: { description: "Takes control of enemy technology and turns it against its masters." },
            data_surge: { description: "Rapidly processes and transfers information, providing tactical advantages." },
            system_override: { description: "Completely takes control of all nearby systems and networks." },
            power_surge: { description: "Releases raw energy in an uncontrolled burst, damaging all nearby entities." },
            system_crash: { description: "Injects corrupt data into enemy systems, causing them to malfunction." },
            quick_process: { description: "Speeds up neural processing, allowing faster reactions and decision making." },
            encryption_field: { description: "Creates an impenetrable field that blocks hostile signals and scans." }
        };
        
        return specialAbilities[abilityId]?.description || "No description available.";
    },
    
    /**
     * Save gacha data
     */
    saveData: function() {
        Utils.saveToStorage('gacha', {
            pullCounter: this.pullCounter,
            superDnaAvailable: this.superDnaAvailable,
            skipAnimation: this.skipAnimation
        });
    },
    
    /**
     * Load gacha data from storage
     * @returns {Object|null} Loaded gacha data or null if not found
     */
    loadData: function() {
        return Utils.loadFromStorage('gacha');
    }
};
