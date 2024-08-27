import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Navbar from "@/components/Navbar.jsx";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <>
      <Navbar />
      {element}
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
