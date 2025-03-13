
import React from 'react';
import { Input } from '@/components/ui/input';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({ icon, ...props }) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-3">
        {icon}
      </div>
      <Input className="pl-10" {...props} />
    </div>
  );
};
