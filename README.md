# Live API Integration & Page Editor

A full-featured application demonstrating real-time API integrations with HubSpot, Google Ads, Shopify, and LinkedIn Ads using Nango.dev, combined with a visual WYSIWYG page editor similar to HubSpot/Elementor.

## 🚀 Features

### 1. Real API Integrations (via Nango.dev)
- **HubSpot**: Fetch contacts, deals, companies, and activities
- **Google Ads**: Access campaigns, ad groups, keywords, and metrics
- **Shopify**: Retrieve products, orders, customers, and inventory
- **LinkedIn Ads**: Get campaigns, analytics, and audience insights

### 2. Visual Page Editor
- **Live DOM Manipulation**: Click and edit any element on the page
- **Content Editing**: Headlines, subheadlines, body text, and CTAs
- **Style Control**: Change colors, fonts, backgrounds, and more
- **Link Management**: Update button URLs and link targets
- **Persistence**: All changes are saved to localStorage
- **Real-time Updates**: See changes immediately as you type

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Nango.dev account (free tier available)
- API credentials for integrations you want to use:
  - HubSpot Developer Account
  - Google Ads API access
  - Shopify Partner Account
  - LinkedIn Ads API access

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Nango.dev

1. Sign up at [nango.dev](https://www.nango.dev)
2. Create a new project
3. Add integrations for each platform:

#### HubSpot Integration
- Go to Nango Dashboard → Integrations
- Add "HubSpot" integration
- Configure OAuth scopes: `crm.objects.contacts.read`, `crm.objects.deals.read`, `crm.objects.companies.read`
- Note your integration ID (usually `hubspot`)

#### Google Ads Integration
- Add "Google Ads" integration
- Configure OAuth scopes for campaign and metrics access
- Note your integration ID (usually `google-ads`)

#### Shopify Integration
- Add "Shopify" integration
- Configure OAuth scopes: `read_products`, `read_orders`, `read_customers`
- Note your integration ID (usually `shopify`)

#### LinkedIn Ads Integration
- Add "LinkedIn Ads" integration
- Configure OAuth scopes for ad account and campaign access
- Note your integration ID (usually `linkedin-ads`)

4. Copy your Nango secret key:
   - Secret Key (for backend - used to generate Connect session tokens)

**Note**: Public key authentication is deprecated as of January 2025. This app uses Connect session authentication (secure by default).

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NANGO_SECRET_KEY=your_nango_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure OAuth Credentials

For each integration, you need to configure OAuth credentials in the Nango dashboard:

#### HubSpot
1. Go to [HubSpot Developer Portal](https://developers.hubspot.com)
2. Create an app
3. Add OAuth redirect URL: Use the one provided by Nango
4. Copy Client ID and Client Secret to Nango

#### Google Ads
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable Google Ads API
3. Create OAuth 2.0 credentials
4. Add redirect URL from Nango
5. Copy credentials to Nango

#### Shopify
1. Go to [Shopify Partners](https://partners.shopify.com)
2. Create an app
3. Configure OAuth redirect URL from Nango
4. Copy API key and secret to Nango

#### LinkedIn Ads
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create an app
3. Add OAuth redirect URL from Nango
4. Copy Client ID and Client Secret to Nango

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### API Integrations

1. **Navigate to Integrations**: Click "Manage Integrations" on the home page
2. **Connect Platform**: Click "Connect" button for any integration
3. **OAuth Flow**: Complete the OAuth authentication in the popup
4. **Fetch Data**: Once connected, click "Fetch Data" to retrieve live data
5. **View Results**: See real-time data displayed in the integration card

### Page Editor

1. **Open Editor**: Click "Open Page Editor" on the home page
2. **Enable Editor Mode**: Click "Enable Editor Mode" in the toolbar
3. **Select Element**: Click on any highlighted element (headlines, buttons, etc.)
4. **Edit Properties**: Use the sidebar to modify:
   - Content text
   - Text color
   - Background color (for buttons)
   - Font size
   - Link URLs and targets
5. **See Changes Live**: Changes apply immediately to the page
6. **Persistence**: All edits are saved automatically to localStorage
7. **Reset**: Click "Reset" to restore original content

## 🏗️ Architecture

### Frontend (Next.js 14 + React)
- **App Router**: Modern Next.js routing with RSC
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Nango Frontend SDK**: OAuth handling

### Backend (Next.js API Routes)
- **Nango Node SDK**: Server-side API calls
- **Proxy Pattern**: Secure API communication via Nango
- **Type-safe APIs**: Full TypeScript support

### Editor System
- **DOM Manipulation**: Direct DOM updates with React
- **State Management**: Local state + localStorage persistence
- **Selector Generation**: Unique CSS selectors for elements
- **Real-time Preview**: Instant visual feedback

## 🔒 Security

- API keys stored in environment variables
- OAuth flows handled securely via Nango
- No direct API credentials in frontend code
- Server-side API calls via Next.js API routes

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── integrations/
│   │   │   └── fetch-data/
│   │   │       └── route.ts          # Data fetching endpoints
│   │   └── nango/
│   │       └── check-connection/
│   │           └── route.ts          # Connection status check
│   ├── editor/
│   │   └── page.tsx                  # Page editor UI
│   ├── integrations/
│   │   └── page.tsx                  # Integrations dashboard
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── lib/
│   ├── nango-config.ts              # Nango configuration
│   ├── nango-client.ts              # Client-side Nango utilities
│   ├── nango-server.ts              # Server-side Nango utilities
│   └── editor-utils.ts              # Editor helper functions
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Key Features Demonstrated

### Real API Integration ✅
- OAuth 2.0 authentication flows
- Token management via Nango
- Live data fetching from external APIs
- Error handling and connection status

### Visual Page Editor ✅
- Click-to-select elements
- Real-time content editing
- Style manipulation (colors, fonts)
- CTA button customization
- Link URL and target management
- Persistent state management
- Undo/redo capability (via localStorage)

## 🐛 Troubleshooting

### OAuth Issues
- Ensure redirect URLs match exactly in Nango and provider platforms
- Check OAuth scopes are correctly configured
- Verify API credentials are active

### Data Fetching Errors
- Confirm integration is connected (check connection status)
- Verify API endpoints are correct for provider
- Check Nango logs for detailed error messages

### Editor Not Working
- Ensure JavaScript is enabled
- Check browser console for errors
- Clear localStorage and refresh if state is corrupted

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
vercel --prod
```

Update environment variables in Vercel dashboard.

### Other Platforms
- Build: `npm run build`
- Start: `npm start`
- Ensure environment variables are set

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📞 Support

For Nango-specific issues, visit [Nango Documentation](https://docs.nango.dev)

For Next.js issues, visit [Next.js Documentation](https://nextjs.org/docs)

---

Built with ❤️ using Next.js 14, TypeScript, Tailwind CSS, and Nango.dev

