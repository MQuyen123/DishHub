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
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as signalR from "@microsoft/signalr";
import Toast from "react-native-toast-message";
import { Button, Menu, DataTable, Modal, Portal, Paragraph } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { apiService } from "../networking/apiService";

const RequestScreen = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState("Tất cả");
  const [tableOptions, setTableOptions] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const restaurantId = 1;

  const { auth } = useContext(AuthContext);

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
  }, [requests, dateFilter, selectedTable]);

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

    try {
      const response = await apiService.updateRequestStatus(id, status, auth.token);

      if (response.status === 200) {
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === id ? { ...request, status } : request
          )
        );
        Alert.alert("Thành công", `Đã cập nhật trạng thái thành ${getStatusStyle(status).text}`);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  const getActionButtons = (request) => {
    const { status, id } = request;
    switch (status) {
      case "pending":
        return (
          <Button
            mode="contained"
            onPress={() => updateRequestStatus(id, "inProgress")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Xử lý
          </Button>
        );
      case "inProgress":
        return (
          <Button
            mode="contained"
            onPress={() => updateRequestStatus(id, "completed")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Hoàn tất
          </Button>
        );
      default:
        return null;
    }
  };

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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

    return (
      <ScrollView>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.headerRow}>
            <DataTable.Title style={styles.headerCell}>Bàn</DataTable.Title>
            <DataTable.Title style={styles.headerCell}>Thời gian</DataTable.Title>
            <DataTable.Title style={styles.headerCell}>Trạng thái & Hành động</DataTable.Title>
          </DataTable.Header>

          {filteredRequests.length > 0 ? (
            filteredRequests.map((request, index) => (
              <DataTable.Row 
                key={request.id} 
                style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                onPress={() => showRequestDetails(request)}
              >
                <DataTable.Cell style={styles.cell}>
                  {request?.tableName || "--"}
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  {request?.createdAt
                    ? dayjs(request.createdAt, "YYYY-MM-DD HH:mm:ss").format("HH:mm")
                    : "--"}
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusStyle(request?.status).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusStyle(request?.status).textColor },
                        ]}
                      >
                        {getStatusStyle(request?.status).text}
                      </Text>
                    </View>
                    {getActionButtons(request)}
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            ))
          ) : (
            <DataTable.Row>
              <DataTable.Cell style={styles.noDataCell}>
                Không có yêu cầu nào trong ngày này
              </DataTable.Cell>
            </DataTable.Row>
          )}
        </DataTable>
      </ScrollView>
    );
  };

  const renderModal = () => {
    if (!selectedRequest) return null;

    return (
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
          <View style={styles.modalContent}>
            <Paragraph>ID: {selectedRequest.id}</Paragraph>
            <Paragraph>Bàn: {selectedRequest.tableName || "--"}</Paragraph>
            <Paragraph>Loại: {selectedRequest.typeName || "--"}</Paragraph>
            <Paragraph>Ghi chú: {selectedRequest.note || "--"}</Paragraph>
            <Paragraph>
              Thời gian: {selectedRequest.createdAt
                ? dayjs(selectedRequest.createdAt, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY HH:mm")
                : "--"}
            </Paragraph>
            <Paragraph>Trạng thái: {getStatusStyle(selectedRequest.status).text}</Paragraph>
          </View>
          <Button mode="contained" onPress={hideModal} style={styles.modalButton}>
            Đóng
          </Button>
        </Modal>
      </Portal>
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
              labelStyle={styles.menuButtonLabel}
            >
              {selectedTable}
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
              titleStyle={styles.menuItemText}
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

      <ScrollView style={styles.contentContainer}>{renderContent()}</ScrollView>
      {renderModal()}
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  dateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  menuButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  menuButtonLabel: {
    color: "#333",
    fontWeight: "600",
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: "#333",
  },
  table: {
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 4,
  },
  headerRow: {
    backgroundColor: "#3498db",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    flex: 1,
    justifyContent: "center",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
  cell: {
    flex: 1,
    justifyContent: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  noDataCell: {
    flex: 3,
    justifyContent: "center",
    height: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    color: "#3498db",
    fontSize: 16,
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
    elevation: 2,
  },
  retryText: {
    color: "white",
    fontWeight: "500",
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#3498db",
  },
  buttonLabel: {
    color: "white",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalContent: {
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#3498db",
  },
});

export default RequestScreen;