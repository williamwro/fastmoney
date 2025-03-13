
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart2, Receipt, Users, Tag } from 'lucide-react';

const NavLinks: React.FC = () => {
  const location = useLocation();
  
  const links = [
    { name: 'Dashboard', href: '/', icon: <BarChart2 className="size-4" /> },
    { name: 'Contas', href: '/bills', icon: <Receipt className="size-4" /> },
    { name: 'Usuários', href: '/users', icon: <Users className="size-4" /> },
    { name: 'Categorias', href: '/categories', icon: <Tag className="size-4" /> }
  ];

  return (
    <nav className="space-y-0.5">
      {links.map((link) => {
        // Determine if the link is active
        const isActive = location.pathname === link.href || 
                        (link.href !== '/' && location.pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.name}
            to={link.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-accent text-accent-foreground"
                : "transparent hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="mr-3 text-muted-foreground group-hover:text-foreground">
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
