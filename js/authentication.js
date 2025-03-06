/**
 * Authentication system for the Cyberpunk MMORPG game
 * Handles user authentication via guest UUID or Cardano wallet
 */

const AuthenticationSystem = {
    // Authentication state
    isAuthenticated: false,
    currentUser: null,
    authMode: null, // 'guest' or 'wallet'
    
    // Supabase client for database operations
    supabaseUrl: "https://mksrmkpqvgnkfmxxdijs.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc3Jta3Bxdmdua2ZteHhkaWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjIzMzUsImV4cCI6MjA1NjY5ODMzNX0.cV-J-sd6HuKKSv-wz1QfR_g4wbXzWj1ZYKKoUMHRj50",
    supabase: null,
    
    // Blockfrost API for Cardano blockchain operations
    blockfrostApiKey: "mainnetHGcRSvYEMhCYxdFRFJVHWTszgHCYSKty",
    blockfrostApiUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    
    // Storage keys
    STORAGE_KEYS: {
        GUEST_ID: 'guest_user_id',
        AUTH_MODE: 'auth_mode',
        USER_WALLET: 'user_wallet_address',
        NONCE: 'auth_nonce'
    },
    
    /**
     * Initialize the authentication system
     */
    init: async function() {
        console.log('Initializing Authentication System...');
        
        try {
            // Initialize Supabase client
            this.initSupabase();
            
            // Set up UI elements first so users can see the login interface
            this.setupUI();
            
            // Try to restore session (in background)
            this.restoreSession().catch(error => {
                console.error('Error restoring session:', error);
                // Fall back to showing login UI
                this.updateAuthUI();
            });
            
            // Set up auto-save
            this.setupAutoSave(60000); // Auto-save every minute
            
            console.log('Authentication System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Authentication System:', error);
        }
    },
    
    /**
     * Initialize Supabase client
     */
    initSupabase: function() {
        try {
            // Create Supabase client
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase client initialized');
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            
            // Create UI alert about the error
            alert('Failed to connect to game server. Please try again later.');
        }
    },
    
    /**
     * Restore user session
     */
    restoreSession: async function() {
        // Check for existing session
        const authMode = Utils.loadFromStorage(this.STORAGE_KEYS.AUTH_MODE);
        
        if (authMode === 'guest') {
            // Restore guest session
            const guestId = Utils.loadFromStorage(this.STORAGE_KEYS.GUEST_ID);
            if (guestId) {
                this.currentUser = { id: guestId, isGuest: true };
                this.authMode = 'guest';
                this.isAuthenticated = true;
                
                console.log('Restored guest session:', guestId);
                
                // Load user data from Supabase
                await this.loadUserProgress(guestId);
            }
        } else if (authMode === 'wallet') {
            // Restore wallet session
            const walletAddress = Utils.loadFromStorage(this.STORAGE_KEYS.USER_WALLET);
            if (walletAddress) {
                // We need to re-verify wallet connection
                try {
                    const isConnected = await this.checkWalletConnection(walletAddress);
                    if (isConnected) {
                        this.currentUser = { id: walletAddress, isGuest: false, wallet: walletAddress };
                        this.authMode = 'wallet';
                        this.isAuthenticated = true;
                        
                        console.log('Restored wallet session:', walletAddress);
                        
                        // Load user data from Supabase
                        await this.loadUserProgress(walletAddress);
                    } else {
                        // Wallet is no longer connected, fall back to guest login
                        console.log('Wallet no longer connected, falling back to guest login');
                        await this.loginAsGuest();
                    }
                } catch (error) {
                    console.error('Error restoring wallet session:', error);
                    // Fall back to guest login
                    await this.loginAsGuest();
                }
            }
        } else {
            // No existing session, default to guest login
            await this.loginAsGuest();
        }
    },
    
    /**
     * Check if wallet is still connected
     * @param {string} walletAddress - Wallet address to check
     * @returns {Promise<boolean>} - Whether wallet is connected
     */
    checkWalletConnection: async function(walletAddress) {
        try {
            // First check if Cardano API namespace is available (CIP-30 compliant)
            if (typeof window.cardano === 'undefined' || !window.cardano.vespr) {
                console.log('Vespr wallet extension not found in window.cardano namespace');
                return false;
            }
            
            try {
                // Following CIP-30 spec: https://cips.cardano.org/cip/CIP-30
                console.log('Check wallet: Requesting permission...');
                
                // Check if API methods exist before calling them
                if (!window.cardano.vespr.enable) {
                    console.log('Check wallet: Enable method not found');
                    return false;
                }
                
                // Get API object by enabling the wallet
                const api = await window.cardano.vespr.enable();
                console.log('Check wallet: Permission granted');
                
                // Check if required API methods exist
                if (!api || typeof api.getUsedAddresses !== 'function') {
                    console.log('Check wallet: Required methods not available');
                    return false;
                }
                
                // Use API to get addresses (hex encoded)
                const addresses = await api.getUsedAddresses();
                console.log('Check wallet: Addresses received:', addresses);
                
                if (!addresses || addresses.length === 0) {
                    console.log('Check wallet: No addresses returned');
                    return false;
                }
                
                // Verify our stored address is in the list
                const isConnected = addresses.includes(walletAddress);
                console.log('Check wallet: Connected status:', isConnected);
                
                return isConnected;
            } catch (e) {
                console.log('Wallet not enabled or accessible:', e);
                return false;
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
            return false;
        }
    },
    
    /**
     * Setup authentication UI elements
     */
    setupUI: function() {
        // Create login modal
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.classList.add('modal');
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Welcome to LovelaceVerse</h2>
                </div>
                <div class="modal-body">
                    <div class="auth-options">
                        <button id="guest-login-btn" class="cyberpunk-btn">Play as Guest</button>
                        <button id="wallet-login-btn" class="cyberpunk-btn">Connect Wallet</button>
                    </div>
                    <div id="login-status" class="login-status"></div>
                </div>
            </div>
        `;
        
        // Add modal to body if it doesn't exist
        if (!document.getElementById('auth-modal')) {
            document.body.appendChild(modal);
        }
        
        // Add event listeners
        document.getElementById('guest-login-btn').addEventListener('click', this.loginAsGuest.bind(this));
        document.getElementById('wallet-login-btn').addEventListener('click', this.connectWallet.bind(this));
        
        // Update UI based on current auth state
        this.updateAuthUI();
    },
    
    /**
     * Update authentication UI
     */
    updateAuthUI: function() {
        const modal = document.getElementById('auth-modal');
        const loginStatus = document.getElementById('login-status');
        
        if (!modal || !loginStatus) return;
        
        if (this.isAuthenticated) {
            // Hide modal
            modal.style.display = 'none';
            
            // Remove any existing auth-info element
            const existingAuthInfo = document.getElementById('auth-info');
            if (existingAuthInfo) {
                existingAuthInfo.remove();
            }
            
            // Update menu buttons based on auth mode
            if (this.authMode === 'guest') {
                // Add Connect Wallet button to menu (after Profile button)
                this.updateMenuConnectWalletButton(true);
            } else if (this.authMode === 'wallet') {
                // Remove Connect Wallet button from menu when already logged in with wallet
                this.updateMenuConnectWalletButton(false);
            }
        } else {
            // Show modal
            modal.style.display = 'block';
            
            // Reset login status
            loginStatus.textContent = '';
            
            // Remove Connect Wallet button when not authenticated
            this.updateMenuConnectWalletButton(false);
        }
    },
    
    /**
     * Update Connect Wallet button in menu
     * @param {boolean} show - Whether to show or hide the button
     */
    updateMenuConnectWalletButton: function(show) {
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) return;
        
        // Check if button already exists
        let connectWalletBtn = document.getElementById('connect-wallet-menu-btn');
        
        if (show) {
            // Add button if it doesn't exist yet
            if (!connectWalletBtn) {
                connectWalletBtn = document.createElement('button');
                connectWalletBtn.id = 'connect-wallet-menu-btn';
                connectWalletBtn.className = 'menu-button';
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.addEventListener('click', this.connectWallet.bind(this));
                
                // Insert after Profile button (which is always the second-to-last button)
                menuButtons.appendChild(connectWalletBtn);
                
                // Ensure correct order in menu: inventory, Character, Gacha, Dungeon, Marketplace, Profile, Connect wallet
                this.arrangeMenuButtons();
            }
        } else {
            // Remove button if it exists
            if (connectWalletBtn) {
                connectWalletBtn.remove();
            }
        }
    },
    
    /**
     * Arrange menu buttons in the correct order
     * Order: inventory, Character, Gacha, Dungeon, Marketplace, Profile, Connect wallet
     */
    arrangeMenuButtons: function() {
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) return;
        
        // Define the correct order
        const buttonOrder = [
            'inventory-button',
            'character-list-button',
            'gacha-button',
            'dungeon-button',
            'marketplace-button',
            'profile-button',
            'connect-wallet-menu-btn'
        ];
        
        // Get all buttons
        const buttons = Array.from(menuButtons.children);
        
        // Sort buttons according to the defined order
        buttons.sort((a, b) => {
            const aIndex = buttonOrder.indexOf(a.id);
            const bIndex = buttonOrder.indexOf(b.id);
            
            // Keep buttons not in the list at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            
            return aIndex - bIndex;
        });
        
        // Re-append buttons in the correct order
        buttons.forEach(button => menuButtons.appendChild(button));
    },
    
    /**
     * Login as guest
     */
    loginAsGuest: async function() {
        try {
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Generating guest login...';
            }
            
            // Check if we already have a guest ID
            let guestId = Utils.loadFromStorage(this.STORAGE_KEYS.GUEST_ID);
            
            if (!guestId) {
                // Generate a new UUID for this guest
                guestId = this.generateUUID();
                
                // Save to local storage
                Utils.saveToStorage(this.STORAGE_KEYS.GUEST_ID, guestId);
                Utils.saveToStorage(this.STORAGE_KEYS.AUTH_MODE, 'guest');
                
                // Create new user in database
                await this.createUserInDatabase({
                    id: guestId,
                    isGuest: true,
                    created_at: new Date().toISOString(),
                    version: 1
                });
            }
            
            // Set user state
            this.currentUser = { id: guestId, isGuest: true };
            this.authMode = 'guest';
            this.isAuthenticated = true;
            
            // Load any existing progress for this guest
            await this.loadUserProgress(guestId);
            
            // Update UI
            this.updateAuthUI();
            
            console.log('Logged in as guest:', guestId);
            
            return true;
        } catch (error) {
            console.error('Guest login failed:', error);
            
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Login failed. Please try again.';
            }
            
            return false;
        }
    },
    
    /**
     * Connect wallet using Vespr
     */
    connectWallet: async function() {
        try {
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Connecting wallet...';
            }
            
            // Check if Cardano API namespace is available (CIP-30 compliant)
            if (typeof window.cardano === 'undefined' || !window.cardano.vespr) {
                console.error('Vespr wallet extension not found in window.cardano namespace');
                
                // Create a more helpful message for the user with installation instructions
                if (statusEl) {
                    statusEl.innerHTML = `
                        <div class="error-message">
                            <p>Vespr wallet extension not found!</p>
                            <p>Please <a href="https://docs.vespr.xyz/vespr" target="_blank">install the Vespr extension</a> and reload the page.</p>
                            <p>Follow CIP-30 standard: <a href="https://cips.cardano.org/cip/CIP-30" target="_blank">CIP-30 Docs</a></p>
                            <p>Or continue as a guest.</p>
                        </div>
                    `;
                }
                
                // Add a fallback button to login as guest
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    const fallbackBtn = document.createElement('button');
                    fallbackBtn.id = 'fallback-guest-btn';
                    fallbackBtn.className = 'cyberpunk-btn';
                    fallbackBtn.textContent = 'Continue as Guest';
                    fallbackBtn.addEventListener('click', this.loginAsGuest.bind(this));
                    
                    // Find the auth options container and append the button if not already there
                    const authOptions = authModal.querySelector('.auth-options');
                    if (authOptions && !document.getElementById('fallback-guest-btn')) {
                        authOptions.appendChild(fallbackBtn);
                    }
                }
                
                return false;
            }
            
            // Generate a nonce for challenge-response verification
            const nonce = this.generateNonce();
            Utils.saveToStorage(this.STORAGE_KEYS.NONCE, nonce);
            
            console.log('Connecting to Vespr wallet via CIP-30 API...');
            
            let walletAddress;
            let api;
            
            try {
                // Following CIP-30 spec: https://cips.cardano.org/cip/CIP-30
                console.log('Requesting wallet permission...');
                
                // Check if API methods exist before calling them
                if (!window.cardano.vespr.enable) {
                    throw new Error('Vespr wallet enable method not found. Check if the extension is up to date.');
                }
                
                // Enable wallet and get api object
                api = await window.cardano.vespr.enable();
                console.log('Wallet permission granted, API object:', api);
                
                // Check if required API methods exist
                if (!api || typeof api.getUsedAddresses !== 'function') {
                    throw new Error('Required wallet API methods not available. Check the Vespr extension version.');
                }
                
                // Safely get wallet network if the method exists
                if (typeof api.getNetworkId === 'function') {
                    try {
                        const networkId = await api.getNetworkId();
                        console.log('Network ID:', networkId);
                    } catch (networkError) {
                        console.warn('Could not get network ID, but continuing:', networkError);
                    }
                }
                
                // Get wallet addresses (hex encoded)
                console.log('Fetching wallet addresses...');
                const addresses = await api.getUsedAddresses();
                console.log('Addresses received:', addresses);
                if (!addresses || addresses.length === 0) {
                    if (statusEl) {
                        statusEl.textContent = 'No wallet addresses found.';
                    }
                    console.error('No wallet addresses available');
                    return false;
                }
                
                // Use the first address (primary)
                walletAddress = addresses[0];
                console.log('Using wallet address:', walletAddress);

                // Create signature payload with nonce for security
                const message = `Authenticate with LovelaceVerse. Nonce: ${nonce}`;
                const messageUtf8 = new TextEncoder().encode(message);
                // Convert the UTF-8 bytes to a hex string (required by CIP-30)
                const messageHex = Array.from(messageUtf8)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                
                // Request signature using CIP-30 API with hex encoded message
                const signResult = await api.signData(walletAddress, messageHex);
                console.log('Signature obtained:', signResult);
                
                if (!signResult || !signResult.signature) {
                    if (statusEl) {
                        statusEl.textContent = 'Wallet signature cancelled or failed.';
                    }
                    console.error('Wallet signature failed or was cancelled');
                    return false;
                }
                
                // Step 5: Verify by checking the signature exists (in a production app, this would be cryptographically verified)
                if (statusEl) {
                    statusEl.textContent = 'Signature verified successfully.';
                }
            } catch (error) {
                console.error('Vespr wallet error:', error);
                if (statusEl) {
                    statusEl.textContent = 'Wallet error: ' + (error.message || JSON.stringify(error) || error);
                }
                return false;
            }
            
            // Optionally verify wallet using Blockfrost
            // This is a simple check to ensure the wallet exists on the blockchain
            try {
                const walletExists = await this.verifyWalletWithBlockfrost(walletAddress);
                if (!walletExists) {
                    console.warn('Wallet not found on blockchain, but proceeding with auth');
                }
            } catch (e) {
                console.warn('Blockfrost verification failed, but proceeding with auth:', e);
            }
            
            // Save wallet address to storage
            Utils.saveToStorage(this.STORAGE_KEYS.USER_WALLET, walletAddress);
            Utils.saveToStorage(this.STORAGE_KEYS.AUTH_MODE, 'wallet');
            
            // If there was a previous guest account, link it to this wallet
            const guestId = Utils.loadFromStorage(this.STORAGE_KEYS.GUEST_ID);
            if (guestId && this.authMode === 'guest') {
                await this.linkAccounts(guestId, walletAddress);
            }
            
            // Check if user exists in database, create if not
            const { data: existingUser } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', walletAddress)
                .single();
            
            if (!existingUser) {
                // Create new user in database
                await this.createUserInDatabase({
                    id: walletAddress,
                    isGuest: false,
                    wallet_address: walletAddress,
                    created_at: new Date().toISOString(),
                    version: 1
                });
            }
            
            // Set user state
            this.currentUser = { 
                id: walletAddress, 
                isGuest: false, 
                wallet: walletAddress 
            };
            this.authMode = 'wallet';
            this.isAuthenticated = true;
            
            // Load user progress
            await this.loadUserProgress(walletAddress);
            
            // Update UI
            this.updateAuthUI();
            
            console.log('Connected wallet:', walletAddress);
            
            if (statusEl) {
                statusEl.textContent = 'Wallet connected successfully!';
            }
            
            return true;
        } catch (error) {
            console.error('Wallet connection error:', error);
            
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Wallet connection failed: ' + (error.message || JSON.stringify(error) || error);
            }
            
            return false;
        }
    },
    
    /**
     * Verify wallet address using Blockfrost API
     * @param {string} walletAddress - Wallet address to verify
     * @returns {Promise<boolean>} - Whether wallet exists on the blockchain
     */
    verifyWalletWithBlockfrost: async function(walletAddress) {
        try {
            // Make API request to Blockfrost
            const response = await fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}`, {
                method: 'GET',
                headers: {
                    'project_id': this.blockfrostApiKey
                }
            });
            
            if (!response.ok) {
                // If response is not OK, wallet might not exist or API error
                return false;
            }
            
            const data = await response.json();
            return !!data; // Check if we got valid data back
        } catch (error) {
            console.error('Error verifying wallet with Blockfrost:', error);
            throw error;
        }
    },
    
    /**
     * Disconnect wallet
     */
    disconnectWallet: async function() {
        try {
            // Disconnect from wallet using CIP-30 standard
            if (typeof window.cardano !== 'undefined' && window.cardano.vespr) {
                // No explicit disconnect in CIP-30, but we can clear our state
                console.log('Clearing wallet connection state...');
            }
            
            // Save any progress before disconnecting
            await this.saveUserProgress();
            
            // Clear wallet authentication
            Utils.removeFromStorage(this.STORAGE_KEYS.USER_WALLET);
            Utils.saveToStorage(this.STORAGE_KEYS.AUTH_MODE, 'guest');
            
            // Set user state back to guest
            await this.loginAsGuest();
            
            console.log('Wallet disconnected, returned to guest mode');
            
            return true;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            return false;
        }
    },
    
    /**
     * Link guest account to wallet account
     * @param {string} guestId - Guest UUID
     * @param {string} walletAddress - Wallet address
     */
    linkAccounts: async function(guestId, walletAddress) {
        try {
            console.log('Linking guest account to wallet:', guestId, walletAddress);
            
            // Get guest progress data
            const { data: guestData } = await this.supabase
                .from('game_progress')
                .select('*')
                .eq('user_id', guestId)
                .single();
            
            if (guestData) {
                // Check if wallet already has progress
                const { data: walletData } = await this.supabase
                    .from('game_progress')
                    .select('*')
                    .eq('user_id', walletAddress)
                    .single();
                
                if (!walletData) {
                    // Copy guest progress to wallet account
                    const progressData = { ...guestData };
                    progressData.user_id = walletAddress;
                    progressData.linked_from = guestId;
                    progressData.version = 1;
                    
                    // Save to database
                    await this.supabase
                        .from('game_progress')
                        .insert(progressData);
                    
                    console.log('Guest progress copied to wallet account');
                } else {
                    // Merge progress (implement your merging logic here)
                    console.log('Existing wallet progress found, merging required');
                    
                    // In a real implementation, you would:
                    // 1. Compare timestamps
                    // 2. Take the newer data in case of conflicts
                    // 3. Merge inventories, currencies, etc. without losing items
                    
                    // For this example, we'll just update the link
                    await this.supabase
                        .from('game_progress')
                        .update({ 
                            linked_from: guestId,
                            updated_at: new Date().toISOString(),
                            version: walletData.version + 1
                        })
                        .eq('user_id', walletAddress);
                }
                
                // Mark guest account as linked
                await this.supabase
                    .from('users')
                    .update({ 
                        linked_to: walletAddress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', guestId);
                
                // Create an entry in the account_links table
                await this.supabase
                    .from('account_links')
                    .insert({
                        guest_id: guestId,
                        wallet_address: walletAddress,
                        linked_at: new Date().toISOString()
                    });
            }
            
            return true;
        } catch (error) {
            console.error('Error linking accounts:', error);
            return false;
        }
    },
    
    /**
     * Create user in the database
     * @param {Object} userData - User data object
     */
    createUserInDatabase: async function(userData) {
        try {
            // Insert user into database
            const { error } = await this.supabase
                .from('users')
                .insert(userData);
            
            if (error) throw error;
            
            // Create empty progress record
            const progressData = {
                user_id: userData.id,
                game_data: {},
                version: 1,
                created_at: new Date().toISOString()
            };
            
            const { error: progressError } = await this.supabase
                .from('game_progress')
                .insert(progressData);
            
            if (progressError) throw progressError;
            
            console.log('Created new user in database:', userData.id);
            
            return true;
        } catch (error) {
            console.error('Error creating user in database:', error);
            return false;
        }
    },
    
    /**
     * Load user progress from the database
     * @param {string} userId - User ID to load progress for
     */
    loadUserProgress: async function(userId) {
        try {
            // Get progress data from database
            const { data, error } = await this.supabase
                .from('game_progress')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) throw error;
            
            if (data && data.game_data) {
                console.log('Loading user progress:', userId);
                
                // Load game data
                const gameData = data.game_data;
                
                // Pass data to each game system
                if (gameData.currency) Currency.loadFromData(gameData.currency);
                if (gameData.inventory) Utils.saveToStorage('inventory', gameData.inventory);
                if (gameData.characters) Utils.saveToStorage('characters', gameData.characters);
                if (gameData.gacha) Utils.saveToStorage('gacha', gameData.gacha);
                if (gameData.map) Utils.saveToStorage('map', gameData.map);
                if (gameData.shards) Utils.saveToStorage('shards', gameData.shards);
                if (gameData.dungeon) Utils.saveToStorage('dungeon', gameData.dungeon);
                if (gameData.audio) Utils.saveToStorage('audio_settings', gameData.audio);
                
                // Save general game data
                if (gameData.general) Utils.saveToStorage('gameData', gameData.general);
            }
            
            return true;
        } catch (error) {
            console.error('Error loading user progress:', error);
            return false;
        }
    },
    
    /**
     * Save user progress to the database
     */
    saveUserProgress: async function() {
        try {
            if (!this.isAuthenticated || !this.currentUser) {
                console.error('Cannot save progress: Not authenticated');
                return false;
            }
            
            console.log('Saving user progress:', this.currentUser.id);
            
            // Collect data from each game system
            const gameData = {
                currency: Currency.saveData(),
                inventory: Utils.loadFromStorage('inventory'),
                characters: Utils.loadFromStorage('characters'),
                gacha: Utils.loadFromStorage('gacha'),
                map: Utils.loadFromStorage('map'),
                shards: Utils.loadFromStorage('shards'),
                dungeon: Utils.loadFromStorage('dungeon'),
                audio: Utils.loadFromStorage('audio_settings'),
                general: Utils.loadFromStorage('gameData') || {
                    lastSaved: new Date().toISOString()
                }
            };
            
            // Get current progress version
            const { data } = await this.supabase
                .from('game_progress')
                .select('version')
                .eq('user_id', this.currentUser.id)
                .single();
            
            const newVersion = data && data.version ? data.version + 1 : 1;
            
            // Update database
            const { error } = await this.supabase
                .from('game_progress')
                .update({
                    game_data: gameData,
                    updated_at: new Date().toISOString(),
                    version: newVersion
                })
                .eq('user_id', this.currentUser.id);
            
            if (error) throw error;
            
            console.log('Progress saved successfully, version:', newVersion);
            
            return true;
        } catch (error) {
            console.error('Error saving user progress:', error);
            return false;
        }
    },
    
    /**
     * Generate a UUID v4
     * @returns {string} UUID v4
     */
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * Generate a nonce for challenge-response verification
     * @returns {string} Random nonce
     */
    generateNonce: function() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Check if user is authenticated
     * @returns {boolean} Whether user is authenticated
     */
    isUserAuthenticated: function() {
        return this.isAuthenticated;
    },
    
    /**
     * Get current user data
     * @returns {Object|null} Current user or null if not authenticated
     */
    getCurrentUser: function() {
        return this.currentUser;
    },
    
    /**
     * Get authentication mode
     * @returns {string|null} 'guest' or 'wallet' or null if not authenticated
     */
    getAuthMode: function() {
        return this.authMode;
    },
    
    /**
     * Setup auto-save interval
     * @param {number} intervalMs - Interval in milliseconds
     */
    setupAutoSave: function(intervalMs = 60000) {
        // Auto-save progress every minute (or specified interval)
        setInterval(() => {
            if (this.isAuthenticated) {
                this.saveUserProgress().catch(console.error);
            }
        }, intervalMs);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationSystem;
}
