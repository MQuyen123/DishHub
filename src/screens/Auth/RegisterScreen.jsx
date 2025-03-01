import React, { useState } from "react";
import { View, TextInput, Button, Text, ScrollView, Alert } from "react-native";
import authService from "../../service/authService";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleRegister = async () => {
    try {
      const userData = {
        username,
        fullName,
        email,
        password,
        dob,
        phoneNumber,
        address,
        avatar
      };

      await authService.register(userData);
      Alert.alert("Success", "Registration successful! Please login.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>Username</Text>
      <TextInput value={username} onChangeText={setUsername} />

      <Text>Full Name</Text>
      <TextInput value={fullName} onChangeText={setFullName} />

      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />

      <Text>Date of Birth (YYYY-MM-DD)</Text>
      <TextInput value={dob} onChangeText={setDob} />

      <Text>Phone Number</Text>
      <TextInput value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

      <Text>Address</Text>
      <TextInput value={address} onChangeText={setAddress} />

      <Text>Avatar URL (Optional)</Text>
      <TextInput value={avatar} onChangeText={setAvatar} />

      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
    </ScrollView>
  );
};

export default RegisterScreen;
