import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Image, View, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import HomeScreen from "../screens/HomeScreen";
import DishHubBotScreen from "../screens/DishHubBotScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Scanner from "../components/Scanner";
import RequestScreen from "../screens/RequestScreen";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';


const Drawer = createDrawerNavigator();

// Nút mở sidebar trong header
const CustomHeaderButton = ({ navigation }) => (
  <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 15 }}>
    <FontAwesome name="th-list" size={24} color="white" />
  </TouchableOpacity>
);

// **Custom Sidebar với logo**
const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={{ alignItems: "center", padding: 20 }}>
        <Image 
          source={require("../../assets/LogoDishHub.png")} 
          style={{ width: 120, height: 120, resizeMode: "contain" }} 
        />
        <Text style={{ color: "#FFA500", fontSize: 18, marginTop: 10 }}>
          Welcome to DishHub
        </Text> 
      </View>
      <DrawerItemList {...props} /> 
    </DrawerContentScrollView>
  );
};

// **Drawer Navigation**
const TabNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#FFA500",
        headerLeft: () => <CustomHeaderButton navigation={navigation} />,
        drawerStyle: { backgroundColor: "#000", width: 250 },
        drawerActiveTintColor: "#FFA500",
        drawerInactiveTintColor: "#FFFFFF",
      })}
    >
      <Drawer.Screen 
        name="Trang chủ" 
        component={HomeScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="DishHubBot" 
        component={DishHubBotScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Scan" 
        component={Scanner} 
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="data-matrix-scan" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Yêu cầu hỗ trợ" 
        component={RequestScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesome6 name="person-circle-exclamation" color={color} size={size}  /> 
          ),
        }}
      />
      <Drawer.Screen 
        name="Hồ sơ" 
        component={ProfileScreen} 
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      
    </Drawer.Navigator>
  );
};



export default TabNavigator;
