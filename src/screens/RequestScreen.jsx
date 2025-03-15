import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as signalR from "@microsoft/signalr";
import Toast from "react-native-toast-message";
import { Button, Menu } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";

const RequestScreen = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableOptions, setTableOptions] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const restaurantId = 1; 

  const { auth } = useContext(AuthContext);

  const tableHead = ["Bàn", "Loại", "Ghi chú", "Thời gian", "Trạng thái", "Hành động"];
  const widthArr = [80, 120, 150, 100, 90, 150];

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/hub/requests?restaurantId=${restaurantId}`
      )
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("Connected to SignalR"))
      .catch((err) => {
        console.error("Connection failed: ", err);
        setError("Không thể kết nối đến SignalR. Vui lòng thử lại.");
        setLoading(false);
      });

    connection.on("LoadCurrentRequest", (data) => {
      setRequests(data.data || data); 
      setLoading(false);
    });

    connection.on("ReceiveNewRequest", (newRequest) => {
      setRequests((prev) => [newRequest, ...prev]);
      Toast.show({
        type: "success",
        text1: "Yêu cầu mới",
        text2: `Yêu cầu mới nhận được: ${newRequest.id}`,
      });
    });

    connection.on("UpdateRequestStatus", (updatedRequest) => {
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === updatedRequest.id
            ? { ...request, status: updatedRequest.status }
            : request
        )
      );
      Toast.show({
        type: "info",
        text1: "Cập nhật yêu cầu",
        text2: `Trạng thái yêu cầu ${updatedRequest.id} được cập nhật thành ${updatedRequest.status}`,
      });
    });

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    const formattedDate = dayjs(dateFilter).format("YYYY-MM-DD");
    const tablesForDate = [
      ...new Set(
        requests
          .filter(
            (request) =>
              dayjs(request?.createdAt, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD") === formattedDate
          )
          .map((req) => req?.tableName)
          .filter(Boolean)
      ),
    ];
    setTableOptions(["Tất cả", ...tablesForDate]);
  }, [requests, dateFilter]);

  useEffect(() => {
    filterRequests();
  }, [requests, dateFilter, selectedTable, filterRequests]);

  const filterRequests = useCallback(() => {
    const formattedDate = dayjs(dateFilter).format("YYYY-MM-DD");
    let filtered = (requests || []).filter((request) => {
      const requestDate = dayjs(request?.createdAt, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD");
      return requestDate === formattedDate;
    });

    if (selectedTable && selectedTable !== "Tất cả") {
      filtered = filtered.filter((request) => request?.tableName === selectedTable);
    }

    setFilteredRequests(filtered);
  }, [requests, dateFilter, selectedTable]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return { text: "Chờ duyệt", bg: "#fff3cd", textColor: "#856404" };
      case "inProgress":
        return { text: "Đang xử lý", bg: "#cce5ff", textColor: "#004085" };
      case "completed":
        return { text: "Hoàn thành", bg: "#d4edda", textColor: "#155724" };
      case "cancelled":
        return { text: "Đã hủy", bg: "#f8d7da", textColor: "#721c24" };
      default:
        return { text: "Không xác định", bg: "#f8f9fa", textColor: "#6c757d" };
    }
  };

  const updateRequestStatus = async (id, status) => {
    if (!auth || !auth.token) {
      Alert.alert("Lỗi", "Token xác thực không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }
      if (response.ok) {
        Alert.alert("Thành công", `Đã cập nhật trạng thái thành ${getStatusStyle(status).text}`);
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái yêu cầu.");
      }  
  };

  const getActionButtons = (request) => {
    const { status, id } = request;
    switch (status) {
      case "pending":
        return (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => updateRequestStatus(id, "inProgress")}
              style={styles.button}
            >
              Xử lý
            </Button>
          </View>
        );
      case "inProgress":
        return (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => updateRequestStatus(id, "completed")}
              style={styles.button}
            >
              Hoàn tất
            </Button>
          </View>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setError(null);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const tableData = filteredRequests.map((request) => [
      request?.tableName || "--",
      request?.typeName || "--",
      <Text style={styles.noteText} key={`note-${request.id}`}>{request?.note || "--"}</Text>,
      request?.createdAt
        ? dayjs(request.createdAt, "YYYY-MM-DD HH:mm:ss").format("HH:mm")
        : "--",
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusStyle(request?.status).bg },
        ]}
        key={`status-${request.id}`}
      >
        <Text
          style={[
            styles.statusText,
            { color: getStatusStyle(request?.status).textColor },
          ]}
        >
          {getStatusStyle(request?.status).text}
        </Text>
      </View>,
      <View style={{ padding: 8 }} key={`action-${request.id}`}>
        {getActionButtons(request)}
      </View>,
    ]);

    console.log("Thời gian nhận yêu cầu",tableData.request?.createdAt);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableWrapper}>
          <Table borderStyle={styles.tableBorder}>
            <Row
              data={tableHead}
              style={styles.headerRow}
              textStyle={styles.headerText}
              widthArr={widthArr}
            />
            {tableData.length > 0 ? (
              <Rows
                data={tableData}
                widthArr={widthArr}
                style={(index) => (index % 2 === 0 ? styles.evenRow : null)}
                textStyle={styles.rowText}
              />
            ) : (
              <View style={styles.noDataRow}>
                <Text style={styles.noDataText}>
                  Không có yêu cầu nào trong ngày này
                </Text>
              </View>
            )}
          </Table>
        </View>
      </ScrollView>
    );
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {dayjs(dateFilter).format("DD/MM/YYYY")}
          </Text>
        </TouchableOpacity>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button
              onPress={openMenu}
              mode="contained-tonal"
              style={styles.menuButton}
            >
              {selectedTable || "Chọn bàn"}
            </Button>
          }
          style={styles.menuContainer}
        >
          {tableOptions.map((table, index) => (
            <Menu.Item
              key={index}
              onPress={() => {
                setSelectedTable(table);
                closeMenu();
              }}
              title={table}
            />
          ))}
        </Menu>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dateFilter}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDateFilter(selectedDate);
          }}
        />
      )}

      <ScrollView>{renderContent()}</ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dateButtonText: {
    color: "white",
    fontWeight: "500",
  },
  tableWrapper: {
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: "#ecf0f1",
  },
  headerRow: {
    height: 50,
    backgroundColor: "#3498db",
  },
  headerText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  rowText: {
    textAlign: "center",
    padding: 8,
    fontSize: 14,
    color: "#333",
  },
  noteText: {
    paddingLeft: 8,
    textAlign: "left",
    fontSize: 14,
    color: "#333",
  },
  noDataRow: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  noDataText: {
    color: "#95a5a6",
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: "white",
    fontWeight: "500",
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    marginHorizontal: 4,
  },
  menuButton: {
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 40,
  },
});

export default RequestScreen;
