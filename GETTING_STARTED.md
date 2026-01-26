# Getting Started

## Welcome! 👋

This guide will get you up and running in **under 5 minutes**.

## What You're Building

A full-featured application with:
1. **Live API Integrations** - Real data from HubSpot, Google Ads, Shopify, LinkedIn
2. **Visual Page Editor** - Edit websites like HubSpot/Elementor

## Prerequisites

Check you have these installed:

```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

Don't have Node.js? [Download here](https://nodejs.org/)

## Step 1: Install Dependencies (2 min)

Open your terminal in the project directory and run:

```bash
npm install
```

You'll see packages being installed. This might take 1-2 minutes.

## Step 2: Set Up Nango (2 min)

### Get Your Free Nango Account

1. Go to [https://www.nango.dev](https://www.nango.dev)
2. Click "Sign Up" (free, no credit card needed)
3. Create a new project
4. Go to **Settings → API Keys**
5. Copy your **Secret Key** (starts with `sec_`)

**Note**: As of January 2025, public keys are deprecated. This app uses the new secure Connect session authentication.

### Configure Environment Variables

Create a file named `.env.local` in the project root:

**Windows (PowerShell):**
```powershell
Copy-Item .env.local.example .env.local
notepad .env.local
```

**Mac/Linux:**
```bash
cp .env.local.example .env.local
nano .env.local
```

Paste your keys:
```env
NANGO_SECRET_KEY=sec_your_actual_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Save and close the file.

**Security Note**: This app uses Connect session authentication - a secure, token-based method that replaced the deprecated public key approach.

## Step 3: Start the Application (1 min)

Run the development server:

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

## Step 4: Open in Browser

Open [http://localhost:3000](http://localhost:3000)

You should see:
- **Home page** with two main cards
- **API Integrations** button
- **Visual Page Editor** button

## Step 5: Try the Page Editor (No Setup Required!)

The page editor works **immediately without any additional setup**:

1. Click **"Open Page Editor"**
2. Click **"Enable Editor Mode"** (blue button)
3. Click on any text (headlines, buttons, etc.)
4. Edit in the sidebar:
   - Change text
   - Pick colors
   - Adjust font sizes
   - Update button links
5. See changes instantly!
6. Refresh the page - changes persist!

**🎉 Congratulations!** The editor is fully functional.

## Step 6: Try API Integrations (Optional)

To test API integrations, you need to set up OAuth (15-30 min per platform).

### Quick Test Without OAuth

1. Click **"Manage Integrations"**
2. See all 4 integration cards (HubSpot, Google Ads, Shopify, LinkedIn)
3. The UI is fully functional
4. To actually connect, you need OAuth credentials

### Setting Up Your First Integration

**We recommend starting with HubSpot (easiest):**

1. **Read the guide**: Open [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Follow HubSpot section**: Step-by-step OAuth setup
3. **Test connection**: Click "Connect" and complete OAuth
4. **Fetch data**: Click "Fetch Data" to see live data

**This takes about 15-30 minutes for your first integration.**

## What Works Right Now (No Additional Setup)

✅ **Home page** - Fully functional
✅ **Page editor** - Complete with all features:
- Element selection
- Content editing
- Color changes
- Style updates
- Link management
- Persistence

✅ **Integration UI** - Fully designed and functional
❌ **API connections** - Requires OAuth setup (optional)

## Troubleshooting

### Error: "Cannot find module"

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

**Option 1: Use different port**
```bash
PORT=3001 npm run dev
```

**Option 2: Kill process on port 3000**

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill
```

### Error: "Environment variable not found"

Make sure you created `.env.local` in the project root (not in a subfolder).

### Page editor not working

1. Check browser console for errors (F12)
2. Try in incognito/private mode
3. Clear browser cache
4. Ensure JavaScript is enabled

### OAuth not working

1. Verify keys in `.env.local` are correct
2. No spaces or quotes around keys
3. Restart dev server after changing `.env.local`

## Project Structure Overview

```
📦 Your Project
├── 📄 .env.local           ← You create this (API keys)
├── 📄 package.json         ← Dependencies
├── 📁 app/                 ← Next.js pages
│   ├── page.tsx           ← Home page
│   ├── editor/            ← Page editor
│   └── integrations/      ← API integrations
└── 📁 lib/                 ← Utilities
```

## Quick Navigation

**Documentation:**
- [QUICKSTART.md](./QUICKSTART.md) - This file
- [README.md](./README.md) - Full documentation
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - OAuth setup
- [EDITOR_GUIDE.md](./EDITOR_GUIDE.md) - Editor features
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Overview

**In the App:**
- Home: [http://localhost:3000](http://localhost:3000)
- Editor: [http://localhost:3000/editor](http://localhost:3000/editor)
- Integrations: [http://localhost:3000/integrations](http://localhost:3000/integrations)

## What to Try Next

### Beginner Path (Today)
1. ✅ Run the app (done!)
2. ✅ Try the page editor
3. 📖 Read [EDITOR_GUIDE.md](./EDITOR_GUIDE.md)
4. 🎨 Customize the demo page

### Intermediate Path (This Week)
1. 📖 Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. 🔐 Set up one OAuth integration
3. 🧪 Test with real data
4. 🚀 Add more integrations

### Advanced Path (This Month)
1. 🎨 Customize the design
2. 🔧 Add new features
3. 🗃️ Add database
4. 🌐 Deploy to production

## Get Help

**Documentation:**
- All guides are in the root directory
- Check [README.md](./README.md) for comprehensive info

**Community:**
- [Nango Discord](https://nango.dev/discord)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

**Issues:**
- Open GitHub issue if something's broken
- Include error message and steps to reproduce

## Tips for Success

1. **Start with the editor** - It works immediately
2. **One integration at a time** - Don't try to set up all 4 at once
3. **Read the error messages** - They're usually helpful
4. **Check the console** - Browser DevTools (F12) show useful info
5. **Ask for help** - Better to ask than struggle

## Common Questions

**Q: Do I need all 4 integrations working?**
A: No! Even one is impressive. The editor works standalone.

**Q: Can I use this in production?**
A: Yes, but add authentication and database first.

**Q: Is this free?**
A: Yes! All tools have free tiers for development.

**Q: How long does setup take?**
A: App runs in 5 min. Each OAuth setup adds 15-30 min.

**Q: Can I customize this?**
A: Absolutely! It's your code now.

## Success!

If you can see the home page and edit elements, you're all set! 🎉

The page editor is **fully functional** right now.

API integrations require OAuth setup but the foundation is complete.

## Next Steps

**Right Now:**
- Explore the page editor
- Try all editing features
- Customize the demo page

**Next 30 Minutes:**
- Read [EDITOR_GUIDE.md](./EDITOR_GUIDE.md)
- Understand all editor features
- Try advanced editing

**Next 2 Hours:**
- Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Set up your first OAuth integration
- Fetch real data from an API

**This Week:**
- Set up all integrations
- Read [FEATURES.md](./FEATURES.md)
- Plan customizations

**This Month:**
- Deploy to production
- Add your own features
- Build something amazing!

---

**You're all set! Happy coding!** 🚀

Need help? Check the documentation or open an issue.

