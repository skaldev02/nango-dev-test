# Setup Guide for Nango.dev Integration

This guide walks you through setting up real API integrations using Nango.dev.

## Step 1: Create Nango Account

1. Visit [https://www.nango.dev](https://www.nango.dev)
2. Sign up for a free account
3. Create a new project

## Step 2: Configure Integrations in Nango Dashboard

### HubSpot Integration

1. In Nango dashboard, click "Integrations" → "Add Integration"
2. Search for "HubSpot" and select it
3. Configure the following:
   - **Integration ID**: `hubspot` (use this exact value)
   - **OAuth Scopes**: 
     - `crm.objects.contacts.read`
     - `crm.objects.deals.read`
     - `crm.objects.companies.read`
     - `crm.objects.contacts.write` (optional)
4. Get OAuth credentials from HubSpot:
   - Go to [HubSpot Developer Portal](https://developers.hubspot.com)
   - Create an app
   - Copy the OAuth redirect URL from Nango
   - Add it to your HubSpot app settings
   - Copy Client ID and Client Secret from HubSpot
   - Paste them in Nango dashboard
5. Save the integration

### Google Ads Integration

1. Add "Google Ads" integration in Nango
2. Configure:
   - **Integration ID**: `google-ads`
   - **OAuth Scopes**: 
     - `https://www.googleapis.com/auth/adwords`
3. Get OAuth credentials from Google:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google Ads API
   - Create OAuth 2.0 credentials
   - Add Nango's redirect URL to authorized redirect URIs
   - Copy Client ID and Client Secret to Nango
4. Save the integration

### Shopify Integration

1. Add "Shopify" integration in Nango
2. Configure:
   - **Integration ID**: `shopify`
   - **OAuth Scopes**:
     - `read_products`
     - `read_orders`
     - `read_customers`
     - `read_inventory` (optional)
3. Get OAuth credentials from Shopify:
   - Go to [Shopify Partners](https://partners.shopify.com)
   - Create an app
   - Add Nango's redirect URL
   - Copy API key and API secret key to Nango
4. Save the integration

### LinkedIn Ads Integration

1. Add "LinkedIn Ads" integration in Nango
2. Configure:
   - **Integration ID**: `linkedin-ads`
   - **OAuth Scopes**:
     - `r_ads`
     - `r_ads_reporting`
     - `rw_ads` (optional)
3. Get OAuth credentials from LinkedIn:
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers)
   - Create an app
   - Add Nango's redirect URL
   - Copy Client ID and Client Secret to Nango
4. Save the integration

## Step 3: Get Your Nango Keys

1. In Nango dashboard, go to "Settings" → "API Keys"
2. Copy your **Secret Key** (starts with `sec_`)
3. Keep it secure!

**Note**: Public keys are deprecated as of January 2025. This app uses the new secure Connect session authentication method.

## Step 4: Configure Application

1. In your project root, create `.env.local`:

```env
NANGO_SECRET_KEY=sec_your_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace the placeholder value with your actual secret key

**Important**: This app uses Connect session authentication (the new secure method). You no longer need a public key in the frontend.

## Step 5: Test Connections

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Click "Manage Integrations"

4. For each integration:
   - Click "Connect"
   - Complete OAuth flow in popup window
   - Click "Fetch Data" to test API connection

## Common Issues

### OAuth Redirect Mismatch
**Problem**: "Redirect URI mismatch" error during OAuth

**Solution**: 
- Ensure redirect URL in provider platform exactly matches Nango's redirect URL
- Check for trailing slashes
- Verify HTTP vs HTTPS

### Invalid Scopes
**Problem**: "Insufficient permissions" when fetching data

**Solution**:
- Review OAuth scopes in Nango dashboard
- Add missing scopes
- Re-authenticate the connection

### Connection Not Found
**Problem**: "Connection not found" error

**Solution**:
- Verify integration ID matches exactly (case-sensitive)
- Check connection was successfully created
- Try re-authenticating

### CORS Errors
**Problem**: CORS errors in browser console

**Solution**:
- API calls should go through Next.js API routes
- Never call external APIs directly from frontend
- Use `/api/integrations/fetch-data` endpoint

## Testing Live Data

Once connected, you should see:

### HubSpot
- List of contacts with names and emails
- Recent deals with amounts
- Company records

### Google Ads
- Active campaigns
- Impressions and clicks data
- Campaign performance metrics

### Shopify
- Product catalog
- Recent orders
- Customer list

### LinkedIn Ads
- Ad account details
- Campaign information
- Performance analytics

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Rotate keys** regularly
3. **Use different keys** for development and production
4. **Limit OAuth scopes** to only what you need
5. **Monitor API usage** in Nango dashboard

## Need Help?

- [Nango Documentation](https://docs.nango.dev)
- [Nango Discord Community](https://nango.dev/discord)
- [GitHub Issues](https://github.com/NangoHQ/nango)

## Next Steps

After successful integration:
1. Explore the Page Editor feature
2. Customize the demo page
3. Add more API endpoints as needed
4. Build your own features on top of this foundation

