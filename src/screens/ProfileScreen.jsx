import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Avatar } from 'react-native-paper';
import LogoutButton from '../components/LogoutButton';

const ProfileScreen = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("Tokuda Shigeo");
  const [email, setEmail] = useState("Tokudakoaito@gmail.com");
  const [address, setAddress] = useState("123 Sakura St., Minato, Tokyo 105-0011, Japan");
  const [password, setPassword] = useState("mypassword");
  const [isEditing, setIsEditing] = useState(false);

  // Store original information
  const [originalName, setOriginalName] = useState(name);
  const [originalEmail, setOriginalEmail] = useState(email);
  const [originalAddress, setOriginalAddress] = useState(address);
  const [originalPassword, setOriginalPassword] = useState(password);

  const handleSave = () => {
    if (!name || !email || !address || !password) {
      Alert.alert("Error", "All fields must be filled out.");
      return;
    }
    setIsEditing(false);
    setOriginalName(name);
    setOriginalEmail(email);
    setOriginalAddress(address);
    setOriginalPassword(password);
    Alert.alert("Success", "Information saved successfully.");
  };

  const handleCancel = () => {
    setName(originalName);
    setEmail(originalEmail);
    setAddress(originalAddress);
    setPassword(originalPassword);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardContainer}>
          {/* Avatar */}
          <Avatar.Image size={85} source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJPZ11TaJT0Qanrre0NyrNIdcvq60jw4sncA&s' }} />


          {/* Name */}
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={[styles.input, !name && styles.emptyInput]}
              value={name}
              onChangeText={setName}
              editable={isEditing}
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Email */}
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !email && styles.emptyInput]}
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Delivery Address */}
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, !address && styles.emptyInput]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              placeholder="Enter your address"
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Password */}
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, !password && styles.emptyInput]}
                value={passwordVisible ? password : "****"}
                secureTextEntry={!passwordVisible}
                onChangeText={setPassword}
                editable={isEditing}
                placeholder="Enter your password"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <MaterialCommunityIcons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {!isEditing && (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            )}
            {isEditing && (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <LogoutButton/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  infoContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  editButton: {
    backgroundColor: "orange",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProfileScreen;