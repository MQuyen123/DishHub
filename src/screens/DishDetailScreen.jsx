import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'; 

const DishDetailScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Text>DishDetailScreen</Text>
      </View>
    </SafeAreaView>
  )
}

export default DishDetailScreen

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
})