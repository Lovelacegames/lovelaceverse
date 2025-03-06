/**
 * Authentication debugging utilities for Cyberpunk MMORPG
 * This script provides tools for testing and troubleshooting the authentication system
 */

const AuthDebug = {
    /**
     * Run a full diagnostic check on the authentication system
     */
    runDiagnostics: function() {
        console.log('=== Authentication System Diagnostics ===');
        
        // Check dependencies
        this.checkDependencies();
        
        // Check for Vespr Wallet
        this.checkVesprWallet();
        
        // Check Supabase connection
        this.checkSupabaseConnection();
        
        // Check if Authentication UI is visible
        this.checkAuthUI();
        
        // Display all localStorage auth-related items
        this.checkLocalStorage();
        
        // Print summary
        console.log('=== End of Diagnostics ===');
        console.log('If you see any [FAILED] messages above, please address those issues.');
        console.log('For more detailed tests, try the individual methods like AuthDebug.testGuestLogin()');
    },
    
    /**
     * Check for required dependencies
     */
    checkDependencies: function() {
        console.log('Checking dependencies...');
        
        // Check for Supabase client
        if (typeof supabase === 'undefined') {
            console.error('[FAILED] Supabase client not found! Make sure the script is included in your HTML file:');
            console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        } else {
            console.log('[PASSED] Supabase client found');
        }
        
        // Check for Authentication System
        if (typeof AuthenticationSystem === 'undefined') {
            console.error('[FAILED] AuthenticationSystem not found! Make sure authentication.js is included in your HTML file and properly loaded.');
        } else {
            console.log('[PASSED] AuthenticationSystem found');
        }
        
        // Check if Utils exists
        if (typeof Utils === 'undefined') {
            console.error('[FAILED] Utils module not found! The authentication system depends on the Utils module for local storage operations.');
        } else {
            console.log('[PASSED] Utils module found');
            
            // Test Utils functions
            if (!Utils.saveToStorage || !Utils.loadFromStorage) {
                console.error('[FAILED] Utils module is missing required functions saveToStorage and/or loadFromStorage');
            } else {
                console.log('[PASSED] Utils module has required functions');
            }
        }
    },
    
    /**
     * Check for Vespr Wallet extension
     */
    checkVesprWallet: function() {
        console.log('Checking for Vespr wallet...');
        
        if (typeof window.vespr === 'undefined') {
            console.warn('[WARNING] Vespr wallet extension not detected. Wallet authentication will not work.');
            console.warn('Users will need to install the Vespr wallet extension from: https://vespr.xyz');
            
            // Check if the user agent is a compatible browser
            const isChrome = navigator.userAgent.includes('Chrome');
            const isFirefox = navigator.userAgent.includes('Firefox');
            
            if (!isChrome && !isFirefox) {
                console.warn('[WARNING] Current browser may not support the Vespr wallet extension. Chrome or Firefox is recommended.');
            }
            
            console.log('Guest login will still work without the wallet extension.');
        } else {
            console.log('[PASSED] Vespr wallet extension detected');
            
            // Check if vespr has required methods
            const requiredMethods = ['connect', 'getConnectedWallets', 'signMessage', 'disconnect'];
            const missingMethods = requiredMethods.filter(method => typeof window.vespr[method] !== 'function');
            
            if (missingMethods.length > 0) {
                console.error(`[FAILED] Vespr wallet is missing required methods: ${missingMethods.join(', ')}`);
            } else {
                console.log('[PASSED] Vespr wallet has all required methods');
            }
        }
    },
    
    /**
     * Check Supabase connection
     */
    checkSupabaseConnection: async function() {
        console.log('Checking Supabase connection...');
        
        if (typeof supabase === 'undefined') {
            console.error('[FAILED] Cannot check Supabase connection: Supabase client not found');
            return;
        }
        
        // Create a test client
        try {
            const supabaseUrl = AuthenticationSystem.supabaseUrl;
            const supabaseKey = AuthenticationSystem.supabaseKey;
            
            if (!supabaseUrl || !supabaseKey) {
                console.error('[FAILED] Supabase URL or key is missing in AuthenticationSystem');
                return;
            }
            
            const testClient = supabase.createClient(supabaseUrl, supabaseKey);
            
            // Try a simple query to check connection
            const { data, error } = await testClient.from('users').select('count').limit(1);
            
            if (error) {
                console.error('[FAILED] Supabase connection test failed:', error.message);
                
                if (error.message.includes('does not exist')) {
                    console.error('[FAILED] The "users" table does not exist. You need to run AuthSetup.init() to create the required tables.');
                    console.log('Try running in the console: AuthSetup.init()');
                } else if (error.message.includes('authentication')) {
                    console.error('[FAILED] Authentication error with Supabase. Check that your API key is correct.');
                }
            } else {
                console.log('[PASSED] Successfully connected to Supabase');
            }
        } catch (error) {
            console.error('[FAILED] Error testing Supabase connection:', error);
        }
    },
    
    /**
     * Check if the Authentication UI is properly set up
     */
    checkAuthUI: function() {
        console.log('Checking Authentication UI...');
        
        // Check for auth modal
        const authModal = document.getElementById('auth-modal');
        if (!authModal) {
            console.warn('[WARNING] Auth modal not found in the DOM. The login UI may not appear.');
            console.warn('This could be because:');
            console.warn('1. AuthenticationSystem.setupUI() has not been called');
            console.warn('2. AuthenticationSystem.init() has not been called');
            console.warn('3. There was an error during UI setup');
        } else {
            console.log('[PASSED] Auth modal found in the DOM');
            
            // Check for required elements within the modal
            const guestLoginBtn = document.getElementById('guest-login-btn');
            const walletLoginBtn = document.getElementById('wallet-login-btn');
            const loginStatus = document.getElementById('login-status');
            
            if (!guestLoginBtn) {
                console.warn('[WARNING] Guest login button not found');
            }
            
            if (!walletLoginBtn) {
                console.warn('[WARNING] Wallet login button not found');
            }
            
            if (!loginStatus) {
                console.warn('[WARNING] Login status element not found');
            }
            
            // Check CSS
            const authModalStyles = window.getComputedStyle(authModal);
            if (authModalStyles.display === 'none') {
                console.log('Auth modal is currently hidden, which may be correct if a user is already logged in');
                
                // Check for auth info
                const authInfo = document.getElementById('auth-info');
                if (!authInfo) {
                    console.warn('[WARNING] Auth info element not found, but auth modal is hidden');
                    console.warn('This suggests the user might be in an inconsistent authentication state');
                } else {
                    console.log('[PASSED] Auth info element found, user appears to be logged in');
                }
            } else {
                console.log('[PASSED] Auth modal is currently visible');
            }
        }
        
        // Check for auth-ui.css
        const hasAuthUiStyles = Array.from(document.styleSheets).some(sheet => 
            sheet.href && sheet.href.includes('auth-ui.css')
        );
        
        if (!hasAuthUiStyles) {
            console.warn('[WARNING] auth-ui.css stylesheet not detected in document');
            console.warn('The authentication UI may not display correctly without styles.');
        } else {
            console.log('[PASSED] auth-ui.css stylesheet found');
        }
    },
    
    /**
     * Check localStorage for authentication-related items
     */
    checkLocalStorage: function() {
        console.log('Checking localStorage for auth data...');
        
        if (!AuthenticationSystem || !AuthenticationSystem.STORAGE_KEYS) {
            console.error('[FAILED] Cannot check localStorage: AuthenticationSystem or STORAGE_KEYS not defined');
            return;
        }
        
        const keys = AuthenticationSystem.STORAGE_KEYS;
        
        // Check for guest ID
        const guestId = localStorage.getItem(keys.GUEST_ID);
        if (guestId) {
            console.log(`[INFO] Found guest ID in localStorage: ${guestId.substring(0, 8)}...`);
        } else {
            console.log('[INFO] No guest ID found in localStorage');
        }
        
        // Check for auth mode
        const authMode = localStorage.getItem(keys.AUTH_MODE);
        if (authMode) {
            console.log(`[INFO] Auth mode in localStorage: ${authMode}`);
        } else {
            console.log('[INFO] No auth mode found in localStorage');
        }
        
        // Check for wallet address
        const walletAddress = localStorage.getItem(keys.USER_WALLET);
        if (walletAddress) {
            console.log(`[INFO] Found wallet address in localStorage: ${walletAddress.substring(0, 8)}...`);
        } else {
            console.log('[INFO] No wallet address found in localStorage');
        }
        
        // Check for nonce
        const nonce = localStorage.getItem(keys.NONCE);
        if (nonce) {
            console.log('[INFO] Found authentication nonce in localStorage');
        }
        
        // Compare with AuthenticationSystem state
        if (AuthenticationSystem.isAuthenticated) {
            console.log('[INFO] AuthenticationSystem reports user is authenticated');
            console.log(`[INFO] Auth mode according to system: ${AuthenticationSystem.authMode}`);
        } else {
            console.log('[INFO] AuthenticationSystem reports user is NOT authenticated');
        }
        
        // Check for consistency
        if (AuthenticationSystem.authMode !== authMode) {
            console.warn('[WARNING] Auth mode mismatch between localStorage and AuthenticationSystem');
        }
    },
    
    /**
     * Test guest login functionality
     */
    testGuestLogin: async function() {
        console.log('Testing guest login...');
        
        if (!AuthenticationSystem || !AuthenticationSystem.loginAsGuest) {
            console.error('[FAILED] Cannot test guest login: AuthenticationSystem not properly initialized');
            return;
        }
        
        try {
            // First, store the current auth state
            const wasAuthenticated = AuthenticationSystem.isAuthenticated;
            const previousAuthMode = AuthenticationSystem.authMode;
            const previousUser = AuthenticationSystem.currentUser;
            
            // Attempt guest login
            const result = await AuthenticationSystem.loginAsGuest();
            
            if (result) {
                console.log('[PASSED] Guest login successful');
                console.log(`[INFO] Generated guest ID: ${AuthenticationSystem.currentUser?.id}`);
            } else {
                console.error('[FAILED] Guest login failed');
            }
            
            // Check if the UI was updated
            const authModal = document.getElementById('auth-modal');
            if (authModal && window.getComputedStyle(authModal).display === 'none') {
                console.log('[PASSED] Auth modal correctly hidden after login');
            } else {
                console.warn('[WARNING] Auth modal still visible after successful login');
            }
            
            // Check if the auth info is displayed
            const authInfo = document.getElementById('auth-info');
            if (authInfo) {
                console.log('[PASSED] Auth info element correctly displayed after login');
            } else {
                console.warn('[WARNING] Auth info element not found after successful login');
            }
            
            // Check localStorage
            const storedGuestId = localStorage.getItem(AuthenticationSystem.STORAGE_KEYS.GUEST_ID);
            const storedAuthMode = localStorage.getItem(AuthenticationSystem.STORAGE_KEYS.AUTH_MODE);
            
            if (storedGuestId && storedGuestId === AuthenticationSystem.currentUser?.id) {
                console.log('[PASSED] Guest ID correctly stored in localStorage');
            } else {
                console.warn('[WARNING] Guest ID not properly stored in localStorage');
            }
            
            if (storedAuthMode === 'guest') {
                console.log('[PASSED] Auth mode correctly stored as "guest" in localStorage');
            } else {
                console.warn(`[WARNING] Auth mode incorrectly stored as "${storedAuthMode}" in localStorage`);
            }
            
            // Restore previous state if the user was already authenticated
            if (wasAuthenticated) {
                console.log('[INFO] Restoring previous authentication state...');
                AuthenticationSystem.isAuthenticated = wasAuthenticated;
                AuthenticationSystem.authMode = previousAuthMode;
                AuthenticationSystem.currentUser = previousUser;
                AuthenticationSystem.updateAuthUI();
            }
            
            return result;
        } catch (error) {
            console.error('[FAILED] Error during guest login test:', error);
            return false;
        }
    },
    
    /**
     * Fix common issues with the authentication system
     */
    fixCommonIssues: function() {
        console.log('Attempting to fix common authentication issues...');
        
        // Issue 1: Missing UI
        if (!document.getElementById('auth-modal')) {
            console.log('Fixing missing UI elements...');
            if (AuthenticationSystem && AuthenticationSystem.setupUI) {
                AuthenticationSystem.setupUI();
                console.log('UI setup called again. Check if the auth modal appears now.');
            }
        }
        
        // Issue 2: Inconsistent localStorage state
        console.log('Checking localStorage consistency...');
        
        if (AuthenticationSystem && AuthenticationSystem.STORAGE_KEYS) {
            const keys = AuthenticationSystem.STORAGE_KEYS;
            const guestId = localStorage.getItem(keys.GUEST_ID);
            const authMode = localStorage.getItem(keys.AUTH_MODE);
            const walletAddress = localStorage.getItem(keys.USER_WALLET);
            
            let inconsistent = false;
            
            // Check for inconsistencies:
            // 1. Auth mode is wallet but no wallet address
            if (authMode === 'wallet' && !walletAddress) {
                console.log('Found inconsistency: Auth mode is wallet but no wallet address stored');
                inconsistent = true;
            }
            
            // 2. No auth mode but guest ID exists
            if (!authMode && guestId) {
                console.log('Found inconsistency: Guest ID exists but no auth mode set');
                inconsistent = true;
            }
            
            if (inconsistent) {
                console.log('Fixing localStorage inconsistencies...');
                
                if (guestId && (!authMode || (authMode === 'wallet' && !walletAddress))) {
                    // Set mode to guest if we have a guest ID but inconsistent state
                    localStorage.setItem(keys.AUTH_MODE, 'guest');
                    console.log('Set auth mode to "guest" based on existing guest ID');
                } else if (!guestId && !walletAddress) {
                    // No IDs at all, clear auth mode
                    localStorage.removeItem(keys.AUTH_MODE);
                    console.log('Cleared auth mode since no IDs were found');
                }
                
                // Reload the session
                if (AuthenticationSystem.restoreSession) {
                    console.log('Attempting to restore session after fixes...');
                    AuthenticationSystem.restoreSession().then(() => {
                        console.log('Session restored. Check if authentication is working now.');
                    }).catch(error => {
                        console.error('Error restoring session:', error);
                    });
                }
            } else {
                console.log('No localStorage inconsistencies found');
            }
        }
        
        // Issue 3: Check if Supabase client is initialized
        if (AuthenticationSystem && !AuthenticationSystem.supabase) {
            console.log('Supabase client not initialized, attempting to initialize...');
            if (AuthenticationSystem.initSupabase) {
                AuthenticationSystem.initSupabase();
                console.log('Supabase initialization attempted');
            }
        }
        
        console.log('Fix attempts completed. Run AuthDebug.runDiagnostics() to check if issues were resolved.');
    },
    
    /**
     * Reset authentication state (for testing/debugging)
     */
    reset: function() {
        console.log('Resetting authentication state...');
        
        if (!AuthenticationSystem || !AuthenticationSystem.STORAGE_KEYS) {
            console.error('[FAILED] Cannot reset: AuthenticationSystem not properly initialized');
            return;
        }
        
        // Clear localStorage items
        const keys = AuthenticationSystem.STORAGE_KEYS;
        localStorage.removeItem(keys.GUEST_ID);
        localStorage.removeItem(keys.AUTH_MODE);
        localStorage.removeItem(keys.USER_WALLET);
        localStorage.removeItem(keys.NONCE);
        
        // Reset AuthenticationSystem state
        AuthenticationSystem.isAuthenticated = false;
        AuthenticationSystem.currentUser = null;
        AuthenticationSystem.authMode = null;
        
        // Update UI
        if (AuthenticationSystem.updateAuthUI) {
            AuthenticationSystem.updateAuthUI();
        }
        
        console.log('Authentication state reset. You should now see the login screen.');
    }
};

// Automatically run diagnostics when the script is loaded, but only in development/testing
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for everything to initialize first
        setTimeout(() => {
            console.log('Running automatic authentication diagnostics (because you\'re on localhost)...');
            AuthDebug.runDiagnostics();
        }, 1000);
    });
}

// Export for use in other modules or the console
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthDebug;
}
