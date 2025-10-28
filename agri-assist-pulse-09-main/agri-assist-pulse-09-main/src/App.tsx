import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MarketForecaster from "./pages/MarketForecaster";
import PestDetection from "./pages/PestDetection";
import IrrigationPredictor from "./pages/IrrigationPredictor";
import CarbonEstimator from "./pages/CarbonEstimator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/market-forecaster" element={<MarketForecaster />} />
          <Route path="/pest-detection" element={<PestDetection />} />
          <Route path="/irrigation-predictor" element={<IrrigationPredictor />} />
          <Route path="/carbon-estimator" element={<CarbonEstimator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;