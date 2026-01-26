# Architecture Comparison: Before vs After Migration

## 🔴 OLD ARCHITECTURE (Deprecated)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  .env.local                                        │    │
│  │  NEXT_PUBLIC_NANGO_PUBLIC_KEY=pub_xxx ⚠️ EXPOSED │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  lib/nango-client.ts                               │    │
│  │  new Nango({ publicKey: NANGO_PUBLIC_KEY })       │    │
│  │  ⚠️ Public key in frontend bundle                 │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  User clicks "Connect"                             │    │
│  │  nango.auth('hubspot', 'user-hubspot')            │    │
│  │  ⚠️ Predictable connection ID                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
                  OAuth Flow Starts
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    NANGO PLATFORM                           │
│  • Uses public key for auth (less secure)                  │
│  • Creates connection with manual ID: "user-hubspot"       │
│  • No user metadata attached                               │
└─────────────────────────────────────────────────────────────┘

⚠️ SECURITY ISSUES:
- Public key exposed in frontend JavaScript
- Predictable connection IDs (user-hubspot, user-shopify, etc.)
- No automatic user association
- Requires manual HMAC signatures for security
```

---

## 🟢 NEW ARCHITECTURE (Current - Secure)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  No API keys stored ✅                             │    │
│  │  Tokens generated on-demand                        │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  User clicks "Connect"                             │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  app/integrations/page.tsx                         │    │
│  │  const userId = getUserId() // from localStorage   │    │
│  │  Request: POST /api/nango/create-connect-session  │    │
│  │  Body: { integrationId, userId }                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  .env.local (SERVER ONLY)                          │    │
│  │  NANGO_SECRET_KEY=sec_xxx ✅ NOT EXPOSED          │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  app/api/nango/create-connect-session/route.ts    │    │
│  │  nango.createConnectSession({                      │    │
│  │    end_user: { id: userId, email, name },         │    │
│  │    allowed_integrations: [integrationId],         │    │
│  │    integration_id: integrationId                  │    │
│  │  })                                               │    │
│  │  ✅ Secure server-side token generation           │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  Returns: { connectSessionToken: "cst_xxx..." } ⏱️ SHORT-LIVED
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  lib/nango-client.ts                               │    │
│  │  const nango = new Nango({                         │    │
│  │    connectSessionToken: token                      │    │
│  │  })                                                │    │
│  │  nango.auth('hubspot') // No manual ID!           │    │
│  │  ✅ Token-based, secure initialization             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
                  OAuth Flow Starts
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    NANGO PLATFORM                           │
│  • Uses Connect session token (more secure) ✅             │
│  • Generates RANDOM connection ID: "conn_abc123xyz"        │
│  • Automatically attaches user metadata                     │
│  • Returns connectionId to backend via webhook              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    FUTURE REQUESTS                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Frontend: "Fetch Data" (sends userId)            │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Backend: lib/nango-server.ts                      │    │
│  │  getConnectionIdForUser(integrationId, userId)    │    │
│  │  → Looks up random connection ID automatically     │    │
│  │  → Uses that ID to fetch data                      │    │
│  │  ✅ User never needs to know the connection ID     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

✅ SECURITY IMPROVEMENTS:
- No API keys in frontend JavaScript
- Random, unpredictable connection IDs
- Automatic user association
- Short-lived tokens (expire quickly)
- Secure by default (no HMAC needed)
- Server-side token generation
```

---

## 🔄 Flow Comparison

### Authentication Flow

#### OLD (Deprecated):
```
1. Frontend loads with public key embedded
2. User clicks "Connect"
3. Frontend directly calls Nango with public key + manual connection ID
4. OAuth completes with predictable ID
```

#### NEW (Secure):
```
1. Frontend has no keys
2. User clicks "Connect"
3. Frontend → Backend: "Create Connect session"
4. Backend → Nango: "Generate token" (using secret key)
5. Backend → Frontend: Returns token
6. Frontend → Nango: Auth with token
7. Nango generates random connection ID
8. OAuth completes securely
```

### Data Fetching Flow

#### OLD (Deprecated):
```
Frontend: "Fetch data for user-hubspot"
   ↓
Backend: Uses hardcoded "user-hubspot" ID
   ↓
Nango: Returns data
```

#### NEW (Secure):
```
Frontend: "Fetch data for user123"
   ↓
Backend: Looks up which connection belongs to user123
   ↓
Backend: Finds "conn_abc123xyz"
   ↓
Backend: Fetches data using that connection
   ↓
Returns data to frontend
```

