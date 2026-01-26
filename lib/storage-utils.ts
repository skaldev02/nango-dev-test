/**
 * Storage utilities for managing authentication tokens and session data
 */

export interface ConnectionData {
  integrationId: string;
  userId: string;
  connectionId: string;
  connectedAt: number;
  expiresAt?: number;
}

export interface SessionData {
  userId: string;
  createdAt: number;
  lastActivity: number;
}

const STORAGE_KEYS = {
  USER_ID: 'nango_user_id',
  SESSION: 'nango_session',
  CONNECTIONS: 'nango_connections',
  TOKENS: 'nango_tokens',
} as const;

// Session expires after 30 days of inactivity
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Storage Manager Class
 */
class StorageManager {
  /**
   * Initialize or get user ID
   */
  getUserId(): string {
    if (typeof window === 'undefined') return 'default-user';
    
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  }

  /**
   * Get or create session
   */
  getSession(): SessionData {
    if (typeof window === 'undefined') {
      return { userId: 'default-user', createdAt: Date.now(), lastActivity: Date.now() };
    }

    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (stored) {
      try {
        const session: SessionData = JSON.parse(stored);
        
        // Check if session expired
        if (Date.now() - session.lastActivity > SESSION_EXPIRY_MS) {
          console.log('[Storage] Session expired, creating new one');
          return this.createNewSession();
        }
        
        // Update last activity
        session.lastActivity = Date.now();
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        return session;
      } catch (error) {
        console.error('[Storage] Failed to parse session:', error);
        return this.createNewSession();
      }
    }
    
    return this.createNewSession();
  }

  /**
   * Create new session
   */
  private createNewSession(): SessionData {
    const session: SessionData = {
      userId: this.getUserId(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  }

  /**
   * Store connection data
   */
  storeConnection(data: ConnectionData): void {
    if (typeof window === 'undefined') return;

    const connections = this.getAllConnections();
    
    // Update or add connection
    const index = connections.findIndex(
      c => c.integrationId === data.integrationId && c.userId === data.userId
    );
    
    if (index >= 0) {
      connections[index] = data;
    } else {
      connections.push(data);
    }
    
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
    console.log('[Storage] Stored connection:', data.integrationId);
  }

  /**
   * Get all stored connections
   */
  getAllConnections(): ConnectionData[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
    if (!stored) return [];
    
    try {
      const connections: ConnectionData[] = JSON.parse(stored);
      
      // Filter out expired connections
      const now = Date.now();
      const valid = connections.filter(c => {
        if (!c.expiresAt) return true;
        return c.expiresAt > now;
      });
      
      // Update storage if any connections were removed
      if (valid.length !== connections.length) {
        localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(valid));
      }
      
      return valid;
    } catch (error) {
      console.error('[Storage] Failed to parse connections:', error);
      return [];
    }
  }

  /**
   * Get connection for specific integration
   */
  getConnection(integrationId: string, userId: string): ConnectionData | null {
    const connections = this.getAllConnections();
    return connections.find(
      c => c.integrationId === integrationId && c.userId === userId
    ) || null;
  }

  /**
   * Check if connection exists and is valid
   */
  hasValidConnection(integrationId: string, userId: string): boolean {
    const connection = this.getConnection(integrationId, userId);
    if (!connection) return false;
    
    // Check expiration
    if (connection.expiresAt && connection.expiresAt < Date.now()) {
      console.log('[Storage] Connection expired:', integrationId);
      this.removeConnection(integrationId, userId);
      return false;
    }
    
    return true;
  }

  /**
   * Remove connection
   */
  removeConnection(integrationId: string, userId: string): void {
    if (typeof window === 'undefined') return;

    const connections = this.getAllConnections();
    const filtered = connections.filter(
      c => !(c.integrationId === integrationId && c.userId === userId)
    );
    
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(filtered));
    console.log('[Storage] Removed connection:', integrationId);
  }

  /**
   * Store authentication token
   */
  storeToken(integrationId: string, token: string, expiresIn?: number): void {
    if (typeof window === 'undefined') return;

    const tokens = this.getAllTokens();
    
    tokens[integrationId] = {
      token,
      storedAt: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
    };
    
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    console.log('[Storage] Stored token for:', integrationId);
  }

  /**
   * Get token for integration
   */
  getToken(integrationId: string): string | null {
    if (typeof window === 'undefined') return null;

    const tokens = this.getAllTokens();
    const tokenData = tokens[integrationId];
    
    if (!tokenData) return null;
    
    // Check if expired
    if (tokenData.expiresAt && tokenData.expiresAt < Date.now()) {
      console.log('[Storage] Token expired:', integrationId);
      this.removeToken(integrationId);
      return null;
    }
    
    return tokenData.token;
  }

  /**
   * Get all tokens
   */
  private getAllTokens(): Record<string, { token: string; storedAt: number; expiresAt?: number }> {
    if (typeof window === 'undefined') return {};

    const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!stored) return {};
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Storage] Failed to parse tokens:', error);
      return {};
    }
  }

  /**
   * Remove token
   */
  removeToken(integrationId: string): void {
    if (typeof window === 'undefined') return;

    const tokens = this.getAllTokens();
    delete tokens[integrationId];
    
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    console.log('[Storage] Removed token for:', integrationId);
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.CONNECTIONS);
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
    console.log('[Storage] Cleared all data');
  }

  /**
   * Clear all data for a specific integration
   */
  clearIntegration(integrationId: string, userId: string): void {
    this.removeConnection(integrationId, userId);
    this.removeToken(integrationId);
    console.log('[Storage] Cleared integration data:', integrationId);
  }

  /**
   * Get storage stats (for debugging)
   */
  getStats(): {
    userId: string;
    sessionAge: number;
    connectionsCount: number;
    tokensCount: number;
  } {
    const session = this.getSession();
    const connections = this.getAllConnections();
    const tokens = this.getAllTokens();
    
    return {
      userId: session.userId,
      sessionAge: Date.now() - session.createdAt,
      connectionsCount: connections.length,
      tokensCount: Object.keys(tokens).length,
    };
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Export utilities
export const StorageUtils = {
  getUserId: () => storage.getUserId(),
  getSession: () => storage.getSession(),
  storeConnection: (data: ConnectionData) => storage.storeConnection(data),
  getConnection: (integrationId: string, userId: string) => storage.getConnection(integrationId, userId),
  hasValidConnection: (integrationId: string, userId: string) => storage.hasValidConnection(integrationId, userId),
  removeConnection: (integrationId: string, userId: string) => storage.removeConnection(integrationId, userId),
  storeToken: (integrationId: string, token: string, expiresIn?: number) => storage.storeToken(integrationId, token, expiresIn),
  getToken: (integrationId: string) => storage.getToken(integrationId),
  clearIntegration: (integrationId: string, userId: string) => storage.clearIntegration(integrationId, userId),
  clearAll: () => storage.clearAll(),
  getStats: () => storage.getStats(),
};

