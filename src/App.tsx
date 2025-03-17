
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { BillProvider } from '@/context/BillContext';

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Bills from '@/pages/Bills';
import Receivables from '@/pages/Receivables';
import BillForm from '@/pages/BillForm';
import ReceivableForm from '@/pages/ReceivableForm';
import Categories from '@/pages/Categories';
import DepositorForm from '@/pages/DepositorForm';
import Depositors from '@/pages/Depositors';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Users from '@/pages/Users';
import ProtectedRoute from '@/components/ProtectedRoute';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

import '@/index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BillProvider>
              <Toaster richColors />
              <PwaInstallPrompt />
              <Routes>
                <Route path="/" element={<ProtectedRoute element={<Index />} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Bills Routes */}
                <Route path="/bills" element={<ProtectedRoute element={<Bills />} />} />
                <Route path="/bills/new" element={<ProtectedRoute element={<BillForm />} />} />
                <Route path="/bills/:id/edit" element={<ProtectedRoute element={<BillForm />} />} />
                
                {/* Receivables Routes */}
                <Route path="/receitas" element={<ProtectedRoute element={<Receivables />} />} />
                <Route path="/receitas/new" element={<ProtectedRoute element={<ReceivableForm />} />} />
                <Route path="/receitas/:id/edit" element={<ProtectedRoute element={<ReceivableForm />} />} />
                
                {/* Categories Routes */}
                <Route path="/categories" element={<ProtectedRoute element={<Categories />} />} />
                
                {/* Depositors Routes */}
                <Route path="/depositors" element={<ProtectedRoute element={<Depositors />} />} />
                <Route path="/depositors/new" element={<ProtectedRoute element={<DepositorForm />} />} />
                <Route path="/depositors/:id/edit" element={<ProtectedRoute element={<DepositorForm />} />} />
                
                {/* Users Routes */}
                <Route path="/users" element={<ProtectedRoute element={<Users />} adminOnly />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BillProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
