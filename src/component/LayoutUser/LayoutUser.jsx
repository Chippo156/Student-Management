import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderPage from '../Header';
import FooterPage from '../Footer';


const LayoutUser = () => {
  return (
    <div>
      <HeaderPage />
      <Outlet />
      <FooterPage />
    </div>
  );
};

export default LayoutUser;
