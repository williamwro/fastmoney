
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart2, Receipt, Users, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavLinksProps {
  isAuthenticated?: boolean;
  mobile?: boolean;
  closeMenu?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ 
  isAuthenticated = false, 
  mobile = false, 
  closeMenu 
}) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if current user is the admin
  const isAdmin = user?.email === 'william@makecard.com.br';
  
  // Only show these links when authenticated
  const authenticatedLinks = [
    { name: 'Dashboard', href: '/', icon: <BarChart2 className="size-4" /> },
    { name: 'Contas', href: '/bills', icon: <Receipt className="size-4" /> },
    // Only show the Users link if the user is admin
    ...(isAdmin ? [{ name: 'Usuários', href: '/users', icon: <Users className="size-4" /> }] : []),
    { name: 'Categorias', href: '/categories', icon: <Tag className="size-4" /> }
  ];
  
  // Show these links always
  const publicLinks = [
    { name: 'Dashboard', href: '/', icon: <BarChart2 className="size-4" /> }
  ];
  
  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <nav className={mobile ? "space-y-0.5" : "flex space-x-4"}>
      {links.map((link) => {
        // Determine if the link is active
        const isActive = location.pathname === link.href || 
                        (link.href !== '/' && location.pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.name}
            to={link.href}
            className={cn(
              mobile 
                ? "group flex items-center rounded-md px-3 py-2 text-sm font-medium" 
                : "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2",
              isActive
                ? mobile 
                  ? "bg-accent text-accent-foreground"
                  : "border-blue-500 text-gray-900"
                : mobile
                  ? "transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            )}
            onClick={closeMenu}
          >
            <span className={cn(
              "text-muted-foreground group-hover:text-foreground",
              mobile ? "mr-3" : "mr-2"
            )}>
              {link.icon}
            </span>
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
