import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as signalR from "@microsoft/signalr";
import Toast from "react-native-toast-message";
import { Badge, Button, Menu, Card } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";

const OrderScreen = () => {
  const [visible, setVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const restaurantId = 1;
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);

  // Lấy danh sách bàn duy nhất từ danh sách order
  const uniqueTables = Array.from(new Set(orders.map((order) => order.tableName)));

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/hub/order-details?restaurantId=${restaurantId}`
      )
      .withAutomaticReconnect()
      .build();

    connection.on("LoadCurrentOrders", (orderData) => {
      setOrders(orderData);
      console.log("Orders loaded:", orderData);
      setLoading(false);
    });

    connection.on("ReceiveNewOrder", (newOrder) => {
      console.log("New order received:", newOrder);
      Toast.show({
        type: "success",
        position: "top",
        text1: "New Order",
        text2: `Table ${newOrder.tableName} has a new order.`,
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    connection.on("UpdateOrderDetailStatus", (updatedOrderDetail) => {
      console.log("Update order status:", updatedOrderDetail);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Update Order",
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrderDetail.id
            ? { ...order, status: updatedOrderDetail.status }
            : order
        )
      );
    });

    connection.start().catch((err) => console.error("Connection failed:", err));

    return () => {
      connection.stop();
    };
  }, []);

  // Lọc đơn hàng theo bàn được chọn
  const filteredOrders = selectedTable
    ? orders.filter((order) => order.tableName === selectedTable)
    : orders;

  // Cập nhật trạng thái đơn hàng sử dụng token
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!auth || !auth.token) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Authentication Error",
        text2: "Missing token, please log in.",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    try {
      const response = await fetch(
        `https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/api/orders/details/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Cập nhật trạng thái đơn hàng trong state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        Toast.show({
          type: "success",
          position: "top",
          text1: "Order Updated",
          text2: `Order status updated to ${newStatus}.`,
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      } else {
        console.error("Failed to update order status:", response.status);
        Toast.show({
          type: "error",
          position: "top",
          text1: "Lỗi cập nhật trạng thái đơn hàng.",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Lỗi cập nhật trạng thái đơn hàng.",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
  };

  const getActionButtons = (order) => {
    const { status, id } = order;

    switch (status) {
      case "pending":
        return (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => updateOrderStatus(id, "confirmed")}
              style={styles.button}
            >
              Xác nhận
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateOrderStatus(id, "rejected")}
              style={styles.button}
            >
              Từ chối
            </Button>
          </View>
        );
      case "confirmed":
        return (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => updateOrderStatus(id, "preparing")}
              style={styles.button}
            >
              Đang chuẩn bị
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateOrderStatus(id, "rejected")}
              style={styles.button}
            >
              Từ chối
            </Button>
          </View>
        );
      case "preparing":
        return (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => updateOrderStatus(id, "delivered")}
              style={styles.button}
            >
              Đã giao
            </Button>
            <Button
              mode="outlined"
              onPress={() => updateOrderStatus(id, "rejected")}
              style={styles.button}
            >
              Từ chối
            </Button>
          </View>
        );
      default:
        return null; // Không hiển thị nút khi trạng thái là delivered hoặc rejected
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị";
      case "delivered":
        return "Đã giao";
      case "rejected":
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "confirmed":
        return "#3498db";
      case "preparing":
        return "#9b59b6";
      case "delivered":
        return "#2ecc71";
      case "rejected":
        return "#e74c3c";
      default:
        return "#bdc3c7";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {/* Header với tiêu đề và nút chọn bàn */}
        <View style={styles.headerContainer}>
          <View style={styles.menuContainer}>
            <Menu
              visible={visible}
              onDismiss={() => setVisible(false)}
              anchor={
                <Button mode="contained-tonal" onPress={() => setVisible(true)}>
                  {selectedTable ? `Bàn ${selectedTable}` : "Chọn bàn"}
                </Button>
              }
            >
              <Menu.Item onPress={() => setSelectedTable(null)} title="Tất cả bàn" />
              {uniqueTables.map((table) => (
                <Menu.Item
                  key={table}
                  onPress={() => {
                    setSelectedTable(table);
                    setVisible(false);
                  }}
                  title={`Bàn ${table}`}
                />
              ))}
            </Menu>
          </View>
        </View>

        {/* Hiển thị danh sách đơn hàng */}
        {filteredOrders.slice().reverse().map((order, index) => (
          <Card key={index} style={styles.orderCard}>
            <Card.Content style={styles.cardContent}>
              <Image source={{ uri: order.dishImage }} style={styles.dishImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.tableText}>BÀN {order.tableName}</Text>
                <Text style={styles.dishName}>{order.dishName}</Text>
                <Text style={styles.quantity}>Số lượng: {order.quantity}</Text>
                <Text style={styles.price}>
                  {order.price.toLocaleString()} VNĐ
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <Badge
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                >
                  {getStatusText(order.status)}
                </Badge>
                {getActionButtons(order)}
              </View>
            </Card.Content>
          </Card>
        ))}
        <View style={{ height: 20 }}>
          {loading && <ActivityIndicator size="large" color="#3498db" />}
        </View>

        <Toast />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#eee",
  },
  orderCard: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 16,
  },
  orderInfo: {
    flex: 1,
  },
  tableText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  dishName: {
    fontSize: 16,
    color: "#34495e",
    marginTop: 8,
  },
  quantity: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "700",
    marginTop: 4,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  button: {
    marginVertical: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  menuContainer: {
    marginRight: "auto",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
});

export default OrderScreen;
