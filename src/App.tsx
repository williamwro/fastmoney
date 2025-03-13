
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { BillProvider } from "./context/BillContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Bills from "./pages/Bills";
import BillForm from "./pages/BillForm";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BillProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
          <Route path="/bills/new" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
          <Route path="/bills/:id/edit" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute isAdminRoute><Users /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BillProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
