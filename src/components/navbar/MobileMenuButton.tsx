
import React from 'react';
import { Menu, X } from 'lucide-react';

type MobileMenuButtonProps = {
  isOpen: boolean;
  toggleMenu: () => void;
};

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, toggleMenu }) => {
  return (
    <div className="flex items-center sm:hidden">
      <button
        onClick={toggleMenu}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default MobileMenuButton;
