
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BillProvider } from './context/BillContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Auth from './pages/Auth';
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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth" element={<Auth />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </BillProvider>
    </AuthProvider>
  );
}

export default App;
