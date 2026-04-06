import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Besoins from "./pages/Besoins";
import Pipeline from "./pages/Pipeline";
import IntroductionDetail from "./pages/IntroductionDetail";
import HubFacilitateur from "./pages/HubFacilitateur";
import IAProspection from "./pages/IAProspection";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import Join from "./pages/Join";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/besoins" element={<Besoins />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/introductions/:id" element={<IntroductionDetail />} />
          <Route path="/facilitateur" element={<HubFacilitateur />} />
          <Route path="/ia-prospection" element={<IAProspection />} />
          <Route path="/account" element={<Account />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/join" element={<Join />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
