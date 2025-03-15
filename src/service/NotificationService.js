import { HubConnectionBuilder } from '@microsoft/signalr';
import * as Notifications from 'expo-notifications';

class NotificationService {
  constructor() {
    // Cấu hình restaurantId (có thể truyền từ bên ngoài nếu cần)
    const restaurantId = 1;

    // Khởi tạo kết nối SignalR cho requests
    this.requestConnection = new HubConnectionBuilder()
      .withUrl(`https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/hub/requests?restaurantId=${restaurantId}`)
      .withAutomaticReconnect()
      .build();

    // Khởi tạo kết nối SignalR cho orders
    this.orderConnection = new HubConnectionBuilder()
      .withUrl(`https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/hub/order-details?restaurantId=${restaurantId}`)
      .withAutomaticReconnect()
      .build();

    this.initialized = false;
  }

  // Khởi tạo dịch vụ và kết nối SignalR
  initialize = async () => {
    if (this.initialized) return;

    // Yêu cầu quyền thông báo
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Quyền thông báo bị từ chối!');
      return;
    }

    // Thiết lập cách xử lý thông báo
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Kết nối đến hub requests
    try {
      await this.requestConnection.start();
      console.log('Kết nối SignalR cho requests đã khởi động');
    } catch (err) {
      console.error('Kết nối SignalR cho requests thất bại:', err);
    }

    // Kết nối đến hub orders
    try {
      await this.orderConnection.start();
      console.log('Kết nối SignalR cho orders đã khởi động');
    } catch (err) {
      console.error('Kết nối SignalR cho orders thất bại:', err);
    }

    // Thiết lập lắng nghe sự kiện
    this.setupEventListeners();

    this.initialized = true;
  };

  // Thiết lập lắng nghe sự kiện từ hai hub
  setupEventListeners = () => {
    // Sự kiện từ hub requests
    this.requestConnection.on('ReceiveNewRequest', (newRequest) => {
      this.showNotification('Yêu cầu mới', this.formatRequestBody(newRequest));
    });

    this.requestConnection.on('UpdateRequestStatus', (updatedRequest) => {
      this.showNotification('Cập nhật yêu cầu', this.formatRequestUpdateBody(updatedRequest));
    });

    // Sự kiện từ hub orders
    this.orderConnection.on('ReceiveNewOrder', (newOrder) => {
      this.showNotification('Đơn hàng mới', this.formatOrderBody(newOrder));
    });

    this.orderConnection.on('UpdateOrderDetailStatus', (updatedOrder) => {
      this.showNotification('Cập nhật đơn hàng', this.formatOrderUpdateBody(updatedOrder));
    });
  };

  // Định dạng nội dung thông báo cho yêu cầu mới
  formatRequestBody = (request) => {
    return `Yêu cầu mới từ bàn ${request.tableName}: ${request.typeName}`;
  };

  // Định dạng nội dung thông báo cho cập nhật yêu cầu
  formatRequestUpdateBody = (request) => {
    return `Yêu cầu ${request.id} đã được cập nhật thành ${request.status}`;
  };

  // Định dạng nội dung thông báo cho đơn hàng mới
  formatOrderBody = (order) => {
    return `Đơn hàng mới từ bàn ${order.tableName}: ${order.dishName} x${order.quantity}`;
  };

  // Định dạng nội dung thông báo cho cập nhật đơn hàng
  formatOrderUpdateBody = (order) => {
    return `Đơn hàng ${order.id} đã được cập nhật thành ${order.status}`;
  };

  // Hiển thị thông báo hệ thống
  showNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null, // Hiển thị ngay lập tức
      });
      console.log('Thông báo đã được lên lịch:', title, body);
    } catch (error) {
      console.error('Lỗi khi hiển thị thông báo:', error);
    }
  };

  // Dừng kết nối SignalR (tuỳ chọn)
  stop = async () => {
    try {
      await this.requestConnection.stop();
      await this.orderConnection.stop();
      console.log('Đã dừng các kết nối SignalR');
    } catch (err) {
      console.error('Lỗi khi dừng kết nối:', err);
    }
  };
}

export default new NotificationService();