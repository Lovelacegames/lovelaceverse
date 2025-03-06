/**
 * Monster system for the Cyberpunk MMORPG game
 * Defines monster types, behaviors, and combat mechanics
 */

const MonsterSystem = {
    // Active monsters
    activeMonsters: [],
    
    // Monster types registry
    monsterTypes: {
        slime: { 
            type: 'basic', 
            maxHealth: 200, 
            attack: 10, 
            defense: 1, 
            speed: 5, 
            experienceValue: 15, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 64,
            height: 64,
            frameCount: 4,
            frameDuration: 200,
            dropRate: 0.8,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.7, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 10, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 10, quantity: [1, 1] },
                { itemId: 'quantum_shield', chance: 10, quantity: [1, 1] },
                { itemId: 'neural_implant', chance: 10, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 10, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 10, quantity: [1, 1] },
                { itemId: 'synth_vest', chance: 10, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 10, quantity: [1, 1] },
                { itemId: 'auto_crossbow', chance: 10, quantity: [1, 1] },
                { itemId: 'binary_blades', chance: 10, quantity: [1, 1] },
                { itemId: 'twin_fangs', chance: 10, quantity: [1, 1] },
                { itemId: 'synth_vest', chance: 10, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.3, quantity: [1, 1] }
            ]
        },
        goblin: { 
            type: 'basic', 
            maxHealth: 200, 
            attack: 10, 
            defense: 1, 
            speed: 5, 
            experienceValue: 20, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 64,
            height: 64,
            frameCount: 4,
            frameDuration: 180,
            dropRate: 0.85,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.6, quantity: [2, 4] },
                { itemId: 'circuit_board', chance: 0.3, quantity: [1, 2] },
                { itemId: 'health_stim', chance: 0.2, quantity: [1, 1] }
            ]
        },
        skeleton: { 
            type: 'basic', 
            maxHealth: 80, 
            attack: 8, 
            defense: 3, 
            speed: 1, 
            experienceValue: 25, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 64,
            height: 64,
            frameCount: 4,
            frameDuration: 220,
            dropRate: 0.9,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.5, quantity: [3, 5] },
                { itemId: 'circuit_board', chance: 0.4, quantity: [1, 3] },
                { itemId: 'energy_drink', chance: 0.2, quantity: [1, 1] }
            ]
        },
        orc: { 
            type: 'elite', 
            maxHealth: 100, 
            attack: 12, 
            defense: 5, 
            speed: 0.8, 
            experienceValue: 50, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 80,
            height: 80,
            frameCount: 4,
            frameDuration: 250,
            dropRate: 0.95,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.7, quantity: [5, 8] },
                { itemId: 'circuit_board', chance: 0.5, quantity: [2, 4] },
                { itemId: 'energy_drink', chance: 0.3, quantity: [1, 2] },
                { itemId: 'nano_repair', chance: 0.2, quantity: [1, 1] }
            ]
        },
        dragon: { 
            type: 'boss', 
            maxHealth: 300, 
            attack: 20, 
            defense: 10, 
            speed: 0.5, 
            experienceValue: 100, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 120,
            height: 120,
            frameCount: 4,
            frameDuration: 300,
            dropRate: 1.0,
            dropTable: [
                { itemId: 'scrap_metal', chance: 1.0, quantity: [10, 15] },
                { itemId: 'circuit_board', chance: 0.8, quantity: [5, 8] },
                { itemId: 'quantum_core', chance: 0.5, quantity: [1, 2] },
                { itemId: 'nano_repair', chance: 0.6, quantity: [1, 3] }
            ]
        }
    },
    
    /**
     * Initialize the monster system
     */
    init: function() {
        this.activeMonsters = [];
    },
    
    /**
     * Create a new monster
     * @param {string} type - Monster type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} Created monster
     */
    createMonster: function(type, x, y) {
        const monsterType = this.monsterTypes[type];
        if (!monsterType) {
            console.error(`Unknown monster type: ${type}`);
            return null;
        }
        
        // Create monster instance
        const monster = {
            id: Utils.generateId(),
            type: type,
            x: x,
            y: y,
            width: monsterType.width,
            height: monsterType.height,
            health: monsterType.maxHealth,
            maxHealth: monsterType.maxHealth,
            attack: monsterType.attack,
            defense: monsterType.defense,
            speed: monsterType.speed,
            experienceValue: monsterType.experienceValue,
            behavior: monsterType.behavior,
            sprite: monsterType.sprite,
            hitSprite: monsterType.hitSprite,
            attackHitSprite: monsterType.attackHitSprite || monsterType.hitSprite,
            frameCount: monsterType.frameCount,
            frameDuration: monsterType.frameDuration,
            currentFrame: 0,
            lastFrameTime: Date.now(),
            isHit: false,
            hitTime: 0,
            hitDuration: 300, // milliseconds
            isAttacking: false,
            attackTime: 0,
            stunDuration: 2000, // 2 seconds stun when hit
            detectionRange: 300, // Distance to detect characters
            // Movement state variables
            movementState: 'idle', // 'idle', 'moving', 'waiting'
            nextStateChangeTime: Date.now() + Math.random() * 3000, // Random initial state
            verticalDirection: Math.random() < 0.5 ? 1 : -1,
            verticalSpeed: Math.random() * 0.05 + 0.02, // Even slower: 0.02-0.07
            waitDuration: 0, // Time to wait in idle state
            baseY: y, // Store original Y position
            verticalRange: Math.floor(Math.random() * 120) + 80, // Random range between 80 and 200px
            effects: [], // Status effects
            dropRate: monsterType.dropRate,
            dropTable: monsterType.dropTable,
            element: null // DOM element
        };
        
        // Create monster element
        monster.element = this.createMonsterElement(monster);
        
        // Add to active monsters
        this.activeMonsters.push(monster);
        
        return monster;
    },
    
    /**
     * Create a DOM element for a monster
     * @param {Object} monster - Monster data
     * @returns {HTMLElement} Monster element
     */
    createMonsterElement: function(monster) {
        const monstersContainer = document.getElementById('monsters-container');
        if (!monstersContainer) return null;
        
        // Create element
        const element = document.createElement('div');
        element.className = 'monster-sprite';
        element.id = `monster-${monster.id}`;
        element.style.width = `${monster.width}px`;
        element.style.height = `${monster.height}px`;
        element.style.left = `${monster.x}px`;
        element.style.top = `${monster.y}px`;
        element.style.backgroundImage = `url(${monster.sprite})`;
        element.style.backgroundSize = `${monster.width * monster.frameCount}px ${monster.height}px`;
        element.style.backgroundPosition = '0 0';
        
        // Add health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'monster-health-bar';
        healthBar.style.width = '100%';
        healthBar.style.height = '4px';
        healthBar.style.backgroundColor = '#ff0000';
        healthBar.style.position = 'absolute';
        healthBar.style.bottom = '0';
        healthBar.style.left = '0';
        
        element.appendChild(healthBar);
        
        // Add to container
        monstersContainer.appendChild(element);
        
        return element;
    },
    
    /**
     * Update all monsters - optimized for performance
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateMonsters: function(deltaTime) {
        const now = Date.now();
        
        // Use for loop instead of forEach for better performance
        for (let i = this.activeMonsters.length - 1; i >= 0; i--) {
            const monster = this.activeMonsters[i];
            
            // Check if monster is dead
            if (monster.health <= 0 || monster.isDead) {
                // Remove from array immediately to avoid processing again
                if (monster.element) {
                    monster.element.remove();
                }
                this.activeMonsters.splice(i, 1);
                continue;
            }
            
            // Check if monster is off-screen (do this early to avoid unnecessary updates)
            if (monster.x + monster.width < -100) {
                if (monster.element) {
                    monster.element.remove();
                }
                this.activeMonsters.splice(i, 1);
                continue;
            }
            
            // Optimize animation update (only if monster is visible on screen)
            if (monster.x < window.innerWidth + 100) {
                // Update animation less frequently for off-screen monsters
                const frameElapsed = now - monster.lastFrameTime;
                if (frameElapsed >= monster.frameDuration) {
                    monster.currentFrame = (monster.currentFrame + 1) % monster.frameCount;
                    monster.lastFrameTime = now;
                    
                    // Update sprite based on state
                    if (monster.element) {
                        let spriteUrl;
                        if (monster.isHit) {
                            spriteUrl = monster.hitSprite;
                        } else if (monster.isAttacking) {
                            spriteUrl = monster.attackHitSprite;
                        } else {
                            spriteUrl = monster.sprite;
                        }
                        
                        // Only update if changed to avoid unnecessary DOM operations
                        if (monster.currentSpriteUrl !== spriteUrl || monster.lastFramePosition !== monster.currentFrame) {
                            monster.element.style.backgroundImage = `url(${spriteUrl})`;
                            monster.element.style.backgroundPosition = `-${monster.currentFrame * monster.width}px 0`;
                            monster.currentSpriteUrl = spriteUrl;
                            monster.lastFramePosition = monster.currentFrame;
                        }
                    }
                }
            }
            
            // Check if hit animation should end
            if (monster.isHit && now - monster.hitTime >= monster.hitDuration) {
                monster.isHit = false;
                
                // Attack after hit animation with a small probability (throttle attacks)
                if (!monster.isAttacking && Math.random() < 0.5) {
                    monster.isAttacking = true;
                    monster.attackTime = now;
                    
                    // Find nearest character to attack
                    const nearestChar = this.findNearestCharacter(monster);
                    if (nearestChar) {
                        this.monsterAttack(monster, nearestChar);
                    }
                }
            }
            
            // Check for stun status
            const isStunned = monster.hitTime && (now - monster.hitTime < monster.stunDuration);
            
            // Check if attack animation should end
            if (monster.isAttacking && now - monster.attackTime >= 2000) {
                monster.isAttacking = false;
            }
            
            // Update horizontal position - only if not stunned
            if (!isStunned) {
                monster.x -= MapSystem.currentSpeed * (deltaTime / 1000) * 1.5;
            }
            
            // Check for characters in range (with throttling)
            // Only check every few frames to reduce CPU usage
            if (!isStunned && !monster.isAttacking && monster.x < window.innerWidth + 50 && now % 5 === 0) {
                const nearestChar = this.findNearestCharacter(monster);
                if (nearestChar) {
                    // Use approximate distance calculation (squared distance) for better performance
                    const dx = (monster.x + monster.width / 2) - (nearestChar.x + nearestChar.width / 2);
                    const dy = (monster.y + monster.height / 2) - (nearestChar.y + nearestChar.height / 2);
                    const distanceSq = dx * dx + dy * dy;
                    
                    if (distanceSq <= monster.detectionRange * monster.detectionRange) {
                        monster.isAttacking = true;
                        monster.attackTime = now;
                        this.monsterAttack(monster, nearestChar);
                    }
                }
            }
            
            // Handle movement state changes - but less frequently
            if (!isStunned && !monster.isAttacking && now % 3 === 0) {
                if (now >= monster.nextStateChangeTime) {
                    // Simplified state change logic
                    switch (monster.movementState) {
                        case 'idle':
                            monster.movementState = 'moving';
                            monster.verticalDirection = Math.random() < 0.5 ? -1 : 1;
                            monster.nextStateChangeTime = now + 2000; // Fixed time for simplicity
                            break;
                        case 'moving':
                        case 'waiting':
                            monster.movementState = 'idle';
                            monster.nextStateChangeTime = now + 1000;
                            break;
                        default:
                            monster.movementState = 'idle';
                            monster.nextStateChangeTime = now + 1000;
                    }
                }
                
                // Simplified movement update
                if (monster.movementState === 'moving') {
                    const verticalMove = monster.verticalSpeed * monster.verticalDirection * deltaTime;
                    monster.y += verticalMove;
                    
                    // Simple boundary check
                    if (Math.abs(monster.y - monster.baseY) >= monster.verticalRange / 2) {
                        monster.verticalDirection *= -1;
                    }
                }
            }
            
            // Update element position - revert to traditional positioning for compatibility
            if (monster.element) {
                // Go back to using left/top instead of transform to ensure compatibility
                monster.element.style.left = `${monster.x}px`;
                monster.element.style.top = `${monster.y}px`;
            }
            
            // Update status effects less frequently
            if (now % 4 === 0) {
                this.updateMonsterEffects(monster, deltaTime);
            }
        }
    },
    
    /**
     * Find the nearest character to a monster - optimized for performance
     * @param {Object} monster - Monster to check
     * @returns {Object|null} Nearest character or null if none
     */
    findNearestCharacter: function(monster) {
        if (!CharacterSystem || !CharacterSystem.getActiveCharacters) return null;
        
        const activeChars = CharacterSystem.getActiveCharacters();
        if (!activeChars || activeChars.length === 0) return null;
        
        // For single character case (most common), optimize by returning directly
        if (activeChars.length === 1) return activeChars[0];
        
        let nearestChar = null;
        let nearestDistanceSq = Infinity; // Use squared distance to avoid sqrt operations
        
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        
        for (let i = 0; i < activeChars.length; i++) {
            const char = activeChars[i];
            
            // Calculate squared distance (faster than actual distance)
            const dx = monsterCenterX - (char.x + char.width / 2);
            const dy = monsterCenterY - (char.y + char.height / 2);
            const distanceSq = dx * dx + dy * dy;
            
            if (distanceSq < nearestDistanceSq) {
                nearestDistanceSq = distanceSq;
                nearestChar = char;
            }
        }
        
        return nearestChar;
    },
    
    /**
     * Monster attacks a character
     * @param {Object} monster - Attacking monster
     * @param {Object} character - Target character
     */
    monsterAttack: function(monster, character) {
        // Calculate damage based on monster's attack and character's defense
        if (!character.stats) return;
        
        const damage = Math.max(1, monster.attack - (character.stats.defense || 0));
        
        // Apply damage to character
        if (character.stats.currentHp) {
            character.stats.currentHp = Math.max(0, character.stats.currentHp - damage);
            
            // Update UI if necessary
            if (window.UIManager && UIManager.updateCharacterHpBar) {
                UIManager.updateCharacterHpBar(character);
            }
            
            // Show damage text
            Utils.createDamageText(character.x + character.width / 2, character.y, damage, "#ff0000");
        }
    },
    
    /**
     * Update monster status effects
     * @param {Object} monster - Monster to update
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateMonsterEffects: function(monster, deltaTime) {
        const now = Date.now();
        
        // Filter out expired effects
        monster.effects = monster.effects.filter(effect => {
            const elapsed = now - effect.startTime;
            return elapsed < effect.duration;
        });
    },
    
    /**
     * Apply damage to a monster
     * @param {string} monsterId - Monster ID
     * @param {number} damage - Damage amount
     * @param {Object} source - Damage source (character)
     * @returns {boolean} True if monster was hit
     */
    damageMonster: function(monsterId, damage, source) {
        const monster = this.getMonsterById(monsterId);
        if (!monster) return false;
        
        // Calculate actual damage (accounting for defense)
        const actualDamage = Math.max(1, damage - monster.defense);
        
        // Apply damage
        monster.health -= actualDamage;
        
        // Update health bar
        if (monster.element) {
            const healthBar = monster.element.querySelector('.monster-health-bar');
            if (healthBar) {
                const healthPercent = (monster.health / monster.maxHealth) * 100;
                healthBar.style.width = `${Math.max(0, healthPercent)}%`;
                
                // Change color based on health
                if (healthPercent < 25) {
                    healthBar.style.background = '#ff0000';
                } else if (healthPercent < 50) {
                    healthBar.style.background = '#ff6600';
                }
            }
            
            // Add damage gauge - visual effect showing damage amount
            this.showDamageGauge(monster, actualDamage);
            
            // Visual feedback for getting hit
            monster.element.style.filter = 'brightness(2) contrast(1.5)';
            setTimeout(() => {
                if (monster.element) {
                    monster.element.style.filter = 'none';
                }
            }, 150);
        }
        
        // Set hit state
        monster.isHit = true;
        monster.hitTime = Date.now();
        
        // Show damage text 
        // Use UIManager if available, fall back to Utils
        if (window.UIManager && typeof UIManager.showFloatingNumber === 'function') {
            const posX = monster.x + monster.width / 2;
            const posY = monster.y;
            UIManager.showFloatingNumber(posX, posY, actualDamage, 'damage');
        } else {
            Utils.createDamageText(monster.x + monster.width / 2, monster.y, actualDamage);
        }
        
        // Check if monster is dead
        if (monster.health <= 0) {
            this.killMonster(monster, source);
        }
        
        return true;
    },
    
    /**
     * Show damage gauge on monster - simplified for performance
     * @param {Object} monster - Monster to show damage gauge on
     * @param {number} damage - Amount of damage dealt
     */
    showDamageGauge: function(monster, damage) {
        if (!monster.element) return;
        
        // Create damage gauge with CSS animations instead of JS animations
        const gauge = document.createElement('div');
        gauge.className = 'damage-gauge';
        gauge.style.position = 'absolute';
        gauge.style.top = '0';
        gauge.style.left = '0';
        gauge.style.width = '100%';
        gauge.style.height = '100%';
        gauge.style.display = 'flex';
        gauge.style.justifyContent = 'center';
        gauge.style.alignItems = 'center';
        gauge.style.fontSize = '24px';
        gauge.style.fontWeight = 'bold';
        gauge.style.color = '#ff0000';
        gauge.style.textShadow = '0 0 5px #000';
        gauge.style.pointerEvents = 'none';
        gauge.style.animation = 'damage-fade 1s forwards';
        gauge.textContent = `-${damage}`;
        
        // Add to monster element
        monster.element.appendChild(gauge);
        
        // Remove after animation completes
        setTimeout(() => {
            if (gauge.parentNode) {
                gauge.remove();
            }
        }, 1000);
    },
    
    /**
     * Kill a monster and handle rewards
     * @param {Object} monster - Monster to kill
     * @param {Object} source - Kill source (character)
     */
    killMonster: function(monster, source) {
        // Award experience to character
        if (source && CharacterSystem && CharacterSystem.addExperience) {
            CharacterSystem.addExperience(source, monster.experienceValue);
        }
        
        // Drop items
        this.dropItems(monster);
        
        // Base copper reward is 2, scaled by dungeon level
        const levelMultiplier = MapSystem.currentDungeonLevel || 1;
        
        // Apply the dungeon copper multiplier if available
        const dungeonMultiplier = window.dungeonCopperMultiplier || 1;
        const copperReward = Math.round(2 * levelMultiplier * dungeonMultiplier);
        
        Currency.addCopper(copperReward);
        
        // Show currency reward text
        Utils.createDamageText(
            monster.x + monster.width / 2, 
            monster.y - 20, 
            `+${copperReward} copper`, 
            '#cd7f32'
        );
        
        // Add death animation with fade out effect
        if (monster.element) {
            // Mark monster as dead to prevent further interactions
            monster.isDead = true;
            
            // Apply fade out effect
            monster.element.style.transition = 'opacity 800ms ease-out';
            monster.element.style.opacity = '0';
            
            // Remove element after animation completes
            setTimeout(() => {
                if (monster.element) {
                    monster.element.remove();
                }
                
                // Remove from active monsters
                this.removeMonster(monster.id);
            }, 800);
        } else {
            // If no element, just remove from active monsters
            this.removeMonster(monster.id);
        }
    },
    
    /**
     * Drop items from a monster
     * @param {Object} monster - Monster that was killed
     */
    dropItems: function(monster) {
        // Check if monster drops anything
        if (Math.random() > monster.dropRate) {
            return;
        }
        
        // Roll for each item in drop table
        monster.dropTable.forEach(drop => {
            if (Math.random() <= drop.chance) {
                // Determine quantity
                const quantity = Utils.randomInt(drop.quantity[0], drop.quantity[1]);
                
                // Check if the addItem function exists before trying to use it
                try {
                    if (Inventory && typeof Inventory.addItem === 'function') {
                        // Use the addItem function
                        Inventory.addItem(drop.itemId, quantity);
                    } else {
                        // Log silently to debug console instead of showing error in main console
                        console.debug("Cannot add item to inventory - using fallback method");
                        
                        // Fallback method
                        const item = Items.getItem(drop.itemId);
                        if (item && Inventory && Array.isArray(Inventory.slots)) {
                            for (let i = 0; i < Inventory.slots.length; i++) {
                                if (Inventory.slots[i] === null) {
                                    Inventory.slots[i] = Object.assign({}, item, {
                                        quantity: quantity,
                                        instanceId: Utils.generateId()
                                    });
                                    break;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.debug("Error adding item to inventory:", error);
                }
                
                // Create visual drop effect
                this.createItemDropEffect(monster.x, monster.y, drop.itemId, quantity);
            }
        });
    },
    
    /**
     * Create a visual effect for an item drop - limit based on performance
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} itemId - Item ID
     * @param {number} quantity - Item quantity
     */
    createItemDropEffect: function(x, y, itemId, quantity) {
        // Limit active item drop effects
        const maxDropEffects = 5;
        const itemsContainer = document.getElementById('items-container');
        if (!itemsContainer) return;
        
        // Count existing drop effects
        const existingDrops = itemsContainer.querySelectorAll('.item-drop');
        if (existingDrops.length >= maxDropEffects) {
            // Skip creating this effect if we have too many
            return;
        }
        
        // Get item data
        const item = Items.getItem(itemId);
        if (!item) return;
        
        // Create drop element
        const dropElement = document.createElement('div');
        dropElement.className = 'item-drop';
        dropElement.style.left = `${x + Utils.randomInt(-20, 20)}px`;
        dropElement.style.top = `${y + Utils.randomInt(-10, 10)}px`;
        
        // Set background image
        let imgSrc = Items.getItemIcon(itemId);
        dropElement.style.backgroundImage = `url(${imgSrc})`;
        
        // Add quantity text if more than 1
        if (quantity > 1) {
            const quantityText = document.createElement('div');
            quantityText.className = 'item-drop-quantity';
            quantityText.textContent = quantity;
            dropElement.appendChild(quantityText);
        }
        
        // Add to container
        itemsContainer.appendChild(dropElement);
        
        // Remove after animation
        setTimeout(() => {
            if (dropElement.parentNode) {
                dropElement.remove();
            }
        }, 1500);
    },
    
    /**
     * Apply a status effect to a monster
     * @param {string} monsterId - Monster ID
     * @param {string} effectType - Effect type
     * @param {*} effectValue - Effect value
     * @param {number} duration - Effect duration in milliseconds
     * @returns {boolean} True if effect was applied
     */
    applyEffect: function(monsterId, effectType, effectValue, duration) {
        const monster = this.getMonsterById(monsterId);
        if (!monster) return false;
        
        // Remove existing effect of the same type
        monster.effects = monster.effects.filter(effect => effect.type !== effectType);
        
        // Add new effect
        monster.effects.push({
            type: effectType,
            value: effectValue,
            duration: duration,
            startTime: Date.now()
        });
        
        return true;
    },
    
    /**
     * Get a monster by ID
     * @param {string} id - Monster ID
     * @returns {Object|null} Monster object or null if not found
     */
    getMonsterById: function(id) {
        return this.activeMonsters.find(monster => monster.id === id);
    },
    
    /**
     * Remove a monster by ID
     * @param {string} id - Monster ID
     * @returns {boolean} True if monster was removed
     */
    removeMonster: function(id) {
        const index = this.activeMonsters.findIndex(monster => monster.id === id);
        if (index === -1) return false;
        
        // Remove element
        const monster = this.activeMonsters[index];
        if (monster.element) {
            monster.element.remove();
        }
        
        // Remove from array
        this.activeMonsters.splice(index, 1);
        
        return true;
    },
    
    /**
     * Get all monsters in range of a character
     * @param {Object} character - Character to check
     * @param {number} range - Range to check
     * @returns {Array} Array of monsters in range
     */
    getMonstersInRange: function(character, range) {
        return this.activeMonsters.filter(monster => {
            const distance = Utils.distance(
                { x: character.x + character.width / 2, y: character.y + character.height / 2 },
                { x: monster.x + monster.width / 2, y: monster.y + monster.height / 2 }
            );
            
            return distance <= range;
        });
    },
    
    /**
     * Check if a character is overlapping with any monsters
     * @param {Object} character - Character to check
     * @param {number} overlapThreshold - Minimum overlap in pixels
     * @returns {Object|null} Overlapping monster or null if none
     */
    getOverlappingMonster: function(character, overlapThreshold = 10) {
        return this.activeMonsters.find(monster => 
            Utils.checkOverlap(
                { x: character.x, y: character.y, width: character.width, height: character.height },
                { x: monster.x, y: monster.y, width: monster.width, height: monster.height },
                overlapThreshold
            )
        );
    },
    
    /**
     * Get the number of active monsters
     * @returns {number} Number of active monsters
     */
    getMonsterCount: function() {
        return this.activeMonsters.length;
    },
    
    /**
     * Clear all monsters
     */
    clearAllMonsters: function() {
        // Remove all monster elements
        this.activeMonsters.forEach(monster => {
            if (monster.element) {
                monster.element.remove();
            }
        });
        
        // Clear array
        this.activeMonsters = [];
    }
};
