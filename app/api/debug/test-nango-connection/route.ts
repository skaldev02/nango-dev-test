import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to diagnose Nango API connectivity
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  // Test 1: Environment variable
  const secretKey = process.env.NANGO_SECRET_KEY;
  results.tests.push({
    name: 'Environment Variable',
    status: secretKey ? 'PASS' : 'FAIL',
    details: secretKey ? 'NANGO_SECRET_KEY is set' : 'NANGO_SECRET_KEY is missing',
  });

  if (!secretKey) {
    return NextResponse.json(results);
  }

  // Test 2: Basic connectivity to Nango API
  console.log('[DIAG] Testing connection to api.nango.dev...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const startTime = Date.now();
    const response = await fetch('https://api.nango.dev/connection', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    results.tests.push({
      name: 'Nango API Connectivity',
      status: 'PASS',
      details: `Connected successfully in ${duration}ms`,
      responseStatus: response.status,
      responseOk: response.ok,
    });

    if (response.ok) {
      const data = await response.json();
      results.tests.push({
        name: 'Nango API Response',
        status: 'PASS',
        details: `Retrieved ${data.connections?.length || 0} connections`,
        connections: data.connections?.map((c: any) => ({
          provider: c.provider_config_key,
          userId: c.end_user?.id,
          connectionId: c.connection_id,
        })) || [],
      });
    } else {
      results.tests.push({
        name: 'Nango API Response',
        status: 'FAIL',
        details: `HTTP ${response.status}: ${await response.text()}`,
      });
    }
  } catch (error) {
    const duration = Date.now();
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        results.tests.push({
          name: 'Nango API Connectivity',
          status: 'FAIL',
          details: 'Request timed out after 30 seconds',
          error: 'TIMEOUT',
          suggestions: [
            'Check internet connection',
            'Try disabling VPN/proxy',
            'Check if api.nango.dev is accessible from your network',
            'Check firewall settings',
          ],
        });
      } else if (error.message.includes('fetch failed')) {
        results.tests.push({
          name: 'Nango API Connectivity',
          status: 'FAIL',
          details: 'Network request failed',
          error: error.message,
          suggestions: [
            'Check internet connection',
            'Verify DNS resolution for api.nango.dev',
            'Try: ping api.nango.dev',
            'Try: curl https://api.nango.dev',
            'Check if corporate firewall is blocking the request',
            'Try disabling VPN/proxy',
          ],
        });
      } else {
        results.tests.push({
          name: 'Nango API Connectivity',
          status: 'FAIL',
          details: error.message,
          error: error.toString(),
        });
      }
    }
  }

  // Test 3: DNS resolution (informational)
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4('api.nango.dev');
    results.tests.push({
      name: 'DNS Resolution',
      status: 'PASS',
      details: `api.nango.dev resolves to ${addresses.join(', ')}`,
    });
  } catch (error) {
    results.tests.push({
      name: 'DNS Resolution',
      status: 'FAIL',
      details: 'Cannot resolve api.nango.dev',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return NextResponse.json(results, { 
    status: results.tests.some((t: any) => t.status === 'FAIL') ? 500 : 200 
  });
}

