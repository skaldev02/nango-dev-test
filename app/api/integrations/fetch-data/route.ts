import { NextRequest, NextResponse } from 'next/server';
import nango from '@/lib/nango-server';
import { getConnectionIdForUser } from '@/lib/nango-server';

export async function POST(request: NextRequest) {
  try {
    const { integrationId, userId } = await request.json();

    if (!integrationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: integrationId and userId' },
        { status: 400 }
      );
    }

    // Get the actual connection ID for this user
    const connectionId = await getConnectionIdForUser(integrationId, userId);
    
    if (!connectionId) {
      return NextResponse.json(
        { error: 'No connection found for this user. Please connect first.' },
        { status: 404 }
      );
    }

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
    } else if (integrationId === 'linkedin-ads' || integrationId.startsWith('linkedin-ads-')) {
      integrationType = 'linkedin-ads';
    } else {
      console.error('[FETCH-DATA] Unknown integration:', integrationId);
      console.error('[FETCH-DATA] Available integrations: hubspot, google-ads, shopify, linkedin-ads');
      return NextResponse.json(
        { 
          error: 'Unknown integration',
          details: `Integration "${integrationId}" is not supported`,
          supportedIntegrations: ['hubspot', 'google-ads', 'shopify', 'linkedin-ads']
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
      case 'linkedin-ads':
        data = await fetchLinkedInAdsData(connectionId);
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
    console.log('[GoogleAds] Fetching data for connection:', connectionId);
    console.log('[GoogleAds] Using provider config key:', providerConfigKey);

    // First, get the customer/account ID
    // Google Ads requires a customer ID for most operations
    const customersResponse = await nango.proxy({
      providerConfigKey: providerConfigKey,
      connectionId,
      endpoint: '/v16/customers:listAccessibleCustomers',
      method: 'GET',
    });
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

    // Extract the customer ID from the first resource name
    // Format: "customers/1234567890"
    const customerId = customerIds[0].split('/')[1];
    console.log('[GoogleAds] Using customer ID:', customerId);

    // Fetch campaigns with metrics using Google Ads Query Language (GAQL)
    const campaignsResponse = await nango.proxy({
      providerConfigKey: providerConfigKey,
      connectionId,
      endpoint: `/v16/customers/${customerId}/googleAds:searchStream`,
      method: 'POST',
      data: {
        query: `
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
        `.trim()
      }
    });
    console.log('[GoogleAds] Campaigns response status:', campaignsResponse.status);

    // Extract campaigns from the response
    const campaignsList = campaignsResponse.data?.results || campaignsResponse.data || [];
    console.log('[GoogleAds] Campaigns fetched:', campaignsList.length);

    // Fetch ad groups for the first campaign (if available)
    let adGroupsList: any[] = [];
    if (campaignsList.length > 0) {
      try {
        const adGroupsResponse = await nango.proxy({
          providerConfigKey: providerConfigKey,
          connectionId,
          endpoint: `/v16/customers/${customerId}/googleAds:searchStream`,
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
          }
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
      const keywordsResponse = await nango.proxy({
        providerConfigKey: providerConfigKey,
        connectionId,
        endpoint: `/v16/customers/${customerId}/googleAds:searchStream`,
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
        }
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
    console.error('[GoogleAds] Fetch error:', error);
    if (error instanceof Error) {
      console.error('[GoogleAds] Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
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

async function fetchLinkedInAdsData(connectionId: string) {
  try {
    // Fetch ad campaigns
    const campaigns = await nango.proxy({
      providerConfigKey: 'linkedin-ads',
      connectionId,
      endpoint: '/rest/adAccounts',
      method: 'GET',
      params: { count: '10' }
    });

    return {
      campaigns: campaigns.data?.elements || [],
      totalCampaigns: campaigns.data?.elements?.length || 0,
    };
  } catch (error) {
    console.error('LinkedIn Ads fetch error:', error);
    throw error;
  }
}

