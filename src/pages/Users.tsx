import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserManagement from '@/components/users/UserManagement';
import { Navigate } from 'react-router-dom';
import Brand from '@/components/navbar/Brand';
import NavLinks from '@/components/navbar/NavLinks';
import UserMenu from '@/components/navbar/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenuButton from '@/components/navbar/MobileMenuButton';
import MobileMenu from '@/components/navbar/MobileMenu';

const Users = () => {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'william@makecard.com.br';
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Redirect if not admin
  if (!isAuthorizedAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full bg-white dark:bg-gray-900 py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Brand />
            <div className="hidden md:flex ml-6">
              <NavLinks />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:block">
              <UserMenu 
                user={user} 
                logout={logout} 
                isAuthenticated={isAuthenticated} 
              />
            </div>
            <MobileMenuButton isOpen={isMenuOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
        
        {/* Mobile menu */}
        <MobileMenu 
          isOpen={isMenuOpen} 
          closeMenu={closeMenu} 
          isAuthenticated={isAuthenticated}
          user={user}
          logout={logout}
        />
      </div>
      
      <main className="container mx-auto px-4 pt-6 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
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
