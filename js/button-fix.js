/**
 * Button Fix Script - Disables Three.js buttons and ensures pure CSS buttons work
 * This script patches issues with missing or non-functioning Three.js buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing button fix...');
    
    // Wait a bit to make sure the DOM is fully loaded
    setTimeout(() => {
        // Remove only button canvas elements that might cause issues
        // Don't remove canvases used for animations, gacha, etc.
        const canvasElements = document.querySelectorAll('.cyberpunk-button-canvas');
        canvasElements.forEach(canvas => {
            // Skip removing canvases that are part of gacha animations
            const isGachaCanvas = 
                canvas.closest('#pull-animation-scene') ||
                canvas.closest('#pull-animation-container') ||
                canvas.closest('.pull-animation-scene') ||
                canvas.closest('.pull-animation-container');
                
            if (canvas && canvas.parentNode && !isGachaCanvas) {
                canvas.parentNode.removeChild(canvas);
            }
        });
        
        // Ensure all button texts are properly displayed
        fixButtonTexts();
        
        // Add a small observer to fix any dynamically added buttons
        observeButtonChanges();
        
        // Fix the buff button state display
        fixBuffButtons();
    }, 500);
});

/**
 * Fix button text visibility ensuring the original text is displayed
 */
function fixButtonTexts() {
    // Find all buttons
    const allButtons = document.querySelectorAll('.cyberpunk-button, .menu-button, .buff-button, .gacha-pull-button, .inventory-tab, .enter-dungeon-button');
    
    allButtons.forEach(button => {
        // Remove any Three.js added spans that might be empty
        const emptySpans = button.querySelectorAll('span:empty');
        emptySpans.forEach(span => span.parentNode.removeChild(span));
        
        // Check if the button has visible text content
        if (button.textContent.trim() === '') {
            // Try to recover the original text from data attribute or default based on button type
            let buttonText = button.getAttribute('data-original-text');
            
            if (!buttonText) {
                // Try to determine a default text based on button type
                if (button.id === 'damage-buff') buttonText = '1x DMG';
                else if (button.id === 'speed-buff') buttonText = '1x SPD';
                else if (button.classList.contains('inventory-tab')) {
                    const tabType = button.getAttribute('data-tab');
                    buttonText = tabType ? tabType.charAt(0).toUpperCase() + tabType.slice(1) : 'Tab';
                }
                else buttonText = button.id || 'Button';
            }
            
            // Set the text content
            button.textContent = buttonText;
        }
    });
}

/**
 * Watch for buttons being added to the DOM and fix them
 */
function observeButtonChanges() {
    // Create a mutation observer to watch for new buttons
    const observer = new MutationObserver(mutations => {
        let needsFix = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                const addedButtons = Array.from(mutation.addedNodes)
                    .filter(node => node.nodeType === Node.ELEMENT_NODE)
                    .flatMap(node => {
                        // Check if the node itself is a button
                        const isButton = node.classList && 
                            (node.classList.contains('cyberpunk-button') || 
                             node.classList.contains('menu-button') || 
                             node.classList.contains('gacha-pull-button') || 
                             node.classList.contains('buff-button') || 
                             node.classList.contains('inventory-tab') || 
                             node.classList.contains('enter-dungeon-button'));
                            
                        // Also check children
                        const childButtons = node.querySelectorAll ? 
                            Array.from(node.querySelectorAll('.cyberpunk-button, .menu-button, .gacha-pull-button, .buff-button, .inventory-tab, .enter-dungeon-button')) : 
                            [];
                            
                        return isButton ? [node, ...childButtons] : childButtons;
                    });
                
                if (addedButtons.length > 0) {
                    needsFix = true;
                }
            }
        });
        
        if (needsFix) {
            fixButtonTexts();
        }
    });
    
    // Start observing the entire document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Fix the buff buttons state display
 */
function fixBuffButtons() {
    // Make sure buff buttons show the right state
    const updateBuffDisplay = function() {
        const damageBuff = document.getElementById('damage-buff');
        const speedBuff = document.getElementById('speed-buff');
        
        if (damageBuff && damageBuff.disabled) {
            damageBuff.classList.add('disabled');
        }
        
        if (speedBuff && speedBuff.disabled) {
            speedBuff.classList.add('disabled');
        }
    };
    
    // Initial update
    updateBuffDisplay();
    
    // Watch for changes to the buff buttons
    const buffButtons = document.querySelectorAll('.buff-button');
    buffButtons.forEach(button => {
        // Create a MutationObserver to watch for changes to the disabled attribute
        const observer = new MutationObserver(mutations => {
            updateBuffDisplay();
        });
        
        // Observe changes to attributes
        observer.observe(button, {
            attributes: true,
            attributeFilter: ['disabled']
        });
        
        // Also handle clicks
        button.addEventListener('click', () => {
            // Short delay to let the buff system process
            setTimeout(updateBuffDisplay, 50);
        });
    });
}
