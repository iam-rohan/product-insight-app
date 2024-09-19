import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList } from 'react-native';

const { width } = Dimensions.get('window');

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);

  const handleSearch = () => {
    if (query.trim()) {
      setHistory((prevHistory) => [...prevHistory, query.trim()]);
      setQuery('');
    }
  };

  const clearQuery = () => {
    setQuery('');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const renderHistoryItem = ({ item }: { item: string }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Search</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearQuery} style={styles.clearIconContainer}>
                <Image source={require('../assets/icons/clear.png')} style={styles.iconImage} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
              <Image source={require('../assets/icons/search.png')} style={styles.iconImage} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {history.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.footerText}>Clear</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>History</Text>
        </View>
      )}
      {history.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.historyList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8D5BA',
  },
  header: {
    height: '33%',
    backgroundColor: '#3B7A57',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#D9D9D9',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
  },
  searchBarContainer: {
    width: 335,
    height: 47.56,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    height: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 40,
    backgroundColor: '#FFF',
  },
  searchIconContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  clearIconContainer: {
    position: 'absolute',
    right: 50,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  iconImage: {
    width: 15,
    height: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footerText: {
    color: '#000',
    fontSize: 10,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  historyList: {
    marginTop: 10,
  },
  historyItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#2A5A42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historyText: {
    color: '#000',
    fontSize: 14,
  },
});

export default SearchScreen;