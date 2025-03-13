
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BillProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/bills/new" element={<BillForm />} />
            <Route path="/bills/:id/edit" element={<BillForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BillProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
