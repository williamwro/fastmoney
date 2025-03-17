
import React from 'react';
import DepositorFormComponent from '@/components/depositors/DepositorForm';
import { DepositorProvider } from '@/context/DepositorContext';

const DepositorFormPage = () => {
  return (
    <DepositorProvider>
      <DepositorFormComponent />
    </DepositorProvider>
  );
};

export default DepositorFormPage;
