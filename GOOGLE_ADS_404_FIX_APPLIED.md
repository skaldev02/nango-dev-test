# ✅ Google Ads 404 Error - FIXED!

## Problem Identified

The Google Ads API was returning a 404 error with this message:
```
The requested URL /v16/customers:listAccessibleCustomers was not found on this server.
```

## Root Cause

The implementation was calling an **old Google Ads API version (`v16`)**. Google Ads API versions are periodically **sunset**; once a version is removed, Google returns **404 Not Found** for those paths.

### What Was Wrong:
```typescript
// ❌ INCORRECT - Old API version (sunset)
endpoint: '/v16/customers:listAccessibleCustomers'
```

### What Was Fixed:
```typescript
// ✅ CORRECT - Use a current Google Ads API version (defaulting to v20)
endpoint: '/v20/customers:listAccessibleCustomers'
```

## Changes Made

Fixed **4 Google Ads API endpoints** in `app/api/integrations/fetch-data/route.ts` by switching from `v16` to `v20` and centralizing the version:

1. `customers:listAccessibleCustomers`
2. `googleAds:searchStream` (campaigns)
3. `googleAds:searchStream` (ad groups)
4. `googleAds:searchStream` (keywords)

The code now uses `process.env.GOOGLE_ADS_API_VERSION || 'v20'` so you can bump versions without code changes.

## Why this fixes the 404

Google Ads REST endpoints are versioned (`/vXX/...`). If you call a version that’s no longer available, Google responds with 404 for that URL.

## Next Steps

1. **The fix has been applied automatically** - No action needed from you!
2. **Test the integration**:
   - Go to http://localhost:3000/integrations
   - Find your Google Ads connection
   - Click "Refresh Data"
   - You should now see data loading successfully!

## Expected Output

### Terminal (Success):
```
[GoogleAds] Step 1: Fetching accessible customers...
[GoogleAds] Customers API response status: 200
[GoogleAds] Customer IDs found: 1
[GoogleAds] Using customer ID: 1234567890
[GoogleAds] Campaigns fetched: 5
[GoogleAds] Ad groups fetched: 12
[GoogleAds] Keywords fetched: 45
```

### Browser (Success):
```
✅ Data loaded successfully!
📊 Campaigns: 5
🎯 Ad Groups: 12
🔑 Keywords: 45
```

## If You Still See Errors

Make sure:
1. ✅ Your `GOOGLE_ADS_DEVELOPER_TOKEN` is set in `.env.local`
2. ✅ The developer token is approved in your Google Ads account
3. ✅ You've restarted the dev server after adding the token
4. ✅ The Google account you connected has access to at least one Google Ads account

---

**The 404 error should now be resolved! Try fetching data again.** 🚀

