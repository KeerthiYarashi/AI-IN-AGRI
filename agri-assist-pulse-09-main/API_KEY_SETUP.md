# OpenWeatherMap API Key Setup

This app uses the OpenWeatherMap API for real-time weather data. Follow these steps to add your API key:

## Getting Your API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

## Adding the API Key to Your Project

Since this is a Vite-based React application, you need to add the API key as an environment variable:

### For Local Development:

1. Create a `.env.local` file in the root directory of your project (same level as `package.json`)
2. Add your API key with the `VITE_` prefix:

```
VITE_OPENWEATHERMAP_KEY=your_api_key_here
```

3. Restart your development server

### For Production (Lovable):

The API key is already configured in the code at `src/services/weatherService.ts`:

```typescript
private readonly API_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;
```

**Important Notes:**

- The `.env.local` file is already in `.gitignore` and won't be committed to git
- The API key will be visible in the browser's network requests (this is normal for client-side applications)
- OpenWeatherMap free tier includes 1,000 API calls per day, which should be sufficient for development
- The app will fall back to sample data if the API key is not configured

## Testing

After adding the API key:

1. Go to the Irrigation Predictor page
2. You should see real weather data based on your location
3. Check the browser console for any API-related messages

## Troubleshooting

- If you see "Using sample weather data" in the console, your API key might not be configured correctly
- Make sure the `.env.local` file is in the root directory
- Ensure the variable name starts with `VITE_`
- Restart the development server after adding the key
