import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Header = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleScanPress = () => {
    navigation.navigate("Scan");
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top, height: 60 + insets.top }]}>
      <View  >
        <Image
          source={require("../../assets/LogoDishHub.png")}
          style={styles.logo}
        />
        <TouchableOpacity onPress={handleScanPress}>
          <MaterialCommunityIcons name="line-scan" color="#FFA500" size={32} />
        </TouchableOpacity>
      </View> 
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingHorizontal: 15,
  },
  logo: {
    width: 100,
    height: 50,
    resizeMode: "contain",
  },
});

export default Header;
