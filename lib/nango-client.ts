import Nango from '@nangohq/frontend';
import { storage } from './storage-utils';

export interface AuthResult {
  success: boolean;
  connectionId?: string;
  error?: string;
}

/**
 * Authenticate an integration using Connect session
 * @param integrationId - The integration to authenticate
 * @param userId - The user ID to associate with the connection
 */
export const authenticateIntegration = async (
  integrationId: string,
  userId: string
): Promise<AuthResult> => {
  try {
    console.log('[Nango] Starting authentication for:', integrationId, 'userId:', userId);
    
    // Step 1: Get a Connect session token from the backend
    const sessionResponse = await fetch('/api/nango/create-connect-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integrationId, userId }),
    });
    
    const sessionData = await sessionResponse.json();
    console.log('[Nango] Session response:', sessionData);
    
    if (!sessionData.success || !sessionData.connectLink) {
      console.error('[Nango] Failed to get connect link:', sessionData);
      return {
        success: false,
        error: sessionData.error || 'Failed to create connect session',
      };
    }
    
    // Step 2: Open the Connect UI in a centered popup window
    console.log('[Nango] Opening Connect UI at:', sessionData.connectLink);
    
    // Calculate center position for popup
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open as a proper popup window (not a tab)
    const popup = window.open(
      sessionData.connectLink,
      'nango-connect',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      console.error('[Nango] Popup blocked');
      return {
        success: false,
        error: 'Popup was blocked. Please allow popups for this site.',
      };
    }
    
    // Focus the popup window
    popup.focus();
    
    // Step 3: Wait for the OAuth flow to complete
    // Aggressively detect success and auto-close popup
    return new Promise((resolve) => {
      let hasResolved = false;
      let successDetectedAt: number | null = null;
      
      const checkInterval = setInterval(async () => {
        // Check if popup is closed
        if (popup.closed) {
          if (hasResolved) return;
          hasResolved = true;
          clearInterval(checkInterval);
          console.log('[Nango] Popup closed - verifying connection with retries...');
          
          // Give Nango time to finalize the connection, then retry multiple times
          // This handles the case where user closes popup manually before our check detects success
          let connected = false;
          const maxRetries = 5;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`[Nango] Connection check attempt ${attempt}/${maxRetries}...`);
            
            // Wait progressively longer between attempts (1s, 2s, 2s, 3s, 3s)
            const delayMs = Math.min(1000 * attempt, 3000);
            await new Promise(r => setTimeout(r, delayMs));
            
            connected = await checkConnection(integrationId, userId);
            if (connected) {
              console.log(`[Nango] Connection verified on attempt ${attempt}!`);
              break;
            }
          }
          
          if (connected) {
            console.log('[Nango] Connection successful!');
            
            // Store connection in localStorage
            storage.storeConnection({
              integrationId,
              userId,
              connectionId: userId,
              connectedAt: Date.now(),
            });
            
            resolve({
              success: true,
              connectionId: userId,
            });
          } else {
            console.log('[Nango] Connection not found after retries');
            resolve({
              success: false,
              error: 'Connection was not established. Please try again or check your authorization.',
            });
          }
          return;
        }
        
        // Try to check connection status even while popup is open
        // This helps detect successful auth faster and enables auto-close
        try {
          console.log('[Nango] Polling connection check...');
          const connected = await checkConnection(integrationId, userId);
          console.log('[Nango] Connection check result:', connected);
          
          if (connected && !hasResolved) {
            
            // Mark success detected for the first time
            if (!successDetectedAt) {
              successDetectedAt = Date.now();
              console.log('[Nango] ✅ Connection detected as successful! Will auto-close popup in 2 seconds...');
            }
            
            // Auto-close popup after 2 seconds (let user see success message briefly)
            const timeSinceSuccess = Date.now() - successDetectedAt;
            console.log('[Nango] Time since success:', timeSinceSuccess, 'ms');
            
            if (timeSinceSuccess >= 2000) {
              hasResolved = true;
              clearInterval(checkInterval);
              console.log('[Nango] Auto-closing popup after success confirmation');
              
              // Store connection in localStorage
              storage.storeConnection({
                integrationId,
                userId,
                connectionId: userId,
                connectedAt: Date.now(),
              });
              
              // Close the popup
              try {
                popup.close();
                console.log('[Nango] Popup closed successfully');
              } catch (e) {
                console.log('[Nango] Could not close popup:', e);
              }
              
              resolve({
                success: true,
                connectionId: userId,
              });
            }
          }
        } catch (e) {
          // Ignore errors during polling
          console.log('[Nango] Polling check error (ignored):', e);
        }
      }, 1000); // Check every second
      
      // Timeout after 5 minutes
      setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          clearInterval(checkInterval);
          if (!popup.closed) {
            popup.close();
          }
          resolve({
            success: false,
            error: 'Authentication timeout',
          });
        }
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('[Nango] Authentication error:', error);
    if (error instanceof Error) {
      console.error('[Nango] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check if a connection exists for an integration
 * @param integrationId - The integration to check
 * @param userId - The user ID associated with the connection
 */
export const checkConnection = async (
  integrationId: string,
  userId: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/nango/check-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integrationId, userId }),
    });
    
    const data = await response.json();
    return data.connected || false;
  } catch (error) {
    console.error('Connection check error:', error);
    return false;
  }
};

