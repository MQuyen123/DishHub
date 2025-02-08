import React, { useEffect } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { isHomeReady } = useAppContext();

  useEffect(() => {
    console.log("WelcomeScreen - isHomeReady:", isHomeReady); // Log 5
    if (isHomeReady) {
      console.log("Preparing to navigate to Home"); // Log 6
      const timeoutId = setTimeout(() => {
        console.log("Navigating to Home"); // Log 7
        navigation.replace("Home");
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [isHomeReady, navigation]);
  return (
    <View style={styles.container}>
      <LinearGradient
        start={{ x: 0.0, y: 0.25 }}
        end={{ x: 0.5, y: 1.0 }}
        locations={[0, 0.3, 0.5]}
        colors={["#FF9803", "#1E1E1E", "#000000"]} 
        style={styles.background}
      />

      <Image
        source={require("../../assets/LogoDishHub.png")}
        style={styles.logo}
      />
      <Image source={require("../../assets/pho.png")} style={styles.image} />
      <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    position: "absolute",
    top: "20%",
  },
  image: {
    width: 450,
    height: 288,
    resizeMode: "contain",
    position: "absolute",
    bottom: -50,
    left: -150,
  },
  loadingText: {
    position: "absolute",
    top: "70%",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