---

## 📊 Component Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                         USER BROWSER                          │
│                                                               │
│  ┌────────────────┐    ┌─────────────────────────────┐      │
│  │  Local Storage │────│ nango_user_id: user-12345   │      │
│  └────────────────┘    └─────────────────────────────┘      │
│         ↓                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │   app/integrations/page.tsx              │               │
│  │   - Displays integration cards           │               │
│  │   - Manages connection state             │               │
│  │   - Handles "Connect" button clicks      │               │
│  └──────────────────────────────────────────┘               │
│         ↓                          ↑                          │
│  ┌──────────────────────────────────────────┐               │
│  │   lib/nango-client.ts                    │               │
│  │   - Requests Connect session tokens      │               │
│  │   - Initializes Nango SDK with token     │               │
│  │   - Triggers OAuth flows                 │               │
│  └──────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────┘
                          ↕ HTTPS
┌───────────────────────────────────────────────────────────────┐
│                       YOUR BACKEND                            │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │   app/api/nango/                         │               │
│  │   ├── create-connect-session/route.ts    │  🆕 NEW       │
│  │   └── check-connection/route.ts          │  ✏️ UPDATED   │
│  └──────────────────────────────────────────┘               │
│         ↓                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │   app/api/integrations/                  │               │
│  │   └── fetch-data/route.ts                │  ✏️ UPDATED   │
│  └──────────────────────────────────────────┘               │
│         ↓                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │   lib/nango-server.ts                    │  ✏️ UPDATED   │
│  │   - Creates Connect sessions             │               │
│  │   - Looks up connections by user ID      │               │
│  │   - Proxies API requests                 │               │
│  └──────────────────────────────────────────┘               │
│         ↓                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │   Environment Variables                  │               │
│  │   NANGO_SECRET_KEY=sec_xxx              │  🔒 SECURE    │
│  └──────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────┘
                          ↕ HTTPS (with secret key)
┌───────────────────────────────────────────────────────────────┐
│                      NANGO PLATFORM                           │
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │   Connect Session API                    │               │
│  │   - Validates secret key                 │               │
│  │   - Generates short-lived tokens         │               │
│  │   - Returns connectSessionToken          │               │
│  └──────────────────────────────────────────┘               │
│         ↓                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │   OAuth Handler                          │               │
│  │   - Validates Connect session token      │               │
│  │   - Generates random connection ID       │               │
│  │   - Stores user metadata                 │               │
│  │   - Manages OAuth flows                  │               │
│  └──────────────────────────────────────────┘               │
│         ↓                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │   Connection Database                    │               │
│  │   {                                      │               │
│  │     connection_id: "conn_abc123xyz",    │  🎲 RANDOM    │
│  │     provider: "hubspot",                │               │
│  │     end_user: {                         │               │
│  │       id: "user-12345",                 │  👤 USER      │
│  │       email: "...",                     │               │
│  │     },                                  │               │
│  │     credentials: { ... }                │  🔒 SECURE    │
│  │   }                                      │               │
│  └──────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

### Layer 1: No Frontend Keys ✅
- **Before**: Public key in frontend bundle
- **After**: No keys in frontend at all

### Layer 2: Server-Side Token Generation ✅
- **Before**: Frontend directly uses public key
- **After**: Backend generates tokens using secret key

### Layer 3: Short-Lived Tokens ✅
- **Before**: Public key never expires
- **After**: Connect session tokens expire quickly

### Layer 4: Random Connection IDs ✅
- **Before**: Predictable IDs (user-hubspot, user-shopify)
- **After**: Random IDs (conn_a2k9x, conn_m3p7q)

### Layer 5: User Association ✅
- **Before**: Manual user tracking needed
- **After**: Automatic user metadata attachment

---

## 📈 Benefits Summary

| Aspect | Old | New | Improvement |
|--------|-----|-----|-------------|
| Frontend Security | Public key exposed | No keys | 🟢 Much better |
| Connection IDs | Predictable | Random | 🟢 Much better |
| Token Lifetime | Permanent | Short-lived | 🟢 Much better |
| User Tracking | Manual | Automatic | 🟢 Much better |
| HMAC Required | Yes | No | 🟢 Simpler |
| Setup Complexity | Medium | Low | 🟢 Simpler |

---

**This architecture is:**
- ✅ More secure
- ✅ Easier to use
- ✅ Better for scaling
- ✅ Future-proof
- ✅ Industry best practice

*Architecture updated: January 22, 2026*
