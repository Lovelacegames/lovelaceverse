/**
 * Character system for the Cyberpunk MMORPG game
 * Defines character classes, stats, and abilities
 */
const CharacterSystem = {
    // All unlocked characters
    characters: [],
    
    // Currently active characters (max 6)
    activeCharacters: [],
    
    // Maximum number of active characters
    maxActiveCharacters: 6,
    
    /**
     * Initialize the character system
     * @param {Object} savedData - Saved character data (optional)
     */
    init: function(savedData = null) {
        this.characters = [];
        this.activeCharacters = [];
        
        // Load saved data if available
        if (savedData) {
            this.loadFromData(savedData);
        }
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    /**
     * Set up character UI event listeners
     */
    setupEventListeners: function() {
        // Character list button
        const characterListButton = document.getElementById('character-list-button');
        if (characterListButton) {
            characterListButton.addEventListener('click', () => {
                this.openCharacterList();
            });
        }
    },
    
    /**
     * Load character data from saved data
     * @param {Object} data - Saved character data
     */
    loadFromData: function(data) {
        // Load unlocked characters
        if (data.characters) {
            this.characters = data.characters.map(charData => {
                const character = this.createCharacterFromData(charData);
                // Add reset stats method to character
                this.addResetStatsMethod(character);
                return character;
            });
        }
        
        // Load active characters
        if (data.activeCharacters) {
            this.activeCharacters = data.activeCharacters.map(id => {
                return this.getCharacterById(id);
            }).filter(char => char !== null);
        }
    },
    
    /**
     * Create a character from saved data
     * @param {Object} data - Character data
     * @returns {Object} Character object
     */
    createCharacterFromData: function(data) {
        return {
            id: data.id,
            name: data.name,
            level: data.level || 1,
            experience: data.experience || 0,
            stats: data.stats || this.getDefaultStats(),
            baseStats: data.baseStats || this.getDefaultStats(),
            abilities: data.abilities || [],
            cooldowns: {},
            buffs: [],
            sitSprite: data.sitSprite,
            idleSprite: data.idleSprite,
            runningSprite: data.runningSprite,
            attackSprite: data.attackSprite,
            rangedSprite: data.rangedSprite,
            magicSprite: data.magicSprite,
            specialAbility: data.specialAbility,
            thumbnail: data.thumbnail || null, // Custom thumbnail image
            rarity: data.rarity || "common",
            element: null, // Legacy DOM element (to be removed)
            mapElement: null, // Map sprite element
            thumbnailElement: null, // Character panel thumbnail element
            currentAnimation: "idle",
            currentFrame: 0,
            lastFrameTime: Date.now(),
            x: 0,
            y: 0,
            baseY: 0,
            verticalOffset: 0,
            verticalDirection: Math.random() < 0.5 ? 1 : -1,
            width: 64,
            height: 64,
            attackWidth: 128, // Larger width for attack animations
            isAttacking: false,
            attackTarget: null,
            // Combat movement tracking
            chaseStartTime: 0,
            chaseDuration: 0,
            chaseTargetId: null,
            attackRange: 50 // Distance at which character can attack without perfect overlap
        };
    },
    
    /**
     * Get default character stats
     * @returns {Object} Default stats
     */
    getDefaultStats: function() {
        return {
            strength: 1,
            agility: 1,
            vitality: 1,
            dexterity: 1,
            intelligence: 1,
            luck: 1,
            maxHp: 150,
            currentHp: 150,
            maxSp: 50,
            currentSp: 50,
            damage: 50,
            magicDamage: 50,
            rangeDamage: 50,
            attackSpeed: 1.0,
            defense: 50,
            magicDefense: 50,
            hit: 5,
            evasion: 5,
            critical: 5,
            fireResistance: 5,
            waterResistance: 5,
            windResistance: 5,
            earthResistance: 5,
            lightningResistance: 5
        };
    },
    
    /**
     * Create a new character
     * @param {Object} data - Character data
     * @returns {Object} Created character
     */
    createCharacter: function(data) {
        if (!data.id) {
            data.id = Utils.generateId();
        }
        
        const existingChar = this.getCharacterById(data.id);
        if (existingChar) {
            console.log(`Character with ID ${data.id} already exists, returning existing character`);
            return existingChar;
        }
        
        const character = this.createCharacterFromData(data);
        this.addResetStatsMethod(character);
        this.calculateDerivedStats(character);
        this.characters.push(character);
        this.saveData();
        return character;
    },
    
    /**
     * Calculate derived stats based on base stats
     * @param {Object} character - Character to update
     */
    calculateDerivedStats: function(character) {
        const stats = character.stats;
        const baseStats = character.baseStats;
        
        for (const key in baseStats) {
            stats[key] = baseStats[key];
        }
        
        const levelBonus = character.level - 1;
        stats.strength += Math.floor(levelBonus * 0.5);
        stats.agility += Math.floor(levelBonus * 0.5);
        stats.vitality += Math.floor(levelBonus * 0.5);
        stats.dexterity += Math.floor(levelBonus * 0.5);
        stats.intelligence += Math.floor(levelBonus * 0.5);
        stats.luck += Math.floor(levelBonus * 0.5);
        
        stats.maxHp = 150 + (stats.vitality * 10);
        stats.maxSp = 50 + (stats.intelligence * 5);
        stats.damage = 50 + (stats.strength * 5);
        stats.magicDamage = 50 + (stats.intelligence * 5);
        stats.rangeDamage = 50 + (stats.dexterity * 5);
        stats.attackSpeed = 1.0 + (stats.agility * 0.02);
        stats.defense = 50 + (stats.vitality * 3);
        stats.magicDefense = 50 + (stats.intelligence * 3);
        stats.hit = 5 + (stats.dexterity * 0.5);
        stats.evasion = 5 + (stats.agility * 0.5) + (stats.luck * 0.2);
        stats.critical = 5 + (stats.luck * 0.5);
        
        const equipmentStats = Inventory.getEquipmentStats(character.id);
        for (const [stat, value] of Object.entries(equipmentStats)) {
            if (stats[stat] !== undefined) {
                stats[stat] += value;
            }
        }
        
        if (character.buffs) {
            CharacterBuffs.applyBuffs(character);
        }
        
        stats.currentHp = Math.min(stats.currentHp || stats.maxHp, stats.maxHp);
        stats.currentSp = Math.min(stats.currentSp || stats.maxSp, stats.maxSp);
    },
    
    /**
     * Activate a character (add to active characters)
     * @param {string} characterId - Character ID
     * @returns {boolean} True if character was activated
     */
    activateCharacter: function(characterId) {
        if (this.activeCharacters.length >= this.maxActiveCharacters) {
            console.warn("Maximum number of active characters reached");
            return false;
        }
        
        // Silently return true if character is already active
        if (this.isCharacterActive(characterId)) {
            // Change from console.log to console.debug to avoid console spam
            console.debug("Character is already active");
            return true;
        }
        
        const character = this.getCharacterById(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return false;
        }
        
        this.activeCharacters.push(character);
        const elements = this.createCharacterElements(character);
        character.mapElement = elements.mapElement;
        character.thumbnailElement = elements.thumbnailElement;
        this.positionCharacter(character);
        this.saveData();
        return true;
    },
    
    /**
     * Deactivate a character (remove from active characters)
     * @param {string} characterId - Character ID
     * @returns {boolean} True if character was deactivated
     */
    deactivateCharacter: function(characterId) {
        if (!this.isCharacterActive(characterId)) {
            console.error("Character is not active");
            return false;
        }
        
        const character = this.getCharacterById(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return false;
        }
        
        this.activeCharacters = this.activeCharacters.filter(c => c.id !== characterId);
        
        if (character.mapElement) {
            const wrapper = document.getElementById(`character-wrapper-${characterId}`);
            if (wrapper) wrapper.remove();
            character.mapElement = null;
        }
        
        if (character.thumbnailElement) {
            character.thumbnailElement.remove();
            character.thumbnailElement = null;
        }
        
        this.saveData();
        return true;
    },
    
    /**
     * Create a DOM element for a character
     * @param {Object} character - Character data
     * @returns {Object} Character elements: {mapElement, thumbnailElement}
     */
    createCharacterElements: function(character) {
        const elements = {
            mapElement: this.createBattleElement(character),
            thumbnailElement: this.createThumbnailElement(character)
        };
        return elements;
    },
    
    /**
     * Create battle element for character (for map display)
     * @param {Object} character - Character data
     * @returns {HTMLElement} Map element
     */
    createBattleElement: function(character) {
        const charactersContainer = document.getElementById("characters-container");
        if (!charactersContainer) return null;
        
        const wrapper = document.createElement("div");
        wrapper.className = "character-wrapper";
        wrapper.id = `character-wrapper-${character.id}`;
        
        const element = document.createElement("div");
        element.className = "character-sprite";
        element.id = `character-${character.id}`;
        element.style.width = `${character.width}px`;
        element.style.height = `${character.height}px`;
        
        let spriteUrl;
        switch (character.currentAnimation) {
            case "sit":
                spriteUrl = character.sitSprite;
                break;
            case "run":
                spriteUrl = character.runningSprite;
                break;
            case "attack":
                spriteUrl = character.attackSprite;
                break;
            case "ranged":
                spriteUrl = character.rangedSprite;
                break;
            case "magic":
                spriteUrl = character.magicSprite;
                break;
            case "idle":
            default:
                spriteUrl = character.idleSprite;
                break;
        }
        
        element.style.backgroundImage = `url(${spriteUrl})`;
        element.style.backgroundPosition = `-${character.currentFrame * character.width}px 0`;
        element.style.backgroundRepeat = "no-repeat";
        element.style.transition = "transform 0.1s ease-out, top 0.5s ease-in-out";
        
        const levelIndicator = document.createElement("div");
        levelIndicator.className = "character-level-indicator";
        levelIndicator.textContent = character.level;
        
        const hpDisplay = document.createElement("div");
        hpDisplay.className = "character-hp-display";
        hpDisplay.textContent = `${character.stats.currentHp}/${character.stats.maxHp}`;
        
        const hpBarContainer = document.createElement("div");
        hpBarContainer.className = "character-hp-bar-container";
        
        const hpBar = document.createElement("div");
        hpBar.className = "character-hp-bar";
        const hpPercentage = (character.stats.currentHp / character.stats.maxHp) * 100;
        hpBar.style.width = `${hpPercentage}%`;
        
        hpBarContainer.appendChild(hpBar);
        wrapper.appendChild(element);
        
        const nameTag = document.createElement("div");
        nameTag.className = "character-name-tag";
        nameTag.textContent = character.name;
        wrapper.appendChild(nameTag);
        wrapper.appendChild(levelIndicator);
        wrapper.appendChild(hpDisplay);
        wrapper.appendChild(hpBarContainer);
        
        charactersContainer.appendChild(wrapper);
        return element;
    },
    
    /**
     * Create thumbnail element for character panel
     * @param {Object} character - Character data
     * @returns {HTMLElement} Thumbnail element
     */
    createThumbnailElement: function(character) {
        const characterPanel = document.getElementById("character-panel");
        if (!characterPanel) return null;
        // Update character container style: make it smaller and remove vertical scroll
        characterPanel.style.width = "100px";
        characterPanel.style.overflowY = "hidden";
        
        const thumbnail = document.createElement("div");
        thumbnail.className = "character-thumbnail";
        thumbnail.id = `character-thumbnail-${character.id}`;
        thumbnail.dataset.id = character.id;
        
        // Create level indicator
        const thumbLevel = document.createElement("div");
        thumbLevel.className = "thumbnail-level";
        thumbLevel.textContent = character.level;
        
        const thumbImg = document.createElement("img");
        // Use custom thumbnail if available, otherwise fall back to idle sprite
        thumbImg.src = character.thumbnail || character.idleSprite;
        thumbImg.alt = character.name;
        
        const thumbInfo = document.createElement("div");
        thumbInfo.className = "thumbnail-info";
        
        // HP bar
        const thumbHpBar = document.createElement("div");
        thumbHpBar.className = "thumbnail-hp-bar";
        const thumbHpFill = document.createElement("div");
        thumbHpFill.className = "thumbnail-hp-fill";
        thumbHpFill.style.width = `${(character.stats.currentHp / character.stats.maxHp) * 100}%`;
        thumbHpBar.appendChild(thumbHpFill);
        
        // SP bar
        const thumbSpBar = document.createElement("div");
        thumbSpBar.className = "thumbnail-sp-bar";
        const thumbSpFill = document.createElement("div");
        thumbSpFill.className = "thumbnail-sp-fill";
        thumbSpFill.style.width = `${(character.stats.currentSp / character.stats.maxSp) * 100}%`;
        thumbSpBar.appendChild(thumbSpFill);
        
        thumbInfo.appendChild(thumbHpBar);
        thumbInfo.appendChild(thumbSpBar);
        
        // XP bar - create and style as an overlay
        const xpBar = document.createElement("div");
        xpBar.className = "thumbnail-xp-bar";
        const xpFill = document.createElement("div");
        xpFill.className = "thumbnail-xp-fill";
        const xpRequired = character.level * 1000;
        const currentXp = character.experience % xpRequired;
        const xpPercent = (currentXp / xpRequired) * 100;
        xpFill.style.width = xpPercent + "%";
        xpFill.style.backgroundColor = "yellow";
        xpBar.appendChild(xpFill);
        // Position the XP bar overlay at the bottom of the image container
        xpBar.style.position = "absolute";
        xpBar.style.bottom = "0";
        xpBar.style.left = "0";
        xpBar.style.width = "100%";
        xpBar.style.height = "10px";
        xpBar.style.zIndex = "5";
        // (Do not append xpBar to thumbInfo here)
        
        // Set thumbnail layout and styling (making it smaller to fit the container)
        thumbnail.style.width = "90px";
        thumbnail.style.height = "130px";
        thumbnail.style.padding = "5px";
        thumbnail.style.boxSizing = "border-box";
        
        thumbnail.appendChild(thumbLevel);
        const imgContainer = document.createElement("div");
        imgContainer.style.position = "relative";
        imgContainer.style.width = "100%";
        imgContainer.style.height = "70px";
        imgContainer.style.overflow = "hidden";
        imgContainer.style.marginBottom = "5px";
        thumbImg.style.width = "100%";
        thumbImg.style.height = "auto";
        imgContainer.appendChild(thumbImg);
        // Append the XP bar overlay to the image container
        imgContainer.appendChild(xpBar);
        thumbnail.appendChild(imgContainer);
        const barsContainer = document.createElement("div");
        barsContainer.style.width = "100%";
        barsContainer.style.marginBottom = "5px";
        barsContainer.appendChild(thumbInfo);
        thumbnail.appendChild(barsContainer);
        const thumbName = document.createElement("div");
        thumbName.className = "thumbnail-name";
        thumbName.textContent = character.name;
        // Bring the character name to the top layer over other thumbnail elements
        thumbName.style.position = "absolute";
        thumbName.style.top = "0";
        thumbName.style.width = "100%";
        thumbName.style.textAlign = "center";
        thumbName.style.fontSize = "18px";
        thumbName.style.fontWeight = "bold";
        thumbName.style.zIndex = "10";
        thumbName.style.background = "rgba(0, 0, 0, 0.5)";
        thumbName.style.color = "#fff";
        thumbnail.appendChild(thumbName);
        
        thumbnail.addEventListener("click", () => {
            this.openCharacterEquipmentModal(character.id);
        });
        characterPanel.appendChild(thumbnail);
        return thumbnail;
    },
    
    /**
     * Open character equipment modal
     * @param {string} characterId - Character ID
     */
    openCharacterEquipmentModal: function(characterId) {
        console.log(`Opening equipment modal for character: ${characterId}`);
        const character = this.getCharacterById(characterId);
        if (!character) {
            console.error(`Character not found with ID: ${characterId}`);
            return;
        }
        
        let modal = document.getElementById("character-equipment-modal");
        if (!modal) {
            console.log("Creating new equipment modal");
            modal = this.createCharacterEquipmentModal();
        }
        this.updateCharacterEquipmentModal(character);
        console.log("Showing equipment modal");
        Utils.showModal("character-equipment-modal");
    },
    
    /**
     * Create character equipment modal
     * @returns {HTMLElement} Character equipment modal
     */
    createCharacterEquipmentModal: function() {
        const modal = document.createElement("div");
        modal.id = "character-equipment-modal";
        modal.className = "modal";
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Character Equipment</h2>
                    <span class="close-modal" onclick="Utils.hideModal('character-equipment-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="character-equipment-layout">
                        <div class="character-portrait-section">
                            <div id="equipment-character-portrait"></div>
                            <div id="equipment-character-info">
                                <div id="equipment-character-name"></div>
                                <div id="equipment-character-level"></div>
                                <div id="equipment-character-stats"></div>
                            </div>
                        </div>
                        <div class="equipment-slots-section">
                            <div class="equipment-slot" data-slot="rightHand">
                                <div class="slot-label">Right Hand</div>
                                <div class="slot-item" id="slot-rightHand"></div>
                            </div>
                            <div class="equipment-slot" data-slot="leftHand">
                                <div class="slot-label">Left Hand</div>
                                <div class="slot-item" id="slot-leftHand"></div>
                            </div>
                            <div class="equipment-slot" data-slot="armor">
                                <div class="slot-label">Armor</div>
                                <div class="slot-item" id="slot-armor"></div>
                            </div>
                            <div class="equipment-slot" data-slot="gloves">
                                <div class="slot-label">Gloves</div>
                                <div class="slot-item" id="slot-gloves"></div>
                            </div>
                            <div class="equipment-slot" data-slot="boots">
                                <div class="slot-label">Boots</div>
                                <div class="slot-item" id="slot-boots"></div>
                            </div>
                            <div class="equipment-slot" data-slot="accessory1">
                                <div class="slot-label">Accessory 1</div>
                                <div class="slot-item" id="slot-accessory1"></div>
                            </div>
                            <div class="equipment-slot" data-slot="accessory2">
                                <div class="slot-label">Accessory 2</div>
                                <div class="slot-item" id="slot-accessory2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const slots = modal.querySelectorAll(".equipment-slot");
            slots.forEach(slot => {
                slot.addEventListener("click", () => {
                    const slotName = slot.getAttribute("data-slot");
                    this.handleEquipmentSlotClick(slotName);
                });
            });
        }, 0);
        
        document.body.appendChild(modal);
        return modal;
    },
    
    /**
     * Update character sprite based on equipped weapon type
     * @param {Object} character - Character to update
     */
    updateCharacterSpriteBasedOnEquipment: function(character) {
        // Store original attack sprite if not already saved
        if (!character.originalAttackSprite) {
            character.originalAttackSprite = character.attackSprite;
        }
        
        // Get character's equipped weapon
        const equipment = Inventory.getCharacterEquipment(character.id);
        if (!equipment || !equipment.rightHand) {
            // No weapon equipped, always use default attack sprite
            character.attackSprite = character.originalAttackSprite;
            return;
        }
        
        const weapon = equipment.rightHand;
        
        // Choose animation based on weapon type
        if (weapon.equipmentType) {
            // Ranged weapons (bows, crossbows)
            if (["bow", "crossbow"].includes(weapon.equipmentType)) {
                character.attackSprite = character.rangedSprite;
            } 
            // Magic weapons (staffs, wands, grimoires)
            else if (["staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                character.attackSprite = character.magicSprite;
            }
            // All other weapons use the default attack sprite
            else {
                character.attackSprite = character.originalAttackSprite;
            }
        } else {
            // No equipment type specified, use default
            character.attackSprite = character.originalAttackSprite;
        }
    },
    
    /**
     * Update character equipment modal
     * @param {Object} character - Character data
     */
    updateCharacterEquipmentModal: function(character) {
        // Store the current character ID for equipment interactions
        this.currentEquipmentCharacterId = character.id;
        
        // Update character sprite based on equipped weapon
        this.updateCharacterSpriteBasedOnEquipment(character);
        
        const portrait = document.getElementById("equipment-character-portrait");
        if (portrait) {
            // Use thumbnail instead of full sprite for equipment modal
            portrait.style.backgroundImage = `url(${character.thumbnail || character.idleSprite})`;
            portrait.style.backgroundSize = "64px 64px"; // Make it a small thumbnail
            portrait.style.backgroundPosition = "center";
            portrait.style.backgroundRepeat = "no-repeat";
            portrait.style.width = "64px";
            portrait.style.height = "64px";
            portrait.style.margin = "0 auto";
            portrait.style.border = "2px solid var(--accent-cyan)";
            portrait.style.borderRadius = "5px";
            portrait.style.boxShadow = "0 0 10px rgba(0, 247, 255, 0.5)";
        }
        
        const name = document.getElementById("equipment-character-name");
        if (name) {
            name.textContent = character.name;
        }
        
        const level = document.getElementById("equipment-character-level");
        if (level) {
            level.textContent = `Level ${character.level}`;
        }
        
        const statsContainer = document.getElementById("equipment-character-stats");
        if (statsContainer) {
            statsContainer.innerHTML = "";
            
            // Add main stats
            const mainStats = ["HP", "SP", "Damage", "Defense"];
            const statValues = [
                `${character.stats.currentHp}/${character.stats.maxHp}`,
                `${character.stats.currentSp}/${character.stats.maxSp}`,
                character.stats.damage,
                character.stats.defense
            ];
            
            mainStats.forEach((stat, index) => {
                const statElement = document.createElement("div");
                statElement.className = "character-stat";
                statElement.innerHTML = `<span class="stat-name">${stat}:</span> <span class="stat-value">${statValues[index]}</span>`;
                statsContainer.appendChild(statElement);
            });
            // Add additional detailed stats for character info
            const additionalStats = [
                { name: "Attack Speed", value: character.stats.attackSpeed },
                { name: "Magic Damage", value: character.stats.magicDamage },
                { name: "Range Damage", value: character.stats.rangeDamage },
                { name: "Hit", value: character.stats.hit },
                { name: "Evasion", value: character.stats.evasion },
                { name: "Critical", value: character.stats.critical },
                { name: "Magic Defense", value: character.stats.magicDefense }
            ];
            additionalStats.forEach(statObj => {
                const statElement = document.createElement("div");
                statElement.className = "character-stat";
                statElement.innerHTML = `<span class="stat-name">${statObj.name}:</span> <span class="stat-value">${statObj.value}</span>`;
                statsContainer.appendChild(statElement);
            });
        }
        
        const equipment = Inventory.getCharacterEquipment(character.id);
        for (const slotName in equipment) {
            let slotElement = document.getElementById(`slot-${slotName}`);
            if (slotElement) {
                slotElement.innerHTML = "";
                slotElement.classList.remove("dual-wield-ref");
                const newSlot = slotElement.cloneNode(false);
                slotElement.parentNode.replaceChild(newSlot, slotElement);
                slotElement = newSlot;
                
                const item = equipment[slotName];
                if (item && !item.isDualWieldRef) {
                    let imgSrc = item.icon;
                    if (!imgSrc || imgSrc.includes("undefined")) {
                        imgSrc = Items.createPlaceholderImage(item.id);
                    }
                    const img = document.createElement("img");
                    img.src = imgSrc;
                    img.alt = item.name;
                    slotElement.appendChild(img);
                    
                    slotElement.addEventListener("mouseenter", (e) => {
                        Inventory.showItemTooltip(item, e.target);
                    });
                    
                    slotElement.addEventListener("mouseleave", () => {
                        Inventory.hideItemTooltip();
                    });
                    
                    slotElement.addEventListener("click", (e) => {
                        e.stopPropagation();
                        Inventory.unequipItem(slotName, character.id);
                        this.updateCharacterEquipmentModal(character);
                    });
                } else if (item && item.isDualWieldRef) {
                    slotElement.classList.add("dual-wield-ref");
                    const label = document.createElement("div");
                    label.className = "dual-wield-label";
                    label.textContent = "(Dual Wield)";
                    slotElement.appendChild(label);
                }
            }
        }
    },
    
    /**
     * Property to store the currently active equipment modal character ID
     */
    currentEquipmentCharacterId: null,

    /**
     * Handle equipment slot click: open equipment selection modal for the slot.
     * @param {string} slotName - Equipment slot name
     */
    handleEquipmentSlotClick: function(slotName) {
        console.log(`Clicked equipment slot: ${slotName}`);
        if (!this.currentEquipmentCharacterId) {
            console.error("No current equipment character set");
            return;
        }
        this.openEquipmentSelectionModal(slotName, this.currentEquipmentCharacterId);
    },

    /**
     * Opens a modal to display available equipment items for the specified slot.
     * @param {string} slotName - Equipment slot name
     * @param {string} characterId - Character ID
     */
    openEquipmentSelectionModal: function(slotName, characterId) {
        // Retrieve available equipment items for the slot from Inventory
        const availableItems = Inventory.getAvailableEquipmentForSlot(slotName, characterId);

        let modal = document.getElementById("equipment-selection-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "equipment-selection-modal";
            modal.className = "modal";
            document.body.appendChild(modal);
        }
        modal.innerHTML = "";
        
        // Build modal content
        const content = document.createElement("div");
        content.className = "modal-content";
        
        const header = document.createElement("div");
        header.className = "modal-header";
        const title = document.createElement("h2");
        title.className = "modal-title";
        title.textContent = "Select Equipment for " + slotName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        header.appendChild(title);
        const closeBtn = document.createElement("span");
        closeBtn.className = "close-modal";
        closeBtn.innerHTML = "&times;";
        closeBtn.addEventListener("click", function() {
            Utils.hideModal("equipment-selection-modal");
        });
        header.appendChild(closeBtn);
        content.appendChild(header);
        
        const body = document.createElement("div");
        body.className = "modal-body";
        
        if (availableItems.length === 0) {
            const noItemsMsg = document.createElement("div");
            noItemsMsg.textContent = "No available equipment for this slot.";
            noItemsMsg.style.textAlign = "center";
            noItemsMsg.style.padding = "20px";
            noItemsMsg.style.color = "#00f7ff";
            body.appendChild(noItemsMsg);
        } else {
            // Create equipment grid
            const equipmentGrid = document.createElement("div");
            equipmentGrid.className = "equipment-selection-grid";
            equipmentGrid.style.display = "grid";
            equipmentGrid.style.gridTemplateColumns = "repeat(auto-fill, 80px)";
            equipmentGrid.style.gap = "10px";
            equipmentGrid.style.justifyContent = "center";
            
            availableItems.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "equipment-item";
                
                // Set fixed size for equipment items
                itemDiv.style.width = "80px";
                itemDiv.style.height = "110px";
                itemDiv.style.padding = "8px";
                itemDiv.style.boxSizing = "border-box";
                itemDiv.style.border = "1px solid #444";
                itemDiv.style.borderRadius = "5px";
                itemDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                itemDiv.style.display = "flex";
                itemDiv.style.flexDirection = "column";
                itemDiv.style.alignItems = "center";
                itemDiv.style.cursor = "pointer";
                
                const imgContainer = document.createElement("div");
                imgContainer.style.width = "64px";
                imgContainer.style.height = "64px";
                imgContainer.style.display = "flex";
                imgContainer.style.justifyContent = "center";
                imgContainer.style.alignItems = "center";
                imgContainer.style.marginBottom = "5px";
                
                const img = document.createElement("img");
                img.src = item.icon || (Items.createPlaceholderImage ? Items.createPlaceholderImage(item.id) : "");
                img.alt = item.name;
                img.style.maxWidth = "64px";
                img.style.maxHeight = "64px";
                img.style.objectFit = "contain";
                
                imgContainer.appendChild(img);
                itemDiv.appendChild(imgContainer);
                
                const itemName = document.createElement("div");
                itemName.className = "equipment-item-name";
                itemName.textContent = item.name;
                itemName.style.fontSize = "12px";
                itemName.style.textAlign = "center";
                itemName.style.width = "100%";
                itemName.style.overflow = "hidden";
                itemName.style.textOverflow = "ellipsis";
                itemName.style.whiteSpace = "nowrap";
                itemDiv.appendChild(itemName);
                
                // Add rarity color if available
                if (item.rarity && item.rarity.color) {
                    itemDiv.style.borderColor = item.rarity.color;
                    itemName.style.color = item.rarity.color;
                }
                
                // Add tooltip functionality
                itemDiv.addEventListener("mouseenter", (e) => {
                    Inventory.showItemTooltip(item, e.target);
                });
                
                itemDiv.addEventListener("mouseleave", () => {
                    Inventory.hideItemTooltip();
                });
                
                itemDiv.addEventListener("click", () => {
                    // Equip the selected item using its index
                    Inventory.equipItem(item.index, characterId);
                    
                    // Update the equipment modal display for the character
                    const character = this.getCharacterById(characterId);
                    if (character) {
                        this.updateCharacterEquipmentModal(character);
                    }
                    Utils.hideModal("equipment-selection-modal");
                });
                
                equipmentGrid.appendChild(itemDiv);
            });
            
            body.appendChild(equipmentGrid);
        }
        
        content.appendChild(body);
        modal.appendChild(content);
        Utils.showModal("equipment-selection-modal");
    },
    
    /**
     * Position a character on the screen
     * @param {Object} character - Character to position
     */
    positionCharacter: function(character) {
        if (!character.mapElement) return;
        
        const container = document.getElementById("characters-container");
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const activeIndex = this.activeCharacters.indexOf(character);
        if (activeIndex === -1) return;
        
        // Position horizontally as before.
        character.x = 100 + (activeIndex * 600);
        
        // Use a fixed number of lanes (maxActiveCharacters) to ensure each character occupies a unique lane.
        const totalLanes = this.maxActiveCharacters; // Fixed number (6)
        const numActive = this.activeCharacters.length;
        const topFraction = 0.70;
        const bottomFraction = 0.73; // Constant span for 6 lanes.
        const laneSpacing = (bottomFraction - topFraction) / (totalLanes - 1);
        const lanes = [];
        for (let i = 0; i < totalLanes; i++) {
            lanes.push(containerRect.height * (topFraction + i * laneSpacing) - character.height);
        }
        // Center the active characters within the fixed lanes.
        const laneOffset = Math.floor((totalLanes - numActive) / 2);
        const laneIndex = activeIndex + laneOffset;
        character.y = lanes[laneIndex];
        character.baseY = character.y;
        
        character.mapElement.style.left = `${character.x}px`;
        character.mapElement.style.top = `${character.y}px`;
        // Ensure lower-positioned characters (with a higher y) are layered on top.
        character.mapElement.style.zIndex = Math.round(character.y);
    },
    
    /**
     * Update all characters
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateCharacters: function(deltaTime) {
        const now = Date.now();
        this.activeCharacters.forEach(character => {
            const frameElapsed = now - character.lastFrameTime;
            const frameDuration = character.isAttacking ? 100 : 200;
            if (frameElapsed >= frameDuration) {
                let frameCount;
                switch (character.currentAnimation) {
                    case "sit":
                    case "idle":
                        frameCount = 2;
                        break;
                    case "run":
                        frameCount = 8;
                        break;
                    case "attack":
                        frameCount = 13;
                        break;
                    case "ranged":
                        frameCount = 13;
                        break;
                    case "magic":
                        frameCount = 7;
                        break;
                    default:
                        frameCount = 2;
                        break;
                }
                
                // Store old frame for transition detection
                const oldFrame = character.currentFrame;
                
                // Update to new frame
                character.currentFrame = (character.currentFrame + 1) % frameCount;
                character.lastFrameTime = now;
                
                if (character.mapElement) {
                    let spriteUrl;
                    switch (character.currentAnimation) {
                        case "sit":
                            spriteUrl = character.sitSprite;
                            break;
                        case "run":
                            spriteUrl = character.runningSprite;
                            break;
                        case "attack":
                            spriteUrl = character.attackSprite;
                            // Apply attack width for attack animation
                            character.mapElement.style.width = `${character.attackWidth}px`;
                            break;
                        case "ranged":
                            spriteUrl = character.rangedSprite;
                            break;
                        case "magic":
                            spriteUrl = character.magicSprite;
                            break;
                        case "idle":
                        default:
                            spriteUrl = character.idleSprite;
                            // Reset to normal width for non-attack animations
                            character.mapElement.style.width = `${character.width}px`;
                            break;
                    }
                    character.mapElement.style.backgroundImage = `url(${spriteUrl})`;
                    
                    // Use attackWidth for attack animations, regular width for others
                    const frameWidth = character.currentAnimation === "attack" ? character.attackWidth : character.width;
                    character.mapElement.style.backgroundPosition = `-${character.currentFrame * frameWidth}px 0`;
                    
                    // Check for projectile launch at specific animation frames
                    if (character.pendingProjectile && character.isAttacking && 
                        typeof ProjectileEffects !== 'undefined') {
                        
                        let launchProjectile = false;
                        
                        // For ranged attacks (bow/crossbow), launch at specific frame
                        if (character.currentAnimation === "ranged") {
                            // Launch at frame 8 (about 2/3 through the animation)
                            if (character.currentFrame === 8) {
                                launchProjectile = true;
                                console.log("Launching arrow projectile from " + character.name);
                            }
                        }
                        // For magic attacks (staff/wand/grimoire), launch at specific frame
                        else if (character.currentAnimation === "magic") {
                            // Launch at frame 3 (middle of the animation)
                            if (character.currentFrame === 3) {
                                launchProjectile = true;
                                console.log("Launching fireball projectile from " + character.name);
                            }
                        }
                        
                        if (launchProjectile) {
                            // Get position info
                            const sourceX = character.x + character.width / 2;
                            const sourceY = character.y + character.height / 2;
                            const target = character.pendingProjectile.target;
                            
                            if (target && !target.isDead) {
                                const targetX = target.x + target.width / 2;
                                const targetY = target.y + target.height / 2;
                                
                                // Create the projectile
                                ProjectileEffects.createProjectile(
                                    character.pendingProjectile.type,
                                    sourceX, sourceY,
                                    targetX, targetY,
                                    target, 
                                    character
                                );
                            }
                            
                            // Clear pending projectile
                            character.pendingProjectile = null;
                        }
                    }
                }
                
                // Check for attack completion (loop back to frame 0)
                if (character.isAttacking && character.currentFrame === 0) {
                    character.isAttacking = false;
                    character.currentAnimation = "idle";
                    character.attackTarget = null;
                    
                    // Clear any remaining pending projectile
                    character.pendingProjectile = null;
                }
            }
            this.updateVerticalMovement(character, deltaTime);
            this.updateCooldowns(character, deltaTime);
            if (character.buffs) {
                CharacterBuffs.updateBuffs(character);
            }
            this.checkCombat(character);
        });
    },
    
    /**
     * Update vertical movement for character
     * @param {Object} character - Character to update
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateVerticalMovement: function(character, deltaTime) {
        if (!character.mapElement) return;
        
        // Initialize vertical movement properties with a wider range if not already set
        if (character.verticalRange === undefined) {
            character.verticalRange = Math.floor(Math.random() * 120) + 80; // Random range between 80 and 200px
            character.verticalSpeed = Math.random() * 0.5 + 0.1; // Random speed between 0.1 and 0.6
        }
        
        // Update vertical position based on direction and speed
        character.verticalOffset += character.verticalDirection * character.verticalSpeed * deltaTime;
        
        // Check if reached the boundaries of movement range and reverse direction
        if (Math.abs(character.verticalOffset) >= character.verticalRange / 2) {
            character.verticalDirection *= -1;
        }
        
        // Calculate new Y position ensuring it stays within 1-200px from base
        const newY = Math.max(character.baseY - character.verticalRange / 2, 
                    Math.min(character.baseY + character.verticalRange / 2, 
                    character.baseY + character.verticalOffset));
        
        // Update character position
        character.mapElement.style.top = `${newY}px`;
    },
    
    /**
     * Update ability cooldowns
     * @param {Object} character - Character to update
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateCooldowns: function(character, deltaTime) {
        for (const abilityId in character.cooldowns) {
            character.cooldowns[abilityId] -= deltaTime / 1000;
            if (character.cooldowns[abilityId] <= 0) {
                delete character.cooldowns[abilityId];
            }
        }
    },
    
    /**
     * Check for combat with monsters
     * @param {Object} character - Character to check
     */
    checkCombat: function(character) {
        if (character.isAttacking) return;
        
        const nearestMonster = this.getNearestMonster(character);
        if (nearestMonster) {
            // Calculate distance to monster
            const charCenter = {
                x: character.x + character.width / 2,
                y: character.y + character.height / 2
            };
            const monsterCenter = {
                x: nearestMonster.x + nearestMonster.width / 2,
                y: nearestMonster.y + nearestMonster.height / 2
            };
            const distance = Utils.distance(charCenter, monsterCenter);
            
            // Determine attack type and range based on equipped weapon
            let attackRange = character.attackRange; // Default melee range
            let isRangedAttack = false;
            
            // Get character's equipped weapon
            const equipment = Inventory.getCharacterEquipment(character.id);
            if (equipment && equipment.rightHand) {
                const weapon = equipment.rightHand;
                // Increased range for ranged/magic weapons
                if (weapon.equipmentType && 
                    ["bow", "crossbow", "staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                    attackRange = 250; // Use 250px range for ranged/magic weapons
                    isRangedAttack = true;
                    console.log(`Using extended attack range (${attackRange}px) for ${character.name} with ${weapon.equipmentType}`);
                }
            }
            
            // Check if in attack range
            const isOverlapping = MonsterSystem.getOverlappingMonster(character, 10);
            const isInAttackRange = distance <= attackRange;
            
            if (isOverlapping || isInAttackRange) {
                // Position character properly before attacking
                this.positionCharacterForAttack(character, nearestMonster, isRangedAttack);
                this.attackMonster(character, nearestMonster);
                // Reset chase tracking when attack happens
                character.chaseStartTime = 0;
                character.chaseDuration = 0;
                character.chaseTargetId = null;
            } else {
                // Track chasing time
                const now = Date.now();
                
                // If this is a new chase or different monster, reset chase timer
                if (character.chaseTargetId !== nearestMonster.id) {
                    character.chaseStartTime = now;
                    character.chaseDuration = 0;
                    character.chaseTargetId = nearestMonster.id;
                } else {
                    // Update chase duration
                    character.chaseDuration = now - character.chaseStartTime;
                }
                
                // Chase timeout check (3 seconds)
                if (character.chaseDuration > 3000) {
                    // Chase has gone on too long - force attack even from distance
                    this.positionCharacterForAttack(character, nearestMonster, false);
                    this.attackMonster(character, nearestMonster);
                    // Reset chase tracking
                    character.chaseStartTime = 0;
                    character.chaseDuration = 0;
                    character.chaseTargetId = null;
                } else {
                    // Regular chase behavior
                    this.moveTowardsMonster(character, nearestMonster);
                }
            }
        } else {
            // No monsters - return to idle state
            if (character.currentAnimation !== "idle") {
                this.setAnimation(character, "idle");
            }
            
            // Reset chase tracking when no monsters
            character.chaseStartTime = 0;
            character.chaseDuration = 0;
            character.chaseTargetId = null;
            
            const container = document.getElementById("characters-container");
            if (container) {
                // Return to base horizontal position
                const targetX = 100;
                if (Math.abs(character.x - targetX) > 10) {
                    const direction = character.x > targetX ? -1 : 1;
                    const moveSpeed = 3;
                    character.x += direction * moveSpeed;
                    if (character.mapElement) {
                        character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
                        character.mapElement.style.left = `${character.x}px`;
                    }
                }
                
                // Return to base vertical position
                if (Math.abs(character.y - character.baseY) > 5) {
                    const verticalDirection = character.y > character.baseY ? -1 : 1;
                    const verticalMoveSpeed = 2;
                    character.y += verticalDirection * verticalMoveSpeed;
                    if (character.mapElement) {
                        character.mapElement.style.top = `${character.y}px`;
                    }
                }
            }
        }
    },
    
    /**
     * Position character properly for attack (in front of monster)
     * @param {Object} character - Character to position
     * @param {Object} monster - Monster to attack
     * @param {boolean} isRangedAttack - Whether the attack is ranged
     */
    positionCharacterForAttack: function(character, monster, isRangedAttack) {
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        const direction = monsterCenterX > character.x + character.width / 2 ? 1 : -1;
        
        if (isRangedAttack) {
            // For ranged attacks, position the character at a distance
            // This allows ranged characters to attack from a safe distance
            const rangedDistance = 200; // Distance for ranged attacks
            character.x = monsterCenterX - (rangedDistance * direction) - character.width / 2;
            
            // Align character vertically with monster for ranged attacks
            character.y = monsterCenterY - character.height / 2;
        } else {
            // For melee attacks, position the character directly adjacent to the monster
            // This ensures melee characters are face-to-face with their targets
            const meleeDistance = monster.width / 2 + character.width / 2;
            character.x = monsterCenterX - (meleeDistance * direction) - character.width / 2;
            
            // Position character slightly elevated compared to monster for melee attacks
            // This creates a more dramatic attacking position from above
            const elevationOffset = 30; // Pixels to position character higher than monster
            character.y = monsterCenterY - character.height / 2 - elevationOffset;
        }
        
        // Ensure character faces the monster
        if (character.mapElement) {
            character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
            character.mapElement.style.left = `${character.x}px`;
            character.mapElement.style.top = `${character.y}px`;
        }
    },
    
    /**
     * Get the nearest monster to a character
     * @param {Object} character - Character to check
     * @returns {Object|null} Nearest monster or null if none
     */
    getNearestMonster: function(character) {
        if (MonsterSystem.activeMonsters.length === 0) return null;
        let nearestMonster = null;
        let nearestDistance = Infinity;
        MonsterSystem.activeMonsters.forEach(monster => {
            const distance = Utils.distance(
                { x: character.x + character.width / 2, y: character.y + character.height / 2 },
                { x: monster.x + monster.width / 2, y: monster.y + monster.height / 2 }
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestMonster = monster;
            }
        });
        return nearestMonster;
    },
    
    /**
     * Move a character towards a monster
     * @param {Object} character - Character to move
     * @param {Object} monster - Target monster
     */
    moveTowardsMonster: function(character, monster) {
        // Set character to running animation
        if (character.currentAnimation !== "run") {
            this.setAnimation(character, "run");
        }
        
        // Calculate centers
        const charCenterX = character.x + character.width / 2;
        const charCenterY = character.y + character.height / 2;
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        
        // Predict monster's next position based on its movement pattern
        // Simple prediction to help intercept vertically moving monsters
        let targetY = monsterCenterY;
        if (monster.verticalDirection !== undefined && monster.verticalSpeed !== undefined) {
            // Adjust target Y position based on monster's movement direction
            targetY += monster.verticalDirection * (monster.verticalSpeed * 30);
        }
        
        // Calculate distance
        const distance = Utils.distance(
            { x: charCenterX, y: charCenterY },
            { x: monsterCenterX, y: targetY }
        );
        
        // If getting close to attack range, slow down for more precision
        const moveSpeed = distance < character.attackRange * 1.5 ? 1.2 : 2.5;
        const verticalMoveSpeed = distance < character.attackRange * 1.5 ? 0.8 : 1.2;
        
        // Determine movement direction
        const direction = monsterCenterX > charCenterX ? 1 : -1;
        character.x += direction * moveSpeed;
        
        // Vertical movement - move character toward monster's predicted Y position
        const verticalDirection = targetY > charCenterY ? 1 : -1;
        
        // Only move vertically if there's a significant vertical difference
        if (Math.abs(charCenterY - targetY) > 5) {
            character.y += verticalDirection * verticalMoveSpeed;
            
            // Make sure character stays within its allowed vertical range from base position
            const maxVerticalDeviation = character.verticalRange ? character.verticalRange / 2 : 100;
            character.y = Math.max(character.baseY - maxVerticalDeviation, 
                        Math.min(character.baseY + maxVerticalDeviation, character.y));
        }
        
        // Update character visual
        if (character.mapElement) {
            character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
            character.mapElement.style.left = `${character.x}px`;
            character.mapElement.style.top = `${character.y}px`;
        }
    },
    
    /**
     * Attack a monster
     * @param {Object} character - Attacking character
     * @param {Object} monster - Target monster
     */
    attackMonster: function(character, monster) {
        character.isAttacking = true;
        character.attackTarget = monster.id;
        const charCenterX = character.x + character.width / 2;
        const monsterCenterX = monster.x + monster.width / 2;
        const direction = monsterCenterX > charCenterX ? 1 : -1;
        if (character.mapElement) {
            character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
        }
        
        // Get character's equipped weapon
        const equipment = Inventory.getCharacterEquipment(character.id);
        const weapon = equipment.rightHand;
        
        // Choose animation based on weapon type
        let animationType = "attack"; // Default melee attack
        let projectileType = null;
        let soundEffect = "attackSprite"; // Default attack sound
        
        if (weapon && weapon.equipmentType) {
            // Ranged weapons (bows, crossbows)
            if (["bow", "crossbow"].includes(weapon.equipmentType)) {
                animationType = "ranged";
                projectileType = "ARROW";
                soundEffect = "rangedSprite";
            } 
            // Magic weapons (staffs, wands, grimoires)
            else if (["staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                animationType = "magic";
                projectileType = "FIREBALL";
                soundEffect = "magicSprite";
            }
        }
        
        // Play the appropriate sound effect if AudioSystem is available
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playSoundEffect(soundEffect);
        }
        
        // Set the animation based on weapon type
        this.setAnimation(character, animationType);
        
        character.currentFrame = 0;
        if (character.mapElement) {
            character.mapElement.style.backgroundPosition = "0 0";
        }
        
        // For ranged and magic attacks, schedule projectile creation
        if (projectileType) {
            // Store the target info for projectile launch at the end of animation
            character.pendingProjectile = {
                type: projectileType,
                target: monster
            };
        } else {
            // For melee attacks, apply damage immediately
            const damage = Math.round(character.stats.damage);
            MonsterSystem.damageMonster(monster.id, damage, character);
        }
    },
    
    /**
     * Set character animation
     * @param {Object} character - Character to animate
     * @param {string} animation - Animation name ("idle", "run", "attack", etc.)
     */
    setAnimation: function(character, animation) {
        if (character.currentAnimation === animation) return;
        character.currentAnimation = animation;
        character.currentFrame = 0;
        if (character.mapElement) {
            let spriteUrl;
            switch (animation) {
                case "sit":
                    spriteUrl = character.sitSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "run":
                    spriteUrl = character.runningSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "attack":
                    spriteUrl = character.attackSprite;
                    // Use the wider width for attack animation
                    character.mapElement.style.width = `${character.attackWidth}px`;
                    break;
                case "ranged":
                    spriteUrl = character.rangedSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "magic":
                    spriteUrl = character.magicSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "idle":
                default:
                    spriteUrl = character.idleSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
            }
            character.mapElement.style.backgroundImage = `url(${spriteUrl})`;
            character.mapElement.style.backgroundPosition = "0 0";
        }
    },
    
    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|null} Character object or null if not found
     */
    getCharacterById: function(id) {
        return this.characters.find(char => char.id === id);
    },
    
    /**
     * Check if a character is active
     * @param {string} id - Character ID
     * @returns {boolean} True if character is active
     */
    isCharacterActive: function(id) {
        return this.activeCharacters.some(char => char.id === id);
    },
    
    /**
     * Get all active characters
     * @returns {Array} Array of active characters
     */
    getActiveCharacters: function() {
        return this.activeCharacters;
    },
    
    /**
     * Get the active character (first one)
     * @returns {Object|null} Active character or null if none
     */
    getActiveCharacter: function() {
        return this.activeCharacters.length > 0 ? this.activeCharacters[0] : null;
    },
    
    /**
     * Open the character list UI with Three.js visualization
     */
    openCharacterList: function() {
        // Create modal if it doesn't exist
        let modal = document.getElementById("character-list-modal");
        if (!modal) {
            modal = this.createCharacterListModal();
        }
        
        // Show the modal
        Utils.showModal("character-list-modal");
        
        // Initialize Three.js visualization after modal is shown
        setTimeout(() => {
            if (typeof CharacterThreeEnvironment !== 'undefined') {
                CharacterThreeEnvironment.init('character-three-container');
            } else {
                console.warn('CharacterThreeEnvironment not available, falling back to standard UI');
                this.updateCharacterListUI();
            }
        }, 100);
    },
    
    /**
     * Create character list modal with Three.js container
     * @returns {HTMLElement} Modal element
     */
    createCharacterListModal: function() {
        const modal = document.createElement("div");
        modal.id = "character-list-modal";
        modal.className = "modal";
        
        modal.innerHTML = `
            <div class="modal-content cyberpunk-modal">
                <div class="modal-header">
                    <h2 class="modal-title">CHARACTER ROSTER</h2>
                    <span class="close-modal" onclick="Utils.hideModal('character-list-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Three.js container -->
                    <div id="character-three-container" class="character-three-container" style="width: 100%; height: 70vh;"></div>
                    
                    <!-- Fallback container for standard UI -->
                    <div id="character-list-container" style="display: none;">
                        <div id="character-list"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="character-count-info">
                        Characters: <span id="active-character-count">0</span>/<span id="total-character-count">0</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add some additional styles for the modal
        const style = document.createElement("style");
        style.textContent = `
            .character-three-container {
                background-color: rgb(0, 13, 31);
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0, 247, 255, 0.3);
            }
            
            .modal-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background-color: rgba(0, 13, 31, 0.8);
                border-top: 1px solid rgba(0, 247, 255, 0.3);
            }
            
            .character-count-info {
                color: #00f7ff;
                font-size: 14px;
            }
            
            #character-action-buttons {
                transition: all 0.3s ease;
                transform-origin: top left;
                animation: buttonAppear 0.3s forwards;
            }
            
            @keyframes buttonAppear {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    },
    
    /**
     * Update the character list UI (fallback when Three.js isn't available)
     */
    updateCharacterListUI: function() {
        const characterList = document.getElementById("character-list");
        if (!characterList) return;
        characterList.innerHTML = "";
        
        // Update character counts
        const activeCount = document.getElementById("active-character-count");
        const totalCount = document.getElementById("total-character-count");
        if (activeCount) activeCount.textContent = this.activeCharacters.length;
        if (totalCount) totalCount.textContent = this.characters.length;
        
        // Show standard UI container and hide Three.js container
        const threeContainer = document.getElementById("character-three-container");
        const standardContainer = document.getElementById("character-list-container");
        
        if (threeContainer) threeContainer.style.display = "none";
        if (standardContainer) standardContainer.style.display = "block";
        
        const uniqueCharacters = {};
        this.characters.forEach(character => {
            uniqueCharacters[character.id] = character;
        });
        
        Object.values(uniqueCharacters).forEach(character => {
            const card = document.createElement("div");
            card.className = `character-card ${this.isCharacterActive(character.id) ? "active" : ""}`;
            card.dataset.id = character.id;
            
            // Character image container
            const imgContainer = document.createElement("div");
            imgContainer.className = "character-image-container";
            const img = document.createElement("img");
            img.src = character.thumbnail || character.idleSprite;
            img.alt = character.name;
            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
            
            // Character name at the top 
            const name = document.createElement("h3");
            name.textContent = character.name;
            name.style.marginTop = "0";
            name.style.marginBottom = "5px";
            name.style.textAlign = "center";
            card.appendChild(name);
            
            // Character info section
            const infoSection = document.createElement("div");
            infoSection.className = "character-info";
            
            // Level first
            const level = document.createElement("div");
            level.className = "character-level";
            level.textContent = `Level ${character.level}`;
            infoSection.appendChild(level);
            
            // Add upgrade level info
            const upgradeInfo = document.createElement("div");
            upgradeInfo.className = "upgrade-info";
            
            // Current upgrade level as overlay on character image
            const upgradeLevel = document.createElement("div");
            upgradeLevel.className = "upgrade-level";
            upgradeLevel.innerHTML = `<span>Upgrade</span><span>Lv. ${character.level}</span>`;
            upgradeLevel.style.position = "absolute";
            upgradeLevel.style.top = "30px"; // Position below character name
            upgradeLevel.style.left = "0";
            upgradeLevel.style.width = "100%";
            upgradeLevel.style.fontSize = "16px";
            upgradeLevel.style.fontWeight = "bold";
            upgradeLevel.style.color = "#f7ff00"; // Bright yellow for contrast
            upgradeLevel.style.textAlign = "center";
            upgradeLevel.style.padding = "3px 0";
            upgradeLevel.style.backgroundColor = "rgba(0, 0, 30, 0.7)";
            upgradeLevel.style.zIndex = "5";
            upgradeLevel.style.textShadow = "0 0 3px #000, 0 0 5px #000";
            imgContainer.appendChild(upgradeLevel); // Add to image container instead of upgradeInfo
            
            // Upgrade progress bar
            const upgradeBarContainer = document.createElement("div");
            upgradeBarContainer.className = "upgrade-bar-container";
            upgradeBarContainer.style.width = "100%";
            upgradeBarContainer.style.height = "10px";
            upgradeBarContainer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
            upgradeBarContainer.style.borderRadius = "5px";
            upgradeBarContainer.style.margin = "5px 0";
            
            const upgradeFill = document.createElement("div");
            upgradeFill.className = "upgrade-fill";
            
            // Calculate upgrade progress (using XP as placeholder)
            const xpRequired = character.level * 1000;
            const currentXp = character.experience % xpRequired;
            const upgradeProgress = (currentXp / xpRequired) * 100;
            
            upgradeFill.style.width = `${upgradeProgress}%`;
            upgradeFill.style.height = "100%";
            upgradeFill.style.backgroundColor = "#aa00ff";
            upgradeFill.style.borderRadius = "5px";
            upgradeBarContainer.appendChild(upgradeFill);
            
            // Append upgrade elements
            upgradeInfo.appendChild(upgradeBarContainer);
            
            // Add upgrade info to character info section
            infoSection.appendChild(upgradeInfo);
            
            // Add rarity indicator at the bottom
            const rarityElement = document.createElement("div");
            rarityElement.className = `rarity rarity-${character.rarity}`;
            rarityElement.textContent = character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1);
            card.appendChild(rarityElement);
            
            card.appendChild(infoSection);
            
            card.addEventListener("click", (event) => {
                this.handleCharacterCardClick(character.id, event);
            });
            
            characterList.appendChild(card);
        });
    },
    
    /**
     * Handle character card click
     * @param {string} characterId - Character ID
     */
    handleCharacterCardClick: function(characterId, event) {
        // Show the character popover instead of the full modal
        this.showCharacterPopover(characterId, event);
    },
    
    /**
     * Show character popover with action buttons
     * @param {string} characterId - Character ID
     * @param {MouseEvent} event - Click event
     */
    showCharacterPopover: function(characterId, event) {
        const character = this.getCharacterById(characterId);
        if (!character) return;
        
        // Remove any existing popovers
        this.hideAllPopovers();
        
        // Create popover element
        const popover = document.createElement("div");
        popover.className = "character-popover";
        popover.id = `character-popover-${characterId}`;
        
        // Add character name as header
        const header = document.createElement("div");
        header.className = "character-popover-header";
        header.textContent = character.name;
        popover.appendChild(header);
        
        // Create deploy/dispatch toggle
        const isActive = this.isCharacterActive(characterId);
        const deployToggle = document.createElement("div");
        deployToggle.className = "character-switch-container";
        
        const toggleLabel = document.createElement("div");
        toggleLabel.className = "character-switch-label";
        toggleLabel.textContent = "Deploy";
        deployToggle.appendChild(toggleLabel);
        
        const switchLabel = document.createElement("label");
        switchLabel.className = "character-switch";
        
        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.checked = isActive;
        
        const slider = document.createElement("span");
        slider.className = "character-switch-slider";
        
        switchLabel.appendChild(toggleInput);
        switchLabel.appendChild(slider);
        deployToggle.appendChild(switchLabel);
        
        // Add toggle event
        toggleInput.addEventListener("change", () => {
            if (toggleInput.checked) {
                this.activateCharacter(characterId);
            } else {
                this.deactivateCharacter(characterId);
            }
            
            // Update character list UI if visible
            if (document.getElementById("character-list-modal").style.display !== "none") {
                this.updateCharacterListUI();
            }
        });
        
        popover.appendChild(deployToggle);
        
        // Equipment button
        const equipmentButton = document.createElement("button");
        equipmentButton.className = "character-popover-button equipment";
        equipmentButton.textContent = "Equipment";
        equipmentButton.addEventListener("click", () => {
            this.hideAllPopovers();
            this.openCharacterEquipmentModal(characterId);
        });
        popover.appendChild(equipmentButton);
        
        // Upgrade button
        const upgradeButton = document.createElement("button");
        upgradeButton.className = "character-popover-button upgrade";
        upgradeButton.textContent = "Upgrade";
        upgradeButton.addEventListener("click", () => {
            this.hideAllPopovers();
            if (typeof ShardSystem !== 'undefined' && ShardSystem.showUpgradeUI) {
                ShardSystem.showUpgradeUI(characterId);
            } else {
                console.error("Shard system not available");
            }
        });
        popover.appendChild(upgradeButton);
        
        // Add to document
        document.body.appendChild(popover);
        
        // Position popover near the clicked element
        const targetElement = event.currentTarget || event.target;
        const rect = targetElement.getBoundingClientRect();
        popover.style.left = `${rect.right + 10}px`;
        popover.style.top = `${rect.top}px`;
        
        // Ensure popover is fully visible on screen
        const popoverRect = popover.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (popoverRect.right > windowWidth) {
            // Show on left side of target if won't fit on right
            popover.style.left = `${rect.left - popoverRect.width - 10}px`;
        }
        
        if (popoverRect.bottom > windowHeight) {
            // Adjust vertical position to fit
            popover.style.top = `${Math.max(0, rect.top - (popoverRect.bottom - windowHeight))}px`;
        }
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick);
        }, 0);
    },
    
    /**
     * Handle click outside of popover to close it
     * @param {MouseEvent} event - Click event
     */
    handleOutsideClick: function(event) {
        const popover = document.querySelector('.character-popover');
        if (popover && !popover.contains(event.target) && 
            !event.target.closest('.character-card')) {
            CharacterSystem.hideAllPopovers();
        }
    },
    
    /**
     * Hide all character popovers
     */
    hideAllPopovers: function() {
        const popovers = document.querySelectorAll('.character-popover');
        popovers.forEach(popover => popover.remove());
        document.removeEventListener('click', this.handleOutsideClick);
    },
    
    /**
     * Show the character actions menu with EQUIP, DEPLOY/DISPATCH, UPGRADE buttons
     * @param {string} characterId - Character ID
     */
    showCharacterActionsMenu: function(characterId) {
        const character = this.getCharacterById(characterId);
        if (!character) return;
        
        // Check if modal already exists
        let modal = document.getElementById("character-actions-modal");
        if (!modal) {
            // Create the modal
            modal = document.createElement("div");
            modal.id = "character-actions-modal";
            modal.className = "modal";
            
            // Create modal content
            const content = document.createElement("div");
            content.className = "modal-content";
            
            // Modal header
            const header = document.createElement("div");
            header.className = "modal-header";
            
            const title = document.createElement("h2");
            title.className = "modal-title";
            title.textContent = "Character Actions";
            
            const closeButton = document.createElement("span");
            closeButton.className = "close-modal";
            closeButton.innerHTML = "&times;";
            closeButton.addEventListener("click", () => {
                Utils.hideModal("character-actions-modal");
            });
            
            header.appendChild(title);
            header.appendChild(closeButton);
            
            // Create body
            const body = document.createElement("div");
            body.className = "modal-body";
            
            // Character info
            const characterInfo = document.createElement("div");
            characterInfo.className = "character-info";
            
            const characterImage = document.createElement("img");
            characterImage.src = character.thumbnail || character.idleSprite;
            characterImage.alt = character.name;
            
            const characterDetails = document.createElement("div");
            characterDetails.className = "character-details";
            
            const characterName = document.createElement("div");
            characterName.textContent = character.name;
            
            const characterLevel = document.createElement("div");
            characterLevel.textContent = `Level ${character.level}`;
            
            const characterRarity = document.createElement("div");
            characterRarity.textContent = character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1);
            characterRarity.className = `rarity-${character.rarity}`;
            
            characterDetails.appendChild(characterName);
            characterDetails.appendChild(characterLevel);
            characterDetails.appendChild(characterRarity);
            
            characterInfo.appendChild(characterImage);
            characterInfo.appendChild(characterDetails);
            
            // Create HP bar
            const hpContainer = document.createElement("div");
            hpContainer.className = "stat-container";
            
            const hpLabel = document.createElement("div");
            hpLabel.className = "stat-label";
            const hpName = document.createElement("span");
            hpName.textContent = "HP";
            const hpValue = document.createElement("span");
            hpValue.textContent = `${character.stats.currentHp}/${character.stats.maxHp}`;
            hpLabel.appendChild(hpName);
            hpLabel.appendChild(hpValue);
            
            const hpBarContainer = document.createElement("div");
            hpBarContainer.className = "stat-bar-container hp-bar";
            const hpFill = document.createElement("div");
            hpFill.className = "stat-fill";
            hpFill.style.width = `${(character.stats.currentHp / character.stats.maxHp) * 100}%`;
            hpBarContainer.appendChild(hpFill);
            
            hpContainer.appendChild(hpLabel);
            hpContainer.appendChild(hpBarContainer);
            
            // Create SP bar
            const spContainer = document.createElement("div");
            spContainer.className = "stat-container";
            
            const spLabel = document.createElement("div");
            spLabel.className = "stat-label";
            const spName = document.createElement("span");
            spName.textContent = "SP";
            const spValue = document.createElement("span");
            spValue.textContent = `${character.stats.currentSp}/${character.stats.maxSp}`;
            spLabel.appendChild(spName);
            spLabel.appendChild(spValue);
            
            const spBarContainer = document.createElement("div");
            spBarContainer.className = "stat-bar-container sp-bar";
            const spFill = document.createElement("div");
            spFill.className = "stat-fill";
            spFill.style.width = `${(character.stats.currentSp / character.stats.maxSp) * 100}%`;
            spBarContainer.appendChild(spFill);
            
            spContainer.appendChild(spLabel);
            spContainer.appendChild(spBarContainer);
            
            // Create XP bar
            const xpRequired = character.level * 1000;
            const currentXp = character.experience % xpRequired;
            const xpContainer = document.createElement("div");
            xpContainer.className = "stat-container";
            
            const xpLabel = document.createElement("div");
            xpLabel.className = "stat-label";
            const xpName = document.createElement("span");
            xpName.textContent = "XP";
            const xpValue = document.createElement("span");
            xpValue.textContent = `${currentXp}/${xpRequired}`;
            xpLabel.appendChild(xpName);
            xpLabel.appendChild(xpValue);
            
            const xpBarContainer = document.createElement("div");
            xpBarContainer.className = "stat-bar-container xp-bar";
            const xpFill = document.createElement("div");
            xpFill.className = "stat-fill";
            xpFill.style.width = `${(currentXp / xpRequired) * 100}%`;
            xpBarContainer.appendChild(xpFill);
            
            xpContainer.appendChild(xpLabel);
            xpContainer.appendChild(xpBarContainer);
            
            // Add stat bars
            const statBars = document.createElement("div");
            statBars.className = "character-stat-bars";
            statBars.appendChild(hpContainer);
            statBars.appendChild(spContainer);
            statBars.appendChild(xpContainer);
            
            // Action buttons container
            const actionButtons = document.createElement("div");
            actionButtons.className = "action-buttons";
            
            // Equipment button
            const equipButton = document.createElement("button");
            equipButton.className = "game-button equip";
            equipButton.textContent = "EQUIP";
            equipButton.addEventListener("click", () => {
                Utils.hideModal("character-actions-modal");
                this.openCharacterEquipmentModal(characterId);
            });
            
            // Deploy/Dispatch button
            const deployButton = document.createElement("button");
            const isActive = this.isCharacterActive(characterId);
            
            if (isActive) {
                deployButton.className = "game-button dispatch";
                deployButton.textContent = "DISPATCH";
            } else {
                deployButton.className = "game-button deploy";
                deployButton.textContent = "DEPLOY";
            }
            
            deployButton.addEventListener("click", () => {
                if (isActive) {
                    this.deactivateCharacter(characterId);
                } else {
                    this.activateCharacter(characterId);
                }
                Utils.hideModal("character-actions-modal");
                this.updateCharacterListUI();
            });
            
            // Upgrade button
            const upgradeButton = document.createElement("button");
            upgradeButton.className = "game-button upgrade";
            upgradeButton.textContent = "UPGRADE";
            upgradeButton.addEventListener("click", () => {
                Utils.hideModal("character-actions-modal");
                if (typeof ShardSystem !== 'undefined' && ShardSystem.showUpgradeUI) {
                    ShardSystem.showUpgradeUI(characterId);
                } else {
                    console.error("Shard system not available");
                }
            });
            
            actionButtons.appendChild(equipButton);
            actionButtons.appendChild(deployButton);
            actionButtons.appendChild(upgradeButton);
            
            // Add elements to body
            body.appendChild(characterInfo);
            body.appendChild(statBars);
            body.appendChild(actionButtons);
            
            // Assemble modal
            content.appendChild(header);
            content.appendChild(body);
            modal.appendChild(content);
            
            document.body.appendChild(modal);
        } else {
            // Update existing modal for this character
            const characterName = modal.querySelector(".modal-title");
            if (characterName) characterName.textContent = `Character Actions: ${character.name}`;
            
            const characterImage = modal.querySelector("img");
            if (characterImage) characterImage.src = character.thumbnail || character.idleSprite;
            
            const nameDisplay = modal.querySelector(".modal-body div div:first-child");
            if (nameDisplay) nameDisplay.textContent = character.name;
            
            const levelDisplay = modal.querySelector(".modal-body div div:nth-child(2)");
            if (levelDisplay) levelDisplay.textContent = `Level ${character.level}`;
            
            const rarityDisplay = modal.querySelector(".modal-body div div:nth-child(3)");
            if (rarityDisplay) {
                rarityDisplay.textContent = character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1);
                rarityDisplay.className = `rarity-${character.rarity}`;
            }
            
            // Update deploy/dispatch button
            const deployButton = modal.querySelectorAll("button")[1];
            if (deployButton) {
                const isActive = this.isCharacterActive(characterId);
                deployButton.textContent = isActive ? "DISPATCH" : "DEPLOY";
                deployButton.onclick = () => {
                    if (isActive) {
                        this.deactivateCharacter(characterId);
                    } else {
                        this.activateCharacter(characterId);
                    }
                    Utils.hideModal("character-actions-modal");
                    this.updateCharacterListUI();
                };
            }
        }
        
        // Show the modal
        Utils.showModal("character-actions-modal");
    },
    
    /**
     * Add experience to a character
     * @param {Object} character - Character to add experience to
     * @param {number} amount - Amount of experience to add
     */
    addExperience: function(character, amount) {
        character.experience += amount;
        const newLevel = Utils.calculateLevel(character.experience);
        const leveledUp = newLevel > character.level;
        if (leveledUp) {
            character.level = newLevel;
            this.calculateDerivedStats(character);
            Utils.createDamageText(character.x + character.width / 2, character.y, "Level Up!", "#ffff00");
        }
        return leveledUp;
    },
    
    /**
     * Heal a character
     * @param {Object} character - Character to heal
     * @param {number} amount - Amount to heal
     */
    heal: function(character, amount) {
        character.stats.currentHp = Math.min(character.stats.currentHp + amount, character.stats.maxHp);
        Utils.createDamageText(character.x + character.width / 2, character.y, amount, "#00ff00");
        UIManager.updateCharacterHpBar(character);
        if (this.activeCharacters.length > 0 && this.activeCharacters[0].id === character.id) {
            UIManager.updateCharacterStatsDisplay(character);
        }
    },
    
    /**
     * Reset stats method for a character instance
     */
    addResetStatsMethod: function(character) {
        character.resetStats = function() {
            CharacterSystem.resetStats(this);
        };
    },
    
    /**
     * Reset character stats to base values
     * @param {Object} character - Character to reset
     */
    resetStats: function(character) {
        for (const key in character.baseStats) {
            character.stats[key] = character.baseStats[key];
        }
        this.calculateDerivedStats(character);
    },
    
    /**
     * Save character data
     */
    saveData: function() {
        const data = {
            characters: this.characters.map(char => ({
                id: char.id,
                name: char.name,
                level: char.level,
                experience: char.experience,
                stats: char.stats,
                baseStats: char.baseStats,
                abilities: char.abilities,
                sitSprite: char.sitSprite,
                idleSprite: char.idleSprite,
                runningSprite: char.runningSprite,
                attackSprite: char.attackSprite,
                rangedSprite: char.rangedSprite,
                magicSprite: char.magicSprite,
                specialAbility: char.specialAbility,
                thumbnail: char.thumbnail,
                rarity: char.rarity
            })),
            activeCharacters: this.activeCharacters.map(char => char.id)
        };
        Utils.saveToStorage("characters", data);
    },
    
    /**
     * Load character data
     * @returns {Object|null} Loaded character data or null if not found
     */
    loadData: function() {
        return Utils.loadFromStorage("characters");
    }
};
