
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, ReceiptText, Gem, BarcodeIcon, Users, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavLinksProps {
  isAuthenticated?: boolean;
  mobile?: boolean;
  closeMenu?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isAuthenticated, mobile, closeMenu }) => {
  const { user } = useAuth();
  
  // Check if user is admin (using the email as a simple check)
  const isAdmin = user?.email === 'william@makecard.com.br';

  return (
    <ul className="flex flex-col space-y-1 lg:space-y-0 lg:flex-row lg:space-x-2">
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-50'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
          onClick={closeMenu}
        >
          <Gem className="mr-2 h-4 w-4" />
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/bills"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-50'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
          onClick={closeMenu}
        >
          <ReceiptText className="mr-2 h-4 w-4" />
          Contas a Pagar
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-50'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
          onClick={closeMenu}
        >
          <BarcodeIcon className="mr-2 h-4 w-4" />
          Categorias
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/depositors"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-50'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
          onClick={closeMenu}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Depositantes
        </NavLink>
      </li>
      
      {isAdmin && (
        <li>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`
            }
            onClick={closeMenu}
          >
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </NavLink>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
