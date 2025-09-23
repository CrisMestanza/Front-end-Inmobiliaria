import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/check_auth/", {
          credentials: "include",
        });
        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuth === null) return <p>Cargando...</p>;
  return isAuth ? children : <Navigate to="/" />;
};

export default PrivateRoute;
