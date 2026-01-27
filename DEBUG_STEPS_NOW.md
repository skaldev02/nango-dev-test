# 🔧 Debug Steps - Popup Not Auto-Closing

## What I've Added

I've added comprehensive logging to help diagnose why the popup isn't auto-closing. The changes are already compiled and running on your dev server.

## 🧪 How to Test Now

### Step 1: Open Browser Console
1. Go to http://localhost:3000/integrations
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Clear the console (click trash icon or press Ctrl+L)

### Step 2: Clear LocalStorage (Important!)
In the browser console, run:
```javascript
localStorage.clear();
location.reload();
```

### Step 3: Connect to HubSpot
1. Click **"Connect"** on the HubSpot card
2. Complete OAuth authorization in the popup
3. Wait for "Success" message
4. **Keep popup open** and watch the logs

## 📊 What to Look For

### In Browser Console (F12)

You should see these logs **every 1 second** after "Success" appears:

```
[Nango] Polling connection check...
[Nango] Connection check result: false or true
```

**If you see this:**
```
[Nango] Connection check result: true
[Nango] ✅ Connection detected as successful! Will auto-close popup in 2 seconds...
[Nango] Time since success: 0 ms
[Nango] Time since success: 1000 ms
[Nango] Time since success: 2000 ms
[Nango] Auto-closing popup after success confirmation
```

**Then the popup SHOULD close** ✅

### In Terminal (Where `npm run dev` is running)

After clicking "Connect", look for:

```
[CONNECT] Creating session for end_user.id: user-XXXXX
```

Then after OAuth completes, you should see (every 1 second):

```
[CHECK-CONNECTION] Checking connection for integration: hubspot, userId: user-XXXXX
[CHECK-CONNECTION] Connections list length: X
[CHECK-CONNECTION] Connection 0: end_user.id = user-XXXXX, connection_id = ...
[CHECK-CONNECTION] ✅ Found connection! connectionId: ...
```

## 🐛 Possible Issues

### Issue 1: No Polling Logs in Browser
**Problem**: You don't see `[Nango] Polling connection check...`

**Means**: The polling loop isn't running

**Solution**: Refresh page and try again

### Issue 2: Connection Check Always Returns False
**In browser**: `[Nango] Connection check result: false` (keeps repeating)

**In terminal**: `[CHECK-CONNECTION] ❌ No connection found for userId: ...`

**Means**: The userId doesn't match or connection isn't being created

**Check**:
- Look at `[CONNECT] Creating session for end_user.id: USER_A`
- Compare with `[CHECK-CONNECTION] Looking for userId: USER_B`
- If USER_A ≠ USER_B, that's the problem!

### Issue 3: Connections List is Empty
**In terminal**: `[CHECK-CONNECTION] Connections list length: 0`

**Means**: No connection exists in Nango after OAuth

**Possible causes**:
- OAuth didn't complete successfully
- Integration ID mismatch
- Try reconnecting

### Issue 4: Connection Exists But Not Found
**In terminal**: 
```
[CHECK-CONNECTION] Connections list length: 1
[CHECK-CONNECTION] Connection 0: end_user.id = user-XXX, connection_id = ...
[CHECK-CONNECTION] ❌ No connection found for userId: user-YYY
```

**Means**: The userIds don't match! This is likely the issue.

## 🔍 Most Likely Issue

Based on the screenshot, I suspect the **userId is not persisting** between:
1. When the Connect session is created
2. When we check for the connection

**To verify**: Compare these two values in the logs:
- `[CONNECT] Creating session for end_user.id: ???`
- `[CHECK-CONNECTION] Looking for userId: ???`

If they're different, that's the bug!

## 📝 Next Steps

1. Test with the new logging
2. Share the console logs (browser + terminal)
3. I'll fix the exact issue based on what we see

## 🚀 Quick Test

Right now, try this:
1. Click "Connect" on HubSpot
2. Complete OAuth
3. Watch **both** browser console and terminal
4. Take a screenshot or copy the logs
5. Share what you see

The logs will tell us exactly what's wrong!

