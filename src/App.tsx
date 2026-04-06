import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TitanErrorBoundary from "@/components/titan/TitanErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TitanSkeleton from "@/components/titan/TitanSkeleton";

const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Besoins = lazy(() => import("./pages/Besoins"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const IntroductionDetail = lazy(() => import("./pages/IntroductionDetail"));
const HubFacilitateur = lazy(() => import("./pages/HubFacilitateur"));
const IAProspection = lazy(() => import("./pages/IAProspection"));
const Account = lazy(() => import("./pages/Account"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Join = lazy(() => import("./pages/Join"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <TitanSkeleton variant="kpi" />
      <TitanSkeleton variant="card" />
      <TitanSkeleton variant="card" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TitanErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/join" element={<Join />} />
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />

              {/* Entreprise */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={["entreprise", "facilitateur", "admin"]}><Dashboard /></ProtectedRoute>
              } />
              <Route path="/besoins" element={
                <ProtectedRoute allowedRoles={["entreprise", "admin"]} requireSubscription><Besoins /></ProtectedRoute>
              } />
              <Route path="/pipeline" element={
                <ProtectedRoute allowedRoles={["entreprise", "facilitateur", "admin"]}><Pipeline /></ProtectedRoute>
              } />
              <Route path="/introductions/:id" element={
                <ProtectedRoute allowedRoles={["entreprise", "facilitateur", "admin"]}><IntroductionDetail /></ProtectedRoute>
              } />
              <Route path="/ia-prospection" element={
                <ProtectedRoute allowedRoles={["entreprise", "admin"]}><IAProspection /></ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute><Account /></ProtectedRoute>
              } />

              {/* Facilitateur */}
              <Route path="/facilitateur" element={
                <ProtectedRoute allowedRoles={["facilitateur", "admin"]}><HubFacilitateur /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin"]}><Admin /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TitanErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
