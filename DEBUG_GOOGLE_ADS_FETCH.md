# Debug Google Ads Data Fetch

## Issue
Google Ads shows as "Connected" but clicking "Refresh Data" doesn't fetch any data.

## Changes Made

I've added extensive logging to help diagnose the issue. The logs will show:

### Client-Side (Browser Console)
- Integration ID being sent
- User ID being sent
- Response status and data

### Server-Side (Terminal)
1. **Fetch Data Request**: Shows what the API receives
2. **Connection Check**: Shows the connection lookup process
3. **Google Ads Data Fetch**: Shows the actual data fetching

## How to Test

1. **Open Browser Console** (F12 → Console tab)

2. **Open Terminal** where your Next.js dev server is running

3. **Click on "Refresh Data" button** for Google Ads

4. **Check both logs** to see where the issue is:

### Expected Flow

#### Browser Console should show:
```
========== CLIENT: FETCH DATA ==========
[Client] Integration ID: google-ads-9fyg
[Client] User ID: user-1769505966180-3gx4eri3i
========================================
```

#### Terminal should show:
```
========== FETCH DATA REQUEST ==========
[FETCH-DATA] Request received
[FETCH-DATA] Integration ID: google-ads-9fyg
[FETCH-DATA] User ID: user-1769505966180-3gx4eri3i
=========================================

========== CONNECTION CHECK ==========
[CHECK-CONNECTION] Integration: google-ads-9fyg
[CHECK-CONNECTION] User ID: user-1769505966180-3gx4eri3i
======================================

[CHECK-CONNECTION] Total connections in Nango: 32
[CHECK-CONNECTION] Connections matching provider_config_key='google-ads-9fyg': 1
[CHECK-CONNECTION] Connection 1/1: {
  end_user_id: 'user-1769505966180-3gx4eri3i',
  connection_id: '113cd810-7688-47b4-9f18-1cc724822e41',
  matches: '✅ MATCH'
}

[FETCH-DATA] ✅ Connection found!
[FETCH-DATA] Connection ID: 113cd810-7688-47b4-9f18-1cc724822e41

========== GOOGLE ADS DATA FETCH ==========
[GoogleAds] Fetching data for connection: 113cd810-7688-47b4-9f18-1cc724822e41
[GoogleAds] Using provider config key: google-ads-9fyg
==========================================

[GoogleAds] Step 1: Fetching accessible customers...
[GoogleAds] Customers API response status: 200
[GoogleAds] Accessible customers response: { ... }
```

## Possible Issues

### 1. Connection Not Found
If you see:
```
[CHECK-CONNECTION] Connections matching provider_config_key='google-ads-9fyg': 0
```

**Solution**: The connection ID in the config might be wrong. Check available provider_config_keys in the logs.

### 2. User ID Mismatch
If you see connections found but no match:
```
[CHECK-CONNECTION] Connection 1/1: {
  end_user_id: 'different-user-id',
  matches: '❌ no match'
}
```

**Solution**: 
- Clear browser localStorage: `localStorage.clear()` in browser console
- Reconnect Google Ads

### 3. API Error
If you see Google Ads logs but then an error:
```
========== GOOGLE ADS ERROR ==========
[GoogleAds] Error message: ...
```

**Solution**: Check the error message for details. Common issues:
- Invalid customer ID
- Missing permissions
- Google Ads API quota exceeded
- OAuth token expired

### 4. Network Error
If you see a fetch error in browser console:
```
[Client] Network error: Cannot connect to server
```

**Solution**: Check that the dev server is running.

## Quick Fix Commands

### Clear localStorage (Browser Console)
```javascript
localStorage.clear();
location.reload();
```

### Check what's in localStorage (Browser Console)
```javascript
console.log('User ID:', localStorage.getItem('nango_user_id'));
console.log('Connections:', JSON.parse(localStorage.getItem('nango_connections') || '[]'));
```

### View all Nango connections (Terminal - in project directory)
```bash
curl -H "Authorization: Bearer $NANGO_SECRET_KEY" https://api.nango.dev/connection
```

## Next Steps

After you test:
1. Copy the relevant logs from both browser and terminal
2. Share them so I can identify the exact issue
3. I'll provide a targeted fix based on what the logs reveal

