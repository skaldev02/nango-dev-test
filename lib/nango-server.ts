import { Nango } from '@nangohq/node';

const nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY || '' });

export default nango;

export interface ConnectionStatus {
  connected: boolean;
  connectionId?: string;
  metadata?: any;
}

/**
 * Check connection status by user ID
 * With the new Connect session flow, we need to find connections by end_user.id
 */
export const checkConnectionStatus = async (
  integrationId: string,
  userId: string
): Promise<ConnectionStatus> => {
  try {
    console.log(`[CHECK-CONNECTION] Checking connection for integration: ${integrationId}, userId: ${userId}`);
    
    const secretKey = process.env.NANGO_SECRET_KEY;
    if (!secretKey) {
      console.error('[CHECK-CONNECTION] No NANGO_SECRET_KEY found');
      return { connected: false };
    }
    
    // Use REST API to list connections (SDK method returns empty)
    // Nango REST API: GET all connections, then filter by provider
    console.log(`[CHECK-CONNECTION] Calling Nango REST API: GET /connection`);
    
    // Create AbortController with 30 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`https://api.nango.dev/connection`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      clearTimeout(timeoutId);
    
    console.log(`[CHECK-CONNECTION] REST API response status:`, response.status);
    
    if (!response.ok) {
      console.error(`[CHECK-CONNECTION] REST API error: ${response.status}`);
      const errorText = await response.text();
      console.error(`[CHECK-CONNECTION] Error response:`, errorText);
      return { connected: false };
    }
    
    const data = await response.json();
    console.log(`[CHECK-CONNECTION] Full REST API response:`, JSON.stringify(data, null, 2));
    
    // Extract connections array and filter by provider
    const allConnections = data.connections || [];
    const connectionsList = allConnections.filter(
      (conn: any) => conn.provider_config_key === integrationId
    );
    
    console.log(`[CHECK-CONNECTION] Total connections:`, allConnections.length);
    console.log(`[CHECK-CONNECTION] Connections for ${integrationId}:`, connectionsList.length);
    
    if (connectionsList.length > 0) {
      console.log(`[CHECK-CONNECTION] First connection structure:`, JSON.stringify(connectionsList[0], null, 2));
      console.log(`[CHECK-CONNECTION] Looking for userId:`, userId);
      
      // Log all end_user IDs
      connectionsList.forEach((conn: any, idx: number) => {
        console.log(`[CHECK-CONNECTION] Connection ${idx}:`, {
          end_user_id: conn.end_user?.id,
          end_user_email: conn.end_user?.email,
          end_user_display_name: conn.end_user?.display_name,
          connection_id: conn.connection_id,
        });
      });
    }
    
    // Find connection for this specific user
    const userConnection = connectionsList.find(
      (conn: any) => conn.end_user?.id === userId
    );
    
    if (userConnection) {
      console.log(`[CHECK-CONNECTION] ✅ Found connection! connectionId: ${userConnection.connection_id}`);
      return {
        connected: true,
        connectionId: userConnection.connection_id,
        metadata: userConnection,
      };
    }
    
    console.log(`[CHECK-CONNECTION] ❌ No connection found for userId: ${userId}`);
    return {
      connected: false,
    };
  } catch (fetchError) {
    clearTimeout(timeoutId);
    
    // Handle specific timeout/network errors
    if (fetchError instanceof Error) {
      if (fetchError.name === 'AbortError') {
        console.error('[CHECK-CONNECTION] Request timed out after 30 seconds');
        console.error('[CHECK-CONNECTION] This might indicate network issues or Nango API being slow');
      } else if (fetchError.message.includes('fetch failed')) {
        console.error('[CHECK-CONNECTION] Network request failed - possible causes:');
        console.error('[CHECK-CONNECTION] 1. No internet connection');
        console.error('[CHECK-CONNECTION] 2. Firewall blocking api.nango.dev');
        console.error('[CHECK-CONNECTION] 3. VPN/proxy issues');
        console.error('[CHECK-CONNECTION] 4. DNS resolution problems');
      }
    }
    throw fetchError;
  }
  } catch (error) {
    console.error('[CHECK-CONNECTION] Connection status check error:', error);
    console.error('[CHECK-CONNECTION] Error details:', {
      integrationId,
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return {
      connected: false,
    };
  }
};

/**
 * Get connection ID for a user
 */
export const getConnectionIdForUser = async (
  integrationId: string,
  userId: string
): Promise<string | null> => {
  try {
    const status = await checkConnectionStatus(integrationId, userId);
    return status.connectionId || null;
  } catch (error) {
    console.error('Get connection ID error:', error);
    return null;
  }
};

