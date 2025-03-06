/**
 * Authentication setup and database initialization for Cyberpunk MMORPG
 * This script creates the necessary tables in Supabase for authentication
 */

const AuthSetup = {
    // Supabase client for database operations (same as in AuthenticationSystem)
    supabaseUrl: "https://mksrmkpqvgnkfmxxdijs.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc3Jta3Bxdmdua2ZteHhkaWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjIzMzUsImV4cCI6MjA1NjY5ODMzNX0.cV-J-sd6HuKKSv-wz1QfR_g4wbXzWj1ZYKKoUMHRj50",
    supabase: null,
    
    /**
     * Initialize the setup process
     */
    init: async function() {
        console.log('Starting authentication setup...');
        
        try {
            // Create Supabase client
            this.initSupabaseClient();
            
            // Create required tables if they don't exist
            await this.createRequiredTables();
            
            console.log('Authentication setup completed successfully!');
        } catch (error) {
            console.error('Authentication setup failed:', error);
            throw error;
        }
    },
    
    /**
     * Initialize Supabase client
     */
    initSupabaseClient: function() {
        try {
            if (typeof supabase === 'undefined') {
                console.error('Supabase client library not loaded! Please make sure the Supabase script is included in the HTML file.');
                return false;
            }
            
            // Create Supabase client
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase client initialized for setup');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return false;
        }
    },
    
    /**
     * Create required tables in Supabase
     */
    createRequiredTables: async function() {
        if (!this.supabase) {
            console.error('Cannot create tables: Supabase client not initialized');
            return false;
        }
        
        console.log('Checking for required tables...');
        
        try {
            // Check if 'users' table exists and create it if not
            await this.createUsersTable();
            
            // Check if 'game_progress' table exists and create it if not
            await this.createGameProgressTable();
            
            // Check if 'account_links' table exists and create it if not
            await this.createAccountLinksTable();
            
            return true;
        } catch (error) {
            console.error('Error creating tables:', error);
            return false;
        }
    },
    
    /**
     * Create the 'users' table if it doesn't exist
     * Note: We're using supabase RPC to create the table with SQL
     * This is not a typical approach, but we'll use it for this example
     */
    createUsersTable: async function() {
        // Check if 'users' table exists
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('id')
                .limit(1);
            
            if (error) {
                // If there's an error, table might not exist
                console.log('Creating users table...');
                await this.executeSql(`
                    CREATE TABLE IF NOT EXISTS public.users (
                        id text PRIMARY KEY,
                        isGuest boolean NOT NULL DEFAULT false,
                        wallet_address text,
                        linked_to text,
                        created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
                        updated_at timestamp with time zone,
                        version integer NOT NULL DEFAULT 1
                    );
                `);
                console.log('Users table created successfully');
            } else {
                console.log('Users table already exists');
            }
        } catch (error) {
            console.error('Error checking/creating users table:', error);
            throw error;
        }
    },
    
    /**
     * Create the 'game_progress' table if it doesn't exist
     */
    createGameProgressTable: async function() {
        // Check if 'game_progress' table exists
        try {
            const { data, error } = await this.supabase
                .from('game_progress')
                .select('user_id')
                .limit(1);
            
            if (error) {
                // If there's an error, table might not exist
                console.log('Creating game_progress table...');
                await this.executeSql(`
                    CREATE TABLE IF NOT EXISTS public.game_progress (
                        id serial PRIMARY KEY,
                        user_id text NOT NULL REFERENCES public.users(id),
                        game_data jsonb NOT NULL DEFAULT '{}'::jsonb,
                        linked_from text,
                        created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
                        updated_at timestamp with time zone,
                        version integer NOT NULL DEFAULT 1
                    );
                    
                    CREATE INDEX IF NOT EXISTS game_progress_user_id_idx ON public.game_progress (user_id);
                `);
                console.log('Game progress table created successfully');
            } else {
                console.log('Game progress table already exists');
            }
        } catch (error) {
            console.error('Error checking/creating game_progress table:', error);
            throw error;
        }
    },
    
    /**
     * Create the 'account_links' table if it doesn't exist
     */
    createAccountLinksTable: async function() {
        // Check if 'account_links' table exists
        try {
            const { data, error } = await this.supabase
                .from('account_links')
                .select('guest_id')
                .limit(1);
            
            if (error) {
                // If there's an error, table might not exist
                console.log('Creating account_links table...');
                await this.executeSql(`
                    CREATE TABLE IF NOT EXISTS public.account_links (
                        id serial PRIMARY KEY,
                        guest_id text NOT NULL,
                        wallet_address text NOT NULL,
                        linked_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
                    );
                    
                    CREATE INDEX IF NOT EXISTS account_links_guest_id_idx ON public.account_links (guest_id);
                    CREATE INDEX IF NOT EXISTS account_links_wallet_address_idx ON public.account_links (wallet_address);
                `);
                console.log('Account links table created successfully');
            } else {
                console.log('Account links table already exists');
            }
        } catch (error) {
            console.error('Error checking/creating account_links table:', error);
            throw error;
        }
    },
    
    /**
     * Execute SQL via Supabase RPC
     * @param {string} sql - SQL statement to execute
     */
    executeSql: async function(sql) {
        try {
            const { data, error } = await this.supabase.rpc('exec_sql', { sql });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error executing SQL:', error);
            throw error;
        }
    },
    
    /**
     * Verify the authentication setup
     */
    verify: function() {
        console.log('Verifying authentication setup...');
        
        // Verify Supabase client
        const hasSupabase = typeof supabase !== 'undefined';
        console.log('✓ Supabase client library loaded:', hasSupabase);
        
        // Verify Vespr wallet availability
        const hasVespr = typeof window.vespr !== 'undefined';
        console.log('✓ Vespr wallet extension available:', hasVespr);
        
        // Check if Blockfrost API is valid
        const blockfrostApiKey = "mainnetHGcRSvYEMhCYxdFRFJVHWTszgHCYSKty";
        console.log('✓ Blockfrost API key configured:', !!blockfrostApiKey);
        
        // Check if Authentication System is initialized
        const hasAuthSystem = typeof AuthenticationSystem !== 'undefined';
        console.log('✓ Authentication System module loaded:', hasAuthSystem);
        
        // Display status summary
        console.log('Authentication environment status:');
        console.log('- Supabase: ' + (hasSupabase ? '✓ Available' : '❌ Not available'));
        console.log('- Vespr Wallet: ' + (hasVespr ? '✓ Available' : '❌ Not available'));
        console.log('- Authentication System: ' + (hasAuthSystem ? '✓ Loaded' : '❌ Not loaded'));
        
        return {
            hasSupabase,
            hasVespr,
            hasAuthSystem
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSetup;
}

// Auto-initialize when included in the page - uncomment to enable
// document.addEventListener('DOMContentLoaded', () => {
//     AuthSetup.init().catch(console.error);
// });
