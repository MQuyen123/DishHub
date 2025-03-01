import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NotificationService from "./src/service/NotificationService";
import TabNavigator from "./src/navigation/TabNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import authService from "./src/service/authService";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem người dùng có đăng nhập trước đó không
    const checkLoginStatus = async () => {
      try {
        const storedUser = await authService.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();

    // Bắt đầu polling thông báo khi ứng dụng mở
    NotificationService.startPolling();

    return () => {
      NotificationService.stopPolling();
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            {user ? <TabNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    </PaperProvider>
  );
}
