# Features Documentation

Complete documentation of all features in the application.

## Table of Contents

1. [API Integrations](#api-integrations)
2. [Visual Page Editor](#visual-page-editor)
3. [Architecture](#architecture)
4. [Data Flow](#data-flow)
5. [Security](#security)

---

## API Integrations

### Overview

The application provides real-time integration with 4 major platforms using Nango.dev for OAuth management and API access.

### Supported Platforms

#### 1. HubSpot CRM

**What It Does:**
- Connects to HubSpot CRM
- Fetches contacts, deals, and companies
- Real-time data synchronization

**Data Retrieved:**
- **Contacts**: Name, email, phone, company
- **Deals**: Deal name, amount, stage, owner
- **Companies**: Company name, domain, industry

**API Endpoints Used:**
- `/crm/v3/objects/contacts`
- `/crm/v3/objects/deals`
- `/crm/v3/objects/companies`

**OAuth Scopes Required:**
- `crm.objects.contacts.read`
- `crm.objects.deals.read`
- `crm.objects.companies.read`

**Use Cases:**
- CRM data synchronization
- Lead management
- Sales pipeline tracking
- Customer relationship analytics

#### 2. Google Ads

**What It Does:**
- Connects to Google Ads account
- Fetches campaign and performance data
- Retrieves ad metrics

**Data Retrieved:**
- **Campaigns**: Campaign ID, name, status
- **Metrics**: Impressions, clicks, CTR
- **Performance**: Cost, conversions, ROI

**API Endpoints Used:**
- `/v13/customers/search`
- Query-based data retrieval

**OAuth Scopes Required:**
- `https://www.googleapis.com/auth/adwords`

**Use Cases:**
- Ad campaign monitoring
- Performance analytics
- Budget tracking
- ROI analysis

#### 3. Shopify

**What It Does:**
- Connects to Shopify store
- Fetches products, orders, customers
- Retrieves inventory data

**Data Retrieved:**
- **Products**: Title, price, inventory, variants
- **Orders**: Order ID, total, items, status
- **Customers**: Name, email, orders count

**API Endpoints Used:**
- `/admin/api/2024-01/products.json`
- `/admin/api/2024-01/orders.json`
- `/admin/api/2024-01/customers.json`

**OAuth Scopes Required:**
- `read_products`
- `read_orders`
- `read_customers`
- `read_inventory`

**Use Cases:**
- E-commerce analytics
- Inventory management
- Order tracking
- Customer insights

#### 4. LinkedIn Ads

**What It Does:**
- Connects to LinkedIn Ads account
- Fetches campaign data
- Retrieves ad performance metrics

**Data Retrieved:**
- **Ad Accounts**: Account info, status
- **Campaigns**: Campaign details, budget
- **Analytics**: Impressions, clicks, engagement

**API Endpoints Used:**
- `/rest/adAccounts`
- `/rest/adCampaigns`

**OAuth Scopes Required:**
- `r_ads`
- `r_ads_reporting`

**Use Cases:**
- B2B advertising
- Professional campaign tracking
- Audience analytics
- Performance monitoring

### Integration Features

#### OAuth Authentication
- **Secure Flow**: Industry-standard OAuth 2.0
- **Popup Window**: Non-intrusive authentication
- **Auto-Close**: Popup closes after success
- **Token Management**: Handled by Nango
- **Refresh Tokens**: Automatic token refresh

#### Connection Management
- **Status Tracking**: Real-time connection status
- **Persistence**: Connections persist across sessions
- **Re-authentication**: Easy reconnection if expired
- **Multiple Accounts**: Support for multiple connections

#### Data Fetching
- **On-Demand**: Fetch data when needed
- **Real-Time**: Live data from APIs
- **Error Handling**: Graceful failure handling
- **Loading States**: Visual feedback during fetch

#### Data Display
- **Structured View**: Organized data presentation
- **Count Metrics**: Quick overview of data volumes
- **Live Updates**: Refresh to see latest data
- **Responsive Cards**: Mobile-friendly display

---

## Visual Page Editor

### Overview

A powerful WYSIWYG editor that allows real-time editing of webpage content, styles, and attributes - similar to HubSpot's page editor or Elementor.

### Core Features

#### 1. Element Selection

**How It Works:**
- Click on any element marked as editable
- Element highlights with blue border
- Properties load in sidebar
- Single selection at a time

**Visual Feedback:**
- Hover: Dashed blue outline
- Selected: Solid blue outline
- Label: Shows element type

**Supported Element Types:**
- Headlines (H1, H2)
- Subheadlines (H3, H4)
- Body text (paragraphs)
- Buttons (CTAs)
- Links (anchors)

#### 2. Content Editing

**Text Content:**
- Multi-line textarea input
- Real-time preview
- Supports line breaks
- Character limit: None (practical: 1000+)

**How Changes Apply:**
- Type in sidebar
- Changes apply instantly
- DOM updates in real-time
- No save button needed (auto-save)

**Use Cases:**
- Update headlines
- Change CTAs
- Modify descriptions
- Fix typos live

#### 3. Style Management

**Text Color:**
- Color picker interface
- Manual hex input
- RGB/RGBA support
- Named colors support
- Live preview

**Background Color:**
- For buttons and containers
- Same color picker
- Transparency support
- Gradient support (manual)

**Font Size:**
- Text input field
- Multiple units supported:
  - Pixels (px)
  - Rems (rem)
  - Ems (em)
  - Percentages (%)
- Live preview
- Responsive sizing

**Additional Styles:**
- Font weight (bold, normal)
- More styles can be added
- CSS property support

#### 4. Link Management

**URL Editing:**
- Full URLs: `https://example.com`
- Relative paths: `/page`
- Hash links: `#section`
- Email links: `mailto:`
- Phone links: `tel:`

**Target Options:**
- Same Tab (`_self`)
- New Tab (`_blank`)
- Dropdown selector
- Updates immediately

**Button Links:**
- Buttons can be links
- Full CTA customization
- URL + style control

#### 5. Persistence

**Auto-Save:**
- Every change saves automatically
- No manual save needed
- Instant persistence

**Storage:**
- LocalStorage used
- Browser-specific
- Survives page refresh
- Doesn't survive browser clear

**State Management:**
- Element-by-element tracking
- CSS selector mapping
- Property preservation
- History tracking (structure ready)

#### 6. Editor Controls

**Toolbar:**
- Enable/Disable editor mode
- Show/Hide sidebar
- Reset all changes
- Back to home

**Editor Modes:**
- **View Mode**: Normal page interaction
- **Edit Mode**: Element selection enabled

**Reset Function:**
- Confirmation dialog
- Clears all changes
- Restores originals
- Clears localStorage

### Technical Implementation

#### DOM Manipulation

**Selection Strategy:**
```typescript
// Elements marked with class and data attribute
<h1 className="editable-element" data-type="headline">
  Content
</h1>
```

**Selector Generation:**
- Unique CSS selectors
- ID-based (if available)
- Class-based fallback
- Position-based fallback
- nth-child support

**Change Application:**
```typescript
// Direct DOM updates
element.textContent = newContent;
element.style.color = newColor;
element.setAttribute('href', newUrl);
```

#### State Management

**Element Data Structure:**
```typescript
interface EditableElement {
  id: string;              // Unique ID
  type: ElementType;       // headline, button, etc.
  selector: string;        // CSS selector
  content: string;         // Text content
  styles: {                // Style properties
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
  };
  attributes: {            // HTML attributes
    href?: string;
    target?: string;
  };
}
```

**Persistence:**
```typescript
// Save to localStorage
localStorage.setItem('pageEditorState', JSON.stringify(state));

// Load on mount
const saved = localStorage.getItem('pageEditorState');
```

#### Real-Time Updates

**Change Flow:**
1. User edits in sidebar
2. State updates
3. DOM applies change
4. localStorage saves
5. Visual feedback

**Performance:**
- Debouncing for rapid changes
- Direct DOM manipulation
- No full re-renders
- Minimal overhead

---

## Architecture

### Frontend Stack

**Framework:** Next.js 14
- App Router
- React Server Components
- Client Components for interactivity
- TypeScript throughout

**Styling:** Tailwind CSS
- Utility-first approach
- Custom configurations
- Responsive design
- Dark mode ready

**State:** React Hooks + LocalStorage
- useState for UI state
- useEffect for side effects
- LocalStorage for persistence
- No external state library needed

### Backend Stack

**API Routes:** Next.js API Routes
- Serverless functions
- RESTful design
- TypeScript
- Error handling

**Integration Layer:** Nango.dev
- OAuth management
- API proxying
- Token refresh
- Connection storage

### Project Structure

```
app/
├── api/                    # Backend API routes
│   ├── integrations/
│   │   └── fetch-data/
│   │       └── route.ts   # Data fetching endpoint
│   └── nango/
│       └── check-connection/
│           └── route.ts   # Connection check
├── editor/
│   └── page.tsx           # Editor interface
├── integrations/
│   └── page.tsx           # Integrations dashboard
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Home page

lib/
├── nango-config.ts        # Nango configuration
├── nango-client.ts        # Client-side utilities
├── nango-server.ts        # Server-side utilities
└── editor-utils.ts        # Editor helpers
```

---

## Data Flow

### API Integration Flow

```
User Action (Click Connect)
  ↓
Frontend: nango-client.ts
  ↓
Nango SDK: OAuth Popup
  ↓
External Platform: Auth
  ↓
Nango: Store Connection
  ↓
Frontend: Update UI
```

### Data Fetch Flow

```
User Action (Click Fetch)
  ↓
Frontend: API Call
  ↓
Next.js API Route
  ↓
Nango Server SDK
  ↓
External API (via Nango Proxy)
  ↓
Response Processing
  ↓
Frontend: Display Data
```

### Editor Change Flow

```
User Edit (Type/Click)
  ↓
React State Update
  ↓
DOM Manipulation
  ↓
LocalStorage Save
  ↓
Visual Feedback
```

---

## Security

### Environment Variables
- Secrets in `.env.local`
- Never committed to Git
- Server-side only for sensitive keys
- Public keys for frontend only

### OAuth Security
- Industry-standard OAuth 2.0
- Nango handles token storage
- Secure token refresh
- No tokens in frontend code

### API Security
- All external calls via backend
- No CORS issues
- Rate limiting (via Nango)
- Error sanitization

### Input Validation
- Color format validation
- URL validation
- CSS value sanitization
- XSS prevention (React escaping)

### Data Privacy
- localStorage is client-side
- No server-side data storage
- No tracking or analytics
- User data stays local

---

## Extensibility

### Adding New Integrations

1. Add config to `INTEGRATION_CONFIGS`
2. Add OAuth setup in Nango
3. Add fetch function in API route
4. Test connection and data fetch

### Adding New Editor Features

1. Update `EditableElement` type
2. Add UI controls in sidebar
3. Implement change handler
4. Update `applyElementChanges`

### Adding Database

1. Choose database (PostgreSQL, MongoDB)
2. Add connection string
3. Replace localStorage with DB calls
4. Add authentication

### Adding User Accounts

1. Add auth provider (NextAuth, Clerk)
2. Protect API routes
3. Associate data with users
4. Add user dashboard

---

## Performance

### Optimization Strategies

**Code Splitting:**
- Next.js automatic splitting
- Route-based chunks
- Dynamic imports for heavy components

**Image Optimization:**
- Next.js Image component
- Automatic WebP conversion
- Lazy loading
- Responsive images

**Caching:**
- Static page caching
- API response caching (future)
- Browser caching headers

**Bundle Size:**
- Tree shaking
- Minification in production
- Only necessary dependencies

### Monitoring

**Metrics to Track:**
- Page load time
- Time to interactive
- API response times
- Error rates
- User actions

**Tools:**
- Lighthouse
- Web Vitals
- Vercel Analytics
- Custom logging

---

## Browser Support

**Tested and Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used:**
- ES6+ JavaScript
- CSS Grid/Flexbox
- LocalStorage API
- Fetch API
- CSS Custom Properties

**Fallbacks:**
- Graceful degradation
- Error boundaries
- Console warnings for old browsers

---

## Future Enhancements

### Planned Features

1. **Editor:**
   - Undo/redo functionality
   - Image editing
   - Drag and drop elements
   - Layout changes
   - Mobile responsive editing
   - Export to HTML/JSON

2. **Integrations:**
   - More platforms (Salesforce, Mailchimp)
   - Webhook support
   - Real-time sync
   - Bulk operations
   - Advanced filtering

3. **General:**
   - User authentication
   - Database persistence
   - Team collaboration
   - Version control
   - A/B testing
   - Analytics dashboard

---

This documentation covers all major features. For specific implementation details, see the code comments in each file.

