'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { INTEGRATION_CONFIGS, IntegrationType } from '@/lib/nango-config';
import { authenticateIntegration, checkConnection } from '@/lib/nango-client';
import { storage } from '@/lib/storage-utils';

// Generate a consistent user ID for this browser session
const getUserId = () => {
  if (typeof window === 'undefined') return 'default-user';
  return storage.getUserId();
};

interface ConnectionState {
  [key: string]: boolean;
}

interface IntegrationData {
  [key: string]: any;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<ConnectionState>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [data, setData] = useState<IntegrationData>({});
  const [dataLoading, setDataLoading] = useState<{ [key: string]: boolean }>({});
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get or create user ID and initialize session
    const id = getUserId();
    setUserId(id);
    
    // Initialize session
    storage.getSession();
    
    // Check existing connections (from localStorage first, then API)
    checkAllConnections(id);
    
    // Load cached data from localStorage if available
    loadCachedData(id);
  }, []);

  const checkAllConnections = async (uid: string) => {
    for (const integration of INTEGRATION_CONFIGS) {
      // First check localStorage
      const hasLocalConnection = storage.hasValidConnection(integration.id, uid);
      
      if (hasLocalConnection) {
        setConnections(prev => ({ ...prev, [integration.id]: true }));
      }
      
      // Then verify with API
      const isConnected = await checkConnection(integration.id, uid);
      setConnections(prev => ({ ...prev, [integration.id]: isConnected }));
      
      // Update localStorage if connection status changed
      if (isConnected && !hasLocalConnection) {
        storage.storeConnection({
          integrationId: integration.id,
          userId: uid,
          connectionId: uid,
          connectedAt: Date.now(),
        });
      } else if (!isConnected && hasLocalConnection) {
        storage.removeConnection(integration.id, uid);
      }
    }
  };

  const loadCachedData = (uid: string) => {
    // Load any cached data from previous session
    const cachedDataKey = `nango_data_${uid}`;
    try {
      const cached = localStorage.getItem(cachedDataKey);
      if (cached) {
        const parsedData = JSON.parse(cached);
        setData(parsedData);
        console.log('[App] Loaded cached data from localStorage');
      }
    } catch (error) {
      console.error('[App] Failed to load cached data:', error);
    }
  };

  const handleConnect = async (integrationId: IntegrationType) => {
    setLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      const result = await authenticateIntegration(integrationId, userId);
      
      if (result.success) {
        // Update connection state
        setConnections(prev => ({ ...prev, [integrationId]: true }));
        
        // Automatically fetch data after successful connection
        await handleFetchData(integrationId);
      } else {
        // Show more helpful error message
        const errorMsg = result.error || 'Connection failed';
        if (errorMsg.includes('cancelled') || errorMsg.includes('not established')) {
          alert(
            `Connection not completed.\n\n` +
            `Please ensure you:\n` +
            `1. Authorize the app in the popup window\n` +
            `2. Wait for the "Success" message\n` +
            `3. Wait 2-3 seconds - popup will close automatically\n\n` +
            `💡 Tip: You can also close it manually after seeing "Success"!`
          );
        } else {
          alert(`Failed to connect: ${errorMsg}`);
        }
        setLoading(prev => ({ ...prev, [integrationId]: false }));
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect. Please try again.');
      setLoading(prev => ({ ...prev, [integrationId]: false }));
    }
    // Note: loading state is cleared after data fetch completes
  };

  const handleFetchData = async (integrationId: IntegrationType) => {
    setDataLoading(prev => ({ ...prev, [integrationId]: true }));
    
    console.log('\n========== CLIENT: FETCH DATA ==========');
    console.log('[Client] Integration ID:', integrationId);
    console.log('[Client] User ID:', userId);
    console.log('========================================\n');
    
    try {
      const response = await fetch('/api/integrations/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, userId }),
      });
      
      const result = await response.json();
      
      console.log('[Client] Response status:', response.status);
      console.log('[Client] Response data:', result);
      
      if (result.success) {
        setData(prev => {
          const newData = { ...prev, [integrationId]: result.data };
          
          // Cache data in localStorage
          try {
            const cachedDataKey = `nango_data_${userId}`;
            localStorage.setItem(cachedDataKey, JSON.stringify(newData));
            console.log('[App] Cached data to localStorage');
          } catch (error) {
            console.error('[App] Failed to cache data:', error);
          }
          
          return newData;
        });
      } else {
        // Show more helpful error message
        let errorMessage = result.error || 'Failed to fetch data';
        
        // Check if it's a network/connection error
        if (result.details?.includes('fetch failed') || 
            result.details?.includes('timeout') ||
            result.details?.includes('ECONNREFUSED') ||
            result.details?.includes('ETIMEDOUT')) {
          errorMessage = 
            `Network error: Cannot reach Nango API\n\n` +
            `Possible causes:\n` +
            `• No internet connection\n` +
            `• Firewall blocking api.nango.dev\n` +
            `• VPN/proxy issues\n` +
            `• Nango API is down\n\n` +
            `Try:\n` +
            `1. Check your internet connection\n` +
            `2. Disable VPN/proxy temporarily\n` +
            `3. Check if api.nango.dev is accessible`;
        } else if (result.error?.includes('No connection found')) {
          errorMessage = 
            `Connection not found in Nango.\n\n` +
            `The UI shows "Connected" from cache, but Nango API\n` +
            `doesn't have this connection.\n\n` +
            `Please disconnect and reconnect.`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Data fetch error:', error);
      alert(
        'Network error: Cannot connect to server.\n\n' +
        'Please check:\n' +
        '• Internet connection\n' +
        '• Development server is running\n' +
        '• No firewall blocking requests'
      );
    } finally {
      setDataLoading(prev => ({ ...prev, [integrationId]: false }));
      // Clear the connection loading state as well
      setLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDisconnect = async (integrationId: IntegrationType) => {
    if (!confirm(`Are you sure you want to disconnect from ${integrationId}?`)) {
      return;
    }
    
    // Clear from localStorage
    storage.clearIntegration(integrationId, userId);
    
    // Clear from state
    setConnections(prev => ({ ...prev, [integrationId]: false }));
    setData(prev => {
      const newData = { ...prev };
      delete newData[integrationId];
      
      // Update cached data
      try {
        const cachedDataKey = `nango_data_${userId}`;
        localStorage.setItem(cachedDataKey, JSON.stringify(newData));
      } catch (error) {
        console.error('[App] Failed to update cached data:', error);
      }
      
      return newData;
    });
    
    console.log('[App] Disconnected from:', integrationId);
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; hover: string; border: string } } = {
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-600', border: 'border-orange-300' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-600', border: 'border-blue-300' },
      green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-600', border: 'border-green-300' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'hover:bg-indigo-600', border: 'border-indigo-300' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Integrations</h1>
          <p className="text-gray-600">Connect to live platforms and fetch real data</p>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {INTEGRATION_CONFIGS.map((integration) => {
            const colors = getColorClasses(integration.color);
            const isConnected = connections[integration.id];
            const isLoading = loading[integration.id];
            const isDataLoading = dataLoading[integration.id];
            const integrationData = data[integration.id];

            return (
              <div key={integration.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Card Header */}
                <div className={`${colors.bg} p-6 border-b-4 ${colors.border}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <span className="text-4xl mr-4">{integration.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                      </div>
                    </div>
                    {isConnected && (
                      <div className="flex gap-2">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="text-red-600 hover:text-red-700 text-xs font-semibold"
                          title="Disconnect"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Data:</h4>
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className={`${colors.bg} ${colors.text} text-xs px-3 py-1 rounded-full font-medium`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={isLoading || isConnected || isDataLoading}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                        isConnected
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : isLoading || isDataLoading
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : `${colors.bg} ${colors.text} ${colors.hover} hover:text-white`
                      }`}
                    >
                      {isLoading 
                        ? 'Connecting...' 
                        : isDataLoading && isConnected 
                        ? 'Fetching Data...' 
                        : isConnected 
                        ? 'Connected' 
                        : 'Connect'}
                    </button>
                    
                    {isConnected && !isLoading && (
                      <button
                        onClick={() => handleFetchData(integration.id)}
                        disabled={isDataLoading}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold ${colors.bg} ${colors.text} ${colors.hover} hover:text-white transition-colors disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed`}
                      >
                        {isDataLoading ? 'Loading...' : 'Refresh Data'}
                      </button>
                    )}
                  </div>

                  {/* Loading State */}
                  {isLoading && !isConnected && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="animate-spin h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="text-yellow-900">
                          <p className="font-medium mb-1">Complete authorization in the popup</p>
                          <p className="text-sm text-yellow-700">
                            1. Authorize the app<br/>
                            2. Wait for "Success" message<br/>
                            3. Popup auto-closes in 2 seconds<br/>
                            <span className="text-xs text-yellow-600 italic">
                              💡 You can close it manually after "Success"!
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(isLoading || isDataLoading) && isConnected && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-900 font-medium">
                          {isDataLoading ? 'Fetching your data...' : 'Completing authentication...'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Data Display */}
                  {integrationData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Live Data:</h4>
                      
                      {/* Summary Counts */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {Object.entries(integrationData).map(([key, value]) => {
                          if (key.startsWith('total')) {
                            return (
                              <div key={key} className="bg-white p-3 rounded border border-gray-200">
                                <div className="text-xs text-gray-600 uppercase">
                                  {key.replace('total', '').replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                  {value as number}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* HubSpot Data Details */}
                      {integration.id === 'hubspot' && (
                        <div className="space-y-3">
                          {/* Contacts */}
                          {integrationData.contacts && integrationData.contacts.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                📇 Contacts ({integrationData.contacts.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.contacts.map((contact: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {contact.properties?.firstname} {contact.properties?.lastname}
                                    </div>
                                    <div className="text-gray-600">{contact.properties?.email}</div>
                                    {contact.properties?.company && (
                                      <div className="text-gray-500">Company: {contact.properties.company}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Deals */}
                          {integrationData.deals && integrationData.deals.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                💼 Deals ({integrationData.deals.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.deals.map((deal: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {deal.properties?.dealname || 'Unnamed Deal'}
                                    </div>
                                    {deal.properties?.amount && (
                                      <div className="text-green-600 font-medium">
                                        ${parseFloat(deal.properties.amount).toLocaleString()}
                                      </div>
                                    )}
                                    {deal.properties?.dealstage && (
                                      <div className="text-gray-600">Stage: {deal.properties.dealstage}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Companies */}
                          {integrationData.companies && integrationData.companies.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                🏢 Companies ({integrationData.companies.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.companies.map((company: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {company.properties?.name || 'Unnamed Company'}
                                    </div>
                                    {company.properties?.domain && (
                                      <div className="text-blue-600">{company.properties.domain}</div>
                                    )}
                                    {company.properties?.industry && (
                                      <div className="text-gray-600">Industry: {company.properties.industry}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Activities */}
                          {integrationData.activities && integrationData.activities.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                📞 Activities ({integrationData.activities.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.activities.map((activity: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {activity.properties?.hs_call_title || 'Call Activity'}
                                    </div>
                                    {activity.properties?.hs_call_status && (
                                      <div className="text-gray-600">Status: {activity.properties.hs_call_status}</div>
                                    )}
                                    {activity.properties?.hs_call_duration && (
                                      <div className="text-gray-500">
                                        Duration: {activity.properties.hs_call_duration}ms
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}

                      {/* Google Ads Data Details */}
                      {(integration.id === 'google-ads-9fyg' || integration.id.startsWith('google-ads')) && (
                        <div className="space-y-3">
                          {/* Campaigns */}
                          {integrationData.campaigns && integrationData.campaigns.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                📊 Campaigns ({integrationData.campaigns.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.campaigns.map((campaign: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {campaign.campaign?.name || 'Unnamed Campaign'}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      {campaign.metrics?.impressions !== undefined && (
                                        <div className="text-gray-600">
                                          👁️ Impressions: {campaign.metrics.impressions.toLocaleString()}
                                        </div>
                                      )}
                                      {campaign.metrics?.clicks !== undefined && (
                                        <div className="text-blue-600 font-medium">
                                          🖱️ Clicks: {campaign.metrics.clicks.toLocaleString()}
                                        </div>
                                      )}
                                      {campaign.metrics?.cost_micros !== undefined && (
                                        <div className="text-green-600 font-medium">
                                          💰 Cost: ${(campaign.metrics.cost_micros / 1000000).toFixed(2)}
                                        </div>
                                      )}
                                      {campaign.metrics?.ctr !== undefined && (
                                        <div className="text-purple-600">
                                          📈 CTR: {(campaign.metrics.ctr * 100).toFixed(2)}%
                                        </div>
                                      )}
                                    </div>
                                    {campaign.campaign?.status && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Status: {campaign.campaign.status}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Ad Groups */}
                          {integrationData.adGroups && integrationData.adGroups.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                🎯 Ad Groups ({integrationData.adGroups.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.adGroups.map((adGroup: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {adGroup.adGroup?.name || adGroup.ad_group?.name || 'Unnamed Ad Group'}
                                    </div>
                                    {adGroup.campaign?.name && (
                                      <div className="text-gray-500 text-xs">
                                        Campaign: {adGroup.campaign.name}
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      {adGroup.metrics?.impressions !== undefined && (
                                        <div className="text-gray-600">
                                          Impressions: {adGroup.metrics.impressions.toLocaleString()}
                                        </div>
                                      )}
                                      {adGroup.metrics?.clicks !== undefined && (
                                        <div className="text-blue-600">
                                          Clicks: {adGroup.metrics.clicks.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Keywords */}
                          {integrationData.keywords && integrationData.keywords.length > 0 && (
                            <details className="bg-white rounded border border-gray-200">
                              <summary className="cursor-pointer p-3 font-semibold text-gray-900 hover:bg-gray-50">
                                🔑 Keywords ({integrationData.keywords.length})
                              </summary>
                              <div className="p-3 pt-0 space-y-2 max-h-60 overflow-y-auto">
                                {integrationData.keywords.map((keyword: any, idx: number) => (
                                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="font-semibold text-gray-900">
                                      {keyword.adGroupCriterion?.keyword?.text || keyword.ad_group_criterion?.keyword?.text || 'Keyword'}
                                    </div>
                                    {keyword.adGroupCriterion?.keyword?.match_type && (
                                      <div className="text-xs text-gray-500">
                                        Match: {keyword.adGroupCriterion.keyword.match_type}
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      {keyword.metrics?.impressions !== undefined && (
                                        <div className="text-gray-600">
                                          Impressions: {keyword.metrics.impressions.toLocaleString()}
                                        </div>
                                      )}
                                      {keyword.metrics?.clicks !== undefined && (
                                        <div className="text-blue-600">
                                          Clicks: {keyword.metrics.clicks.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Account Info */}
                          {integrationData.customerId && (
                            <div className="bg-white rounded border border-gray-200 p-3 text-xs">
                              <span className="text-gray-600">Customer ID: </span>
                              <span className="font-mono text-gray-900">{integrationData.customerId}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Other integrations data display */}
                      {integration.id !== 'hubspot' && (
                        <div className="text-sm text-gray-700 space-y-1">
                          {Object.entries(integrationData).map(([key, value]) => {
                            if (!key.startsWith('total')) {
                              return (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-semibold">
                                    {typeof value === 'number' ? value : Array.isArray(value) ? value.length : 'N/A'}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Setup Instructions</h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">1. Configure Nango.dev</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Sign up at <a href="https://nango.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">nango.dev</a></li>
                <li>Create integrations for HubSpot, Google Ads, and Shopify</li>
                <li>Copy your public and secret keys</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Set Environment Variables</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                NANGO_SECRET_KEY=your_secret_key<br/>
                <span className="text-gray-500"># Public key no longer needed - we use secure Connect sessions</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Configure OAuth</h4>
              <p className="text-sm ml-4">
                Each integration requires OAuth credentials from the respective platform. Configure them in Nango dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

