import { NextRequest, NextResponse } from 'next/server';

// API route to create Nango Connect session - Fixed version
export async function POST(request: NextRequest) {
  console.log('[CONNECT] Starting create-connect-session API call');
  
  try {
    const { integrationId, userId } = await request.json();
    console.log('[CONNECT] Received request for integration:', integrationId, 'user:', userId);

    if (!integrationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: integrationId and userId' },
        { status: 400 }
      );
    }

    const secretKey = process.env.NANGO_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'NANGO_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('[CONNECT] Calling Nango API...');
    
    // Create a Connect session using Nango's REST API
    const response = await fetch('https://api.nango.dev/connect/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        end_user: {
          id: userId,
          email: `user-${userId}@example.com`,
          display_name: `User ${userId}`,
        },
        allowed_integrations: [integrationId],
      }),
    });

    console.log('[CONNECT] Nango API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[CONNECT] Nango API error:', JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to create connect session',
          details: errorData.error?.errors?.[0]?.message || errorData.message || `HTTP ${response.status}`,
          fullError: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[CONNECT] Nango response data:', JSON.stringify(data, null, 2));

    // The Nango API returns the token in data.data.token (nested structure)
    const token = data.data?.token || data.token;
    const connectLink = data.data?.connect_link || data.connect_link;
    
    console.log('[CONNECT] Extracted token:', token ? 'YES' : 'NO');
    console.log('[CONNECT] Extracted connect_link:', connectLink ? 'YES' : 'NO');

    if (!token || typeof token !== 'string') {
      console.error('[CONNECT] No valid token found in response');
      console.error('[CONNECT] Full response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to get connect session token',
          details: 'Token not found in Nango response' 
        },
        { status: 500 }
      );
    }

    console.log('[CONNECT] Successfully created connect session');
    return NextResponse.json({ 
      success: true,
      connectSessionToken: token,
      connectLink: connectLink, // Return the hosted UI link
    });
  } catch (error) {
    console.error('[CONNECT] Connect session creation error:', error);
    
    if (error instanceof Error) {
      console.error('[CONNECT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create connect session',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
