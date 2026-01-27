# LinkedIn Ads Connection Error Fix

## Problem

You're getting a **400 Bad Request** error when trying to connect to LinkedIn Ads:

```
POST http://localhost:3000/api/nango/create-connect-session 400 (Bad Request)
[Nango] Session response: {error: 'Failed to create connect session', details: 'HTTP 400'}
```

The server logs show:
```
[CONNECT] Nango API response status: 400
[CONNECT] Nango API error: { error: { code: 'invalid_body', errors: [ [Object] ] } }
```

## Root Cause

The error `invalid_body` from Nango API means that **`linkedin-ads` is not configured as an integration in your Nango dashboard**, or the integration ID doesn't match.

## Solution

### Option 1: Add LinkedIn Ads Integration to Nango (Recommended)

1. **Log in to Nango Dashboard**
   - Go to https://app.nango.dev
   - Navigate to "Integrations"

2. **Add LinkedIn Ads Integration**
   - Click "Add Integration"
   - Search for "LinkedIn Ads" or "LinkedIn"
   - Note the exact integration ID that Nango uses (it should be `linkedin-ads`)

3. **Configure LinkedIn OAuth**
   - Create a LinkedIn App:
     - Go to https://www.linkedin.com/developers/apps
     - Create a new app
     - Request access to "Marketing Developer Platform" product
     - Note your Client ID and Client Secret
   
   - In Nango dashboard:
     - Enter LinkedIn Client ID
     - Enter LinkedIn Client Secret
     - Use the redirect URI provided by Nango
     - Save the integration

4. **Verify Integration ID**
   - Make sure the integration ID in Nango matches `linkedin-ads`
   - If it's different (e.g., `linkedin` or `linkedin-advertising`), update `lib/nango-config.ts`

### Option 2: Use Diagnostic Script

Run the diagnostic script to see which integrations are actually configured:

```bash
npx tsx scripts/check-integrations.ts
```

This will:
- List all configured integrations in your Nango account
- Test each integration ID to see if it works
- Show specific error messages for failed integrations

### Option 3: Update Integration ID in Code

If Nango uses a different ID for LinkedIn Ads, update the code:

**File: `lib/nango-config.ts`**

```typescript
export const INTEGRATIONS = {
  HUBSPOT: 'hubspot',
  GOOGLE_ADS: 'google-ads',
  SHOPIFY: 'shopify',
  LINKEDIN_ADS: 'linkedin', // Change this to match Nango's ID
} as const;
```

## Common LinkedIn Integration IDs

Different providers use different IDs for LinkedIn:
- `linkedin-ads` - Most common for advertising
- `linkedin` - Generic LinkedIn integration
- `linkedin-advertising` - Alternative naming
- `linkedin-marketing` - Some platforms use this

## Verification Steps

After configuring the integration:

1. **Test the connection:**
   ```bash
   # Restart your dev server
   npm run dev
   ```

2. **Try connecting again:**
   - Go to http://localhost:3000/integrations
   - Click "Connect" on LinkedIn Ads
   - You should see the OAuth popup

3. **Check the logs:**
   - Look for `[CONNECT] Successfully created connect session` in terminal
   - The response should include a `token` and `connect_link`

## Expected Success Response

When LinkedIn Ads is properly configured, you should see:

```
[CONNECT] Starting create-connect-session API call
[CONNECT] Received request for integration: linkedin-ads user: user-xxxxx
[CONNECT] Calling Nango API...
[CONNECT] Nango API response status: 201
[CONNECT] Nango response data: {
  "data": {
    "token": "nango_connect_session_...",
    "connect_link": "https://connect.nango.dev/?session_token=...",
    "expires_at": "2026-01-26T11:13:38.451Z"
  }
}
[CONNECT] Extracted token: YES
[CONNECT] Extracted connect_link: YES
[CONNECT] Successfully created connect session
```

## Still Having Issues?

If you continue to get errors:

1. **Check your Nango subscription:**
   - LinkedIn Ads might require a specific plan
   - Some integrations need approval from Nango

2. **Verify OAuth credentials:**
   - Make sure your LinkedIn app has the Marketing Developer Platform product enabled
   - Check that redirect URIs are correctly configured

3. **Contact Nango support:**
   - They can verify if LinkedIn Ads is available for your account
   - They can confirm the correct integration ID

## Additional Resources

- [Nango Documentation](https://docs.nango.dev)
- [LinkedIn Marketing API](https://docs.microsoft.com/en-us/linkedin/marketing/)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)

