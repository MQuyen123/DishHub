import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { Table, Row } from "react-native-table-component";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { apiService } from "../networking/apiService";

const RequestScreen = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tableHead = ["ID", "Order ID", "Loại", "Ghi chú", "Thời gian", "Trạng thái"];
  const widthArr = [60, 100, 120, 150, 120, 120];

  const fetchRequests = async () => {
    try {
      console.log("[DEBUG] Bắt đầu gọi API");
      setError(null);
      const response = await apiService.fetchRequests();
      console.log("[DEBUG] Phản hồi API:", response);
      const data = response?.isSucess ? response.data : [];
      console.log('hehhee' + data);
      setRequests(data)
      console.log("[DEBUG] Cập nhật requests thành công");
    } catch (error) {
      console.error("[DEBUG] Lỗi trong quá trình fetch:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setRequests([]);
    } finally {
      console.log("[DEBUG] Kết thúc quá trình fetch");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequestsByDate(dateFilter);
  }, [requests, dateFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
  };

  const filterRequestsByDate = (date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    console.log(requests);
    const filtered = (requests || []).filter(
      (request) => {
        const requestDate = dayjs(request?.createdAt, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD");
        return requestDate === formattedDate; 
      }
    );
    setFilteredRequests(filtered.reverse());
  };

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
          <TouchableOpacity onPress={fetchRequests} style={styles.retryButton}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => {
                console.log("Request item:", request); // Debug từng item
                return (
                  <Row
                    key={request?.id || index}
                    data={[
                      request?.id.toString() || "--",
                      request?.orderId.toString() || "--",
                      request?.typeName || "--",
                      request?.note || "--",
                      request?.createdAt ? 
                        dayjs(request.createdAt, "YYYY-MM-DD HH:mm:ss").format("HH:mm") 
                        : "--",
                      getStatusStyle(request?.status).text,
                    ]}
                    style={[
                      styles.row,
                      index % 2 === 0 && styles.evenRow,
                      { backgroundColor: getStatusStyle(request?.status).bg }
                    ]}
                    textStyle={{ color: getStatusStyle(request?.status).textColor }} // Đảm bảo đây là object
                    widthArr={widthArr}
                  />
                );
              })
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
      </View>

      {showPicker && (
        <DateTimePicker
          value={dateFilter}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              setDateFilter(selectedDate);
            }
          }}
        />
      )}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3498db"]}
            tintColor="#3498db"
          />
        }
      >
        {renderContent()}
      </ScrollView>
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
  },
  row: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
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
});

export default RequestScreen;