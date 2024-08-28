import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw "accessToken Not found";
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } },
      );
      const { accessToken, user } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      setIsAuthenticated(true);
      setUser(user);
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, fetchUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
