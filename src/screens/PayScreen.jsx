import React, { useContext, useEffect, useState } from "react";
import { View, ActivityIndicator, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Button, Text } from "react-native-paper";
import QRCode from "react-qr-code"; 
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import { formatPrice } from "../utils/formatPrice";

const PayScreen = () => {
  const restaurantId = 1;
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [qrValue, setQrValue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { auth } = useContext(AuthContext);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/api/table/tables-infor?restaurantId=${restaurantId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      const data = await response.json();
      if (data.isSucess) {
        setTables(data.data);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to load tables",
          text2: data.message || "Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [restaurantId, auth.token]);

  const fetchPaymentUrl = async (order) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/api/payments/${order.id}/pay`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${auth.token}` 
          },
        }
      );
      const data = await response.json();
      if (data.isSucess) {
        setQrValue(data.data.url);
        setModalVisible(true); // Hiển thị modal khi thanh toán thành công
      } else {
        Toast.show({
          type: "error",
          text1: "Payment request failed",
          text2: data.message || "Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    setRefreshing(false);
  };

  const renderTableItem = ({ item }) => {
    const { table } = item;
    return (
      <Card style={styles.card}>
      <Card.Title
        title={`Bàn: ${table.name}`}
        subtitle={table.description}
        titleStyle={{ fontSize: 20, fontWeight: "bold", color: "#2c3e50" }}
        subtitleStyle={{ fontSize: 14, color: "#7f8c8d" }}
      />
      <Card.Content>
        {table.order ? (
        <>
          <Text style={styles.orderText}>Mã đơn hàng: {table.order.id}</Text>
          <Text style={styles.orderText}>
          Tổng số tiền: {formatPrice(table.order.totalAmount)}
          </Text>
        </>
        ) : (
        <Text style={styles.noOrderText}>Chưa có đơn hàng</Text>
        )}
      </Card.Content>
      {table.order && (
        <Card.Actions>
        <Button
          mode="contained"
          onPress={() => fetchPaymentUrl(table.order)}
          style={styles.payButton}
        >
          Thanh toán
        </Button>
        </Card.Actions>
      )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loading} />
      ) : qrValue ? (
        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={200} />
          <Button
            mode="contained"
            onPress={() => setQrValue(null)}
            style={styles.backButton}
          >
            Quay về
          </Button>
        </View>
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item.table.id.toString()}
          renderItem={renderTableItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  loading: {
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  orderText: {
    fontSize: 16,
    marginVertical: 4,
    color: "#555",
  },
  noOrderText: {
    fontSize: 16,
    marginVertical: 4,
    color: "gray",
    fontStyle: "italic",
  },
  payButton: {
    marginTop: 10,
  },
  qrContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    marginTop: 20,
  },
});

export default PayScreen;
