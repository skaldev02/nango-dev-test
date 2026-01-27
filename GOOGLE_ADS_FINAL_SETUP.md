# ✅ Google Ads Developer Token Setup - FINAL STEP

## What I Just Did:

1. ✅ Added `GOOGLE_ADS_DEVELOPER_TOKEN` to your `.env.local` file
2. ✅ Updated the code to include the developer token in all Google Ads API requests
3. ✅ Added validation to check if the token exists

## What YOU Need To Do:

### Step 1: Add Your Developer Token

Open `.env.local` and replace `your_developer_token_here` with your actual Google Ads Developer Token:

```env
NEXT_PUBLIC_NANGO_PUBLIC_KEY=5c0b84d9-09d6-4fda-b76f-b624a7b9e5db
NANGO_SECRET_KEY=600849af-f1ee-4aaf-a854-71b566f75555
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_ADS_DEVELOPER_TOKEN=YOUR_ACTUAL_TOKEN_HERE  👈 Replace this!
GOOGLE_ADS_API_VERSION=v20  # optional (defaults to v20)
# GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890  # optional (often required for MCC/manager setups; no dashes)
```

### Step 2: Get Your Developer Token

If you don't have it handy:

1. Go to: https://ads.google.com
2. Navigate to: **Tools & Settings** → **Setup** → **API Center**
3. Copy your **Developer Token** (test account)
4. Paste it into `.env.local`

### Step 3: Restart Your Dev Server

**Important!** Environment variables only load when the server starts:

1. **Stop** your current dev server (Ctrl+C in the terminal)
2. **Start** it again:
   ```bash
   npm run dev
   ```

### Step 4: Test!

1. **Refresh your browser** (hard reload: Ctrl+Shift+R)
2. **Click "Refresh Data"** on Google Ads
3. **Watch the magic happen!** ✨

## Expected Success Output

You should now see:

### Terminal:
```
[GoogleAds] Developer token found: ABcdeFGH12...
[GoogleAds] Step 1: Fetching accessible customers...
[GoogleAds] Customers API response status: 200
[GoogleAds] Customer IDs found: 1
[GoogleAds] Using customer ID: 1234567890
[GoogleAds] Campaigns fetched: 5
[GoogleAds] Ad groups fetched: 10
```

### Browser:
```
✅ Data loaded successfully!
📊 Campaigns: 5
🎯 Ad Groups: 10
🔑 Keywords: 20
```

## If It Still Doesn't Work

Check:
1. ✅ Developer token is copied correctly (no extra spaces)
2. ✅ Dev server was restarted after adding the token
3. ✅ Token status in Google Ads is "Approved" (test accounts are auto-approved)
4. ✅ The Google Ads account has at least one active campaign

## Common Issues

**Error: "GOOGLE_ADS_DEVELOPER_TOKEN is not set"**
- Solution: Restart the dev server after updating `.env.local`

**Error: "Request failed with status code 401"**
- Solution: Check if your developer token is correct and approved

**Error: "No accessible customers found"**
- Solution: Make sure the Google account you connected has access to at least one Google Ads account

---

## Quick Commands:

**View your .env.local:**
```bash
cat .env.local
```

**Restart dev server:**
```bash
# Press Ctrl+C to stop, then:
npm run dev
```

---

**You're almost there! Just add your developer token and restart the server!** 🚀

