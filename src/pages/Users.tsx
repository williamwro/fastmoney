
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import UserManagement from '@/components/UserManagement';
import { Navigate } from 'react-router-dom';

const Users = () => {
  const { user, isLoading } = useAuth();
  
  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'william@makecard.com.br';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Redirect if not admin
  if (!isAuthorizedAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-gray-500 mt-1">
              Gerenciamento de usuários do sistema
            </p>
          </div>
          
          <UserManagement />
        </div>
      </main>
    </div>
  );
};

export default Users;
