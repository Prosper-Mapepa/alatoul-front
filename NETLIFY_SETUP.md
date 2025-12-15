# Netlify Deployment Setup Guide

## Quick Setup

1. **Connect Repository to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your GitHub repository
   - Select the frontend repository

2. **Configure Build Settings**
   - Netlify will auto-detect Next.js from `netlify.toml`
   - Build command: `npm run build` (already configured)
   - Publish directory: `.next` (already configured)

3. **Set Environment Variables**
   Go to **Site settings** → **Environment variables** and add:

   **Required:**
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL (e.g., `https://your-backend.railway.app/api`)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = Your Google Maps API key

   **Example:**
   ```
   NEXT_PUBLIC_API_URL=https://alatoul-api-production.up.railway.app/api
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Deploy**
   - Click **"Deploy site"**
   - Netlify will automatically build and deploy your Next.js app

## Environment Variables

### NEXT_PUBLIC_API_URL
Your Railway backend API URL. Make sure to:
- Include the `/api` path at the end
- Use `https://` (not `http://`)
- Get the URL from your Railway dashboard

Example: `https://alatoul-api-production.up.railway.app/api`

### NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Your Google Maps API key for:
- Address autocomplete
- Route mapping
- Live tracking

Get your key from [Google Cloud Console](https://console.cloud.google.com/)

## Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs for specific errors

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure Railway backend is running
- Check CORS settings on backend (should allow your Netlify domain)

### Routing Issues
- Next.js routing is handled automatically by `@netlify/plugin-nextjs`
- If you see 404s, check that the plugin is installed

### Images Not Loading
- Verify `images.domains` in `next.config.js` includes your image domains
- Check that images are in the `public` folder or properly referenced

## Post-Deployment

After successful deployment:
1. Test all pages and features
2. Verify API connections work
3. Check that Google Maps loads correctly
4. Test authentication flow
5. Verify WebSocket connections (if using)

## Continuous Deployment

Netlify automatically deploys when you push to your main branch. To deploy manually:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
