import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderPage from '../Header';
import FooterPage from '../Footer';

const LayoutUser: React.FC = () => {
  return (
    <div>
      <HeaderPage />
      <Outlet />
      <FooterPage />
    </div>
  );
};

export default LayoutUser;