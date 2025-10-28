# AI Agri Assistant - Flowcharts & Diagrams

## 1. Overall System Architecture

<lov-mermaid>
graph TB
    A[User Interface - React PWA] --> B[Route Handler]
    B --> C[Market Forecaster]
    B --> D[Pest Detection]
    B --> E[Irrigation Predictor]
    B --> F[Carbon Estimator]
    
    C --> G[Forecast Service]
    D --> H[Pest Service]
    E --> I[Weather Service]
    F --> J[Carbon Service]
    
    G --> K[(Local JSON Data)]
    G --> L[Remote Forecast API]
    
    H --> M[TensorFlow.js Model]
    H --> N[Plant.id API]
    
    I --> O[OpenWeatherMap API]
    I --> K
    
    J --> K
    
    K --> P[Service Worker Cache]
    L --> P
    N --> P
    O --> P
    
    style A fill:#4ade80
    style P fill:#60a5fa
    style K fill:#fbbf24
</lov-mermaid>

## 2. Market Price Forecaster Flow (Enhanced with Mandi API)

<lov-mermaid>
flowchart TD
    A[User Selects Crop] --> B{Cache Valid?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D{Mandi API Available?}
    D -->|Yes| E[Fetch Real-Time Mandi Data]
    D -->|No| F{Remote API Available?}
    E --> G[AI Processing - Linear Regression]
    G --> H[AI Processing - EMA Calculation]
    H --> I[AI Processing - Seasonal Analysis]
    I --> J[Generate 14-Day Forecast]
    J --> K[Analyze Trends & Volatility]
    K --> L[Generate Smart Recommendations]
    L --> M[Update Cache]
    F -->|Yes| N[Fetch from Remote API]
    F -->|No| O[Load Local JSON]
    N --> M
    O --> M
    C --> P[Calculate Statistics]
    M --> P
    P --> Q[Generate Chart Data]
    Q --> R[Display Historical Prices]
    Q --> S[Display AI Forecast]
    Q --> T[Show Technical Indicators]
    Q --> U[Display Market Insights]
    
    style A fill:#4ade80
    style E fill:#10b981
    style L fill:#3b82f6
    style U fill:#8b5cf6
</lov-mermaid>

## 3. Pest Detection Flow

<lov-mermaid>
flowchart TD
    A[User Captures/Uploads Image] --> B[Validate Image]
    B --> C{TensorFlow.js Model Available?}
    C -->|Yes| D[Load Local Model]
    C -->|No| E{Plant.id API Key?}
    D --> F[Preprocess Image]
    F --> G[Run Inference]
    G --> H[Get Predictions]
    E -->|Yes| I[Upload to Plant.id]
    E -->|No| J[Use Sample Data]
    I --> K[Parse API Response]
    J --> L[Return Sample Result]
    H --> M[Calculate Confidence]
    K --> M
    L --> M
    M --> N{Confidence > 70%?}
    N -->|Yes| O[Display Disease Name]
    N -->|No| P[Show Low Confidence Warning]
    O --> Q[Determine Severity]
    P --> Q
    Q --> R[Suggest Organic Remedies]
    R --> S[Display Results to User]
    
    style A fill:#4ade80
    style O fill:#ef4444
    style R fill:#10b981
    style S fill:#60a5fa
</lov-mermaid>

## 4. Smart Irrigation Decision Flow

<lov-mermaid>
flowchart TD
    A[User Selects Crop & Location] --> B{Cache Valid?}
    B -->|Yes| C[Use Cached Weather]
    B -->|No| D{Location Available?}
    D -->|Yes| E[Get GPS Coordinates]
    D -->|No| F[Use Sample Location]
    E --> G{Weather API Key?}
    F --> G
    G -->|Yes| H[Fetch Current Weather]
    G -->|No| I[Load Sample Weather]
    H --> J[Fetch 5-Day Forecast]
    I --> J
    J --> K[Get Crop Thresholds]
    K --> L[Calculate Total Rainfall Next 3 Days]
    L --> M{Rainfall > Threshold?}
    M -->|Yes| N[Irrigation NOT Needed]
    M -->|No| O{Soil Moisture OK?}
    O -->|Yes| P[Irrigation NOT Needed]
    O -->|No| Q[Irrigation NEEDED]
    N --> R[Calculate Next Irrigation Date]
    P --> R
    Q --> R
    R --> S[Display Recommendation]
    S --> T[Show Weather Forecast]
    
    style A fill:#4ade80
    style Q fill:#ef4444
    style N fill:#10b981
    style P fill:#10b981
    style S fill:#60a5fa
</lov-mermaid>

## 5. Carbon Footprint Calculation Flow

<lov-mermaid>
flowchart TD
    A[User Inputs Farm Data] --> B[Fertilizer Usage]
    A --> C[Machinery Usage]
    A --> D[Farm Area in Hectares]
    
    B --> E[Urea Amount kg]
    B --> F[DAP Amount kg]
    
    C --> G[Tractor Hours]
    C --> H[Pump Hours]
    
    E --> I[Calculate Urea Emissions]
    F --> J[Calculate DAP Emissions]
    G --> K[Calculate Tractor Emissions]
    H --> L[Calculate Pump Emissions]
    
    I --> M[Total Fertilizer Emissions]
    J --> M
    K --> N[Total Machinery Emissions]
    L --> N
    
    M --> O[Sum All Emissions]
    N --> O
    
    O --> P[Divide by Area]
    P --> Q[Carbon per Hectare]
    
    Q --> R{Level Classification}
    R -->|< 2 ton/ha| S[Low Impact]
    R -->|2-4 ton/ha| T[Medium Impact]
    R -->|> 4 ton/ha| U[High Impact]
    
    S --> V[Generate Eco-Tips]
    T --> V
    U --> V
    
    V --> W[Display Results & Recommendations]
    
    style A fill:#4ade80
    style S fill:#10b981
    style T fill:#f59e0b
    style U fill:#ef4444
    style W fill:#60a5fa
</lov-mermaid>

## 6. PWA Offline Strategy

<lov-mermaid>
flowchart TD
    A[App Load Request] --> B{Service Worker Installed?}
    B -->|No| C[Install Service Worker]
    B -->|Yes| D{Network Available?}
    C --> E[Cache Static Assets]
    E --> F[Cache Data Files]
    F --> G[App Ready]
    
    D -->|Yes| H{Cache Fresh?}
    D -->|No| I[Serve from Cache]
    
    H -->|Yes| I
    H -->|No| J[Fetch from Network]
    J --> K[Update Cache]
    K --> L[Serve Fresh Data]
    
    I --> M[App Running]
    L --> M
    G --> M
    
    M --> N[User Action]
    N --> O{Requires Network?}
    O -->|No| P[Use Local Processing]
    O -->|Yes| Q{Network Available?}
    
    Q -->|Yes| R[Fetch from API]
    Q -->|No| S[Use Cached/Sample Data]
    
    P --> T[Display Result]
    R --> T
    S --> T
    
    style A fill:#4ade80
    style I fill:#60a5fa
    style P fill:#10b981
    style S fill:#fbbf24
</lov-mermaid>

## 7. User Journey Map

<lov-mermaid>
journey
    title Farmer's Daily Journey with AI Agri Assistant
    section Morning Check
      Open App: 5: Farmer
      Check Weather: 5: Farmer
      View Irrigation Needs: 4: Farmer, App
      Get Irrigation Decision: 5: Farmer, App
    section Field Work
      Notice Pest Problem: 3: Farmer
      Capture Plant Photo: 4: Farmer
      Get Pest Identification: 5: Farmer, App
      Apply Organic Remedy: 4: Farmer
    section Market Planning
      Check Crop Prices: 5: Farmer
      View 14-Day Forecast: 5: Farmer, App
      Plan Harvest Date: 5: Farmer, App
    section Evening Review
      Calculate Carbon Footprint: 4: Farmer
      Review Eco Tips: 4: Farmer
      Plan Next Day: 5: Farmer
</lov-mermaid>

## 8. Data Flow & Security

<lov-mermaid>
graph LR
    A[User Device] -->|HTTPS| B[Service Worker]
    B --> C{Data Type}
    
    C -->|Static Assets| D[Browser Cache]
    C -->|API Calls| E{Network Check}
    
    E -->|Online| F[External APIs]
    E -->|Offline| G[Local Storage]
    
    F -->|OpenWeather| H[Weather Data]
    F -->|Plant.id| I[Pest Data]
    F -->|Custom| J[Market Data]
    
    H --> K[Cache Response]
    I --> K
    J --> K
    
    K --> L[IndexedDB]
    G --> L
    
    L --> M[App State]
    D --> M
    
    M --> N[UI Components]
    
    style A fill:#4ade80
    style F fill:#60a5fa
    style L fill:#fbbf24
    style N fill:#8b5cf6
</lov-mermaid>

---

## How to Use These Diagrams in PowerPoint

1. **Screenshot Method**: Take screenshots of these diagrams and insert as images
2. **Mermaid Live Editor**: Copy the code blocks to https://mermaid.live for higher resolution exports
3. **Export Options**: Download as PNG or SVG for best quality
4. **Color Coding**: 
   - Green (#4ade80): User Input/Start
   - Blue (#60a5fa): Process/Service
   - Orange (#fbbf24): Cached/Offline
   - Red (#ef4444): Alert/Action Required
   - Purple (#8b5cf6): Output/Display
