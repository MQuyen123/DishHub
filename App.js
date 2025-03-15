import React, { useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, Text } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NotificationService from "./src/service/NotificationService";
import TabNavigator from "./src/navigation/TabNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import "react-native-get-random-values";
import "event-target-shim";
import { TextEncoder, TextDecoder } from "fast-text-encoding";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

function MainApp() {
  const { auth, authLoading } = useContext(AuthContext);

  useEffect(() => {
    // Khởi tạo kết nối thông báo SignalR
    NotificationService.initialize();
  }, []);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {auth ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
