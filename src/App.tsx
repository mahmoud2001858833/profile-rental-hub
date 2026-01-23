import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Customer from "./pages/Customer";
import Admin from "./pages/Admin";
import PublicPage from "./pages/PublicPage";
import Cart from "./pages/Cart";
import Terms from "./pages/Terms";
import Browse from "./pages/Browse";
import NotFound from "./pages/NotFound";
import AIGuide from "./components/AIGuide";
import WhatsAppButton from "./components/WhatsAppButton";
import { useState } from "react";

const App = () => {
  // Query client must be created inside component but memoized with useState
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customer" element={<Customer />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/p/:slug" element={<PublicPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AIGuide />
                <WhatsAppButton />
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;