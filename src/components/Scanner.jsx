import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const Scanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);

  // Kiểm tra quyền camera
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Cần cấp quyền truy cập camera</Text>
        <Button title="Cấp quyền" onPress={requestPermission} />
      </View>
    );
  }

  // Hàm xử lý khi quét QR code
  const handleBarCodeScanned = ({ data }) => {
    setScannedData(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarCodeScanned}
      />
      {scannedData && (
        <Text style={styles.result}>Kết quả: {scannedData}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: "100%",
    height: 400,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  result: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
  },
});

export default Scanner;
