/**
 * Gacha Animation Fix - Ensures gacha animations work properly after buttons fix
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing gacha animation fix...');
    
    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
        ensureGachaAnimationWorks();
    }, 800);
    
    // Listen for gacha button clicks to ensure animation works
    const gachaButtons = document.querySelectorAll('.gacha-pull-button');
    gachaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create containers in advance of animation
            ensureGachaAnimationWorks();
        });
    });
    
    // Also ensure containers exist when the gacha modal is opened
    const gachaModalButton = document.getElementById('gacha-button');
    if (gachaModalButton) {
        gachaModalButton.addEventListener('click', function() {
            // Short delay to let modal open
            setTimeout(ensureGachaAnimationWorks, 300);
        });
    }
});

/**
 * Ensure gacha animation works by creating required containers
 */
function ensureGachaAnimationWorks() {
    // Ensure pull animation container exists
    ensurePullAnimationContainer();
    
    // Make sure Three.js is initialized
    initializeGachaThree();
}

/**
 * Ensure the pull animation container exists
 */
function ensurePullAnimationContainer() {
    // Check if containers exist
    let pullAnimationContainer = document.getElementById('pull-animation-container');
    
    // Create main container if it doesn't exist
    if (!pullAnimationContainer) {
        console.log('Creating pull animation container');
        
        // Create main container
        pullAnimationContainer = document.createElement('div');
        pullAnimationContainer.id = 'pull-animation-container';
        pullAnimationContainer.className = 'pull-animation-container';
        
        // Initial styling
        pullAnimationContainer.style.display = 'none';
        pullAnimationContainer.style.position = 'absolute';
        pullAnimationContainer.style.top = '0';
        pullAnimationContainer.style.left = '0';
        pullAnimationContainer.style.width = '100%';
        pullAnimationContainer.style.height = '100%';
        pullAnimationContainer.style.zIndex = '10';
        
        // Find gacha modal to append to
        const gachaModal = document.getElementById('gacha-modal');
        if (gachaModal) {
            const modalBody = gachaModal.querySelector('.modal-body');
            if (modalBody) {
                modalBody.appendChild(pullAnimationContainer);
            } else {
                document.body.appendChild(pullAnimationContainer);
            }
        } else {
            document.body.appendChild(pullAnimationContainer);
        }
    }
    
    // Create scene container if it doesn't exist
    let pullAnimationScene = document.getElementById('pull-animation-scene');
    if (!pullAnimationScene) {
        console.log('Creating pull animation scene');
        
        pullAnimationScene = document.createElement('div');
        pullAnimationScene.id = 'pull-animation-scene';
        pullAnimationScene.className = 'pull-animation-scene';
        
        // Add basic styling
        pullAnimationScene.style.width = '100%';
        pullAnimationScene.style.height = '100%';
        pullAnimationScene.style.position = 'relative';
        pullAnimationScene.style.overflow = 'hidden';
        
        // Append to container
        pullAnimationContainer.appendChild(pullAnimationScene);
    }
    
    // Add required CSS
    ensureGachaCssExists();
}

/**
 * Ensure required CSS for gacha animations exists
 */
function ensureGachaCssExists() {
    if (!document.getElementById('gacha-animation-fix-css')) {
        const style = document.createElement('style');
        style.id = 'gacha-animation-fix-css';
        style.textContent = `
            .pull-animation-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                display: none;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                background-color: rgba(0, 10, 20, 0.8);
            }
            
            .pull-animation-container.active {
                opacity: 1;
            }
            
            .pull-animation-scene {
                width: 100%;
                height: 100%;
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Initialize GachaThreeEnvironment if not already initialized
 */
function initializeGachaThree() {
    // Check if GachaThreeEnvironment exists
    if (typeof GachaThreeEnvironment !== 'undefined') {
        // If we already have a container but no scene, reinitialize
        if (GachaThreeEnvironment.container && !GachaThreeEnvironment.scene) {
            console.log('Reinitializing GachaThreeEnvironment');
            GachaThreeEnvironment.init();
        } 
        // If we have no container, initialize
        else if (!GachaThreeEnvironment.container) {
            console.log('Initializing GachaThreeEnvironment');
            GachaThreeEnvironment.init();
        }
    }
}
