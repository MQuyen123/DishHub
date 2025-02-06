import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useAppContext } from "../context/AppContext";
import { apiService } from '../networking/apiService';

const HomeScreen = () => {
  const { setIsHomeReady } = useAppContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchProduct(1);
      setProduct(data);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
      setIsHomeReady(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9803" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {product && (
          <>
            <Text style={styles.title}>{product.title}</Text>
            <Image 
              source={{ uri: product.image }} 
              style={styles.image}
            />
            <Text style={styles.price}>Price: ${product.price}</Text>
            <Text style={styles.description}>{product.description}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;