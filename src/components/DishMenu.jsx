import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Card, Menu, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import { apiService } from "../networking/apiService"; // Đảm bảo đường dẫn chính xác

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 2 - 15;

const DishMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (auth && auth.token) {
      fetchCategories();
      fetchDishes();
    }
  }, [auth]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.fetchCategories(auth.token);
      if (response.isSucess) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục món ăn:", error);
      setCategories([]);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await apiService.fetchAllDishes(auth.token);
      if (response.isSucess) {
        setDishes(response.data);
      } else {
        setDishes([]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách món ăn:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      filter === "all" || dish.categoryId.toString() === filter;
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openMenu = () => {
    setVisible(true);
  };

  const closeMenu = () => setVisible(false);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm món ăn..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <View style={styles.dropdownContainer}>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>
                {categories.find((cat) => cat.id.toString() === filter)?.name ||
                  "Tất cả"}
              </Text>
            </TouchableOpacity>
          }
          style={styles.menu}
        >
          <List.Item
            title="Tất cả"
            onPress={() => {
              setFilter("all");
              closeMenu();
            }}
            left={() => <List.Icon icon="folder" />}
          />
          {categories.map((category) => (
            <List.Item
              key={category.id.toString()}
              title={category.name}
              onPress={() => {
                setFilter(category.id.toString());
                closeMenu();
              }}
              left={() => <List.Icon icon="folder" />}
            />
          ))}
        </Menu>
      </View>
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("DishDetail", { dishId: item.id })
            }
          >
            <Card style={styles.card}>
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require("../../assets/SmallLogo.png")
                }
                style={styles.image}
              />
              <Card.Content>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  dropdownButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  menu: {
    width: 200,
    marginTop: 5,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: ITEM_SIZE,
    marginBottom: 15,
    borderRadius: 10,
  },
  image: { width: ITEM_SIZE, height: ITEM_SIZE, resizeMode: "cover" },
  title: { fontSize: 16, fontWeight: "bold", marginVertical: 5 },
  price: { fontSize: 14, color: "#FF6347" },
});

export default DishMenu;
