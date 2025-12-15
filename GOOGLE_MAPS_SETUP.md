# Google Maps API Setup Guide

## Overview
The booking form uses Google Maps Places Autocomplete to provide address suggestions as users type. This requires a Google Maps API key.

## Setup Steps

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** (required for address autocomplete)
   - **Maps JavaScript API** (optional, for future map features)

### 2. Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key

### 3. Restrict API Key (Recommended)

For security, restrict your API key:
1. Click on your API key to edit it
2. Under **API restrictions**, select "Restrict key"
3. Choose "Maps JavaScript API" and "Places API"
4. Under **Website restrictions**, add your domain (e.g., `http://localhost:3000` for development)

### 4. Add API Key to Project

1. Create a `.env.local` file in the `frontend` directory (if it doesn't exist)
2. Add your API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

3. Restart your Next.js development server:
```bash
npm run dev
```

## Important Notes

- The API key starts with `NEXT_PUBLIC_` so it's available in the browser
- Never commit your `.env.local` file to version control
- For production, set the API key in your hosting platform's environment variables

## Testing

After setup, the address fields in the booking form should show Google Places suggestions as you type.

