import axiosInstance from './axiosConfig';

class ApiService {
  async fetchProduct(id) {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async fetchAllProducts() {
    try {
      const response = await axiosInstance.get('/products');
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const response = await axiosInstance.get('/products', {
        params: { q: query }
      });
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}
export const apiService = new ApiService();
