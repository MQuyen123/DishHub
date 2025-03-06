import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import * as signalR from '@microsoft/signalr';
import Toast from 'react-native-toast-message';

const OrderScreen = () => {
    const [orders, setOrders] = useState([]);
    const restaurantId = 1; // Thay bằng ID thực tế của nhà hàng

    useEffect(() => {
        // Tạo kết nối với SignalR Hub
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7097/hub/order-details?restaurantId=${restaurantId}`)
            .withAutomaticReconnect()
            .build();

        // Xử lý khi nhận danh sách đơn hàng
        connection.on("LoadCurrentOrders", (orderData) => {
            console.log("Received orders:", orderData);
            setOrders(orderData);
        });

        // Nhận đơn hàng mới khi có thông báo từ server
        connection.on("ReceiveNewOrder", (newOrder) => {
            console.log("New order received:", newOrder);
            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'New Order',
                text2: `Table ${newOrder.tableName} has a new order.`,
                visibilityTime: 5000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
            });
            setOrders(prevOrders => [...prevOrders, newOrder]); // Thêm đơn hàng mới vào danh sách
        });

        // Kết nối tới Hub
        connection.start()
            .then(() => console.log("Connected to SignalR"))
            .catch(err => console.error("Connection failed:", err));

        // Cleanup khi component unmount
        return () => {
            connection.stop();
        };
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Danh sách đơn hàng</Text>
            {orders.map((order, index) => (
                <View key={index} style={styles.orderBox}>
                    <View style={styles.header}>
                        <Text style={styles.text}>Tên bàn: {order.tableName}</Text>
                        <Text style={styles.text}>Order ID: {order.orderId}</Text>
                    </View>
                    <View style={styles.content}>
                        <Image style={styles.image} source={{ uri: order.dishImage }} />
                        <View style={styles.details}>
                            <Text style={styles.text}>Tên món ăn: {order.dishName}</Text>
                            <Text style={styles.text}>Số lượng: {order.quantity}</Text>
                            <Text style={styles.text}>Giá: {order.price} VND</Text>
                        </View>
                        <Text style={styles.text}>Trạng thái: {order.status}</Text>
                    </View>
                </View>
            ))}
            <Toast ref={(ref) => Toast.setRef(ref)} />
        </ScrollView>
    );
};

export default OrderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    orderBox: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        backgroundColor: '#ccc',
        marginRight: 10,
    },
    details: {
        flex: 1,
    },
    text: {
        fontSize: 14,
    },
});