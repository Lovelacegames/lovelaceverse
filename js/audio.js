/**
 * Audio system for the Cyberpunk MMORPG game
 * Handles sound effects, background music and volume control
 */

const AudioSystem = {
    // Sound effects
    soundEffects: {
        click: 'music/click.mp3',
        attackSprite: 'music/attackSprite.mp3',
        rangedSprite: 'music/rangedSprite.mp3',
        magicSprite: 'music/magicSprite.mp3'
    },
    
    // Background music mapping dungeon IDs to their music files
    backgroundMusic: {
        cyber_slums: 'music/neon_district.mp3',     // Verified file exists
        neon_district: 'music/neon_district.mp3',   // Verified file exists
        corporate_plaza: 'music/corporate_plaza.mp3', // Verified file exists
        data_nexus: 'music/data_nexus.mp3',         // Verified file exists
        quantum_void: 'music/quantum_void.mp3',     // Verified file exists
        lovecity: 'music/lovecity.mp3'              // Verified file exists
    },
    
    // Audio elements
    bgmElement: null,
    
    // Volume settings
    volume: 0.5, // Default volume 50%
    isMuted: false,
    currentBgm: null,
    
    /**
     * Initialize the audio system
     */
    init: function() {
        console.log('Initializing AudioSystem...');
        
        // Create BGM element
        this.bgmElement = document.createElement('audio');
        this.bgmElement.id = 'bgm-player';
        this.bgmElement.loop = true;
        document.body.appendChild(this.bgmElement);
        
        // Load volume settings from storage or use defaults
        const savedVolume = Utils.loadFromStorage('audio_volume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
        
        const savedMuted = Utils.loadFromStorage('audio_muted');
        if (savedMuted !== null) {
            this.isMuted = savedMuted === 'true';
        }
        
        // Create audio controls UI
        this.createAudioControls();
        
        // Set initial volume
        this.updateVolumeUI();
    },
    
    /**
     * Create audio controls UI
     */
    createAudioControls: function() {
        const container = document.createElement('div');
        container.id = 'audio-controls';
        container.className = 'audio-controls';
        
        // Create the HTML content for the controls
        const audioIconClass = this.isMuted ? 'muted' : 'unmuted';
        container.innerHTML = 
            '<div class="audio-controls-panel">' +
                '<button id="audio-toggle" class="audio-button">' +
                    '<i class="audio-icon ' + audioIconClass + '"></i>' +
                '</button>' +
                '<div class="volume-slider-container">' +
                    '<input type="range" id="volume-slider" min="0" max="1" step="0.01" value="' + this.volume + '">' +
                '</div>' +
            '</div>';
        
        document.body.appendChild(container);
        
        // Add event listeners
        const audioToggle = document.getElementById('audio-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleMute();
            });
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }
    },
    
    /**
     * Update volume UI to match current settings
     */
    updateVolumeUI: function() {
        const audioToggle = document.getElementById('audio-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (audioToggle) {
            const icon = audioToggle.querySelector('.audio-icon');
            if (icon) {
                if (this.isMuted) {
                    icon.classList.remove('unmuted');
                    icon.classList.add('muted');
                } else {
                    icon.classList.remove('muted');
                    icon.classList.add('unmuted');
                }
            }
        }
        
        if (volumeSlider) {
            volumeSlider.value = this.volume;
        }
        
        // Update BGM volume
        if (this.bgmElement) {
            this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        }
    },
    
    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound effect to play
     */
    playSoundEffect: function(soundName) {
        if (this.isMuted) return;
        
        const soundPath = this.soundEffects[soundName];
        if (!soundPath) {
            console.error(`Sound effect not found: ${soundName}`);
            return;
        }
        
        const audio = new Audio(soundPath);
        audio.volume = this.volume;
        audio.play().catch(error => {
            console.error(`Error playing sound effect: ${error}`);
        });
    },
    
    /**
     * Play background music
     * @param {string} musicId - ID of the music to play
     */
    playBackgroundMusic: function(musicId) {
        if (!this.bgmElement) return;
        
        const musicPath = this.backgroundMusic[musicId];
        if (!musicPath) {
            console.error(`Background music not found: ${musicId}`);
            return;
        }
        
        // If already playing this BGM, don't restart it
        if (this.currentBgm === musicId && !this.bgmElement.paused) {
            return;
        }
        
        // Stop current BGM if playing
        this.stopBackgroundMusic();
        
        // Set new BGM
        this.bgmElement.src = musicPath;
        this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        this.currentBgm = musicId;
        
        // Try to play audio, but it may be blocked until user interaction
        this.bgmElement.play().catch(error => {
            console.log('Audio will play after user interaction');
            
            // Add event listeners for first user interaction
            const playOnFirstInteraction = function() {
                // Try to play the audio again
                if (AudioSystem.bgmElement) {
                    AudioSystem.bgmElement.play().catch(function(e) {
                        console.log('Still could not play audio: ' + e);
                    });
                }
                
                // Set flag for future audio plays
                document.documentElement.setAttribute('data-user-interacted', 'true');
                
                // Remove event listeners
                document.removeEventListener('click', playOnFirstInteraction);
                document.removeEventListener('keydown', playOnFirstInteraction);
                document.removeEventListener('touchstart', playOnFirstInteraction);
            };
            
            // Add one-time event listeners for user interaction
            document.addEventListener('click', playOnFirstInteraction, { once: true });
            document.addEventListener('keydown', playOnFirstInteraction, { once: true });
            document.addEventListener('touchstart', playOnFirstInteraction, { once: true });
        });
    },
    
    /**
     * Stop background music
     */
    stopBackgroundMusic: function() {
        if (!this.bgmElement) return;
        
        this.bgmElement.pause();
        this.bgmElement.currentTime = 0;
        this.currentBgm = null;
    },
    
    /**
     * Set volume level
     * @param {number} volume - Volume level from 0 to 1
     */
    setVolume: function(volume) {
        // Ensure volume is between 0 and 1
        this.volume = Math.max(0, Math.min(1, parseFloat(volume)));
        
        // Update BGM volume
        if (this.bgmElement) {
            this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        }
        
        // Save volume setting
        Utils.saveToStorage('audio_volume', this.volume.toString());
        
        // Update UI
        this.updateVolumeUI();
    },
    
    /**
     * Toggle mute state
     */
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        
        // Update BGM volume
        if (this.bgmElement) {
            this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        }
        
        // Save mute setting
        Utils.saveToStorage('audio_muted', this.isMuted.toString());
        
        // Update UI
        this.updateVolumeUI();
    },
    
    /**
     * Play click sound effect
     * Used for button clicks
     */
    playClickSound: function() {
        this.playSoundEffect('click');
    }
};
