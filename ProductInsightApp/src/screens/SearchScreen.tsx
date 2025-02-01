import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {computeProductHealthScore} from '../services/scoringService';

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [recognizedIngredients, setRecognizedIngredients] = useState<
    Array<{name: string; grade: {letter: string; color: string}}>
  >([]);
  const [unrecognizedIngredients, setUnrecognizedIngredients] = useState<
    string[]
  >([]);
  const [harmfulFlags, setHarmfulFlags] = useState<{
    carcinogenic: string[];
    preservative: string[];
  }>({
    carcinogenic: [],
    preservative: [],
  });
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Handle ingredient search
  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setShowOverlay(true);

    try {
      const ingredientList = query
        .split(',')
        .map(item => item.trim().toLowerCase());
      const scoreResult = await computeProductHealthScore(ingredientList);

      // Map scores to grades like A,B,C,D,E
      const gradedIngredients = scoreResult.ingredientScores.map(
        ({name, score}) => ({
          name,
          grade: mapScoreToGrade(score),
        }),
      );

      // Separate recognized & unrecognized ingredients
      const recognized = gradedIngredients;
      const unrecognized = ingredientList.filter(
        ingredient =>
          !scoreResult.ingredientScores.some(
            score => score.name === ingredient,
          ),
      );

      setRecognizedIngredients(recognized);
      setUnrecognizedIngredients(unrecognized);
      setHarmfulFlags(scoreResult.harmfulFlags);

      // Update search history
      setHistory(prevHistory => [query.trim(), ...prevHistory]);
    } catch (error) {
      console.error('Error in search:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapScoreToGrade = (score: number): {letter: string; color: string} => {
    if (score >= 0.8) return {letter: 'A', color: '#2E7D32'}; // Green
    if (score >= 0.6) return {letter: 'B', color: '#66BB6A'}; // Light Green
    if (score >= 0.4) return {letter: 'C', color: '#FFEB3B'}; // Yellow
    if (score >= 0.2) return {letter: 'D', color: '#FF9800'}; // Orange
    return {letter: 'E', color: '#F44336'}; // Red
  };

  // Clear search input
  const clearQuery = () => {
    setQuery('');
  };

  // Clear search history
  const clearHistory = () => {
    setHistory([]);
  };

  // Render search history
  const renderHistoryItem = ({item}: {item: string}) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header & Search Bar */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Search</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter ingredients (comma-separated)..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={performSearch}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={clearQuery}
                style={styles.clearIconContainer}>
                <Icon name="times" size={15} color="#000" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={performSearch}
              style={styles.searchIconContainer}>
              <Icon name="search" size={15} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search History */}
      {history.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Search History</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearHistoryText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.historyList}
          />
        </View>
      )}

      {/* Output Modal (Overlay) */}
      {showOverlay && (
        <Modal transparent={true} animationType="slide" visible={showOverlay}>
          <View style={styles.overlayContainer}>
            <View style={styles.outputBox}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOverlay(false)}>
                <Text style={styles.closeText}>✖ Close</Text>
              </TouchableOpacity>

              {/* Recognized Ingredients & Scores */}
              <Text style={styles.sectionTitle}>Recognized Ingredients</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#3498db" />
              ) : recognizedIngredients.length > 0 ? (
                recognizedIngredients.map(({name, grade}, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gradeContainer,
                      {backgroundColor: grade.color},
                    ]}>
                    <Text style={styles.gradeText}>
                      {name}: {grade.letter}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.unrecognizedText}>
                  No recognized ingredients.
                </Text>
              )}

              {/* Unrecognized Ingredients */}
              <Text style={styles.sectionTitle}>
                Not Found in Current Database
              </Text>
              {unrecognizedIngredients.length > 0 ? (
                unrecognizedIngredients.map((ingredient, index) => (
                  <Text key={index} style={styles.unrecognizedText}>
                    {ingredient}
                  </Text>
                ))
              ) : (
                <Text style={styles.resultText}>
                  All ingredients recognized.
                </Text>
              )}

              {/* Harmful Flags */}
              <Text style={styles.sectionTitle}>Harmful Flags</Text>
              {harmfulFlags.carcinogenic.length > 0 ||
              harmfulFlags.preservative.length > 0 ? (
                <>
                  {harmfulFlags.carcinogenic.map((item, index) => (
                    <Text key={index} style={styles.harmfulText}>
                      {item} (Carcinogenic)
                    </Text>
                  ))}
                  {harmfulFlags.preservative.map((item, index) => (
                    <Text key={index} style={styles.harmfulText}>
                      {item} (Preservative)
                    </Text>
                  ))}
                </>
              ) : (
                <Text style={styles.resultText}>
                  No harmful ingredients detected.
                </Text>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    color: 'black',
  },

  // 🔹 Header Styles
  header: {
    height: '27%',
    backgroundColor: '#3B7A57',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerText: {
    color: '#D9D9D9',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: '5%',
  },

  // 🔹 Search Input Section
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: '5%',
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
    borderRadius: 22,
    paddingHorizontal: 30,
    backgroundColor: '#D9D9D9',
  },
  searchIconContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{translateY: -12}],
  },
  clearIconContainer: {
    position: 'absolute',
    right: 50,
    top: '50%',
    transform: [{translateY: -12}],
  },

  // 🔹 Search History Section
  historyContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearHistoryText: {
    color: 'red',
    fontSize: 14,
  },
  historyList: {
    marginTop: 10,
  },
  historyItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },

  // 🔹 Overlay for Results
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  outputBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },

  // 🔹 Close Button Styles
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 🔹 Section Headers
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },

  // 🔹 Ingredient Result Styles
  resultText: {
    fontSize: 16,
    color: '#444',
    paddingVertical: 4,
  },

  unrecognizedText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 4,
  },

  harmfulText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: 'bold',
    paddingVertical: 4,
  },

  // 🔹 Grading System for Recognized Ingredients
  gradeContainer: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SearchScreen;
