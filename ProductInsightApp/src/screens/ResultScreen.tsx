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
import {recognizeTextFromImage} from '../services/mlkit';
import {parseIngredients} from '../services/parseIngredients';
import {computeProductHealthScore} from '../services/scoringService';

type RankType = 'A' | 'B' | 'C' | 'D' | 'E';

type RootStackParamList = {
  Result: {coverPhoto: string; ocrPhoto: string};
};

type ResultScreenProps = {
  route: RouteProp<RootStackParamList, 'Result'>;
};

const Ranker: React.FC<{rank: RankType}> = ({rank}) => {
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

const mapScoreToRank = (score: number): RankType => {
  if (score >= 0.8) return 'A';
  if (score >= 0.6) return 'B';
  if (score >= 0.4) return 'C';
  if (score >= 0.2) return 'D';
  return 'E';
};

const ResultScreen: React.FC<ResultScreenProps> = ({route}) => {
  const {coverPhoto, ocrPhoto} = route.params;

  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [rank, setRank] = useState<RankType>('C');
  const [recognizedIngredients, setRecognizedIngredients] = useState<string[]>(
    [],
  );
  const [unrecognizedIngredients, setUnrecognizedIngredients] = useState<
    string[]
  >([]);
  const [harmfulFlags, setHarmfulFlags] = useState<{
    carcinogenic: string[];
    preservative: string[];
  }>({carcinogenic: [], preservative: []});

  useEffect(() => {
    const performOCRAndScoring = async () => {
      try {
        setLoading(true);

        const text = await recognizeTextFromImage(ocrPhoto);

        const ingredientList = text ? parseIngredients(text) : [];

        const scoreResult = await computeProductHealthScore(ingredientList);
        setHealthScore(scoreResult.overallHealthScore);

        setRecognizedIngredients(
          ingredientList.filter(ingredient =>
            scoreResult.ingredientScores.some(
              score => score.name === ingredient,
            ),
          ),
        );
        setUnrecognizedIngredients(scoreResult.unrecognizedIngredients);

        const computedRank = mapScoreToRank(scoreResult.overallHealthScore);
        setRank(computedRank);

        setHarmfulFlags(scoreResult.harmfulFlags);
      } catch (error) {
        console.error('Error during OCR and scoring:', error);
      } finally {
        setLoading(false);
      }
    };

    performOCRAndScoring();
  }, [ocrPhoto]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Image source={{uri: coverPhoto}} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Ranker rank={rank} />
          <Text style={styles.healthScoreText}>
            {healthScore !== null
              ? `Health Score: ${(healthScore * 100).toFixed(2)}%`
              : 'Calculating...'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recognized Ingredients:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          recognizedIngredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredientsText}>
              {ingredient}
            </Text>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Not Found in Current Database:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          unrecognizedIngredients.map((ingredient, index) => (
            <Text key={index} style={styles.unrecognizedText}>
              {ingredient}
            </Text>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harmful Flags:</Text>
        {harmfulFlags.carcinogenic.length === 0 &&
        harmfulFlags.preservative.length === 0 ? (
          <Text style={styles.noNegativesText}>
            No harmful ingredients detected.
          </Text>
        ) : (
          [
            ...harmfulFlags.carcinogenic.map(flag => ({
              text: `${flag} (Carcinogenic)`,
              color: 'red',
            })),
            ...harmfulFlags.preservative.map(flag => ({
              text: `${flag} (Preservative)`,
              color: 'orange',
            })),
          ].map((item, index) => (
            <Text
              key={index}
              style={[styles.negativeText, {color: item.color}]}>
              {item.text}
            </Text>
          ))
        )}
      </View>

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
  healthScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
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
    marginRight: 5,
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
  ingredientsText: {
    fontSize: 16,
    color: '#444',
  },
  unrecognizedText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  noNegativesText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  negativeText: {
    fontSize: 16,
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
    borderRadius: 10,
  },
});

export default ResultScreen;
