/**
 * Cyberpunk-themed 3D Character Visualization using Three.js
 * Creates immersive 3D character cards with dynamic effects
 */

const CharacterThreeVisuals = {
    // Track character card instances
    cardInstances: {},
    
    // Track scene instances
    sceneInstances: {},
    
    // Color schemes for cyberpunk theme
    colors: {
        neon: {
            cyan: 0x00f7ff,
            magenta: 0xff00ff,
            blue: 0x0066ff,
            purple: 0x9900ff,
            green: 0x00ff66,
            yellow: 0xffee00
        },
        rarity: {
            common: 0xffffff,
            uncommon: 0x00ff66,
            rare: 0x00f3ff,
            epic: 0xff00ff,
            legendary: 0xf7ff00
        },
        dark: {
            base: 0x000d1f,
            accent: 0x0a1a2f
        }
    },
    
    /**
     * Initialize the character visualization system
     */
    init: function() {
        console.log('Initializing Character 3D Visualization system...');
        
        // Check for THREE global
        if (typeof THREE === 'undefined') {
            console.warn('THREE.js not loaded, attempting to use window.THREE');
            if (typeof window.THREE !== 'undefined') {
                THREE = window.THREE;
            } else {
                console.error('THREE.js not available');
                return false;
            }
        }
        
        // Add event listener for character list display
        document.addEventListener('DOMContentLoaded', () => {
            // Listen for character list modal opening
            const characterListButton = document.getElementById('character-list-button');
            if (characterListButton) {
                characterListButton.addEventListener('click', () => {
                    // Character list is populated by the game's UI.js
                    // Wait for it to be populated before enhancing
                    setTimeout(() => this.enhanceCharacterCards(), 100);
                });
            }
            
            // Also enhance when character details are viewed in the gacha result
            document.addEventListener('gachaResultShown', this.enhanceGachaResult.bind(this));
        });
        
        return true;
    },
    
    /**
     * Clean up all 3D scenes
     */
    cleanup: function() {
        Object.values(this.sceneInstances).forEach(instance => {
            if (instance.renderer) {
                instance.renderer.dispose();
            }
            
            // Cancel animation frame
            if (instance.animationFrameId) {
                cancelAnimationFrame(instance.animationFrameId);
            }
        });
        
        this.sceneInstances = {};
        this.cardInstances = {};
    },
    
    /**
     * Apply 3D enhancements to character cards
     */
    enhanceCharacterCards: function() {
        console.log('Enhancing character cards with 3D effects...');
        
        // Find all character cards in the list
        const characterCards = document.querySelectorAll('.character-card');
        
        if (characterCards.length === 0) {
            console.log('No character cards found to enhance');
            return;
        }
        
        console.log(`Found ${characterCards.length} character cards to enhance`);
        
        // First cleanup any existing instances to avoid memory leaks
        this.cleanup();
        
        // Enhance each card
        characterCards.forEach((card, index) => {
            const characterId = card.getAttribute('data-character-id');
            if (!characterId) return;
            
            // Get character data
            const character = CharacterManager.getCharacter(characterId);
            if (!character) return;
            
            // Create a unique ID for this card instance
            const cardId = `character-card-${index}-${characterId}`;
            
            // Add a container for the Three.js canvas
            const canvasContainer = document.createElement('div');
            canvasContainer.className = 'character-card-canvas';
            canvasContainer.style.position = 'absolute';
            canvasContainer.style.top = '0';
            canvasContainer.style.left = '0';
            canvasContainer.style.width = '100%';
            canvasContainer.style.height = '100%';
            canvasContainer.style.zIndex = '-1';
            canvasContainer.style.borderRadius = '8px';
            canvasContainer.style.overflow = 'hidden';
            canvasContainer.id = cardId;
            
            // Make sure the card is position relative
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            
            // Add the canvas container as the first child
            if (card.firstChild) {
                card.insertBefore(canvasContainer, card.firstChild);
            } else {
                card.appendChild(canvasContainer);
            }
            
            // Create the 3D scene for this card
            this.createCardScene(cardId, character, canvasContainer);
            
            // Store the card instance
            this.cardInstances[cardId] = {
                element: card,
                container: canvasContainer,
                character: character
            };
        });
    },
    
    /**
     * Create a 3D scene for a character card
     * @param {string} cardId - Unique ID for this card instance
     * @param {Object} character - Character data
     * @param {HTMLElement} container - Container for the Three.js canvas
     */
    createCardScene: function(cardId, character, container) {
        // Set up scene
        const scene = new THREE.Scene();
        
        // Set up camera
        const aspect = container.clientWidth / container.clientHeight;
        const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        camera.position.z = 3;
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Add animated background
        const rarityColor = this.getRarityColor(character.rarity);
        const primaryColor = new THREE.Color(rarityColor);
        const secondaryColor = new THREE.Color(this.colors.dark.accent);
        
        // Create background plane with shader material
        const backgroundGeometry = new THREE.PlaneGeometry(4, 4);
        const backgroundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                primaryColor: { value: primaryColor },
                secondaryColor: { value: secondaryColor }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 primaryColor;
                uniform vec3 secondaryColor;
                varying vec2 vUv;
                
                // Noise function
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    // Base gradient
                    vec3 color = mix(secondaryColor, primaryColor * 0.5, vUv.y);
                    
                    // Add noise for texture
                    float n = noise(vUv * 10.0 + time * 0.1);
                    color = mix(color, primaryColor, n * 0.05);
                    
                    // Add grid pattern
                    float gridX = step(0.98, fract(vUv.x * 20.0));
                    float gridY = step(0.98, fract(vUv.y * 20.0));
                    float grid = gridX + gridY;
                    
                    // Add pulsing effect
                    float pulse = 0.5 + 0.5 * sin(time * 0.5);
                    
                    // Edge glow
                    float edge = 0.0;
                    edge += smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
                    edge += smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
                    edge = edge * pulse;
                    
                    // Add scanline
                    float scanline = smoothstep(0.49, 0.5, fract(vUv.y * 30.0 - time));
                    
                    // Combine effects
                    color = mix(color, primaryColor, grid * 0.3);
                    color = mix(color, primaryColor, edge * 0.3);
                    color = mix(color, vec3(1.0), scanline * 0.1);
                    
                    gl_FragColor = vec4(color, 0.85);
                }
            `,
            transparent: true
        });
        
        const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        background.position.z = -1;
        scene.add(background);
        
        // Add border frame
        const borderGeometry = new THREE.PlaneGeometry(3.8, 3.8);
        const borderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(rarityColor) }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                
                void main() {
                    // Create border effect
                    float border = 0.05;
                    float edge = 0.0;
                    edge += step(vUv.x, border) + step(1.0 - border, vUv.x);
                    edge += step(vUv.y, border) + step(1.0 - border, vUv.y);
                    
                    // Animate border
                    float pulse = 0.7 + 0.3 * sin(time * 2.0);
                    
                    // Only render the border
                    float alpha = edge * pulse;
                    if (alpha < 0.1) discard;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            depthWrite: false
        });
        
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = -0.5;
        scene.add(border);
        
        // Add energy particles based on character's rarity
        this.addEnergyParticles(scene, rarityColor, character.rarity);
        
        // Add circular holograms
        this.addCharacterHolograms(scene, character);
        
        // Store scene instance for animation
        this.sceneInstances[cardId] = {
            scene: scene,
            camera: camera,
            renderer: renderer,
            materials: [backgroundMaterial, borderMaterial],
            animationFrameId: null,
            time: 0
        };
        
        // Start animation loop
        this.animateCard(cardId);
    },
    
    /**
     * Add energy particles to a character card scene
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {number} color - Particle color
     * @param {string} rarity - Character rarity
     */
    addEnergyParticles: function(scene, color, rarity) {
        // The number and intensity of particles depends on character rarity
        let particleCount = 20; // Base count
        let particleSize = 0.03;
        let particleSpeed = 0.3;
        
        // Adjust based on rarity
        switch(rarity.toLowerCase()) {
            case 'uncommon':
                particleCount = 30;
                particleSize = 0.04;
                particleSpeed = 0.4;
                break;
            case 'rare':
                particleCount = 40;
                particleSize = 0.05;
                particleSpeed = 0.5;
                break;
            case 'epic':
                particleCount = 50;
                particleSize = 0.06;
                particleSpeed = 0.6;
                break;
            case 'legendary':
                particleCount = 60;
                particleSize = 0.07;
                particleSpeed = 0.7;
                break;
        }
        
        // Create particles
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random position within card bounds
            positions[i3] = (Math.random() - 0.5) * 3;
            positions[i3 + 1] = (Math.random() - 0.5) * 3;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
            
            // Random velocity
            velocities[i3] = (Math.random() - 0.5) * 0.01 * particleSpeed;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01 * particleSpeed;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01 * particleSpeed;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.userData = { velocities: velocities };
        
        const particleMaterial = new THREE.PointsMaterial({
            color: color,
            size: particleSize,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
    },
    
    /**
     * Add circular hologram displays showing character stats
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} character - Character data
     */
    addCharacterHolograms: function(scene, character) {
        // Create circular holorams for level, power, etc.
        const hologramPoints = [
            { position: new THREE.Vector3(-1.5, 1.2, 0), data: character.level, label: 'LVL' },
            { position: new THREE.Vector3(1.5, 1.2, 0), data: character.upgradeLevel || 0, label: 'UPG' },
            { position: new THREE.Vector3(-1.5, -1.2, 0), data: character.xp || 0, label: 'XP' },
            { position: new THREE.Vector3(1.5, -1.2, 0), data: this.getRarityValue(character.rarity), label: 'RRT' }
        ];
        
        hologramPoints.forEach(point => {
            this.createHologramCircle(scene, point.position, point.data, point.label, this.getRarityColor(character.rarity));
        });
    },
    
    /**
     * Create a circular hologram with data display
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Vector3} position - Position for the hologram
     * @param {number} value - Value to display
     * @param {string} label - Label for the value
     * @param {number} color - Color for the hologram
     */
    createHologramCircle: function(scene, position, value, label, color) {
        // Create hologram ring
        const ringGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
        const ringMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) }
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                
                void main() {
                    // Animated rotation
                    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                    float normAngle = (angle + 3.14159) / (2.0 * 3.14159);
                    
                    // Create segmented ring
                    float segments = 12.0;
                    float segmentIndex = floor(normAngle * segments);
                    float segmentFraction = fract(normAngle * segments);
                    
                    // Animate segments
                    float brightness = 0.5 + 0.5 * sin(segmentIndex + time * 2.0);
                    
                    // Add pulse
                    float pulse = 0.7 + 0.3 * sin(time * 3.0);
                    
                    // Combine effects
                    vec3 finalColor = color * brightness * pulse;
                    
                    gl_FragColor = vec4(finalColor, 0.7);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.position.z = 0.1;
        scene.add(ring);
        
        // Create text plane for the value
        const valueCanvas = document.createElement('canvas');
        valueCanvas.width = 64;
        valueCanvas.height = 64;
        const ctx = valueCanvas.getContext('2d');
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 64, 64);
        
        ctx.font = 'bold 28px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw glow
        ctx.shadowColor = `#${new THREE.Color(color).getHexString()}`;
        ctx.shadowBlur = 10;
        
        // Draw text
        ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`;
        
        // Format value (limit to 2 digits)
        const displayValue = typeof value === 'number' && value > 99 ? '99+' : value.toString();
        ctx.fillText(displayValue, 32, 24);
        
        // Draw label
        ctx.font = 'bold 12px "Share Tech Mono", monospace';
        ctx.fillText(label, 32, 44);
        
        const valueTexture = new THREE.CanvasTexture(valueCanvas);
        const valueMaterial = new THREE.MeshBasicMaterial({
            map: valueTexture,
            transparent: true,
            opacity: 0.9
        });
        
        const valuePlane = new THREE.PlaneGeometry(0.3, 0.3);
        const valueMesh = new THREE.Mesh(valuePlane, valueMaterial);
        valueMesh.position.copy(position);
        valueMesh.position.z = 0.15;
        scene.add(valueMesh);
    },
    
    /**
     * Animate a character card scene
     * @param {string} cardId - ID of the card to animate
     */
    animateCard: function(cardId) {
        const instance = this.sceneInstances[cardId];
        if (!instance) return;
        
        // Update time
        instance.time += 0.01;
        
        // Update shader uniforms
        instance.materials.forEach(material => {
            if (material.uniforms && material.uniforms.time) {
                material.uniforms.time.value = instance.time;
            }
        });
        
        // Animate particles if they exist
        instance.scene.children.forEach(child => {
            if (child instanceof THREE.Points) {
                const positions = child.geometry.attributes.position.array;
                const velocities = child.geometry.userData.velocities;
                
                for (let i = 0; i < positions.length; i += 3) {
                    // Update positions based on velocities
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];
                    
                    // Bounce off walls
                    if (Math.abs(positions[i]) > 2) velocities[i] *= -1;
                    if (Math.abs(positions[i + 1]) > 2) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 0.5) velocities[i + 2] *= -1;
                }
                
                child.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        // Render scene
        instance.renderer.render(instance.scene, instance.camera);
        
        // Continue animation loop
        instance.animationFrameId = requestAnimationFrame(() => this.animateCard(cardId));
    },
    
    /**
     * Apply 3D enhancements to gacha result
     */
    enhanceGachaResult: function() {
        console.log('Enhancing gacha result with 3D effects...');
        
        // Find gacha result container
        const resultContainer = document.getElementById('gacha-character-result');
        if (!resultContainer) return;
        
        // Get character ID from container
        const characterId = resultContainer.getAttribute('data-character-id');
        if (!characterId) return;
        
        // Get character data
        const character = CharacterManager.getCharacter(characterId);
        if (!character) return;
        
        // Create a unique ID for this instance
        const resultId = `gacha-result-${characterId}`;
        
        // Add a container for the Three.js canvas
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'gacha-result-canvas';
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.top = '0';
        canvasContainer.style.left = '0';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.zIndex = '-1';
        canvasContainer.style.borderRadius = '8px';
        canvasContainer.style.overflow = 'hidden';
        canvasContainer.id = resultId;
        
        // Make sure the container is position relative
        if (getComputedStyle(resultContainer).position === 'static') {
            resultContainer.style.position = 'relative';
        }
        
        // Add the canvas container as the first child
        if (resultContainer.firstChild) {
            resultContainer.insertBefore(canvasContainer, resultContainer.firstChild);
        } else {
            resultContainer.appendChild(canvasContainer);
        }
        
        // Create the 3D scene for this result
        this.createCardScene(resultId, character, canvasContainer);
        
        // Store the instance
        this.cardInstances[resultId] = {
            element: resultContainer,
            container: canvasContainer,
            character: character
        };
    },
    
    /**
     * Get color for character rarity
     * @param {string} rarity - Character rarity
     * @returns {number} - Color value
     */
    getRarityColor: function(rarity) {
        const rarityLower = rarity.toLowerCase();
        return this.colors.rarity[rarityLower] || this.colors.rarity.common;
    },
    
    /**
     * Get numeric value for character rarity
     * @param {string} rarity - Character rarity
     * @returns {number} - Rarity value
     */
    getRarityValue: function(rarity) {
        const rarityMap = {
            'common': 1,
            'uncommon': 2,
            'rare': 3,
            'epic': 4,
            'legendary': 5
        };
        
        return rarityMap[rarity.toLowerCase()] || 1;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    CharacterThreeVisuals.init();
});
