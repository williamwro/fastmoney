
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Import refactored components
import Brand from './navbar/Brand';
import NavLinks from './navbar/NavLinks';
import UserMenu from './navbar/UserMenu';
import MobileMenuButton from './navbar/MobileMenuButton';
import MobileMenu from './navbar/MobileMenu';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  // Transform the user object to match the expected shape with name property
  const userWithName = user ? {
    ...user,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  } : null;
  
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 fixed w-full z-10 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Brand />
            <div className="ml-6 flex">
              <NavLinks isAuthenticated={isAuthenticated} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu 
              user={userWithName} 
              logout={logout} 
              isAuthenticated={isAuthenticated} 
            />
          </div>
          
          <MobileMenuButton isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isOpen} 
        closeMenu={closeMenu} 
        isAuthenticated={isAuthenticated}
        user={userWithName}
        logout={logout}
      />
    </nav>
  );
};

export default Navbar;
