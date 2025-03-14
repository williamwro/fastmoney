
import React from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface LottieSuccessProps {
  animationData: any;
  className?: string;
  loop?: boolean;
}

const LottieSuccess = ({ 
  animationData, 
  className,
  loop = true
}: LottieSuccessProps) => {
  return (
    <div className={cn("w-full", className)}>
      <Lottie 
        animationData={animationData} 
        loop={loop}
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  );
};

export default LottieSuccess;
