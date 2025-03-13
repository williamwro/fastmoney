
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { BillProvider } from "./context/BillContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, authChecked } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (authChecked && !isAuthenticated && !isLoading) {
      console.log("ProtectedRoute - Usuário não autenticado, redirecionando para /login", {
        path: location.pathname
      });
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, authChecked, isLoading, navigate, location]);
  
  console.log("ProtectedRoute - Estado de autenticação:", { 
    isAuthenticated, 
    authChecked, 
    isLoading,
    path: location.pathname
  });
  
  // Se a autenticação ainda está sendo verificada, mostrar indicador de carregamento
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-500 mt-2">Verificando autenticação...</div>
        </div>
      </div>
    );
  }
  
  // Mostrar estado de carregamento durante operações de autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-500 mt-2">Carregando...</div>
        </div>
      </div>
    );
  }
  
  // Não redireciona aqui - isso é feito no useEffect para evitar problemas de renderização
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-500 mt-2">Redirecionando para o login...</div>
        </div>
      </div>
    );
  }
  
  console.log("ProtectedRoute - Usuário autenticado, renderizando conteúdo protegido");
  return <>{children}</>;
};

// Component for auth routes (login/signup)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authChecked, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (authChecked && isAuthenticated && !isLoading) {
      console.log("AuthRoute - Usuário autenticado, redirecionando para /bills", {
        path: location.pathname
      });
      navigate("/bills", { replace: true });
    }
  }, [isAuthenticated, authChecked, isLoading, navigate, location]);
  
  console.log("AuthRoute - Estado de autenticação:", { 
    isAuthenticated, 
    authChecked, 
    isLoading,
    path: location.pathname
  });
  
  // Mostrar tela de carregamento enquanto verifica autenticação
  if (!authChecked) {
    console.log("AuthRoute - Autenticação ainda sendo verificada");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-500 mt-2">Verificando autenticação...</div>
        </div>
      </div>
    );
  }
  
  // Não redireciona aqui - isso é feito no useEffect para evitar problemas de renderização
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-500 mt-2">Redirecionando para o dashboard...</div>
        </div>
      </div>
    );
  }
  
  // Mostrar loading durante operações de autenticação
  if (isLoading) {
    console.log("AuthRoute - Carregando operações de autenticação");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-500 mt-2">Processando...</div>
        </div>
      </div>
    );
  }
  
  // Se chegamos aqui, o usuário não está autenticado e pode ver a tela de login/signup
  console.log("AuthRoute - Renderizando tela de autenticação");
  return <>{children}</>;
};

// Main App component
const AppContent = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
        <Route path="/bills/new" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
        <Route path="/bills/:id/edit" element={<ProtectedRoute><BillForm /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BillProvider>
          <AppContent />
        </BillProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
