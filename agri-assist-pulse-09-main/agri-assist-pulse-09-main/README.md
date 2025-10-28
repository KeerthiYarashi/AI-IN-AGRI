# 🌾 AI Agri Assistant - Smart Farming PWA

A production-quality Progressive Web App (PWA) that provides smart farming solutions powered by AI. Features include market price forecasting, pest detection, irrigation optimization, and carbon footprint tracking.

## 🚀 Features

### 1. 📈 Market Price Forecaster
- AI-powered price predictions for crops
- Interactive charts showing historical and forecast data
- Best selling day recommendations
- Sample data for tomato, onion, potato, and wheat

### 2. 🐛 Pest & Disease Detection
- Client-side TensorFlow.js model support
- Plant.id API integration as fallback
- Organic remedy suggestions
- Camera upload and drag-drop support

### 3. 💧 Smart Irrigation Predictor
- Weather-based irrigation recommendations
- Soil moisture monitoring
- Crop-specific water requirements
- OpenWeatherMap integration

### 4. 🌍 Carbon Footprint Estimator
- Calculate emissions from fertilizers and machinery
- Per-hectare calculations
- Eco-friendly tips and recommendations
- Benchmark comparisons

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI/ML**: TensorFlow.js
- **PWA**: Service Worker + Manifest
- **UI Components**: shadcn/ui

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-agri-assistant

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

The app works fully offline with sample data, but you can configure these optional API integrations:

### Optional API Keys (use VITE_ prefix for Vite):

```env
# OpenWeatherMap API (for real weather data)
VITE_OPENWEATHERMAP_KEY=your_openweather_api_key

# Plant.id API (for enhanced pest detection)
VITE_PLANT_ID_API_KEY=your_plant_id_api_key

# Remote forecast URL (for live market data)
VITE_REMOTE_FORECAST_URL=https://your-api.com/forecasts
```

### How to get API keys:

1. **OpenWeatherMap**: 
   - Sign up at https://openweathermap.org/api
   - Get free API key (1000 calls/day)

2. **Plant.id**:
   - Register at https://plant.id/
   - Get API key for plant disease identification

## 📱 PWA Features

- **Offline-first**: Works without internet connection
- **Installable**: Add to home screen on mobile/desktop
- **Fast loading**: Service worker caching
- **Responsive**: Optimized for all screen sizes

## 🌐 Internationalization

- **Primary Language**: English
- **Secondary Language**: Kannada (ಕನ್ನಡ)
- Bilingual labels throughout the app

## 📊 Sample Data

The app includes comprehensive sample data for demo purposes:

- **Market Data**: `/public/data/market_forecasts.json`
- **Pest Samples**: `/public/data/pest_samples.json`  
- **Weather Data**: `/public/data/weather_sample.json`

## 🤖 TensorFlow.js Model Setup

To add a custom pest detection model:

1. Convert your TensorFlow SavedModel to TensorFlow.js format:
```bash
pip install tensorflowjs
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --signature_name=serving_default \
    --saved_model_tags=serve \
    /path/to/saved_model \
    ./public/models/pest_tfjs_model/
```

2. Add `labels.json` file in the model directory with class mappings.

See `/public/models/README.md` for detailed instructions.

## 🎨 Design System

The app uses a comprehensive design system with:

- **Colors**: Agriculture-themed palette (greens, earth tones)
- **Gradients**: Feature-specific color gradients
- **Animations**: Smooth Framer Motion transitions
- **Components**: Reusable shadcn/ui components
- **Typography**: Semantic text styles

## 📈 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Lazy-loaded routes and components
- **Caching**: Aggressive service worker caching
- **Images**: Optimized assets and lazy loading

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy the `dist` folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy the `dist` folder to Netlify
```

### Self-hosted
```bash
npm run build
# Serve the `dist` folder with any static server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **PlantVillage Dataset** for plant disease data
- **OpenWeatherMap** for weather API
- **Plant.id** for plant identification
- **Farmers** who inspired this project

---

Built with ❤️ for farmers worldwide 🌾