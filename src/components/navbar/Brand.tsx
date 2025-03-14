
import React from 'react';
import { Link } from 'react-router-dom';
import { LOGO_PATH } from '@/assets/logo';

const Brand: React.FC = () => {
  return (
    <div className="flex-shrink-0 flex items-center w-auto">
      <Link to="/" className="flex items-center">
        <img 
          src={LOGO_PATH} 
          alt="FastMoney Logo" 
          className="h-7 w-auto"
        />
      </Link>
    </div>
  );
};

export default Brand;
