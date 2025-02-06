import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
const WelcomeScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            {/* Gradient nền */}
            <LinearGradient
                start={{ x: 0.0, y: 0.25 }} end={{ x: 0.5, y: 1.0 }}
                locations={[0, 0.3, 0.4]}
                colors={['#FF9803', '#000000']} // Điều chỉnh gradient để màu đen chiếm nhiều hơn
                style={styles.background}
            />
            {/* Logo DishHub ở giữa */}
            <Image
                source={require('../../assets/LogoDishHub.png')}
                style={styles.logo}
            />
            {/* Hình tô phở ở phía dưới */}
            <Image
                source={require('../../assets/pho.png')}
                style={styles.image}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Home")} // Điều hướng đến màn hình Home
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    logo: {
        width: 200, // Đặt kích thước phù hợp với logo
        height: 200,
        resizeMode: 'contain',
        position: 'absolute',
        top: '20%', // Căn giữa logo trong màn hình
    },
    image: {
        width: 450,
        height: 288,
        resizeMode: 'contain',
        position: 'absolute',
        bottom: -50,
        left: -150,
    },
    button: {
        backgroundColor: "#FF9803",
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 20,
        position: 'absolute',
        top: '60%',
    },
    buttonText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
    },
});

export default WelcomeScreen;
