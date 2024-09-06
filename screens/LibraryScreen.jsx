import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

const books = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'https://example.com/great-gatsby.jpg',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'https://example.com/mockingbird.jpg',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    cover: 'https://example.com/1984.jpg',
  },
  // Add more books here
];

const LibraryScreen = () => {
  const renderBook = ({ item }) => (
    <TouchableOpacity style={styles.bookContainer}>
      <Image source={{ uri: item.cover }} style={styles.coverImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  bookContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 5,
  },
  bookInfo: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default LibraryScreen;
