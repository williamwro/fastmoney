
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BillProvider } from "./context/BillContext";
import Index from "./pages/Index";
import Bills from "./pages/Bills";
import BillForm from "./pages/BillForm";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BillProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bills" 
                element={
                  <ProtectedRoute>
                    <Bills />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bills/new" 
                element={
                  <ProtectedRoute>
                    <BillForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bills/:id/edit" 
                element={
                  <ProtectedRoute>
                    <BillForm />
                  </ProtectedRoute>
                } 
              />
              {/* Redirects to pages that were removed */}
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/signup" element={<Navigate to="/auth" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BillProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
