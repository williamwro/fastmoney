
import React from 'react';
import { Link } from 'react-router-dom';

const Brand: React.FC = () => {
  return (
    <div className="flex-shrink-0 flex items-center">
      <Link to="/" className="flex items-center space-x-2">
        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          FinTec
        </span>
      </Link>
    </div>
  );
};

export default Brand;
