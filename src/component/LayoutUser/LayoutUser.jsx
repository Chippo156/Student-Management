import React from "react";
import { Outlet } from "react-router-dom";
import HeaderPage from "../Header";

const LayoutUser= () => {
  return (
    <div>
      <HeaderPage />
      <Outlet />
    </div>
  );
};

export default LayoutUser;
