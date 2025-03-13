
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserMenuProps = {
  user: { name: string } | null;
  logout: () => void;
  isAuthenticated: boolean;
  mobile?: boolean;
  closeMenu?: () => void;
};

const UserMenu: React.FC<UserMenuProps> = ({ 
  user, 
  logout, 
  isAuthenticated,
  mobile = false,
  closeMenu
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isAuthenticated) {
    if (mobile) {
      return (
        <>
          <Link
            to="/login"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
            onClick={closeMenu}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-300 text-base font-medium"
            onClick={closeMenu}
          >
            Cadastrar
          </Link>
        </>
      );
    }
    
    return (
      <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link to="/signup">
          <Button>Cadastrar</Button>
        </Link>
      </div>
    );
  }

  if (mobile) {
    return (
      <button
        onClick={() => {
          logout();
          if (closeMenu) closeMenu();
        }}
        className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
      >
        <div className="flex items-center">
          <LogOut className="h-5 w-5" />
          <span className="ml-2">Sair</span>
        </div>
      </button>
    );
  }

  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
      <Link to="/bills/new">
        <Button size="sm" variant="default" className="flex items-center space-x-1">
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>Nova Conta</span>
        </Button>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" disabled>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
