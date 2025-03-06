/**
 * Profile Dashboard System for the Cyberpunk MMORPG game
 * Displays user wallet information and token balances in a cyberpunk-themed dashboard
 */

const ProfileDashboard = {
    // Configuration
    defaultPolicyId: "855e51f09dffb1eee10bd5ba070a925249b79ab2da5cff65311e7f97",
    customPolicyId: null, // Will be loaded from storage or set to default
    
    // Blockfrost API for Cardano blockchain operations
    blockfrostApiKey: "mainnetHGcRSvYEMhCYxdFRFJVHWTszgHCYSKty",
    blockfrostApiUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    
    // Cache for token balances to reduce API calls
    balanceCache: {
        ada: null,
        customToken: null,
        lastFetched: null,
        cacheDuration: 60000 // 1 minute
    },
    
    // Storage keys
    STORAGE_KEYS: {
        CUSTOM_POLICY_ID: 'custom_token_policy_id'
    },
    
    /**
     * Initialize the profile dashboard
     */
    init: function() {
        console.log('Initializing Profile Dashboard...');
        
        try {
            // Load custom policy ID from storage or use default
            this.loadCustomPolicyId();
            
            // Create profile button in menu
            this.createProfileButton();
            
            // Create profile modal
            this.createProfileModal();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Profile Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Profile Dashboard:', error);
        }
    },
    
    /**
     * Load custom policy ID from storage or use default
     */
    loadCustomPolicyId: function() {
        const savedPolicyId = Utils.loadFromStorage(this.STORAGE_KEYS.CUSTOM_POLICY_ID);
        this.customPolicyId = savedPolicyId || this.defaultPolicyId;
        console.log('Loaded custom policy ID:', this.customPolicyId);
    },
    
    /**
     * Save custom policy ID to storage
     * @param {string} policyId - Policy ID to save
     */
    saveCustomPolicyId: function(policyId) {
        this.customPolicyId = policyId;
        Utils.saveToStorage(this.STORAGE_KEYS.CUSTOM_POLICY_ID, policyId);
        console.log('Saved custom policy ID:', policyId);
    },
    
    /**
     * Create profile button in menu
     */
    createProfileButton: function() {
        // Check if menu buttons container exists
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) {
            console.error('Menu buttons container not found');
            return;
        }
        
        // Create button if it doesn't exist yet
        if (!document.getElementById('profile-button')) {
            const button = document.createElement('button');
            button.id = 'profile-button';
            button.className = 'menu-button';
            
            // Set initial button text (will be updated by updateProfileButton)
            button.textContent = 'Profile';
            
            // Add button to menu
            menuButtons.appendChild(button);
        }
        
        // Update button content based on auth state
        this.updateProfileButton();
    },
    
    /**
     * Update profile button content based on authentication state
     */
    updateProfileButton: function() {
        const button = document.getElementById('profile-button');
        if (!button) return;
        
        if (AuthenticationSystem.isAuthenticated) {
            if (AuthenticationSystem.authMode === 'wallet') {
                // Show shortened wallet address
                const walletAddress = AuthenticationSystem.currentUser.wallet;
                const shortenedAddress = walletAddress.substring(0, 6) + '...';
                button.textContent = `${shortenedAddress}`;
            } else {
                // Show guest text
                button.textContent = 'Guest Profile';
            }
        } else {
            // Default text if not authenticated
            button.textContent = 'Profile';
        }
    },
    
    /**
     * Create profile modal
     */
    createProfileModal: function() {
        // Check if profile modal already exists
        if (document.getElementById('profile-modal')) return;
        
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'modal';
        modal.style.display = 'none'; // Initially hidden
        
        // Set modal content
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-modal-header">
                    <h2>USER PROFILE</h2>
                    <button class="close-profile-modal">&times;</button>
                </div>
                <div class="profile-modal-body">
                    <div class="user-identity">
                        <div class="address-container">
                            <span class="address-label">IDENTITY:</span>
                            <div id="wallet-address-display" class="wallet-address">Loading...</div>
                        </div>
                        <div class="login-status">
                            <div id="status-indicator" class="status-indicator"></div>
                            <span id="status-text" class="status-text">Checking connection status...</span>
                        </div>
                    </div>
                    
                    <div class="token-balances">
                        <h3 class="balance-header">DIGITAL ASSETS</h3>
                        
                        <div class="balance-item">
                            <div class="token-info">
                                <div class="token-icon ada"></div>
                                <div>
                                    <span class="token-name">ADA</span>
                                </div>
                            </div>
                            <div id="ada-balance" class="token-amount ada loading">Loading</div>
                        </div>
                        
                        <div class="balance-item">
                            <div class="token-info">
                                <div class="token-icon custom"></div>
                                <div>
                                    <span class="token-name">CUSTOM TOKEN</span>
                                    <span id="custom-policy-display" class="token-policy-id">Policy: ${this.customPolicyId.substring(0, 8)}...</span>
                                </div>
                            </div>
                            <div id="custom-token-balance" class="token-amount custom loading">Loading</div>
                        </div>
                        
                        <div class="token-policy-container">
                            <div class="token-policy-title">CUSTOM TOKEN POLICY ID</div>
                            <div class="token-policy-field">
                                <input id="policy-id-input" type="text" value="${this.customPolicyId}" placeholder="Enter token policy ID">
                                <button id="update-policy-btn">UPDATE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
    },
    
    /**
     * Set up event listeners for profile dashboard
     */
    setupEventListeners: function() {
        // Profile button click
        const profileButton = document.getElementById('profile-button');
        if (profileButton) {
            profileButton.addEventListener('click', this.showProfileModal.bind(this));
        }
        
        // Close button click
        const closeButton = document.querySelector('.close-profile-modal');
        if (closeButton) {
            closeButton.addEventListener('click', this.hideProfileModal.bind(this));
        }
        
        // Update policy ID button click
        const updatePolicyBtn = document.getElementById('update-policy-btn');
        if (updatePolicyBtn) {
            updatePolicyBtn.addEventListener('click', this.updateCustomPolicyId.bind(this));
        }
        
        // Listen for authentication state changes
        document.addEventListener('authStateChanged', this.handleAuthStateChange.bind(this));
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('profile-modal');
            if (event.target === modal) {
                this.hideProfileModal();
            }
        });
    },
    
    /**
     * Show profile modal and update data
     */
    showProfileModal: function() {
        const modal = document.getElementById('profile-modal');
        if (!modal) return;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Update user identity display
        this.updateIdentityDisplay();
        
        // Update token balances if user is authenticated with wallet
        if (AuthenticationSystem.isAuthenticated && AuthenticationSystem.authMode === 'wallet') {
            this.fetchTokenBalances(AuthenticationSystem.currentUser.wallet);
        } else {
            // Show zeros for guest or unauthorized users
            this.updateBalanceDisplays('0', '0');
        }
    },
    
    /**
     * Hide profile modal
     */
    hideProfileModal: function() {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Update custom policy ID from input field
     */
    updateCustomPolicyId: function() {
        const input = document.getElementById('policy-id-input');
        if (!input) return;
        
        const newPolicyId = input.value.trim();
        if (newPolicyId === '') {
            alert('Please enter a valid policy ID');
            return;
        }
        
        // Save new policy ID
        this.saveCustomPolicyId(newPolicyId);
        
        // Update display
        const policyDisplay = document.getElementById('custom-policy-display');
        if (policyDisplay) {
            policyDisplay.textContent = `Policy: ${newPolicyId.substring(0, 8)}...`;
        }
        
        // Reset and fetch balance with new policy ID
        const customBalance = document.getElementById('custom-token-balance');
        if (customBalance) {
            customBalance.textContent = 'Loading';
            customBalance.classList.add('loading');
        }
        
        // Invalidate cache
        this.balanceCache.customToken = null;
        this.balanceCache.lastFetched = null;
        
        // Re-fetch if authenticated
        if (AuthenticationSystem.isAuthenticated && AuthenticationSystem.authMode === 'wallet') {
            this.fetchTokenBalances(AuthenticationSystem.currentUser.wallet);
        }
    },
    
    /**
     * Update user identity display
     */
    updateIdentityDisplay: function() {
        const addressDisplay = document.getElementById('wallet-address-display');
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (!addressDisplay || !statusIndicator || !statusText) return;
        
        if (AuthenticationSystem.isAuthenticated) {
            if (AuthenticationSystem.authMode === 'wallet') {
                // Display wallet address and connected status
                const walletAddress = AuthenticationSystem.currentUser.wallet;
                addressDisplay.textContent = walletAddress;
                addressDisplay.classList.remove('guest');
                
                statusIndicator.classList.add('connected');
                statusIndicator.classList.remove('guest');
                statusText.textContent = 'Connected via Cardano Wallet';
            } else {
                // Display guest status
                addressDisplay.textContent = 'Guest User';
                addressDisplay.classList.add('guest');
                
                statusIndicator.classList.add('guest');
                statusIndicator.classList.remove('connected');
                statusText.textContent = 'Playing as Guest • Connect Wallet to Save Progress';
            }
        } else {
            // Not authenticated
            addressDisplay.textContent = 'Not Connected';
            addressDisplay.classList.add('guest');
            
            statusIndicator.classList.remove('connected', 'guest');
            statusText.textContent = 'Not authenticated';
        }
    },
    
    /**
     * Fetch token balances from Blockfrost API
     * @param {string} walletAddress - Wallet address to fetch balances for
     */
    fetchTokenBalances: async function(walletAddress) {
        // Check if cache is still valid
        const now = Date.now();
        if (this.balanceCache.lastFetched && (now - this.balanceCache.lastFetched < this.balanceCache.cacheDuration)) {
            console.log('Using cached balances');
            this.updateBalanceDisplays(
                this.balanceCache.ada || '0',
                this.balanceCache.customToken || '0'
            );
            return;
        }
        
        try {
            // Set loading state
            const adaBalance = document.getElementById('ada-balance');
            const customBalance = document.getElementById('custom-token-balance');
            
            if (adaBalance) {
                adaBalance.textContent = 'Loading';
                adaBalance.classList.add('loading');
            }
            
            if (customBalance) {
                customBalance.textContent = 'Loading';
                customBalance.classList.add('loading');
            }
            
            // First try to get balance directly from wallet API (more accurate)
            let adaAmount = '0';
            let customTokenAmount = '0';
            let usedWalletAPI = false;
            
            try {
                console.log('Trying to get balance from wallet API...');
                
                // Check if we can access the wallet API correctly using CIP-30
                if (typeof window.cardano !== 'undefined' && window.cardano.vespr) {
                    // Get API object
                    const api = await window.cardano.vespr.enable();
                    
                    if (api && typeof api.getBalance === 'function') {
                        console.log('Getting balance via wallet API...');
                        
                        // Get balance (returns all assets)
                        const balance = await api.getBalance();
                        console.log('Wallet balance:', balance);
                        
                        if (balance && balance.length > 0) {
                            // Look for lovelace (ADA) entry - this is the one without asset name
                            const lovelaceEntry = balance.find(entry => entry.unit === 'lovelace');
                            
                            if (lovelaceEntry) {
                                adaAmount = (parseInt(lovelaceEntry.quantity) / 1000000).toFixed(2);
                                this.balanceCache.ada = adaAmount;
                                console.log('ADA balance from wallet:', adaAmount);
                            }
                            
                            // Look for the custom token with our policy ID
                            const customTokenEntry = balance.find(entry => entry.unit && entry.unit.startsWith(this.customPolicyId));
                            
                            if (customTokenEntry) {
                                customTokenAmount = (parseInt(customTokenEntry.quantity) / 1000000).toFixed(2);
                                this.balanceCache.customToken = customTokenAmount;
                                console.log('Custom token balance from wallet:', customTokenAmount);
                            }
                            
                            usedWalletAPI = true;
                        }
                    }
                }
            } catch (walletError) {
                console.warn('Could not get balance from wallet API, falling back to Blockfrost:', walletError);
            }
            
            // If we couldn't get balance from wallet API, use Blockfrost
            if (!usedWalletAPI) {
                console.log('Using Blockfrost API to get balances...');
                
                // Fetch ADA balance
                const adaResponse = await fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}`, {
                    method: 'GET',
                    headers: {
                        'project_id': this.blockfrostApiKey
                    }
                });
                
                if (adaResponse.ok) {
                    const adaData = await adaResponse.json();
                    if (adaData && adaData.amount && adaData.amount.length > 0) {
                        // Convert lovelace (millionths of ADA) to ADA
                        adaAmount = (parseInt(adaData.amount[0].quantity) / 1000000).toFixed(2);
                        // Cache the result
                        this.balanceCache.ada = adaAmount;
                    }
                } else {
                    console.error('Error fetching ADA balance:', await adaResponse.text());
                }
                
                // Fetch custom token balance
                const assetsResponse = await fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}/assets`, {
                    method: 'GET',
                    headers: {
                        'project_id': this.blockfrostApiKey
                    }
                });
                
                if (assetsResponse.ok) {
                    const assetsData = await assetsResponse.json();
                    // Find the asset with our policy ID
                    const customAsset = assetsData.find(asset => asset.unit.startsWith(this.customPolicyId));
                    if (customAsset) {
                        // Format based on decimals (assuming 6 for simplicity, adjust as needed)
                        customTokenAmount = (parseInt(customAsset.quantity) / 1000000).toFixed(2);
                    }
                    // Cache the result
                    this.balanceCache.customToken = customTokenAmount;
                } else {
                    console.error('Error fetching assets:', await assetsResponse.text());
                }
            }
            
            // Update cache timestamp
            this.balanceCache.lastFetched = now;
            
            // Update UI
            this.updateBalanceDisplays(adaAmount, customTokenAmount);
        } catch (error) {
            console.error('Error fetching token balances:', error);
            
            // Update UI with error state
            const adaBalance = document.getElementById('ada-balance');
            const customBalance = document.getElementById('custom-token-balance');
            
            if (adaBalance) {
                adaBalance.textContent = 'Error';
                adaBalance.classList.remove('loading');
            }
            
            if (customBalance) {
                customBalance.textContent = 'Error';
                customBalance.classList.remove('loading');
            }
        }
    },
    
    /**
     * Update balance displays with fetched values
     * @param {string} adaAmount - ADA balance amount
     * @param {string} customTokenAmount - Custom token balance amount
     */
    updateBalanceDisplays: function(adaAmount, customTokenAmount) {
        const adaBalance = document.getElementById('ada-balance');
        const customBalance = document.getElementById('custom-token-balance');
        
        if (adaBalance) {
            adaBalance.textContent = adaAmount;
            adaBalance.classList.remove('loading');
        }
        
        if (customBalance) {
            customBalance.textContent = customTokenAmount;
            customBalance.classList.remove('loading');
        }
    },
    
    /**
     * Handle authentication state changes
     */
    handleAuthStateChange: function() {
        console.log('Auth state changed, updating profile dashboard');
        
        // Update profile button
        this.updateProfileButton();
        
        // Update modal content if it's open
        const modal = document.getElementById('profile-modal');
        if (modal && modal.style.display === 'flex') {
            this.updateIdentityDisplay();
            
            // Fetch balances if authenticated with wallet
            if (AuthenticationSystem.isAuthenticated && AuthenticationSystem.authMode === 'wallet') {
                this.fetchTokenBalances(AuthenticationSystem.currentUser.wallet);
            } else {
                this.updateBalanceDisplays('0', '0');
            }
        }
    }
};

// Add custom event for auth state changes that AuthenticationSystem will dispatch
if (typeof AuthenticationSystem !== 'undefined') {
    // Extend the auth system's updateAuthUI function to dispatch events
    const originalUpdateAuthUI = AuthenticationSystem.updateAuthUI;
    AuthenticationSystem.updateAuthUI = function() {
        // Call the original function
        originalUpdateAuthUI.call(AuthenticationSystem);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('authStateChanged'));
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileDashboard;
}
