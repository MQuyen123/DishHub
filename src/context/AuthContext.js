import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import authService from "../service/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Kiểm tra token hết hạn
  const isExpiredToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      // decoded.exp tính theo giây, nên nhân 1000 để so sánh với Date.now()
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Lấy token đã lưu trong AsyncStorage và cập nhật auth
  const getStoragedToken = async () => {
    try {
      const storagedToken = await AsyncStorage.getItem("token");
      if (storagedToken) {
        if (isExpiredToken(storagedToken)) {
          setAuth(null);
        } else {
          const decoded = jwtDecode(storagedToken);
          const authData = {
            username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
            roleId: decoded.RoleId,
            token: storagedToken,
          };
          setAuth(authData);
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      await AsyncStorage.removeItem("token");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    getStoragedToken();
  }, []);

  // Hàm đăng nhập: gọi authService.login, lưu token và cập nhật auth
  const login = async (userName, password) => {
    try {
      const userData = await authService.login(userName, password);
      setAuth(userData);
      await AsyncStorage.setItem("token", userData.token);
    } catch (error) {
      throw error;
    }
  };

  // Hàm đăng xuất: gọi authService.logout, xóa token và cập nhật auth
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setAuth(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
