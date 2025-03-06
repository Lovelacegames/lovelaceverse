/**
 * Map system for the Cyberpunk MMORPG game
 * Handles map generation, movement, and dungeon mechanics
 */

const MapSystem = {
    // Map properties
    mapWidth: 10000, // Total map distance
    currentDistance: 0, // Current distance traveled
    currentDungeonLevel: 1, // Current dungeon level
    
    // Map background elements
    backgrounds: [],
    backgroundWidth: 1200, // Width of each background segment
    
    // Map speed (pixels per second)
    baseSpeed: 30, // Increased for faster monster movement
    currentSpeed: 30,
    
    // Map state
    isMoving: false,
    
    // Monster spawning
    monsterSpawnRate: 0.15, // Increased even more to spawn more monsters
    monsterSpawnDistance: 50, // Reduced to allow more frequent spawning
    lastMonsterSpawnDistance: 0,
    allowedMonsterTypes: null, // Will be set by the dungeon system
    
    /**
     * Initialize the map system
     */
    init: function() {
        this.currentDistance = 0;
        this.currentSpeed = this.baseSpeed;
        this.isMoving = false;
        this.lastMonsterSpawnDistance = 0;
        
        // Create initial background elements
        this.createBackgrounds();
        
        // Update distance display
        this.updateDistanceDisplay();
    },
    
    /**
     * Create background elements for parallax scrolling
     */
    createBackgrounds: function() {
        const mapContainer = document.getElementById('map-background');
        if (!mapContainer) return;
        
        // Clear existing backgrounds
        mapContainer.innerHTML = '';
        this.backgrounds = [];
        
        // Get background image from Utils
        const backgroundImage = Utils.getMapBackground();
        
        // Create multiple background elements for seamless looping
        for (let i = 0; i < 3; i++) {
            const bg = document.createElement('div');
            bg.className = 'map-background-segment';
            bg.style.width = `${this.backgroundWidth}px`;
            bg.style.height = '100%';
            // Add error handling for background image loading
            bg.style.backgroundImage = `url(${backgroundImage || 'img/mainmap1.png'})`;
            
            // Add error handling in case image fails to load
            const img = new Image();
            img.onerror = () => {
                console.error(`Failed to load background image: ${backgroundImage}`);
                bg.style.backgroundImage = `url(img/mainmap1.png)`;
                
                // If all else fails, generate a basic background color
                if (!bg.style.backgroundImage || bg.style.backgroundImage === 'url()') {
                    bg.style.background = 'linear-gradient(to bottom, #000033, #0066cc, #333333)';
                }
            };
            img.src = backgroundImage || 'img/mainmap1.png';
            // Changed from 'cover' to '100% 100%' to prevent image from being cut off
            bg.style.backgroundSize = '100% 100%';
            bg.style.position = 'absolute';
            bg.style.left = `${i * this.backgroundWidth}px`;
            bg.style.top = '0';
            
            mapContainer.appendChild(bg);
            this.backgrounds.push(bg);
        }
    },
    
    /**
     * Start map movement
     */
    startMovement: function() {
        if (this.isMoving) return;
        
        this.isMoving = true;
        this.lastFrameTime = Date.now();
        this.update();
    },
    
    /**
     * Stop map movement
     */
    stopMovement: function() {
        this.isMoving = false;
    },
    
    /**
     * Update map state (called every frame)
     */
    update: function() {
        if (!this.isMoving) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = now;
        
        // Update distance
        const distanceMoved = this.currentSpeed * deltaTime;
        this.currentDistance += distanceMoved;
        
        // Check for dungeon level up (every 10,000 distance)
        const oldLevel = this.currentDungeonLevel;
        this.currentDungeonLevel = Math.floor(this.currentDistance / this.mapWidth) + 1;
        
        // If level changed, notify player
        if (this.currentDungeonLevel > oldLevel) {
            this.onDungeonLevelUp();
        }
        
        // Check if we've reached the end of the map
        if (this.currentDistance >= this.mapWidth) {
            // Loop back to the beginning, but keep progress for level calculation
            this.currentDistance = this.currentDistance % this.mapWidth;
            
            // Reset monster spawn tracking
            this.lastMonsterSpawnDistance = 0;
            
            // Notify game of map completion
            Game.onMapCompleted();
        }
        
        // Update background positions for parallax effect
        this.updateBackgrounds(distanceMoved);
        
        // Update distance display
        this.updateDistanceDisplay();
        
        // Check for monster spawning
        this.checkMonsterSpawn();
        
        // Continue the update loop
        requestAnimationFrame(() => this.update());
    },
    
    /**
     * Handle dungeon level up events
     */
    onDungeonLevelUp: function() {
        // Show level up notification
        Utils.showNotification(`Dungeon Level ${this.currentDungeonLevel}!`, 'Monsters are stronger but drop more rewards!', 5000);
        
        // Play level up sound
        // Utils.playSound('level_up');
        
        console.log(`Dungeon level up! Now at level ${this.currentDungeonLevel}`);
    },
    
    /**
     * Update background positions for parallax scrolling
     * @param {number} distanceMoved - Distance moved in this frame
     */
    updateBackgrounds: function(distanceMoved) {
        // Convert game distance to pixels for background movement
        const pixelsMoved = distanceMoved * 0.5; // Adjust this factor for parallax speed
        
        // Update each background segment
        this.backgrounds.forEach((bg, index) => {
            // Get current position
            let currentLeft = parseFloat(bg.style.left);
            
            // Move background
            currentLeft -= pixelsMoved;
            
            // If background has moved completely off-screen to the left, 
            // move it to the right side for seamless looping
            if (currentLeft <= -this.backgroundWidth) {
                currentLeft += this.backgrounds.length * this.backgroundWidth;
            }
            
            // Update position
            bg.style.left = `${currentLeft}px`;
        });
    },
    
    /**
     * Update the distance display
     */
    updateDistanceDisplay: function() {
        const distanceElement = document.getElementById('current-distance');
        if (distanceElement) {
            distanceElement.textContent = Math.floor(this.currentDistance);
        }
    },
    
    /**
     * Check if a monster should be spawned
     */
    checkMonsterSpawn: function() {
        // Check if we've moved far enough since the last monster spawn
        if (this.currentDistance - this.lastMonsterSpawnDistance < this.monsterSpawnDistance) {
            return;
        }
        
        // Random chance to spawn a monster
        if (Math.random() < this.monsterSpawnRate) {
            this.spawnMonster();
            this.lastMonsterSpawnDistance = this.currentDistance;
        }
    },
    
    /**
     * Spawn a monster on the map
     */
    spawnMonster: function() {
        // Get the map container dimensions
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        
        const containerRect = mapContainer.getBoundingClientRect();
        
        // Determine monster type based on dungeon configuration or fallback to distance-based
        let monsterType;
        const progressPercent = this.currentDistance / this.mapWidth;
        
        if (this.allowedMonsterTypes && this.allowedMonsterTypes.length > 0) {
            // Use dungeon-specific monster types
            if (progressPercent > 0.8 && Math.random() < 0.2) {
                // 20% chance for bosses near the end regardless of dungeon
                monsterType = 'dragon';
            } else {
                // Pick random monster from allowed types
                const randomIndex = Math.floor(Math.random() * this.allowedMonsterTypes.length);
                monsterType = this.allowedMonsterTypes[randomIndex];
            }
        } else {
            // Fallback to original distance-based monsters
            if (progressPercent < 0.2) {
                monsterType = 'slime';
            } else if (progressPercent < 0.4) {
                monsterType = 'goblin';
            } else if (progressPercent < 0.6) {
                monsterType = 'skeleton';
            } else if (progressPercent < 0.8) {
                monsterType = 'orc';
            } else {
                // Boss appears near the end
                monsterType = Math.random() < 0.2 ? 'dragon' : 'orc';
            }
        }
        
        // Get the monster's size from the monster registry for proper alignment
        const monsterData = MonsterSystem.monsterTypes[monsterType];
        if (!monsterData) return;
        
        // Randomly choose between left and right side for monster spawn
        // 30% chance to spawn from left, 70% chance to spawn from right
        const spawnFromLeft = Math.random() < 0.3;
        
        // Position the monster at either the left or right side of the screen
        const monsterX = spawnFromLeft ? -monsterData.width : containerRect.width;
        
        // Align monster to the same ground level as characters
        // Characters are positioned at: containerRect.height * 0.7 - character.height
        // So we need to do the same for monsters to align them properly
        const monsterY = containerRect.height * 0.7 - monsterData.height;
        
        // Create the monster with proper scaling for dungeon level
        const monster = Game.createMonster(monsterType, monsterX, monsterY);
        
        // If we have a valid monster reference and we're past dungeon level 1,
        // apply dungeon level scaling
        if (monster && this.currentDungeonLevel > 1) {
            this.applyDungeonLevelScaling(monster);
        }
    },
    
    /**
     * Apply dungeon level scaling to a monster
     * @param {Object} monster - Monster to scale
     */
    applyDungeonLevelScaling: function(monster) {
        // Scale monster stats based on dungeon level
        // HP and attack are multiplied by 2x per level
        const levelMultiplier = Math.pow(2, this.currentDungeonLevel - 1);
        
        // Apply scaling
        monster.maxHealth *= levelMultiplier;
        monster.health = monster.maxHealth; // Reset health to new max
        monster.attack *= levelMultiplier;
        
        // Update the monster's appearance to indicate higher level
        if (monster.element) {
            // Add a visual indicator for higher level monsters
            monster.element.style.filter = `brightness(${1 + (this.currentDungeonLevel * 0.1)})`;
            
            // Add a level indicator
            const levelIndicator = document.createElement('div');
            levelIndicator.className = 'monster-level-indicator';
            levelIndicator.textContent = `Lv.${this.currentDungeonLevel}`;
            levelIndicator.style.position = 'absolute';
            levelIndicator.style.top = '-20px';
            levelIndicator.style.left = '50%';
            levelIndicator.style.transform = 'translateX(-50%)';
            levelIndicator.style.color = '#ff9900';
            levelIndicator.style.fontWeight = 'bold';
            levelIndicator.style.textShadow = '0 0 3px black';
            monster.element.appendChild(levelIndicator);
        }
    },
    
    /**
     * Set the map speed
     * @param {number} speed - New speed in pixels per second
     */
    setSpeed: function(speed) {
        this.currentSpeed = speed;
    },
    
    /**
     * Reset the map speed to base value
     */
    resetSpeed: function() {
        this.currentSpeed = this.baseSpeed;
    },
    
    /**
     * Get the current map progress as a percentage
     * @returns {number} Progress percentage (0-100)
     */
    getProgressPercentage: function() {
        return (this.currentDistance / this.mapWidth) * 100;
    },
    
    /**
     * Check if a position is visible on screen
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Object width
     * @param {number} height - Object height
     * @returns {boolean} True if position is visible
     */
    isPositionVisible: function(x, y, width, height) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return false;
        
        const containerRect = mapContainer.getBoundingClientRect();
        
        return (
            x + width > 0 &&
            x < containerRect.width &&
            y + height > 0 &&
            y < containerRect.height
        );
    },
    
    /**
     * Convert a distance value to an X position on screen
     * @param {number} distance - Distance value
     * @returns {number} X position
     */
    distanceToPosition: function(distance) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return 0;
        
        const containerRect = mapContainer.getBoundingClientRect();
        
        // Calculate relative position based on current distance
        const relativeDistance = distance - this.currentDistance;
        
        // Convert to screen position
        return containerRect.width * 0.3 + relativeDistance;
    },
    
    /**
     * Save map data
     * @returns {Object} Map data for saving
     */
    saveData: function() {
        return {
            currentDistance: this.currentDistance,
            lastMonsterSpawnDistance: this.lastMonsterSpawnDistance
        };
    },
    
    /**
     * Load map data
     * @param {Object} data - Saved map data
     */
    loadData: function(data) {
        if (!data) return;
        
        this.currentDistance = data.currentDistance || 0;
        this.lastMonsterSpawnDistance = data.lastMonsterSpawnDistance || 0;
        
        this.updateDistanceDisplay();
    }
};

