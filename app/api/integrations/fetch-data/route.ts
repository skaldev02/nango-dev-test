import { NextRequest, NextResponse } from 'next/server';
import nango from '@/lib/nango-server';
import { getConnectionIdForUser } from '@/lib/nango-server';

export async function POST(request: NextRequest) {
  try {
    const { integrationId, userId } = await request.json();

    console.log('\n========== FETCH DATA REQUEST ==========');
    console.log('[FETCH-DATA] Request received');
    console.log('[FETCH-DATA] Integration ID:', integrationId);
    console.log('[FETCH-DATA] User ID:', userId);
    console.log('=========================================\n');

    if (!integrationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: integrationId and userId' },
        { status: 400 }
      );
    }

    // Get the actual connection ID for this user
    console.log('[FETCH-DATA] Looking up connection...');
    const connectionId = await getConnectionIdForUser(integrationId, userId);
    
    if (!connectionId) {
      console.error('[FETCH-DATA] ❌ No connection found!');
      console.error('[FETCH-DATA] Searched for integrationId:', integrationId);
      console.error('[FETCH-DATA] Searched for userId:', userId);
      return NextResponse.json(
        { error: 'No connection found for this user. Please connect first.' },
        { status: 404 }
      );
    }

    console.log('[FETCH-DATA] ✅ Connection found!');
    console.log('[FETCH-DATA] Connection ID:', connectionId);

    let data: any = {};

    // Fetch data based on integration type
    // Handle both exact matches and IDs with suffixes (e.g., google-ads-9fyg)
    console.log('[FETCH-DATA] Original integrationId:', integrationId);
    console.log('[FETCH-DATA] Connection ID:', connectionId);
    
    // Determine which integration this is
    let integrationType: string;
    if (integrationId === 'hubspot' || integrationId.startsWith('hubspot-')) {
      integrationType = 'hubspot';
    } else if (integrationId === 'google-ads' || integrationId.startsWith('google-ads-')) {
      integrationType = 'google-ads';
    } else if (integrationId === 'shopify' || integrationId.startsWith('shopify-')) {
      integrationType = 'shopify';
    } else {
      console.error('[FETCH-DATA] Unknown integration:', integrationId);
      console.error('[FETCH-DATA] Available integrations: hubspot, google-ads, shopify');
      return NextResponse.json(
        { 
          error: 'Unknown integration',
          details: `Integration "${integrationId}" is not supported`,
          supportedIntegrations: ['hubspot', 'google-ads', 'shopify']
        },
        { status: 400 }
      );
    }
    
    console.log('[FETCH-DATA] Detected integration type:', integrationType);
    
    switch (integrationType) {
      case 'hubspot':
        data = await fetchHubSpotData(connectionId);
        break;
      case 'google-ads':
        data = await fetchGoogleAdsData(connectionId, integrationId);
        break;
      case 'shopify':
        data = await fetchShopifyData(connectionId);
        break;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchHubSpotData(connectionId: string) {
  try {
    console.log('[HubSpot] Fetching data for connection:', connectionId);

    // Fetch contacts with properties
    const contacts = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/contacts',
      method: 'GET',
      params: { 
        limit: '20',
        properties: 'firstname,lastname,email,phone,company,jobtitle'
      }
    });
    console.log('[HubSpot] Contacts fetched:', contacts.data?.results?.length || 0);

    // Fetch deals with properties
    const deals = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/deals',
      method: 'GET',
      params: { 
        limit: '20',
        properties: 'dealname,amount,dealstage,closedate,pipeline'
      }
    });
    console.log('[HubSpot] Deals fetched:', deals.data?.results?.length || 0);

    // Fetch companies with properties
    const companies = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/companies',
      method: 'GET',
      params: { 
        limit: '20',
        properties: 'name,domain,industry,city,state,country,phone,numberofemployees'
      }
    });
    console.log('[HubSpot] Companies fetched:', companies.data?.results?.length || 0);

    // Fetch activities (calls)
    let activities: any[] = [];
    try {
      const calls = await nango.proxy({
        providerConfigKey: 'hubspot',
        connectionId,
        endpoint: '/crm/v3/objects/calls',
        method: 'GET',
        params: { 
          limit: '10',
          properties: 'hs_call_title,hs_call_status,hs_call_duration,hs_timestamp'
        }
      });
      activities = calls.data?.results || [];
      console.log('[HubSpot] Activities fetched:', activities.length);
    } catch (activityError) {
      console.warn('[HubSpot] Could not fetch activities (may not have permissions):', activityError);
      // Don't fail the entire request if activities fail
    }

    const contactsList = contacts.data?.results || [];
    const dealsList = deals.data?.results || [];
    const companiesList = companies.data?.results || [];

    console.log('[HubSpot] Data fetch complete:', {
      contacts: contactsList.length,
      deals: dealsList.length,
      companies: companiesList.length,
      activities: activities.length
    });

    return {
      contacts: contactsList,
      deals: dealsList,
      companies: companiesList,
      activities: activities,
      totalContacts: contactsList.length,
      totalDeals: dealsList.length,
      totalCompanies: companiesList.length,
      totalActivities: activities.length,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[HubSpot] Fetch error:', error);
    if (error instanceof Error) {
      console.error('[HubSpot] Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

async function fetchGoogleAdsData(connectionId: string, providerConfigKey: string) {
  try {
    console.log('\n========== GOOGLE ADS DATA FETCH ==========');
    console.log('[GoogleAds] Fetching data for connection:', connectionId);
    console.log('[GoogleAds] Using provider config key:', providerConfigKey);
    console.log('==========================================\n');

    // Google Ads API versions are periodically sunset. Keep this configurable so we can
    // bump versions without touching code (defaults to the current REST reference).
    const GOOGLE_ADS_API_VERSION = process.env.GOOGLE_ADS_API_VERSION || 'v20';
    console.log('[GoogleAds] Using API version:', GOOGLE_ADS_API_VERSION);

    // Check for developer token
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      throw new Error(
        'GOOGLE_ADS_DEVELOPER_TOKEN is not set in environment variables. ' +
        'Please add it to your .env.local file.'
      );
    }
    console.log('[GoogleAds] Developer token found:', developerToken.substring(0, 10) + '...');

    // Optional but often required when the authenticated Google account is under a manager (MCC).
    // If set, pass it through as the Google Ads "login-customer-id" header (digits only; no dashes).
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
    if (loginCustomerId) {
      console.log('[GoogleAds] Using login customer id (MCC):', loginCustomerId);
    }

    const googleAdsHeaders: Record<string, string> = {
      'developer-token': developerToken,
      ...(loginCustomerId ? { 'login-customer-id': loginCustomerId } : {}),
    };

    const proxyGoogleAds = (options: {
      endpoint: string;
      method: 'GET' | 'POST';
      data?: any;
      params?: Record<string, string>;
    }) =>
      nango.proxy({
        providerConfigKey,
        connectionId,
        baseUrlOverride: 'https://googleads.googleapis.com',
        headers: googleAdsHeaders,
        ...options,
      });

    // First, get the customer/account ID
    // Google Ads requires a customer ID for most operations
    console.log('[GoogleAds] Step 1: Fetching accessible customers...');
    
    // Use Nango proxy with developer token header and base URL override
    // Google Ads API requires the developer-token header and base URL
    const customersResponse = await proxyGoogleAds({
      endpoint: `/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      method: 'GET',
    });
    console.log('[GoogleAds] Customers API response status:', customersResponse.status);
    console.log('[GoogleAds] Accessible customers response:', JSON.stringify(customersResponse.data, null, 2));

    const customerIds = customersResponse.data?.resourceNames || [];
    console.log('[GoogleAds] Customer IDs found:', customerIds.length);

    if (customerIds.length === 0) {
      console.warn('[GoogleAds] No accessible customers found');
      return {
        campaigns: [],
        adGroups: [],
        keywords: [],
        totalCampaigns: 0,
        totalAdGroups: 0,
        totalKeywords: 0,
        fetchedAt: new Date().toISOString(),
      };
    }

    // Extract numeric customer IDs from resource names.
    // Format: "customers/1234567890"
    const candidateCustomerIds = customerIds
      .map((r: string) => r?.split('/')?.[1])
      .filter(Boolean);
    console.log('[GoogleAds] Candidate customer IDs:', candidateCustomerIds);

    const campaignsQuery = `
          SELECT 
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr
          FROM campaign 
          WHERE segments.date DURING LAST_30_DAYS
          ORDER BY metrics.impressions DESC
          LIMIT 20
        `.trim();

    // Try customer IDs until we find one we can query (403s are common with MCC / permissions).
    let customerId: string | null = null;
    let campaignsResponse: any = null;
    for (const candidate of candidateCustomerIds) {
      try {
        console.log('[GoogleAds] Trying customer ID:', candidate);
        campaignsResponse = await proxyGoogleAds({
          endpoint: `/${GOOGLE_ADS_API_VERSION}/customers/${candidate}/googleAds:searchStream`,
          method: 'POST',
          data: { query: campaignsQuery },
        });
        customerId = candidate;
        break;
      } catch (candidateError: any) {
        const status = candidateError?.response?.status ?? candidateError?.status;
        const data = candidateError?.response?.data;
        console.warn('[GoogleAds] Could not query campaigns for customer ID:', candidate, {
          status,
          data,
        });
      }
    }

    if (!customerId || !campaignsResponse) {
      throw new Error(
        '403 fetching campaigns for accessible customers. ' +
          'If your Google Ads account is under a manager (MCC), set GOOGLE_ADS_LOGIN_CUSTOMER_ID in .env.local ' +
          '(digits only; no dashes), then restart the dev server.'
      );
    }

    console.log('[GoogleAds] Using customer ID:', customerId);
    console.log('[GoogleAds] Campaigns response status:', campaignsResponse.status);

    // Extract campaigns from the response
    const campaignsList = campaignsResponse.data?.results || campaignsResponse.data || [];
    console.log('[GoogleAds] Campaigns fetched:', campaignsList.length);

    // Fetch ad groups for the first campaign (if available)
    let adGroupsList: any[] = [];
    if (campaignsList.length > 0) {
      try {
        const adGroupsResponse = await proxyGoogleAds({
          endpoint: `/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`,
          method: 'POST',
          data: {
            query: `
              SELECT 
                ad_group.id,
                ad_group.name,
                ad_group.status,
                campaign.id,
                campaign.name,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros
              FROM ad_group 
              WHERE segments.date DURING LAST_30_DAYS
              ORDER BY metrics.impressions DESC
              LIMIT 20
            `.trim()
          },
        });
        adGroupsList = adGroupsResponse.data?.results || adGroupsResponse.data || [];
        console.log('[GoogleAds] Ad groups fetched:', adGroupsList.length);
      } catch (adGroupError) {
        console.warn('[GoogleAds] Could not fetch ad groups:', adGroupError);
      }
    }

    // Fetch keywords (optional)
    let keywordsList: any[] = [];
    try {
      const keywordsResponse = await proxyGoogleAds({
        endpoint: `/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`,
        method: 'POST',
        data: {
          query: `
            SELECT 
              ad_group_criterion.keyword.text,
              ad_group_criterion.keyword.match_type,
              ad_group.id,
              ad_group.name,
              campaign.name,
              metrics.impressions,
              metrics.clicks,
              metrics.cost_micros
            FROM keyword_view 
            WHERE segments.date DURING LAST_30_DAYS
            AND ad_group_criterion.status = 'ENABLED'
            ORDER BY metrics.impressions DESC
            LIMIT 20
          `.trim()
        },
      });
      keywordsList = keywordsResponse.data?.results || keywordsResponse.data || [];
      console.log('[GoogleAds] Keywords fetched:', keywordsList.length);
    } catch (keywordError) {
      console.warn('[GoogleAds] Could not fetch keywords:', keywordError);
    }

    console.log('[GoogleAds] Data fetch complete:', {
      campaigns: campaignsList.length,
      adGroups: adGroupsList.length,
      keywords: keywordsList.length,
    });

    return {
      campaigns: campaignsList,
      adGroups: adGroupsList,
      keywords: keywordsList,
      customerId: customerId,
      totalCampaigns: campaignsList.length,
      totalAdGroups: adGroupsList.length,
      totalKeywords: keywordsList.length,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('\n========== GOOGLE ADS ERROR ==========');
    console.error('[GoogleAds] Fetch error:', error);

    const maybeAny = error as any;
    const status = maybeAny?.response?.status ?? maybeAny?.status;
    const responseData = maybeAny?.response?.data;
    if (status) {
      console.error('[GoogleAds] HTTP status:', status);
    }
    if (responseData) {
      console.error('[GoogleAds] Error response data:', responseData);
    }

    if (status === 403) {
      console.error(
        "[GoogleAds] 403 usually means permissions / MCC / developer token status. " +
          "Try setting GOOGLE_ADS_LOGIN_CUSTOMER_ID (manager account id, no dashes) and re-authing."
      );
    }

    if (error instanceof Error) {
      console.error('[GoogleAds] Error name:', error.name);
      console.error('[GoogleAds] Error message:', error.message);
      console.error('[GoogleAds] Error stack:', error.stack);
    }
    // Log the full error object
    console.error('[GoogleAds] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('======================================\n');
    throw error;
  }
}

async function fetchShopifyData(connectionId: string) {
  try {
    // Fetch products
    const products = await nango.proxy({
      providerConfigKey: 'shopify',
      connectionId,
      endpoint: '/admin/api/2024-01/products.json',
      method: 'GET',
      params: { limit: '10' }
    });

    // Fetch orders
    const orders = await nango.proxy({
      providerConfigKey: 'shopify',
      connectionId,
      endpoint: '/admin/api/2024-01/orders.json',
      method: 'GET',
      params: { limit: '10', status: 'any' }
    });

    // Fetch customers
    const customers = await nango.proxy({
      providerConfigKey: 'shopify',
      connectionId,
      endpoint: '/admin/api/2024-01/customers.json',
      method: 'GET',
      params: { limit: '10' }
    });

    return {
      products: products.data?.products || [],
      orders: orders.data?.orders || [],
      customers: customers.data?.customers || [],
      totalProducts: products.data?.products?.length || 0,
      totalOrders: orders.data?.orders?.length || 0,
      totalCustomers: customers.data?.customers?.length || 0,
    };
  } catch (error) {
    console.error('Shopify fetch error:', error);
    throw error;
  }
}

