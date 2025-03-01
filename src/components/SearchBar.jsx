import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SearchBar = () => {
  const insets = useSafeAreaInsets(); 
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top, height: 60 + insets.top }]}>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});

export default SearchBar;
