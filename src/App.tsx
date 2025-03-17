
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { BillProvider } from '@/context/BillContext';
import { DepositorProvider } from '@/context/DepositorContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Bills from '@/pages/Bills';
import BillForm from '@/pages/BillForm';
import Categories from '@/pages/Categories';
import Users from '@/pages/Users';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Depositors from '@/pages/Depositors';
import DepositorForm from '@/pages/DepositorForm';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BillProvider>
          <DepositorProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                
                <Route path="/bills" element={
                  <ProtectedRoute>
                    <Bills />
                  </ProtectedRoute>
                } />
                
                <Route path="/bills/new" element={
                  <ProtectedRoute>
                    <BillForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/bills/:id/edit" element={
                  <ProtectedRoute>
                    <BillForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/categories" element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                } />
                
                <Route path="/depositors" element={
                  <ProtectedRoute>
                    <Depositors />
                  </ProtectedRoute>
                } />
                
                <Route path="/depositors/new" element={
                  <ProtectedRoute>
                    <DepositorForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/depositors/:id" element={
                  <ProtectedRoute>
                    <DepositorForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/users" element={
                  <ProtectedRoute adminOnly={true}>
                    <Users />
                  </ProtectedRoute>
                } />
                
                {/* Fallback Routes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Router>
            <PwaInstallPrompt />
            <Toaster position="top-center" />
          </DepositorProvider>
        </BillProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
