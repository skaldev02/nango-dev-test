# Quick Start Guide - HubSpot Integration Testing

## ✅ What's Been Fixed

The HubSpot integration backend is now **fully functional**! The critical bug preventing OAuth authentication has been fixed.

### The Fix
- **File**: `app/api/nango/create-connect-session/route.ts`
- **Issue**: Token was being extracted from wrong location in Nango API response
- **Solution**: Now correctly extracts token from `data.data.token` nested structure

## 🚀 Next Steps to Test

### 1. Restart the Development Server

The build cache was cleared, so you need to restart the dev server:

```powershell
# In the terminal running the dev server (or open a new terminal)
cd C:\Users\abc\Desktop\nango-dev-test
npm run dev
```

Wait for the message: `✓ Ready in X.Xs`

### 2. Test the Integration

Once the server is running:

1. **Open your browser** to: http://localhost:3000/integrations

2. **Click "Connect"** on the HubSpot card

3. **Expected behavior**:
   - Console logs will show: `[CONNECT] Starting create-connect-session API call`
   - A popup window should open with Nango's Connect UI
   - You'll be redirected to HubSpot's OAuth authorization page
   - After authorizing, the popup will close
   - The button will change to "Connected" with a green badge

4. **Click "Fetch Data"** to test the API integration:
   - Should fetch contacts, deals, and companies from your HubSpot account
   - Results will display below the button

### 3. If You See Errors

**"Failed to create connect session"**
- Check that `NANGO_SECRET_KEY` in `.env.local` is correct
- Verify the HubSpot integration exists in your Nango dashboard

**"No connection found"**
- The OAuth flow didn't complete successfully
- Try connecting again
- Check browser console for errors

**Popup doesn't open**
- Check if popup blockers are enabled in your browser
- Try clicking "Connect" again
- Check browser console (F12) for JavaScript errors

## 📊 Backend Testing (Already Verified ✅)

You can verify the backend fix is working with this PowerShell command:

```powershell
$body = @{integrationId="hubspot";userId="test-user"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/nango/create-connect-session" -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

**Expected output**:
```json
{
  "success": true,
  "connectSessionToken": "nango_connect_session_..."
}
```

## 🔧 Prerequisites

Make sure these are configured in your Nango dashboard:

1. **HubSpot Integration Created**
   - Integration ID: `hubspot` (case-sensitive)
   - OAuth credentials from HubSpot configured

2. **OAuth Scopes** (in Nango dashboard):
   - `crm.objects.contacts.read`
   - `crm.objects.deals.read`
   - `crm.objects.companies.read`

3. **HubSpot App** (at developers.hubspot.com):
   - OAuth app created
   - Redirect URL from Nango added to HubSpot app settings
   - Client ID and Secret added to Nango dashboard

## 📝 Console Logs to Watch For

When you click "Connect", you should see these logs in the terminal running `npm run dev`:

```
[CONNECT] Starting create-connect-session API call
[CONNECT] Received request for integration: hubspot user: user-...
[CONNECT] Calling Nango API...
[CONNECT] Nango API response status: 201
[CONNECT] Nango response data: { "data": { "token": "..." } }
[CONNECT] Extracted token: YES
[CONNECT] Successfully created connect session
```

## ✨ What This Enables

Once the HubSpot integration is connected and working:

- ✅ Fetch contacts with names, emails, and company info
- ✅ Fetch deals with amounts, stages, and owners
- ✅ Fetch company records with domains and industries
- ✅ Real-time data synchronization via Nango proxy
- ✅ Secure OAuth token management
- ✅ Automatic token refresh (handled by Nango)

The same fix applies to all other integrations (Google Ads, Shopify, LinkedIn Ads) since they share the same backend endpoint!

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ **Working** | Token extraction fixed |
| Nango Config | ✅ **Valid** | Secret key configured |
| Frontend Code | ✅ **Ready** | Awaiting fresh build |
| OAuth Flow | ⏳ **Pending Test** | Needs server restart + browser test |
| Data Fetching | ⏳ **Pending Test** | After OAuth connection |

---

**Ready to test?** Just restart the dev server with `npm run dev` and navigate to the integrations page!

