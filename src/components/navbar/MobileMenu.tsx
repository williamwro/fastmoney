
import React from 'react';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';

type MobileMenuProps = {
  isOpen: boolean;
  closeMenu: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { name: string } | null;
  logout: () => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  closeMenu, 
  isAuthenticated,
  isAdmin,
  user, 
  logout 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="sm:hidden">
      <div className="pt-2 pb-3 space-y-1">
        <NavLinks 
          mobile 
          closeMenu={closeMenu} 
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
        />
        
        <UserMenu 
          user={user} 
          logout={logout} 
          isAuthenticated={isAuthenticated} 
          mobile 
          closeMenu={closeMenu} 
        />
      </div>
    </div>
  );
};

export default MobileMenu;
