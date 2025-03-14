
import React from 'react';
import { Link } from 'react-router-dom';

const Brand: React.FC = () => {
  return (
    <div className="flex-shrink-0 flex items-center w-auto">
      <Link to="/" className="flex items-center">
        <img 
          src="/lovable-uploads/33692494-af2f-4fdf-9f67-b4d711e23f02.png" 
          alt="FastMoney Logo" 
          className="h-8 w-auto"
        />
      </Link>
    </div>
  );
};

export default Brand;
