# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm, yarn, or pnpm installed
- [ ] A Nango.dev account (free tier works)

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Configure Nango (2 min)

1. Visit [https://app.nango.dev/](https://app.nango.dev/)
2. Sign up/login
3. Copy your keys from Settings → API Keys
4. Create `.env.local`:

```bash
cp .env.local.example .env.local
```

5. Edit `.env.local` and paste your keys

### Step 3: Run the App (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Try the Editor (1 min)

1. Click "Open Page Editor"
2. Click "Enable Editor Mode"
3. Click any text element
4. Edit content in sidebar
5. See changes instantly!

## That's It! 🎉

You can now:
- ✅ Use the page editor (works immediately)
- 🔜 Connect APIs (requires OAuth setup - see full guide below)

## To Enable API Integrations

The editor works out of the box, but API integrations require additional setup:

### Quick API Setup (15-30 min per integration)

1. **Choose an integration** (start with one):
   - HubSpot (easiest)
   - Shopify
   - Google Ads
   - LinkedIn Ads

2. **Follow the detailed guide**:
   - See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
   - Each integration needs OAuth credentials
   - Configure in Nango dashboard

3. **Test the integration**:
   - Go to "Manage Integrations"
   - Click "Connect"
   - Complete OAuth flow
   - Click "Fetch Data"

## What Works Right Now (No Setup)

### Page Editor ✅
- Edit headlines
- Change colors
- Modify buttons
- Update text
- Change links
- All changes save locally

### What Needs Setup

### API Integrations 🔐
- Requires Nango account ✅ (you have this)
- Requires OAuth configuration ⏳ (15-30 min per platform)
- Requires platform API access ⏳ (varies)

## Recommended Learning Path

### Day 1: Get Familiar
1. ✅ Run the app
2. ✅ Try the page editor
3. ✅ Edit demo page
4. ✅ Explore the UI

### Day 2: First Integration
1. 🔐 Pick HubSpot (easiest)
2. 🔐 Create HubSpot developer account
3. 🔐 Configure OAuth in Nango
4. 🔐 Test connection

### Day 3: More Integrations
1. 🔐 Add Shopify or Google Ads
2. 🔐 Configure OAuth
3. 🔐 Fetch live data

### Day 4: Customize
1. 🎨 Modify the demo page
2. 🎨 Add your branding
3. 🎨 Create new editable sections

## Common Questions

### Q: Do I need all 4 integrations?
**A:** No! Start with one or even zero. The editor works standalone.

### Q: Can I use this without Nango?
**A:** The editor works without any setup. APIs require Nango.

### Q: Is this production-ready?
**A:** It's a demonstration. You'll need to add:
- Authentication
- Database persistence
- Error boundaries
- Rate limiting
- Testing

### Q: How much does it cost?
**A:** 
- Nango: Free tier available
- HubSpot: Free developer account
- Shopify: Free partner account
- Google Ads: Requires active ad account
- LinkedIn Ads: Requires active ad account

### Q: Can I deploy this?
**A:** Yes! Works on:
- Vercel (recommended)
- Netlify
- AWS
- Any Node.js host

## Project Structure

```
nango-integration-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── editor/            # Page editor
│   ├── integrations/      # API dashboard
│   └── page.tsx           # Home page
├── lib/                   # Utilities
│   ├── nango-*.ts        # Nango helpers
│   └── editor-utils.ts   # Editor logic
├── .env.local            # Your API keys (create this)
└── README.md             # Full documentation
```

## Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Editor not working
- Check browser console for errors
- Try clearing localStorage
- Refresh the page
- Ensure JavaScript is enabled

### OAuth errors
- Verify keys in `.env.local`
- Check Nango dashboard for status
- See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## Get Help

- 📖 [Full README](./README.md)
- 🔧 [Setup Guide](./SETUP_GUIDE.md)
- ✏️ [Editor Guide](./EDITOR_GUIDE.md)
- 🌐 [Nango Docs](https://docs.nango.dev)

## Next Steps

Choose your path:

### Path A: Editor Focus
1. ✅ Customize demo page
2. ✅ Add more editable elements
3. ✅ Build your own pages
4. 🔜 Add API integrations later

### Path B: Integration Focus
1. 🔐 Set up one integration
2. 🔐 Fetch live data
3. 🔐 Add more integrations
4. ✅ Try editor later

### Path C: Full Stack
1. ✅ Master the editor
2. 🔐 Add all integrations
3. 🎨 Build custom features
4. 🚀 Deploy to production

## Tips for Success

1. **Start simple**: Use the editor first
2. **One at a time**: Add integrations incrementally
3. **Read errors**: Console messages are helpful
4. **Check docs**: Nango docs are comprehensive
5. **Ask for help**: Open GitHub issues

---

Happy building! 🚀

