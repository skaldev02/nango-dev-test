# Storage Quick Reference

## Quick Access

```typescript
import { storage } from '@/lib/storage-utils';

// Get user ID
const userId = storage.getUserId();

// Store connection
storage.storeConnection({
  integrationId: 'hubspot',
  userId: userId,
  connectionId: userId,
  connectedAt: Date.now()
});

// Check connection
const hasConnection = storage.hasValidConnection('hubspot', userId);

// Get connection details
const connection = storage.getConnection('hubspot', userId);

// Store token
storage.storeToken('hubspot', 'token_123', 3600); // expires in 1 hour

// Get token
const token = storage.getToken('hubspot');

// Disconnect (clear everything for integration)
storage.clearIntegration('hubspot', userId);

// Clear all data
storage.clearAll();

// Debug info
console.log(storage.getStats());
```

## localStorage Keys

| Key | Data | Example |
|-----|------|---------|
| `nango_user_id` | String | `"user-1234567-abc123"` |
| `nango_session` | JSON | `{"userId":"...","createdAt":...}` |
| `nango_connections` | JSON Array | `[{integrationId:"hubspot",...}]` |
| `nango_tokens` | JSON Object | `{"hubspot":{token:"...",storedAt:...}}` |
| `nango_data_{userId}` | JSON Object | `{"hubspot":{contacts:[...],...}}` |

## Common Patterns

### On App Init
```typescript
// Get or create user ID
const userId = storage.getUserId();

// Initialize session (auto-creates if needed)
storage.getSession();

// Check existing connections
const connections = storage.getAllConnections();
```

### On Successful OAuth
```typescript
// Store connection
storage.storeConnection({
  integrationId,
  userId,
  connectionId: userId,
  connectedAt: Date.now(),
});
```

### On Data Fetch
```typescript
// Cache the data
const cacheKey = `nango_data_${userId}`;
localStorage.setItem(cacheKey, JSON.stringify(data));
```

### On Disconnect
```typescript
// Clear integration data
storage.clearIntegration(integrationId, userId);

// Clear cached data
const cacheKey = `nango_data_${userId}`;
const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
delete cached[integrationId];
localStorage.setItem(cacheKey, JSON.stringify(cached));
```

## Expiration Times

- **Session:** 30 days of inactivity
- **Connections:** Optional (set `expiresAt` field)
- **Tokens:** Optional (set TTL in seconds)
- **Cached Data:** No auto-expiration (manual refresh)

## Best Practices

1. ✅ Always use `storage` singleton
2. ✅ Check `hasValidConnection()` before using cached data
3. ✅ Handle localStorage errors gracefully (try-catch)
4. ✅ Clear data on disconnect
5. ✅ Don't store sensitive data
6. ❌ Don't store OAuth tokens (Nango handles this)
7. ❌ Don't store large binary data

## Debug Commands (Browser Console)

```javascript
// View all connections
console.log(JSON.parse(localStorage.getItem('nango_connections')));

// View session
console.log(JSON.parse(localStorage.getItem('nango_session')));

// View storage stats
console.log(storage.getStats());

// Clear all Nango data
storage.clearAll();

// Check storage size
let total = 0;
for (let key in localStorage) {
  if (key.startsWith('nango_')) {
    total += localStorage.getItem(key).length;
  }
}
console.log(`Total storage: ${(total / 1024).toFixed(2)} KB`);
```

