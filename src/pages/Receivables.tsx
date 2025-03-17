
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBills } from '@/context/BillContext';
import ReceivablesList from '@/components/ReceivablesList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle, FileDown } from 'lucide-react';
import Brand from '@/components/navbar/Brand';
import NavLinks from '@/components/navbar/NavLinks';
import UserMenu from '@/components/navbar/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenuButton from '@/components/navbar/MobileMenuButton';
import MobileMenu from '@/components/navbar/MobileMenu';

const Receivables = () => {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const { isLoading: billsLoading } = useBills();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  if (authLoading || billsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
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
        
        <MobileMenu 
          isOpen={isMenuOpen} 
          closeMenu={closeMenu} 
          isAuthenticated={isAuthenticated}
          user={user}
          logout={logout}
        />
      </div>
      
      <main className="container mx-auto px-4 pt-6 pb-12 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Visualize, organize e gerencie seus recebimentos
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => window.exportReceivablesToPDF && window.exportReceivablesToPDF()}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Exportar PDF
              </Button>
              <Link to="/receitas/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Recebimento
                </Button>
              </Link>
            </div>
          </div>
          
          <ReceivablesList />
        </div>
      </main>
    </div>
  );
};

export default Receivables;
