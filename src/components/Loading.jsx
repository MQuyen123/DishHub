import { StyleSheet, Text, View , ActivityIndicator} from 'react-native'
import React from 'react'

const Loading = () => {
   return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF9803" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
}

export default Loading

const styles = StyleSheet.create({
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
      },
      loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
      },
})