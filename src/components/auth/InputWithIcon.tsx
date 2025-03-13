
import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute left-3 top-3">
          {icon}
        </div>
        <Input ref={ref} className="pl-10" {...props} />
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';
