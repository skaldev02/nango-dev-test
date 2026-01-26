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
    switch (integrationId) {
      case 'hubspot':
        data = await fetchHubSpotData(connectionId);
        break;
      case 'google-ads':
        data = await fetchGoogleAdsData(connectionId);
        break;
      case 'shopify':
        data = await fetchShopifyData(connectionId);
        break;
      case 'linkedin-ads':
        data = await fetchLinkedInAdsData(connectionId);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown integration' },
          { status: 400 }
        );
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
    // Fetch contacts
    const contacts = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/contacts',
      method: 'GET',
      params: { limit: '10' }
    });

    // Fetch deals
    const deals = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/deals',
      method: 'GET',
      params: { limit: '10' }
    });

    // Fetch companies
    const companies = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/companies',
      method: 'GET',
      params: { limit: '10' }
    });

    // Fetch activities (engagements - calls, meetings, emails, tasks, notes)
    const activities = await nango.proxy({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/calls',
      method: 'GET',
      params: { limit: '10' }
    });

    return {
      contacts: contacts.data?.results || [],
      deals: deals.data?.results || [],
      companies: companies.data?.results || [],
      activities: activities.data?.results || [],
      totalContacts: contacts.data?.results?.length || 0,
      totalDeals: deals.data?.results?.length || 0,
      totalCompanies: companies.data?.results?.length || 0,
      totalActivities: activities.data?.results?.length || 0,
    };
  } catch (error) {
    console.error('HubSpot fetch error:', error);
    throw error;
  }
}

async function fetchGoogleAdsData(connectionId: string) {
  try {
    // Fetch campaigns
    const campaigns = await nango.proxy({
      providerConfigKey: 'google-ads',
      connectionId,
      endpoint: '/v13/customers/search',
      method: 'POST',
      data: {
        query: 'SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks FROM campaign ORDER BY metrics.impressions DESC LIMIT 10'
      }
    });

    return {
      campaigns: campaigns.data?.results || [],
      totalCampaigns: campaigns.data?.results?.length || 0,
    };
  } catch (error) {
    console.error('Google Ads fetch error:', error);
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

