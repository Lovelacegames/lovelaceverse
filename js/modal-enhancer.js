/**
 * Modal Enhancement System
 * Ensures all modals and dynamically created UI elements get cyberpunk styling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the UI to fully initialize
    setTimeout(() => {
        console.log('Initializing modal enhancer...');
        setupModalEnhancements();
        ensureNoMissingImages();
    }, 1000);
});

/**
 * Set up enhancements for all modals
 */
function setupModalEnhancements() {
    // Add scanner lines to dungeon modal
    enhanceDungeonModal();
    
    // Handle button click events to ensure Three.js enhancements work
    setupButtonListeners();
}

/**
 * Add cyberpunk enhancements to the dungeon modal
 */
function enhanceDungeonModal() {
    const dungeonModal = document.getElementById('dungeon-selection-modal');
    
    if (dungeonModal) {
        // Add scanner line
        const scannerLine = document.createElement('div');
        scannerLine.className = 'scanner-line';
        dungeonModal.appendChild(scannerLine);
        
        // Add holographic HUD elements
        const hudElements = [
            { position: 'top-left', content: '<div class="hud-coordinates">COORDINATES: X-2381 Y-5992</div>' },
            { position: 'top-right', content: '<div>SYSTEM READY</div><div class="hud-warning">CONNECTION SECURE</div>' },
            { position: 'bottom-left', content: '<div>NEURAL LINK ACTIVE</div>' },
            { position: 'bottom-right', content: '<div>SCAN COMPLETE</div>' }
        ];
        
        const dungeonContainer = dungeonModal.querySelector('.dungeon-three-container');
        if (dungeonContainer) {
            hudElements.forEach(element => {
                const hudElement = document.createElement('div');
                hudElement.className = `cyber-hud hud-${element.position}`;
                hudElement.innerHTML = element.content;
                dungeonContainer.appendChild(hudElement);
            });
        }
    }
}

/**
 * Setup button listeners to ensure Three.js enhancements are applied
 */
function setupButtonListeners() {
    // Listen for dungeon button click to ensure dynamically created buttons get enhanced
    const dungeonButton = document.getElementById('dungeon-button');
    if (dungeonButton) {
        dungeonButton.addEventListener('click', () => {
            // Give the modal time to populate
            setTimeout(() => {
                if (window.CyberpunkButtons) {
                    window.CyberpunkButtons.enhanceAllButtons();
                }
            }, 300);
        });
    }
    
    // Listen for other modal buttons
    const modalTriggers = document.querySelectorAll('.menu-button');
    modalTriggers.forEach(button => {
        button.addEventListener('click', () => {
            // Give the modal time to populate
            setTimeout(() => {
                if (window.CyberpunkButtons) {
                    window.CyberpunkButtons.enhanceAllButtons();
                }
            }, 300);
        });
    });
    
    // Enhance inventory tab buttons
    const inventoryTabs = document.querySelectorAll('.inventory-tab');
    inventoryTabs.forEach(tab => {
        tab.classList.add('cyberpunk-button');
    });
}

/**
 * Prevent 404 errors by handling missing images
 */
function ensureNoMissingImages() {
    // Monitor for image loading errors and replace with Three.js effects
    document.addEventListener('error', function(event) {
        // Only handle image errors
        if (event.target.tagName.toLowerCase() === 'img') {
            console.log('Caught image loading error:', event.target.src);
            
            // Get the image element that failed to load
            const imgElement = event.target;
            
            // Create a canvas element to replace the broken image
            const canvas = document.createElement('canvas');
            canvas.width = imgElement.width || 100;
            canvas.height = imgElement.height || 100;
            canvas.className = 'fallback-image-canvas';
            
            // Style the canvas
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            // Replace the image with the canvas
            if (imgElement.parentNode) {
                imgElement.parentNode.replaceChild(canvas, imgElement);
                
                // Draw a cyberpunk style placeholder
                drawCyberpunkPlaceholder(canvas);
            }
        }
    }, true);
    
    // Also check for any broken images that already exist
    setTimeout(() => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                // Create a fake error event to use the same handling code
                const errorEvent = new Event('error');
                errorEvent.target = img;
                document.dispatchEvent(errorEvent);
            }
        });
    }, 2000); // Wait a bit to allow images to load naturally first
}

/**
 * Draw a cyberpunk-style placeholder for missing images
 * @param {HTMLCanvasElement} canvas - Canvas to draw on
 */
function drawCyberpunkPlaceholder(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Color gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#000d1f');
    gradient.addColorStop(1, '#0a1a2f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw cyberpunk grid
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < width; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw warning text
    ctx.fillStyle = '#ff00ff';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('IMAGE', width / 2, height / 2 - 12);
    ctx.fillText('UNAVAILABLE', width / 2, height / 2 + 12);
    
    // Draw glowing border
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Animate the placeholder
    animatePlaceholder(canvas);
}

/**
 * Animate the cyberpunk placeholder
 * @param {HTMLCanvasElement} canvas - Canvas to animate
 */
function animatePlaceholder(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let scanlinePos = 0;
    
    function animate() {
        // Only update a portion of the canvas for efficiency
        ctx.clearRect(0, scanlinePos - 5, width, 10);
        
        // Re-draw background for the scanline area
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#000d1f');
        gradient.addColorStop(1, '#0a1a2f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanlinePos - 5, width, 10);
        
        // Draw scanline
        ctx.fillStyle = 'rgba(0, 247, 255, 0.7)';
        ctx.fillRect(0, scanlinePos, width, 2);
        
        // Move scanline
        scanlinePos += 2;
        if (scanlinePos > height) {
            scanlinePos = 0;
        }
        
        // Continue animation if canvas is still in the DOM
        if (document.body.contains(canvas)) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}
