import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug API route to check which integrations are configured in Nango
 * Access at: http://localhost:3000/api/debug/check-integrations
 */
export async function GET(request: NextRequest) {
  const secretKey = process.env.NANGO_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: 'NANGO_SECRET_KEY not configured' },
      { status: 500 }
    );
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  // Test each integration we're trying to use
  const integrations = ['hubspot', 'google-ads', 'shopify'];

  for (const integrationId of integrations) {
    try {
      const response = await fetch('https://api.nango.dev/connect/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          end_user: {
            id: 'test-user',
            email: 'test@example.com',
            display_name: 'Test User',
          },
          allowed_integrations: [integrationId],
        }),
      });

      const result: any = {
        integrationId,
        status: response.status,
        success: response.ok,
      };

      if (response.ok) {
        result.message = '✅ Working - Integration exists';
      } else {
        const errorData = await response.json().catch(() => ({}));
        result.message = '❌ ' + (errorData.error?.errors?.[0]?.message || 'Error');
        result.error = errorData;
      }

      results.tests.push(result);
    } catch (error) {
      results.tests.push({
        integrationId,
        success: false,
        message: '❌ Request failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Try to fetch integrations list from Nango config API
  try {
    const configResponse = await fetch('https://api.nango.dev/config', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (configResponse.ok) {
      const configData = await configResponse.json();
      results.configuredIntegrations = configData.configs?.map((c: any) => 
        c.unique_key || c.provider_config_key || c.id
      ) || [];
    }
  } catch (error) {
    results.configFetchError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

