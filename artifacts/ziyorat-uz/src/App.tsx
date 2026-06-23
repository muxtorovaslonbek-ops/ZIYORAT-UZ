import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import "@/lib/i18n";

import Index from "./pages/Index";

const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Plan = lazy(() => import("./pages/Plan"));
const RegionPlan = lazy(() => import("./pages/RegionPlan"));
const Shrines = lazy(() => import("./pages/IframePages").then(m => ({ default: m.Shrines })));
const Guides = lazy(() => import("./pages/IframePages").then(m => ({ default: m.Guides })));
const Tour3D = lazy(() => import("./pages/IframePages").then(m => ({ default: m.Tour3D })));
const Favorites = lazy(() => import("./pages/Favorites"));
const Reviews = lazy(() => import("./pages/Reviews"));
const About = lazy(() => import("./pages/About"));
const Partnership = lazy(() => import("./pages/Partnership"));
const AiYolboshchi = lazy(() => import("./pages/AiYolboshchi"));
const ZamonlarAro = lazy(() => import("./pages/ZamonlarAro"));
const TarixiyLiboslar = lazy(() => import("./pages/TarixiyLiboslar"));
const Premium = lazy(() => import("./pages/Premium"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminApplications = lazy(() => import("./pages/AdminApplications"));
const Admin = lazy(() => import("./pages/Admin"));
const MilliyMarket = lazy(() => import("./pages/MilliyMarket"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AiGuideFloating = lazy(() => import("./components/AiGuideFloating").then(m => ({ default: m.AiGuideFloating })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/plan/:viloyat" element={<RegionPlan />} />
                <Route path="/ziyoratgohlar" element={<Shrines />} />
                <Route path="/gidlar" element={<Guides />} />
                <Route path="/3d-sayohat" element={<Tour3D />} />
                <Route path="/sevimli" element={<Favorites />} />
                <Route path="/baholash" element={<Reviews />} />
                <Route path="/shartnoma" element={<Partnership />} />
                <Route path="/about" element={<About />} />
                <Route path="/ai-yolboshchi" element={<AiYolboshchi />} />
                <Route path="/zamonlar-aro" element={<ZamonlarAro />} />
                <Route path="/tarixiy-liboslar" element={<TarixiyLiboslar />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/milliy-market" element={<MilliyMarket />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/applications" element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Suspense fallback={null}>
              <AiGuideFloating />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
