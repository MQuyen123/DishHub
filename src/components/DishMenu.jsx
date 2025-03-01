import React, { useEffect, useState } from "react";
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
import { Card, Menu, List } from "react-native-paper"; // Import các component từ react-native-paper
import axios from "axios";
import { formatPrice } from "../utils/formatPrice";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 2 - 15;

const DishMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchDishes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/api/categories"
      );
      setCategories(
        Array.isArray(response.data?.data) ? response.data.data : []
      );
    } catch (error) {
      console.error("Lỗi lấy danh mục món ăn:", error);
      setCategories([]);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await axios.get(
        "https://dishub-dxacd4dyevg9h3en.southeastasia-01.azurewebsites.net/api/dishes"
      );
      setDishes(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách món ăn:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = filter === "all" || dish.categoryId.toString() === filter;
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openMenu = () => {
    console.log("Nút dropdown được nhấn!");
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
                {categories.find((cat) => cat.id.toString() === filter)?.name || "Tất cả"}
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
    alignSelf: "flex-start", // Đảm bảo nó không chiếm hết màn hình
  },
  dropdownButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2, // Bóng cho Android
    shadowColor: "#000", // Bóng cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  menu: {
    width: 200, // Độ rộng của menu
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
