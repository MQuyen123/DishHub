import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native"; // Import only if you are using View in this file
import WelcomeScreen from "./src/screens/WelcomeScreen";
import HomeScreen from "./src/screens/HomeScreen";
import { AppProvider, useAppContext } from "./src/context/AppContext";
import { apiService } from './src/networking/apiService';
import TabBar from './src/navigation/TabBar'; // Import TabBar


const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();


export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); 
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null; // Don't render anything before the app is ready
    }


    const MainApp = () => {  // MainApp is now *inside* App.js
        const { isHomeReady, setIsHomeReady, setHomeData, setIsLoading } = useAppContext();
        const [initialNavigationRoute, setInitialNavigationRoute] = useState('Welcome');


        useEffect(() => {
            const prepareHomeData = async () => {
                setIsLoading(true); // Set loading state before fetching data
                try {
                    const data = await apiService.fetchProduct(1);
                    setHomeData(data);
                } catch (error) {
                    console.error("Error fetching home data:", error);
                    // **IMPORTANT:** Handle the error here appropriately (e.g., show an error message, set an error state)
                } finally {
                    setIsLoading(false);
                    setIsHomeReady(true);
                }
            };

            prepareHomeData();
        }, []);

        useEffect(() => {
            if (isHomeReady) {
                setInitialNavigationRoute('Home');
            }
        }, [isHomeReady]);

        return (
            <NavigationContainer>
                {initialNavigationRoute === 'Welcome' ? (
                    <Stack.Navigator
                        initialRouteName={initialNavigationRoute}
                        screenOptions={{ headerShown: false, gestureEnabled: false }}
                    >
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Home" component={HomeScreen} />
                    </Stack.Navigator>
                ) : (
                    <TabBar /> // Use TabBar when isHomeReady is true
                )}
            </NavigationContainer>
        );
    };



    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <AppProvider>
                <MainApp /> 
            </AppProvider>
        </View>
    );
}