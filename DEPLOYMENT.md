# Deployment Guide

Deploy your application to production.

## Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is the easiest option for Next.js apps.

#### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your code in a Git repository

#### Steps

1. **Prepare for Deployment**

```bash
# Test production build locally
npm run build
npm start
```

2. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

3. **Deploy to Vercel**

**Option A: Via Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables:
   ```
   NANGO_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
   
   **Note**: Public key is deprecated. We now use Connect session authentication.
6. Click "Deploy"

**Option B: Via CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

4. **Update OAuth Redirect URLs**

After deployment, update redirect URLs in:
- Nango dashboard → use new Vercel URL
- HubSpot app settings
- Google Cloud Console
- Shopify app settings
- LinkedIn app settings

Format: `https://your-domain.vercel.app/api/nango/callback`

#### Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update environment variables with new domain

### Option 2: Netlify

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
```

2. **Configure Build**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3. **Deploy**

```bash
netlify deploy --prod
```

4. **Set Environment Variables**

```bash
netlify env:set NANGO_SECRET_KEY your_secret_key
netlify env:set NEXT_PUBLIC_APP_URL https://your-site.netlify.app
```

**Note**: Public key authentication is deprecated.

### Option 3: AWS Amplify

1. **Push to Git** (GitHub, GitLab, Bitbucket)

2. **Connect to Amplify**
   - Go to AWS Amplify Console
   - Click "New App" → "Host web app"
   - Connect your repository
   - Configure build settings:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm install
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: .next
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
     ```

3. **Add Environment Variables**
   - In Amplify Console → App Settings → Environment Variables
   - Add all keys from `.env.local`

### Option 4: Digital Ocean App Platform

1. **Create `app.yaml`**

```yaml
name: nango-integration-app
services:
- name: web
  github:
    repo: your-username/your-repo
    branch: main
  build_command: npm run build
  run_command: npm start
  envs:
  - key: NANGO_SECRET_KEY
    value: ${NANGO_SECRET_KEY}
  - key: NEXT_PUBLIC_APP_URL
    value: ${APP_URL}
```

2. **Deploy via Dashboard**
   - Connect GitHub
   - Select repository
   - Add environment variables
   - Deploy

### Option 5: Self-Hosted (VPS/Docker)

#### Using Node.js

1. **Build the App**

```bash
npm run build
```

2. **Transfer Files**

```bash
# Copy to server
scp -r .next package.json package-lock.json user@server:/var/www/app/
```

3. **On Server**

```bash
cd /var/www/app
npm install --production
npm start
```

4. **Use PM2 for Process Management**

```bash
npm install -g pm2
pm2 start npm --name "nango-app" -- start
pm2 save
pm2 startup
```

5. **Configure Nginx**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Using Docker

1. **Create `Dockerfile`**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Create `docker-compose.yml`**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NANGO_SECRET_KEY=${NANGO_SECRET_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

3. **Deploy**

```bash
docker-compose up -d
```

## Production Checklist

### Security
- [ ] Environment variables set correctly
- [ ] Secrets not in code/commits
- [ ] HTTPS enabled
- [ ] OAuth redirect URLs updated
- [ ] API rate limiting configured
- [ ] CORS configured properly

### Performance
- [ ] Built in production mode
- [ ] Static assets cached
- [ ] Images optimized
- [ ] Bundle size checked
- [ ] Lighthouse score > 90

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Uptime monitoring
- [ ] Log aggregation

### Testing
- [ ] All integrations tested
- [ ] Editor functionality verified
- [ ] Mobile responsive checked
- [ ] Cross-browser tested
- [ ] OAuth flows work

## Environment Variables for Production

```env
# Required
NANGO_SECRET_KEY=sec_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Note: Public key (NEXT_PUBLIC_NANGO_PUBLIC_KEY) is deprecated as of January 2025
# This app uses Connect session authentication (secure by default)

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Post-Deployment

### Update OAuth Redirect URLs

For each integration, update redirect URLs to your production domain:

**Format**: `https://yourdomain.com`

**Update in:**
1. Nango Dashboard
2. HubSpot Developer Portal
3. Google Cloud Console
4. Shopify Partners
5. LinkedIn Developers

### Test Everything

1. **Home Page**: Loads correctly
2. **Integrations Page**: 
   - OAuth flows work
   - Data fetches successfully
3. **Editor Page**:
   - Elements selectable
   - Changes save
   - Styles apply
4. **Mobile**: Responsive on all devices
5. **Performance**: Fast load times

### Monitor

Set up monitoring for:
- Error rates
- Response times
- API usage
- User actions

## Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors
npm run build

# Check for missing dependencies
npm install

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### OAuth Not Working

- Verify redirect URLs match exactly
- Check environment variables are set
- Ensure HTTPS is enabled
- Test in incognito mode

### 500 Errors

- Check server logs
- Verify environment variables
- Check Nango API status
- Review API rate limits

### Slow Performance

- Enable Next.js caching
- Use CDN for static assets
- Optimize images
- Check bundle size

## Scaling

### Horizontal Scaling

- Use load balancer
- Deploy multiple instances
- Share session state (Redis)
- Use CDN for static files

### Database

To add persistence:

1. Choose database (PostgreSQL, MongoDB)
2. Add connection string to env
3. Replace localStorage with DB calls
4. Add migrations

### Caching

Add Redis for:
- API response caching
- Session management
- Rate limiting

## Cost Estimates

### Free Tier (Hobby)
- Vercel: Free (hobby projects)
- Nango: Free tier
- Total: $0/month

### Production (Small)
- Vercel Pro: $20/month
- Nango: $50-100/month
- Domain: $10-15/year
- Total: ~$70-120/month

### Production (Scale)
- Vercel Enterprise: $150+/month
- Nango: $200+/month
- Monitoring: $50/month
- Total: $400+/month

## Backup & Recovery

### Backup Strategy

1. **Code**: Git repository
2. **Config**: Environment variables documented
3. **Data**: Regular database backups
4. **Logs**: Centralized logging

### Disaster Recovery

1. Keep `.env.local.example` updated
2. Document deployment steps
3. Test restoration procedure
4. Have rollback plan

## Support

### Getting Help

- [Vercel Support](https://vercel.com/support)
- [Nango Documentation](https://docs.nango.dev)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

### Community

- [Nango Discord](https://nango.dev/discord)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

Ready to deploy? Start with Vercel for the easiest experience!

