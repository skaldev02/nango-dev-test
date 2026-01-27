# 🔴 Network Error Fix Guide

## Problem

**Error:** `ConnectTimeoutError: Connect Timeout Error (attempted address: api.nango.dev:443, timeout: 10000ms)`

**Symptom:** UI shows "Connected" but fetch fails with network timeout.

## Why This Happens

The UI shows "Connected" because it's using **cached data from localStorage**, but when you try to fetch new data, the backend **cannot reach Nango's API** due to network issues.

## Immediate Solution

### Option 1: Run Network Diagnostic (Recommended)

Visit this URL in your browser:
```
http://localhost:3000/api/debug/test-nango-connection
```

This will test:
- ✅ Environment variables
- ✅ Network connectivity to Nango API
- ✅ DNS resolution
- ✅ Response time

You'll get a detailed report with specific suggestions.

### Option 2: Quick Network Test

Open PowerShell/CMD and run:

```powershell
# Test 1: Check if api.nango.dev is reachable
ping api.nango.dev

# Test 2: Check if HTTPS port is open
Test-NetConnection api.nango.dev -Port 443

# Test 3: Try curl (if installed)
curl https://api.nango.dev
```

## Common Causes & Fixes

### 1. 🌐 No Internet Connection
**Fix:** Check your internet connection
```powershell
ping google.com
```

### 2. 🔒 Corporate Firewall
**Fix:** Check if your firewall is blocking api.nango.dev
- Contact IT to whitelist `api.nango.dev:443`
- Try from a different network (mobile hotspot)

### 3. 🔐 VPN/Proxy Issues
**Fix:** Temporarily disable VPN/proxy
```powershell
# Windows: Check proxy settings
netsh winhttp show proxy
```

### 4. 🌍 DNS Problems
**Fix:** Try different DNS servers
```powershell
# Flush DNS cache
ipconfig /flushdns

# Try Google DNS
nslookup api.nango.dev 8.8.8.8
```

### 5. ⏱️ Slow Network
**Fix:** Increase timeout (already done - now 30 seconds)

The code has been updated to:
- ✅ 30-second timeout (was 10 seconds)
- ✅ Better error messages
- ✅ Detailed network diagnostics

## Updated Code Features

### Backend Improvements (`lib/nango-server.ts`)
```typescript
// Now with 30-second timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

// Better error messages for different scenarios
if (fetchError.name === 'AbortError') {
  console.error('Request timed out after 30 seconds');
} else if (fetchError.message.includes('fetch failed')) {
  console.error('Network request failed - check firewall/VPN');
}
```

### Frontend Improvements (`app/integrations/page.tsx`)
```typescript
// Now shows helpful error dialogs
if (result.details?.includes('fetch failed')) {
  errorMessage = 
    `Network error: Cannot reach Nango API\n\n` +
    `Possible causes:\n` +
    `• No internet connection\n` +
    `• Firewall blocking api.nango.dev\n` +
    `• VPN/proxy issues`;
}
```

## Step-by-Step Troubleshooting

### Step 1: Run Diagnostic
```
http://localhost:3000/api/debug/test-nango-connection
```

### Step 2: Check Results
- **All PASS** → Network is fine, issue is elsewhere
- **Connectivity FAIL** → Network/firewall issue
- **DNS FAIL** → DNS configuration problem

### Step 3: Apply Fix Based on Results

**If DNS fails:**
```powershell
ipconfig /flushdns
nslookup api.nango.dev
```

**If connectivity fails:**
```powershell
# Test direct connection
Test-NetConnection api.nango.dev -Port 443 -InformationLevel Detailed
```

**If timeout:**
- Check if VPN is enabled
- Try mobile hotspot
- Contact IT about firewall

### Step 4: Verify Fix
1. Disconnect the integration in UI
2. Clear localStorage: DevTools → Application → Local Storage → Clear
3. Reconnect and fetch data
4. Check terminal for success logs

## Alternative: Use Nango SDK Instead of REST API

If REST API continues to fail, we can switch to using the Nango Node SDK which might handle network issues better:

```typescript
// Instead of direct fetch
const connections = await nango.listConnections();
```

Would you like me to implement this alternative approach?

## Expected Success Logs

When working correctly, you should see:
```
[CHECK-CONNECTION] Checking connection for integration: google-ads-9fyg
[CHECK-CONNECTION] Calling Nango REST API: GET /connection
[CHECK-CONNECTION] REST API response status: 200
[CHECK-CONNECTION] Total connections: 4
[CHECK-CONNECTION] Connections for google-ads-9fyg: 1
[CHECK-CONNECTION] ✅ Found connection! connectionId: abc-123
```

## Still Having Issues?

### Quick Workaround: Use Cached Connection

If network issues persist, we can modify the code to work offline with cached connections:

1. Connect once when network is stable
2. Use cached connection data for subsequent fetches
3. Only verify connection periodically (e.g., every 5 minutes)

Let me know if you need this implemented!

## Summary

✅ **Fixes Applied:**
- Increased timeout from 10s to 30s
- Better error messages in UI and backend
- Created network diagnostic tool
- Added detailed troubleshooting guide

🔧 **Next Action:**
Run the diagnostic: `http://localhost:3000/api/debug/test-nango-connection`

