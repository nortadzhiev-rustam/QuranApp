import { ScrollView, Text, View, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';

export default function SearchIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  // TODO: Implement search functionality
  const handleSearch = (query) => {
    console.log('🔍 SEARCH: Searching for:', query);
  };
  const renderEmptyState = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No results found</Text>
      </View>
    );
  };
  return (
    <FlatList
      data={[]}
      renderItem={renderEmptyState}
      keyExtractor={(item, index) => index.toString()}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
