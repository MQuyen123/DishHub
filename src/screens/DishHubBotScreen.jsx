import React, { useState, useCallback } from 'react';
import {  StyleSheet, RefreshControl, ScrollView, Image, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const DishHubBotScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setWebViewKey((prevKey) => prevKey + 1);
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image 
          source={require('../../assets/LogoDishHub.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <WebView 
            key={webViewKey}
            source={{ uri: 'https://elevenlabs.io/app/talk-to?agent_id=HOHyaemgMsoFc0eUole8' }} 
            style={styles.webview}
          />
        </ScrollView>
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
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  webview: {
    flex: 1,
    height: '100%',
  },
  logo: {
    width: "30%", 
    height: "10%", 
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default DishHubBotScreen;
