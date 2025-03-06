/**
 * Script to generate Gacha banner images
 * This creates the three banner images for the gacha types
 */

function createGachaImage(text, color, secondaryColor, size = 200) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add some effects for visual interest
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 10 + Math.random() * 40;
        
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    
    // Add some particles/stars
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 1 + Math.random() * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    }
    
    // DNA helix pattern for cyberpunk theme
    ctx.beginPath();
    for (let i = 0; i < size; i += 20) {
        const amplitude = size / 10;
        const frequency = size / 400;
        
        // First strand
        ctx.moveTo(i, size/2 + Math.sin(i * frequency) * amplitude);
        ctx.lineTo(i + 10, size/2 + Math.sin((i + 10) * frequency) * amplitude);
        
        // Second strand
        ctx.moveTo(i, size/2 + Math.sin((i + Math.PI) * frequency) * amplitude);
        ctx.lineTo(i + 10, size/2 + Math.sin((i + 10 + Math.PI) * frequency) * amplitude);
        
        // Connecting rungs
        if (i % 40 === 0) {
            ctx.moveTo(i, size/2 + Math.sin(i * frequency) * amplitude);
            ctx.lineTo(i, size/2 + Math.sin((i + Math.PI) * frequency) * amplitude);
        }
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add title text
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(text, size/2, size/2);
    
    // Add "DNA" text
    ctx.font = 'bold 16px Arial';
    ctx.fillText('DNA', size/2, size/2 + 30);
    
    return canvas.toDataURL('image/png');
}

// Create and display the images for download
window.onload = function() {
    const container = document.getElementById('gacha-images');
    
    // Mortal DNA (blue theme)
    const mortalImg = createGachaImage('MORTAL', '#003366', '#0066cc');
    const mortalEl = document.createElement('div');
    mortalEl.innerHTML = `
        <h3>Mortal DNA</h3>
        <img src="${mortalImg}" alt="Mortal DNA">
        <a href="${mortalImg}" download="mortal.png">Download</a>
    `;
    container.appendChild(mortalEl);
    
    // Synthetic DNA (purple theme)
    const syntheticImg = createGachaImage('SYNTHETIC', '#330066', '#9900cc');
    const syntheticEl = document.createElement('div');
    syntheticEl.innerHTML = `
        <h3>Synthetic DNA</h3>
        <img src="${syntheticImg}" alt="Synthetic DNA">
        <a href="${syntheticImg}" download="synthetic.png">Download</a>
    `;
    container.appendChild(syntheticEl);
    
    // Divine DNA (gold theme)
    const divineImg = createGachaImage('DIVINE', '#996600', '#ffcc00');
    const divineEl = document.createElement('div');
    divineEl.innerHTML = `
        <h3>Divine DNA</h3>
        <img src="${divineImg}" alt="Divine DNA">
        <a href="${divineImg}" download="divine.png">Download</a>
    `;
    container.appendChild(divineEl);
    
    // Generate and save directly
    if (typeof saveAsFile === 'function') {
        saveAsFile(mortalImg, 'img/mortal.png');
        saveAsFile(syntheticImg, 'img/synthetic.png');
        saveAsFile(divineImg, 'img/divine.png');
    }
};

// Helper function for direct saving (browser environment won't use this)
function saveAsFile(dataUrl, filename) {
    // This function would be implemented in a Node.js context if needed
    console.log(`Saving ${filename}...`);
}

// Function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
}
