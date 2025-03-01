import { apiService } from '../networking/apiService';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.lastCreatedAt = null;
    this.pollingInterval = 3000;
    this.isPolling = false;
    this.intervalId = null;
    this.initialized = false;
    this.cacheKey = 'cached_requests'; // Key để lưu trữ trong AsyncStorage
  }

  // ======= INITIALIZATION ======= //
  initialize = async () => {
    if (this.initialized) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Quyền thông báo bị từ chối!');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Khôi phục lastCreatedAt từ cache nếu có
    const cachedData = await this.getCachedData();
    if (cachedData && cachedData.lastCreatedAt) {
      this.lastCreatedAt = cachedData.lastCreatedAt;
    }

    this.initialized = true;
  };

  // ======= CACHE HANDLING ======= //
  // Lấy dữ liệu từ AsyncStorage
  getCachedData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(this.cacheKey);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Lỗi khi lấy cache:', error);
      return null;
    }
  };

  // Lưu dữ liệu vào AsyncStorage
  setCachedData = async (requests) => {
    try {
      const dataToCache = {
        requests,
        lastCreatedAt: this.lastCreatedAt,
      };
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(dataToCache));
    } catch (error) {
      console.error('Lỗi khi lưu cache:', error);
    }
  };

  // ======= POLLING LOGIC ======= //
  startPolling = async () => {
    if (!this.isPolling) {
      await this.initialize();
      this.checkRequests();
      this.intervalId = setInterval(this.checkRequests, this.pollingInterval);
      this.isPolling = true;
      console.log('Bắt đầu polling...');
    }
  };

  stopPolling = () => {
    if (this.isPolling && this.intervalId) {
      clearInterval(this.intervalId);
      this.isPolling = false;
      this.intervalId = null;
      console.log('Dừng polling...');
    }
  };

  checkRequests = async () => {
    try {
      // Lấy dữ liệu từ API
      const response = await apiService.fetchRequests();
      const serverRequests = response.data;

      // Lấy dữ liệu từ cache
      const cachedData = await this.getCachedData();
      const cachedRequests = cachedData ? cachedData.requests : [];

      // So sánh dữ liệu server với cache
      if (this.isDataChanged(cachedRequests, serverRequests)) {
        console.log('Dữ liệu thay đổi, xử lý request mới...');
        this.processNewRequests(serverRequests);
        await this.setCachedData(serverRequests); // Cập nhật cache
      } else {
        console.log('Không có thay đổi trong dữ liệu.');
      }
    } catch (error) {
      console.error('Lỗi polling:', error);
    }
  };

  // Kiểm tra xem dữ liệu có thay đổi không
  isDataChanged = (cachedRequests, serverRequests) => {
    if (!cachedRequests || cachedRequests.length !== serverRequests.length) {
      return true; // Số lượng khác nhau → dữ liệu thay đổi
    }

    // So sánh từng request (dựa trên id hoặc createdAt)
    return serverRequests.some((serverReq, index) => {
      const cachedReq = cachedRequests[index];
      return (
        serverReq.id !== cachedReq.id ||
        new Date(serverReq.createdAt).getTime() !== new Date(cachedReq.createdAt).getTime()
      );
    });
  };

  // ======= REQUEST PROCESSING ======= //
  processNewRequests = (requests) => {
    if (!requests || !requests.length) return;

    const sortedRequests = [...requests].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const newRequests = this.lastCreatedAt
      ? sortedRequests.filter(
          (req) => new Date(req.createdAt) > new Date(this.lastCreatedAt)
        )
      : sortedRequests;

    if (newRequests.length > 0) {
      this.lastCreatedAt = newRequests[newRequests.length - 1].createdAt;
      newRequests.reverse().forEach((req) => {
        console.log(`Phát hiện request mới: ${req.id}`);
        this.showNotification(req);
      });
    }
  };

  // ======= NOTIFICATION HANDLING ======= //
  showNotification = async (request) => {
    try {
      console.log('Scheduling Notification:', request);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 New Request!',
          body: this.formatNotificationBody(request),
          data: { requestId: request.id },
        },
        trigger: null,
      });
      console.log('Notification Scheduled!');
    } catch (error) {
      console.error('Notification Error:', error);
    }
  };

  formatNotificationBody = (request) => [
    `Mã order: ${request.orderId}`,
    `Loại: ${request.typeName}`,
    `Ghi chú: ${request.note || 'Không có ghi chú'}`,
    `Thời gian: ${request.createdAt}`,
  ].join('\n');
}

export default new NotificationService();