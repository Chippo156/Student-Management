
import { useDispatch, useSelector } from "react-redux";
import "./App.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LayoutUser from "./component/LayoutUser/LayoutUser";
import Error from "./component/Error";
import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import LayoutAdmin from "./component/LayoutAdmin/LayoutAdmin";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleGetUser = async () => {
  };
  useEffect(() => {
    handleGetUser();
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LayoutUser />, // Không truyền mode/setMode
      errorElement: <Error />,
      children: [
        { index: false, path: "/", element: <Home /> }, // Không truyền mode/setMode
        {
          index: true,
          path: "/destination/:id",
          // element: <TravelDetail />,
        },
      ],
    },

    {
      path: "login",
      element: <Login />,
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "/admin",
      element: <LayoutAdmin />,
    },
  ]);

  return (
    <div className="container">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;