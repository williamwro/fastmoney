
import React from 'react';
import { Link } from 'react-router-dom';

const Brand: React.FC = () => {
  return (
    <div className="flex-shrink-0 flex items-center w-auto">
      <Link to="/" className="flex items-center">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">FastMoney</span>
      </Link>
    </div>
  );
};

export default Brand;
