import Admin from "../../page/Admin";
import Footer from "../Footer";
import Header from "../Header";
import { Outlet } from 'react-router-dom';

function LayoutAdmin() {
  return (
    <div>
      <Header />
      <Admin />
     
    </div>
  );
}

export default LayoutAdmin;
