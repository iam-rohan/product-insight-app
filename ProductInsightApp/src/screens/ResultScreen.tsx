import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Import your types if needed
import { recognizeTextFromImage } from '../services/mlkit';

type RankType = 'A' | 'B' | 'C' | 'D' | 'E'; // Declare RankType locally

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

const ResultScreen: React.FC<{ route: ResultScreenRouteProp }> = ({ route }) => {
  const [showNegatives, setShowNegatives] = useState(true);
  const [showPositives, setShowPositives] = useState(true);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Extracting data from route params with default fallbacks
  const { coverPhoto = '', ocrPhoto = '' }: {  coverPhoto: string; ocrPhoto: string } = route.params || {};

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

  const getRankColor = (rank: RankType) => {
    switch (rank) {
      case 'A':
        return '#2E7D32';
      case 'B':
        return '#66BB6A';
      case 'C':
        return '#FFEB3B';
      case 'D':
        return '#FF9800';
      case 'E':
        return '#F44336';
      default:
        return '#BDBDBD';
    }
  };

  const Ranker: React.FC<{ rank: RankType }> = ({ rank }) => {
    const ranks: RankType[] = ['A', 'B', 'C', 'D', 'E'];
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

  useEffect(() => {
    const performOCR = async () => {
      try {
        setLoading(true);
        const text = await recognizeTextFromImage(ocrPhoto);
        setRecognizedText(text);
        console.log('Recognized Text:', text); // Debugging the OCR output
      } catch (error) {
        console.error('OCR failed:', error);
        setRecognizedText('Failed to recognize text from the image.');
      } finally {
        setLoading(false);
      }
    };

    if (ocrPhoto) {
      performOCR();
    }
  }, [ocrPhoto]);

  const openModal = (imageUri: string) => {
    setModalImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalImage(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => openModal(coverPhoto)}>
          <Image
            source={{ uri: coverPhoto || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Product</Text>
          <Ranker rank={'C'} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            {loading ? 'Loading...' : recognizedText || 'No text recognized from the photo.'}
          </Text>
        </View>
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
      </ScrollView>

      <Modal visible={modalVisible} transparent={false} animationType="fade">
        <View style={styles.modalContainer}>
          {modalImage && <Image source={{ uri: modalImage }} style={styles.modalImage} />}
          <Button title="Close" onPress={closeModal} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222222',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rankContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: 10,
  },
  rankBox: {
    width: 38,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginVertical: 20,
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingLeft: 20,
  },
  negativeText: {
    color: '#444444',
  },
  positiveText: {
    color: '#444444',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  ingredientsText: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  modalImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default ResultScreen;
