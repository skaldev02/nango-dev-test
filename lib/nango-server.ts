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
    // List all connections for this integration
    const response = await nango.listConnections({
      provider_config_key: integrationId,
    });
    
    // The response might be an object with a 'connections' property or directly an array
    const connectionsList = Array.isArray(response) 
      ? response 
      : (response as any)?.connections || [];
    
    // Find connection for this specific user
    const userConnection = connectionsList.find(
      (conn: any) => conn.end_user?.id === userId
    );
    
    if (userConnection) {
      return {
        connected: true,
        connectionId: userConnection.connection_id,
        metadata: userConnection,
      };
    }
    
    return {
      connected: false,
    };
  } catch (error) {
    console.error('Connection status check error:', error);
    console.error('Error details:', {
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

