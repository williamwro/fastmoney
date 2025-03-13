
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type NavLinkItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

type NavLinksProps = {
  mobile?: boolean;
  closeMenu?: () => void;
  isAuthenticated: boolean;
};

const NavLinks: React.FC<NavLinksProps> = ({ mobile = false, closeMenu, isAuthenticated }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'william@makecard.com.br';
  
  const navigation: NavLinkItem[] = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Contas', path: '/bills', icon: <FileText className="h-5 w-5" /> },
    { name: 'Usuários', path: '/users', icon: <Users className="h-5 w-5" />, adminOnly: true },
  ];
  
  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || (item.adminOnly && isAuthorizedAdmin)
  );
  
  if (!isAuthenticated) return null;
  
  if (mobile) {
    return (
      <>
        {filteredNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`${
              location.pathname === item.path
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={closeMenu}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </div>
          </Link>
        ))}
      </>
    );
  }
  
  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      {filteredNavigation.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`${
            location.pathname === item.path
              ? 'border-b-2 border-blue-500 text-gray-900'
              : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
