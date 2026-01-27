/**
 * Diagnostic script to check which integrations are configured in Nango
 * Run with: npx tsx scripts/check-integrations.ts
 */

import 'dotenv/config';

const NANGO_SECRET_KEY = process.env.NANGO_SECRET_KEY;

if (!NANGO_SECRET_KEY) {
  console.error('❌ NANGO_SECRET_KEY not found in environment variables');
  process.exit(1);
}

async function checkIntegrations() {
  console.log('🔍 Checking configured integrations in Nango...\n');

  try {
    // Try to fetch integrations from Nango API
    const response = await fetch('https://api.nango.dev/config', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NANGO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch integrations:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('Error details:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    console.log('✅ Successfully connected to Nango API\n');
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    // Try to list integrations
    if (data.configs && Array.isArray(data.configs)) {
      console.log('\n📦 Configured integrations:');
      data.configs.forEach((config: any) => {
        console.log(`  - ${config.unique_key || config.provider_config_key || config.id}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test each integration we're trying to use
  console.log('\n🧪 Testing integration IDs...\n');
  const integrations = ['hubspot', 'google-ads', 'shopify'];

  for (const integrationId of integrations) {
    try {
      console.log(`Testing ${integrationId}...`);
      const response = await fetch('https://api.nango.dev/connect/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NANGO_SECRET_KEY}`,
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

      if (response.ok) {
        console.log(`  ✅ ${integrationId} - Working`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`  ❌ ${integrationId} - Error ${response.status}`);
        if (errorData.error?.errors?.[0]) {
          console.log(`     Message: ${errorData.error.errors[0].message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${integrationId} - Failed:`, error);
    }
  }
}

checkIntegrations();

