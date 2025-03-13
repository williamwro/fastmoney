
import React from 'react';

interface AuthFormHeaderProps {
  title: string;
}

export const AuthFormHeader: React.FC<AuthFormHeaderProps> = ({ title }) => {
  return (
    <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
  );
};
