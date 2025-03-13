
import React from 'react';

interface AuthFormHeaderProps {
  title: string;
}

export const AuthFormHeader: React.FC<AuthFormHeaderProps> = ({ title }) => {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    </div>
  );
};
