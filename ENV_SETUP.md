# Quick Start: Updated Environment Setup

## Updated Environment Variables

Your `.env.local` file should now look like this:

```env
NANGO_SECRET_KEY=sec_your_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANT**: Remove `NEXT_PUBLIC_NANGO_PUBLIC_KEY` if you have it - it's no longer needed!

## Get Your Secret Key

1. Go to [https://app.nango.dev](https://app.nango.dev)
2. Navigate to **Settings → API Keys**
3. Copy your **Secret Key** (starts with `sec_`)
4. Paste it in `.env.local`

## What Changed?

This app now uses **Connect session authentication** instead of public keys:

- ✅ More secure (no keys in frontend)
- ✅ Short-lived tokens generated on-demand
- ✅ Random connection IDs for better security
- ✅ Compliant with Nango's new security standards

## Testing Your Setup

1. **Update your environment**:
   - Remove `NEXT_PUBLIC_NANGO_PUBLIC_KEY` from `.env.local`
   - Keep only `NANGO_SECRET_KEY`

2. **Restart your dev server**:
   ```bash
   npm run dev
   ```

3. **Test the integration**:
   - Go to `http://localhost:3000/integrations`
   - Click "Connect" on any integration
   - Complete the OAuth flow
   - Click "Fetch Data" to verify

## Troubleshooting

### Error: "Public key authentication is deprecated"
- **Solution**: You're still using the old public key. Update your `.env.local` and restart the server.

### Error: "Failed to create connect session"
- **Solution**: Check that `NANGO_SECRET_KEY` is correct and starts with `sec_`

### Error: "No connection found for this user"
- **Solution**: Click "Connect" first to establish a connection, then "Fetch Data"

## More Information

See `NANGO_MIGRATION.md` for complete migration details and technical documentation.

