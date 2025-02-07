import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import HomeScreen from "../screens/HomeScreen";
import DishHubBotScreen from "../screens/DishHubBotScreen";
import ProfileScreen from "../screens/ProfileScreen";



const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconName = {
            Home: "home",
            DishHubBot: "robot",
            Profile: "account",
          }[route.name];

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={() => navigation.navigate(route.name)}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={28}
                color={isFocused ? "#FFA500" : "#FFFFFF"}
              />
              <Text style={[styles.label, { color: isFocused ? "#FFA500" : "#FFFFFF" }]}>{route.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="DishHubBot" component={DishHubBotScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#000',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 70,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default TabNavigator;