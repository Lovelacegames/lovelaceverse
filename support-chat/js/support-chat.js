/**
 * Support Chat Main Module
 * Entry point for the AI support chat system
 */

// Global objects for use by other scripts
let threeAvatar;
let knowledgeBase;
let aiService;
let messageHandler;
let uiController;
let supportChat;

class SupportChat {
  constructor() {
    // Module instances will be created after their scripts load
    this.threeAvatar = null;
    this.knowledgeBase = null;
    this.aiService = null;
    this.messageHandler = null;
    this.uiController = null;
    
    // Initialization state
    this.isInitialized = false;
    
    // Font loading for cyberpunk style
    this.fontUrl = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap';
  }

  /**
   * Initialize the support chat system
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log('Initializing Shelly AI Support Chat...');
      
      // Load font
      await this.loadFont();
      
      // Load HTML and CSS
      this.injectHtml();
      this.injectCss();
      
      // Wait for DOM to be ready
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          window.addEventListener('load', resolve);
        });
      }
      
      // Create instances
      this.threeAvatar = new ThreeAvatar();
      this.knowledgeBase = new KnowledgeBase();
      this.aiService = new AiService();
      this.messageHandler = new MessageHandler(this.aiService, this.knowledgeBase);
      this.uiController = new UiController();
      
      // Initialize components in sequence
      const uiInitialized = this.uiController.initialize({
        callbacks: {
          onSendMessage: (message) => this.handleUserMessage(message),
          onChatOpened: () => this.handleChatOpened(),
          onChatClosed: () => this.handleChatClosed(),
          onChatToggle: (isOpen) => this.handleChatToggle(isOpen)
        }
      });
      
      if (!uiInitialized) {
        throw new Error('Failed to initialize UI');
      }
      
      // Get canvas elements from UI
      const canvasElements = this.uiController.getCanvasElements();
      
      // Initialize Three.js avatar
      await this.threeAvatar.initialize(
        canvasElements.bubbleCanvas,
        canvasElements.avatarCanvas
      );
      
      // Initialize knowledge base
      const knowledgeBaseInitialized = await this.knowledgeBase.initialize();
      if (!knowledgeBaseInitialized) {
        console.warn('Knowledge base initialization issues - will use fallback responses');
      }
      
      // Initialize AI service
      const aiServiceInitialized = await this.aiService.initialize();
      if (!aiServiceInitialized) {
        console.warn('AI service initialization issues - will use fallback responses');
      }
      
      // Initialize message handler and set callbacks
      await this.messageHandler.initialize();
      this.messageHandler.setCallbacks({
        onTypingStart: () => this.handleTypingStart(),
        onTypingUpdate: (text) => this.handleTypingUpdate(text),
        onResponseComplete: (response) => this.handleResponseComplete(response)
      });
      
      // Display initial messages
      const initialMessages = this.messageHandler.formatMessagesForDisplay();
      this.uiController.displayMessages(initialMessages);
      
      // Scrape game information
      this.scrapeGameInfo();
      
      console.log('Shelly AI Support Chat initialized successfully');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize support chat:', error);
      return false;
    }
  }

  /**
   * Load Orbitron font for cyberpunk style
   */
  async loadFont() {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = this.fontUrl;
      link.onload = () => resolve();
      document.head.appendChild(link);
    });
  }

  /**
   * Inject HTML for the support chat
   */
  injectHtml() {
    // Direct HTML injection
    document.body.insertAdjacentHTML('beforeend', `
      <div id="support-chat-container">
        <div id="support-chat-bubble" class="neon-border">
          <canvas id="shelly-canvas"></canvas>
        </div>
        <div id="support-chat-interface">
          <div id="support-chat-header">
            <div id="support-chat-title">SHELLY AI SUPPORT</div>
            <button id="support-chat-close">×</button>
          </div>
          <div id="support-chat-avatar-container">
            <canvas id="support-chat-avatar-canvas"></canvas>
          </div>
          <div id="support-chat-messages"></div>
          <div id="support-chat-input-container">
            <textarea id="support-chat-input" placeholder="Ask about the game..." rows="1" maxlength="200"></textarea>
            <button id="support-chat-send">Send</button>
          </div>
        </div>
      </div>
    `);
  }

  /**
   * Inject CSS for the support chat
   */
  injectCss() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'support-chat/css/support-chat.css';
    document.head.appendChild(link);
  }

  /**
   * Scrape game information in the background
   */
  async scrapeGameInfo() {
    try {
      console.log('Scraping game information...');
      await this.knowledgeBase.scrapeGameInfo();
      console.log('Game information scraped successfully');
    } catch (error) {
      console.error('Failed to scrape game information:', error);
    }
  }

  /**
   * Handle user message
   * @param {string} message - User's message
   */
  async handleUserMessage(message) {
    // Display user message
    this.uiController.displayMessage({
      content: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    
    // Set avatar to thinking state
    this.threeAvatar.setState('thinking');
    
    // Process the message
    await this.messageHandler.processMessage(message);
  }

  /**
   * Handle typing start
   */
  handleTypingStart() {
    this.uiController.showTypingIndicator();
    this.threeAvatar.setState('thinking');
  }

  /**
   * Handle typing update
   * @param {string} text - Current text being typed
   */
  handleTypingUpdate(text) {
    this.uiController.updateTypingMessage(text);
    this.threeAvatar.setState('talking');
  }

  /**
   * Handle response complete
   * @param {string} response - Final response
   */
  handleResponseComplete(response) {
    this.uiController.finalizeTypingMessage();
    this.threeAvatar.setState('idle');
  }

  /**
   * Handle chat opened event
   */
  handleChatOpened() {
    // Show welcome message if new session
    this.threeAvatar.setState('talking');
    
    // Short delay to return to idle
    setTimeout(() => {
      this.threeAvatar.setState('idle');
    }, 1000);
  }

  /**
   * Handle chat closed event
   */
  handleChatClosed() {
    this.threeAvatar.setState('idle');
  }

  /**
   * Handle chat toggle event
   * @param {boolean} isOpen - Whether the chat is open
   */
  handleChatToggle(isOpen) {
    // Set avatar state based on chat state
    this.threeAvatar.setState(isOpen ? 'talking' : 'idle');
    
    // If opening, show a short animation
    if (isOpen) {
      setTimeout(() => {
        this.threeAvatar.setState('idle');
      }, 1000);
    }
  }
}

// Initialize when all scripts are loaded
window.addEventListener('load', () => {
  // Allow a small delay for all scripts to initialize
  setTimeout(() => {
    supportChat = new SupportChat();
    supportChat.initialize();
  }, 500);
});
