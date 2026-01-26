# Quick Fix: LinkedIn Ads Integration Issue

## Error Message
```
"Integration does not exist"
path: ["allowed_integrations", "0"]
```

## The Problem
The integration ID `linkedin-ads` does not exist in your Nango dashboard.

## Solution: Check & Add Integration

### Step 1: Check What's Actually Configured

Open this URL in your browser (while your dev server is running):

```
http://localhost:3000/api/debug/check-integrations
```

This will show you:
- ✅ Which integration IDs work
- ❌ Which integration IDs don't exist
- 📋 List of all configured integrations in your Nango account

### Step 2: Add LinkedIn Ads to Nango

1. **Go to Nango Dashboard**
   - Visit: https://app.nango.dev
   - Login with your account

2. **Navigate to Integrations**
   - Click "Integrations" in the left sidebar
   - You should see: HubSpot, Google Ads, Shopify (already working)

3. **Add LinkedIn Integration**
   - Click "+ Add Integration" or "New Integration"
   - Search for "LinkedIn"
   - Look for one of these:
     - **LinkedIn Ads** (preferred)
     - **LinkedIn** (generic)
     - **LinkedIn Marketing API**
   
4. **Important: Note the Integration ID**
   - After adding, Nango will show the integration ID
   - Common IDs are:
     - `linkedin-ads`
     - `linkedin`
     - `linkedin-advertising`
     - `linkedin-marketing`

5. **Configure OAuth Credentials**
   - You need a LinkedIn App from: https://www.linkedin.com/developers/apps
   - Click "Create App" if you don't have one
   - Add these products to your LinkedIn App:
     - "Marketing Developer Platform" (required for ads API)
     - "Advertising API"
   - Copy Client ID and Client Secret
   - Paste them into Nango's LinkedIn integration settings
   - Use the OAuth Redirect URL provided by Nango

### Step 3: Update Your Code (If Needed)

If Nango's integration ID is NOT `linkedin-ads`, update your code:

**File: `lib/nango-config.ts`** (line 9)

```typescript
export const INTEGRATIONS = {
  HUBSPOT: 'hubspot',
  GOOGLE_ADS: 'google-ads',
  SHOPIFY: 'shopify',
  LINKEDIN_ADS: 'linkedin', // ← Change this to match Nango's ID
} as const;
```

### Step 4: Test Again

1. Restart dev server (if you changed code)
2. Go to http://localhost:3000/integrations
3. Click "Connect" on LinkedIn Ads
4. Should now open OAuth popup successfully

## Common LinkedIn Integration IDs

Try these alternatives if `linkedin-ads` doesn't work:

| Integration ID | Description |
|---------------|-------------|
| `linkedin-ads` | LinkedIn Advertising (most common) |
| `linkedin` | Generic LinkedIn integration |
| `linkedin-advertising` | Alternative naming |
| `linkedin-marketing` | Marketing API specific |

## Can't Add LinkedIn to Nango?

### Possible Reasons:

1. **LinkedIn not available in Nango's catalog**
   - Check Nango's integration catalog
   - Some integrations require business plans

2. **LinkedIn requires approval**
   - Some platforms need Nango's approval
   - Contact Nango support

3. **Using Nango Cloud vs Self-hosted**
   - Integration availability varies by deployment type

### Alternative: Use a Different Integration Provider

If LinkedIn Ads isn't available in Nango, consider:
- Using LinkedIn's OAuth directly (without Nango)
- Using a different integration platform
- Requesting LinkedIn support from Nango team

## Still Stuck?

Run the diagnostic endpoint:
```
http://localhost:3000/api/debug/check-integrations
```

Then share the output and I can help you identify the correct integration ID to use.

