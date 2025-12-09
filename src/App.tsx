import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PondDesign from "./pages/PondDesign";
import FishSpecies from "./pages/FishSpecies";
import FishDisease from "./pages/FishDisease";
import YieldFeed from "./pages/YieldFeed";
import DiseaseDetection from "./pages/DiseaseDetection";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/pond-design" element={<PondDesign />} />
          <Route path="/fish-species" element={<FishSpecies />} />
          <Route path="/fish-disease" element={<FishDisease />} />
          <Route path="/yield-feed" element={<YieldFeed />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
