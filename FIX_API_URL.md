# Fix API URL Configuration in Netlify

## Problem
Getting `404 Not Found` when trying to login. The frontend is calling `/auth/login` instead of `/api/auth/login`.

## Solution

The backend uses a global `/api` prefix for all routes. Your `NEXT_PUBLIC_API_URL` in Netlify must include `/api` at the end.

### Steps to Fix:

1. **Go to Netlify Dashboard**
   - Navigate to your site
   - Go to **Site settings** → **Environment variables**

2. **Update `NEXT_PUBLIC_API_URL`**
   - Find `NEXT_PUBLIC_API_URL` in the list
   - Current (WRONG): `https://gracious-growth-production-6d22.up.railway.app`
   - Change to (CORRECT): `https://gracious-growth-production-6d22.up.railway.app/api`
   - **Important:** The URL must end with `/api`

3. **Save and Redeploy**
   - Click **"Save"**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Wait for deployment to complete

4. **Verify**
   - After deployment, try logging in again
   - Check browser console - requests should now go to `/api/auth/login`

## Correct Environment Variable

```env
NEXT_PUBLIC_API_URL=https://gracious-growth-production-6d22.up.railway.app/api
```

## Why This Matters

- Backend routes are prefixed with `/api` (e.g., `/api/auth/login`, `/api/users`, etc.)
- Frontend's `API_BASE_URL` uses `NEXT_PUBLIC_API_URL` directly
- If `NEXT_PUBLIC_API_URL` doesn't include `/api`, requests go to wrong endpoints

## All API Endpoints

With the correct configuration, these endpoints will work:
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `GET /api/auth/me`
- ✅ `GET /api/users`
- ✅ `GET /api/rides`
- etc.
