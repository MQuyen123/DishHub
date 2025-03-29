import axiosInstance from "./axiosConfig";

class ApiService {
  async fetchDish(id, token) {
    return axiosInstance.get(`/dishes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async fetchAllDishes(token) {
    return axiosInstance.get("/dishes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async fetchCategories(token) {
    return axiosInstance.get("/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async fetchRequests(token) {
    return axiosInstance.get("/requests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async updateOrderStatus(id, status, token) {
    return axiosInstance.patch(
      `/requests/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  async updateRequestStatus(id, status, token) {
    return axiosInstance.patch(
      `/requests/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}

export const apiService = new ApiService();
