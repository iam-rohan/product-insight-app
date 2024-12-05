import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {analyzeIngredients} from '../services/feature_extraction';

// Define Rank Type
type RankType = 'A' | 'B' | 'C' | 'D' | 'E';

// Define parameter list for navigation
type RootStackParamList = {
  Result: {
    coverPhoto: string;
    ocrPhoto: string;
    ingredientList: string[];
    rank: string;
  };
};

type ResultScreenProps = {
  route: RouteProp<RootStackParamList, 'Result'>;
};

// Define Ranker Component for Overall Product
const OverallRanker: React.FC<{rank: RankType}> = ({rank}) => {
  const ranks: RankType[] = ['A', 'B', 'C', 'D', 'E'];

  const getRankColor = (rank: RankType) => {
    switch (rank) {
      case 'A':
        return '#2E7D32'; // Green
      case 'B':
        return '#66BB6A'; // Light Green
      case 'C':
        return '#FFEB3B'; // Yellow
      case 'D':
        return '#FF9800'; // Orange
      case 'E':
        return '#F44336'; // Red
      default:
        return '#BDBDBD'; // Gray
    }
  };

  return (
    <View style={styles.rankContainer}>
      {ranks.map(r => (
        <View
          key={r}
          style={[
            styles.rankBox,
            {
              backgroundColor: getRankColor(r),
              transform: r === rank ? [{scale: 1.5}] : [{scale: 1}],
            },
          ]}>
          <Text style={styles.rankText}>{r}</Text>
        </View>
      ))}
    </View>
  );
};

// Define Ranker Component for Ingredients
const IngredientRanker: React.FC<{rank: RankType}> = ({rank}) => {
  const getRankColor = (rank: RankType) => {
    switch (rank) {
      case 'A':
        return '#2E7D32'; // Green
      case 'B':
        return '#66BB6A'; // Light Green
      case 'C':
        return '#FFEB3B'; // Yellow
      case 'D':
        return '#FF9800'; // Orange
      case 'E':
        return '#F44336'; // Red
      default:
        return '#BDBDBD'; // Gray
    }
  };

  return (
    <View style={[styles.rankBox, {backgroundColor: getRankColor(rank)}]}>
      <Text style={styles.rankText}>{rank}</Text>
    </View>
  );
};

// ResultScreen Component
const ResultScreen: React.FC<ResultScreenProps> = ({route}) => {
  const {coverPhoto, ingredientList, rank} = route.params;

  const [loading, setLoading] = useState(true);
  const [ingredientRanks, setIngredientRanks] = useState<
    {ingredient: string; rank: RankType}[]
  >([]);
  const [overallRank, setOverallRank] = useState<RankType>(rank as RankType);
  const [unrecognizedIngredients, setUnrecognizedIngredients] = useState<
    string[]
  >([]);
  const [carcinogenicIngredients, setCarcinogenicIngredients] = useState<
    string[]
  >([]);
  const [harmfulPreservatives, setHarmfulPreservatives] = useState<string[]>(
    [],
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const result = await analyzeIngredients(ingredientList);

        const newIngredientRanks = result.recognized.map(ingredient => {
          const score = Math.random(); // Replace with actual health score logic
          const rank = getRankFromScore(score);
          return {ingredient, rank};
        });

        // Determine overall product rank based on ingredient scores
        const overallScore =
          newIngredientRanks.reduce(
            (acc, item) => acc + rankToScore(item.rank),
            0,
          ) / newIngredientRanks.length;
        const finalRank = getRankFromScore(overallScore);

        setIngredientRanks(newIngredientRanks);
        setOverallRank(finalRank);
        setUnrecognizedIngredients(result.unrecognized);
        setCarcinogenicIngredients(result.carcinogenic);
        setHarmfulPreservatives(result.harmful);
      } catch (error) {
        console.error('Error analyzing ingredients:', error);
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, [ingredientList]);

  const getRankFromScore = (score: number): RankType => {
    if (score >= 0.8) return 'A';
    if (score >= 0.6) return 'B';
    if (score >= 0.4) return 'C';
    if (score >= 0.2) return 'D';
    return 'E';
  };

  const rankToScore = (rank: RankType): number => {
    switch (rank) {
      case 'A':
        return 1;
      case 'B':
        return 0.8;
      case 'C':
        return 0.6;
      case 'D':
        return 0.4;
      case 'E':
        return 0.2;
      default:
        return 0;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Image source={{uri: coverPhoto}} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <OverallRanker rank={overallRank} />
        </View>
      </View>

      {/* Recognized Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recognized Ingredients:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <View>
            {ingredientRanks.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.ingredientText}>{item.ingredient}</Text>
                <IngredientRanker rank={item.rank} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Unrecognized Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unrecognized Ingredients:</Text>
        {unrecognizedIngredients.length > 0 ? (
          unrecognizedIngredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>
              {ingredient}
            </Text>
          ))
        ) : (
          <Text style={styles.ingredientText}>None</Text>
        )}
      </View>

      {/* Carcinogenic Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Carcinogenic Ingredients:</Text>
        {carcinogenicIngredients.length > 0 ? (
          carcinogenicIngredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>
              {ingredient}
            </Text>
          ))
        ) : (
          <Text style={styles.ingredientText}>None</Text>
        )}
      </View>

      {/* Harmful Preservatives Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harmful Preservatives:</Text>
        {harmfulPreservatives.length > 0 ? (
          harmfulPreservatives.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>
              {ingredient}
            </Text>
          ))
        ) : (
          <Text style={styles.ingredientText}>None</Text>
        )}
      </View>

      {/* Full-Screen Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Image source={{uri: coverPhoto}} style={styles.modalImage} />
          <Button title="Close" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  image: {
    width: 180,
    height: 200,
    borderRadius: 10,
    marginRight: 20,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  rankContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  rankBox: {
    width: 33,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  ingredientText: {
    fontSize: 16,
    color: '#444',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default ResultScreen;
