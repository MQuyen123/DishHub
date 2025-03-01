import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/api/auth";

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Dữ liệu người dùng cần đăng ký
 */
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data; // Trả về thông tin user
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

/**
 * Đăng nhập và nhận token
 * @param {string} userName - Tên đăng nhập
 * @param {string} password - Mật khẩu
 */
const login = async (userName, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { userName, password });
    const userData = response.data;

    // Lưu thông tin người dùng vào AsyncStorage
    await storeUser(userData);

    return userData;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

/**
 * Lưu thông tin người dùng vào AsyncStorage
 * @param {Object} userData - Dữ liệu người dùng đã đăng nhập
 */
const storeUser = async (userData) => {
  await AsyncStorage.setItem("user", JSON.stringify(userData));
};

/**
 * Lấy thông tin người dùng từ AsyncStorage
 */
const getUser = async () => {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Đăng xuất người dùng, xóa dữ liệu khỏi AsyncStorage
 */
const logout = async () => {
  await AsyncStorage.removeItem("user");
};

export default { register, login, storeUser, getUser, logout };
