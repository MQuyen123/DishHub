import axiosInstance from './axiosConfig';

class ApiService {
  async fetchDish(id) {
    return axiosInstance.get(`/dish/${id}`);
  }

  async fetchAllDishes() {
    return axiosInstance.get('/dish');
  }

  async fetchCategories() {
    return axiosInstance.get('/categories');
  }

  async fetchRequests() {
    return axiosInstance.get('/requests');
  }
}

export const apiService = new ApiService();
