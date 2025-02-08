import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { apiService } from "../networking/apiService";
import Loading from "./Loading";
import { Card } from 'react-native-paper';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchAllProducts(); 
      setProducts(data); 
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.cardContainer}>
      <Card style={styles.productCard}>
        <Card.Cover source={{ uri: item.image }} style={styles.productImage} />
        <Card.Content>
          <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
          <Text style={styles.productPrice}>Price: ${item.price}</Text>
          <Text style={styles.ratingText}>⭐ {item.rating.rate} ({item.rating.count})</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} 
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  productList: {
    paddingVertical: 10,
  },
  cardContainer: {
    flex: 1,
    margin: 10,
  },
  productCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
  },
  productImage: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
    marginTop: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#555",
    textAlign: "left",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 12,
    color: "#888",
    textAlign: "left",
    marginTop: 5,
  },
});

export default Menu;