/**
 * Map generation utilities
 */
const MapGenerator = {
    /**
     * Generate a new map
     * @param {string} theme - Map theme ('cyberpunk', 'wasteland', 'neon', etc.)
     * @returns {Object} Map configuration
     */
    generateMap: function(theme = 'cyberpunk') {
        // Base map configuration
        const map = {
            theme: theme,
            width: 10000,
            backgroundImage: 'img/mainmap1.png',
            monsterDensity: 1.0,
            itemDensity: 0.5,
            obstacles: []
        };
        
        // Adjust properties based on theme
        switch (theme) {
            case 'wasteland':
                map.monsterDensity = 1.2;
                map.itemDensity = 0.3;
                break;
            case 'neon':
                map.monsterDensity = 0.8;
                map.itemDensity = 0.7;
                break;
            // Add more themes as needed
        }
        
        // Generate obstacles
        map.obstacles = this.generateObstacles(map.width, theme);
        
        return map;
    },
    
    /**
     * Generate obstacles for a map
     * @param {number} mapWidth - Width of the map
     * @param {string} theme - Map theme
     * @returns {Array} Array of obstacle objects
     */
    generateObstacles: function(mapWidth, theme) {
        const obstacles = [];
        const obstacleCount = Math.floor(mapWidth / 500); // One obstacle every 500 distance
        
        for (let i = 0; i < obstacleCount; i++) {
            // Position obstacles evenly throughout the map
            const position = (i + 0.5) * 500 + Utils.randomInt(-100, 100);
            
            // Skip positions too close to start or end
            if (position < 200 || position > mapWidth - 200) {
                continue;
            }
            
            // Generate obstacle based on theme
            let obstacle;
            switch (theme) {
                case 'cyberpunk':
                    obstacle = {
                        type: ['barrier', 'debris', 'terminal'][Utils.randomInt(0, 2)],
                        position: position,
                        width: Utils.randomInt(50, 150),
                        height: Utils.randomInt(50, 200)
                    };
                    break;
                case 'wasteland':
                    obstacle = {
                        type: ['rock', 'wreckage', 'crater'][Utils.randomInt(0, 2)],
                        position: position,
                        width: Utils.randomInt(50, 200),
                        height: Utils.randomInt(50, 150)
                    };
                    break;
                case 'neon':
                    obstacle = {
                        type: ['hologram', 'barrier', 'sign'][Utils.randomInt(0, 2)],
                        position: position,
                        width: Utils.randomInt(50, 100),
                        height: Utils.randomInt(100, 250)
                    };
                    break;
                // Add more themes as needed
            }
            
            obstacles.push(obstacle);
        }
        
        return obstacles;
    }
};
