import React, { createContext, useState } from "react";
import authService from "../service/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (userName, password) => {
    try {
      const userData = await authService.login(userName, password);
      setUser(userData);
      await authService.storeUser(userData); // Lưu vào AsyncStorage
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
