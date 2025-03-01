import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import DishMenu from "../components/DishMenu";


const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <DishMenu />
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
