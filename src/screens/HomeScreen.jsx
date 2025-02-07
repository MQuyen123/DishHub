import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Menu from "../components/Menu";
import Header from "../components/Header";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <Menu />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
