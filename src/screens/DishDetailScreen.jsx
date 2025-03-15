import React, { useEffect, useState, useContext } from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';
import { Card, Text, ActivityIndicator, Appbar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatPrice } from "../utils/formatPrice";
import { apiService } from "../networking/apiService";
import { AuthContext } from "../context/AuthContext";

const DishDetailScreen = () => {
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { dishId } = route.params;
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (dishId && auth?.token) {
      fetchDishDetail(dishId);
    } else {
      console.error("dishId or token is missing");
      setLoading(false);
    }
  }, [dishId, auth]);

  const fetchDishDetail = async (id) => {
    setLoading(true);
    try {
      const response = await apiService.fetchDish(id, auth.token);
      if (response.isSucess && response.data) {
        setDish(response.data);
      } else {
        console.error("Failed to fetch dish detail:", response.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching dish detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator animating={true} size="large" style={styles.loader} />;
  }

  if (!dish) {
    return <Text style={styles.errorText}>Không tìm thấy thông tin món ăn.</Text>;
  }

  return (
    <View style={styles.container}>
      <Appbar>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </Appbar>

      <Card>
        <Card.Cover source={{ uri: dish.image }} style={styles.image} />
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>{dish.name}</Text>
          <Text variant="bodyMedium" style={styles.description}>{dish.description}</Text>
          <Text variant="titleMedium" style={styles.price}>Giá: {formatPrice(dish.price)}</Text>
        </Card.Content>
      </Card>

      {dish.ingredients && dish.ingredients.length > 0 && (
        <View>
          <Text variant="titleMedium" style={styles.ingredientTitle}>Nguyên liệu</Text>
          <FlatList
            data={dish.ingredients}
            keyExtractor={(item) => item.id?.toString()}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={styles.ingredientContainer}>
                <Image source={{ uri: item.image }} style={styles.ingredientImage} />
                <Text variant="bodySmall" style={styles.ingredientName}>{item.name}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    height: 200,
    width: 200,
    alignSelf: 'center',
    marginVertical: 16,
  },
  title: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  description: {
    marginVertical: 4,
  },
  price: {
    marginVertical: 8,
    fontWeight: 'bold',
    color: 'green',
  },
  ingredientTitle: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  ingredientContainer: {
    alignItems: 'center',
    margin: 8,
    width: 100,
  },
  ingredientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ingredientName: {
    textAlign: 'center',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default DishDetailScreen;
