// Nango configuration and utilities
// Note: Public key is deprecated. We now use Connect session tokens for frontend auth
export const NANGO_SECRET_KEY = process.env.NANGO_SECRET_KEY || '';

export const INTEGRATIONS = {
  HUBSPOT: 'hubspot',
  GOOGLE_ADS: 'google-ads-9fyg',
  SHOPIFY: 'shopify',
} as const;

export type IntegrationType = typeof INTEGRATIONS[keyof typeof INTEGRATIONS];

export interface Integration {
  id: IntegrationType;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export const INTEGRATION_CONFIGS: Integration[] = [
  {
    id: INTEGRATIONS.HUBSPOT,
    name: 'HubSpot',
    description: 'CRM platform for contacts, deals, and companies',
    icon: '🔶',
    color: 'orange',
    features: ['Contacts', 'Deals', 'Companies', 'Activities'],
  },
  {
    id: INTEGRATIONS.GOOGLE_ADS,
    name: 'Google Ads',
    description: 'Advertising platform for campaigns and analytics',
    icon: '🎯',
    color: 'blue',
    features: ['Campaigns', 'Ad Groups', 'Keywords', 'Performance Metrics'],
  },
  {
    id: INTEGRATIONS.SHOPIFY,
    name: 'Shopify',
    description: 'E-commerce platform for products and orders',
    icon: '🛍️',
    color: 'green',
    features: ['Products', 'Orders', 'Customers', 'Inventory'],
  },
];

