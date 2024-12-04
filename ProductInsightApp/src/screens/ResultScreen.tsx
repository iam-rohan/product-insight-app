import React, { useEffect, useState } from 'react';
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
import Icon from 'react-native-vector-icons/FontAwesome';
import { RouteProp } from '@react-navigation/native';
import { recognizeTextFromImage } from '../services/mlkit';

type RankType = 'A' | 'B' | 'C' | 'D' | 'E';

type RootStackParamList = {
  Result: { coverPhoto: string; ocrPhoto: string; rank: RankType };
};

type ResultScreenProps = {
  route: RouteProp<RootStackParamList, 'Result'>;
};

// Define Ranker component
const Ranker: React.FC<{ rank: RankType }> = ({ rank }) => {
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
      {ranks.map((r) => (
        <View
          key={r}
          style={[
            styles.rankBox,
            {
              backgroundColor: getRankColor(r),
              transform: r === rank ? [{ scale: 1.5 }] : [{ scale: 1 }],
            },
          ]}
        >
          <Text style={styles.rankText}>{r}</Text>
        </View>
      ))}
    </View>
  );
};

// ResultScreen Component
const ResultScreen: React.FC<ResultScreenProps> = ({ route }) => {
  const { coverPhoto, ocrPhoto } = route.params;

  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNegatives, setShowNegatives] = useState(true);
  const [showPositives, setShowPositives] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const negatives = [
    { text: 'Phosphoric Acid', color: 'red' },
    { text: 'High Sugar', color: 'red' },
    { text: 'Caffeine', color: 'red' },
  ];

  const positives = [
    { text: 'Low Calories', color: 'green' },
    { text: 'Vitamin C', color: 'green' },
    { text: 'No Artificial Flavors', color: 'green' },
  ];

  useEffect(() => {
    const performOCR = async () => {
      try {
        setLoading(true);
        const text = await recognizeTextFromImage(ocrPhoto);
        setRecognizedText(text);
      } catch (error) {
        console.error('OCR failed:', error);
        setRecognizedText('Failed to recognize text from the image.');
      } finally {
        setLoading(false);
      }
    };

    performOCR();
  }, [ocrPhoto]);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Image source={{ uri: coverPhoto }} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.headerText}>
         
          {/* Always use rank "C" */}
          <Ranker rank="C" />
        </View>
      </View>

      {/* OCR Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recognized Ingredients:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <Text style={styles.ingredientsText}>
            {recognizedText || 'No text found.'}
          </Text>
        )}
      </View>

      {/* Negatives Section */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => setShowNegatives(!showNegatives)}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Negatives</Text>
            <Icon
              name={showNegatives ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {showNegatives && (
          <View>
            {negatives.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.negativeText}>{item.text}</Text>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Positives Section */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => setShowPositives(!showPositives)}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Positives</Text>
            <Icon
              name={showPositives ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </View>
        </TouchableOpacity>
        {showPositives && (
          <View>
            {positives.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.positiveText}>{item.text}</Text>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Full-Screen Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: coverPhoto }} style={styles.modalImage} />
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
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
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  negativeText: {
    fontSize: 16,
    color: '#D32F2F',
  },
  positiveText: {
    fontSize: 16,
    color: '#388E3C',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  ingredientsText: {
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
