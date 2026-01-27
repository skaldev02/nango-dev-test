# 🔍 Debug: Auto-Close Not Working - Investigation

## Changes Made

Added comprehensive logging to diagnose why the popup isn't auto-closing and data isn't being fetched.

### Files Modified

1. **`lib/nango-server.ts`** - Added detailed connection check logging
2. **`lib/nango-client.ts`** - Added polling check logging
3. **`app/api/nango/create-connect-session/route.ts`** - Added userId logging

## 🧪 Next Test Steps

### 1. Clear Previous Data
Open browser console (F12) and run:
```javascript
localStorage.clear();
```

### 2. Reload Page
Refresh: http://localhost:3000/integrations

### 3. Click "Connect" on HubSpot

### 4. Watch Both Consoles

**Browser Console** should show:
```
[Nango] Starting authentication for: hubspot userId: user-XXXXX
[Nango] Opening Connect UI at: https://connect.nango.dev/...
[Nango] Polling connection check...
[Nango] Connection check result: false
[Nango] Polling connection check...
[Nango] Connection check result: false
... (continues until success) ...
[Nango] Polling connection check...
[Nango] Connection check result: true   ← Should happen after OAuth
[Nango] ✅ Connection detected as successful! Will auto-close popup in 2 seconds...
[Nango] Time since success: 0 ms
[Nango] Time since success: 1000 ms
[Nango] Time since success: 2000 ms
[Nango] Auto-closing popup after success confirmation
[Nango] Popup closed successfully
```

**Terminal (Backend)** should show:
```
[CONNECT] Creating session for end_user.id: user-XXXXX
[CONNECT] Successfully created connect session

... after OAuth completes ...

[CHECK-CONNECTION] Checking connection for integration: hubspot, userId: user-XXXXX
[CHECK-CONNECTION] Raw response type: object
[CHECK-CONNECTION] Response is array: false
[CHECK-CONNECTION] Connections list length: 1
[CHECK-CONNECTION] First connection structure: {
  "connection_id": "...",
  "end_user": {
    "id": "user-XXXXX"  ← This should match!
  },
  ...
}
[CHECK-CONNECTION] Connection 0: end_user.id = user-XXXXX, connection_id = ...
[CHECK-CONNECTION] ✅ Found connection! connectionId: ...
```

## 🔍 What to Look For

### Issue 1: userId Mismatch
**Symptom**: Backend shows different `end_user.id` than client is checking

**Look for**:
- `[CONNECT] Creating session for end_user.id: user-XXXXX`
- `[CHECK-CONNECTION] Looking for userId: user-YYYYY` (different!)

**Cause**: userId is being regenerated on each page load

### Issue 2: Connection Not Created
**Symptom**: `[CHECK-CONNECTION] Connections list length: 0`

**Possible causes**:
- OAuth wasn't completed
- Integration ID mismatch
- Nango API error

### Issue 3: Connection Structure Different
**Symptom**: Connection exists but `end_user` field is different

**Look for**:
- `[CHECK-CONNECTION] First connection structure:` - check the actual structure
- Maybe it's `user` instead of `end_user`?
- Maybe it's `userId` instead of `id`?

### Issue 4: Polling Not Running
**Symptom**: No `[Nango] Polling connection check...` messages

**Cause**: Popup window might not be opening correctly

## 📊 Expected Behavior

1. **Create Session**: userId is generated and session created
2. **Popup Opens**: User completes OAuth
3. **Polling Detects**: `checkConnection` returns true
4. **2 Second Wait**: User sees success message
5. **Auto-Close**: Popup closes
6. **Data Fetch**: Data fetches automatically
7. **Display**: Data shows in UI

## 🐛 Current Issue

Based on the screenshot:
- ✅ Popup opens
- ✅ OAuth completes
- ✅ "Success" message shows
- ❌ Popup doesn't auto-close
- ❌ Data doesn't fetch

This suggests: **Connection check is returning `false`**

## 🔧 Solution Strategy

After reviewing the logs:

1. **If userId mismatch** → Fix userId persistence
2. **If connection not found** → Check Nango API integration
3. **If structure different** → Update field names in check
4. **If polling not running** → Check popup window opening

## 📝 Please Share Logs

After testing, please share:
1. Browser console logs (all `[Nango]` messages)
2. Terminal logs (all `[CHECK-CONNECTION]` messages)
3. What the userId values are in both places

This will help identify the exact issue!

