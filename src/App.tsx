
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BillProvider } from './context/BillContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Bills from './pages/Bills';
import BillForm from './pages/BillForm';
import Users from './pages/Users';
import Categories from './pages/Categories';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BillProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            {/* Auth route removed */}
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
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categories" 
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              } 
            />
            {/* Redirect /auth to /login */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </BillProvider>
    </AuthProvider>
  );
}

export default App;
