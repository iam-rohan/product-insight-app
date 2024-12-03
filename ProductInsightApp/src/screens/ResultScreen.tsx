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
import { RootStackParamList } from '../types';
import { getPhotos } from '../database/database'; // Import your database logic
import { recognizeTextFromImage } from '../services/mlkit'; // Assuming this function is correctly implemented

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

type RankType = 'A' | 'B' | 'C' | 'D' | 'E';

const ResultScreen: React.FC<{ route: ResultScreenRouteProp }> = () => {
  const [showNegatives, setShowNegatives] = useState(true);
  const [showPositives, setShowPositives] = useState(true);
  const [coverPhotoFirst, setCoverPhotoFirst] = useState<string | null>(null);
  const [recognizedTextSecond, setRecognizedTextSecond] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

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
        return '#2E7D32'; // Dark green
      case 'B':
        return '#66BB6A'; // Light green
      case 'C':
        return '#FFEB3B'; // Yellow
      case 'D':
        return '#FF9800'; // Orange
      case 'E':
        return '#F44336'; // Red
      default:
        return '#BDBDBD'; // Gray for unranked
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
    const fetchPhotos = async () => {
      setLoading(true);
      setCoverPhotoFirst(null);
      setRecognizedTextSecond(null);

      try {
        const photos = await getPhotos();

        if (photos.length > 0) {
          setCoverPhotoFirst(photos[0].coverPhoto);

          if (photos[0].ocrPhoto) {
            try {
              const recognizedText = await recognizeTextFromImage(photos[0].ocrPhoto);
              setRecognizedTextSecond(recognizedText);
            } catch (error) {
              console.error('OCR failed:', error);
              setRecognizedTextSecond('Failed to recognize text from the image.');
            }
          }
        } else {
          console.log('No photos found in the database.');
          setRecognizedTextSecond('No photos available.');
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
        setRecognizedTextSecond('Error loading photos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

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
        {loading ? (
          <Text>Loading...</Text>
        ) : coverPhotoFirst ? (
          <TouchableOpacity onPress={() => openModal(coverPhotoFirst)}>
            <Image source={{ uri: coverPhotoFirst }} style={styles.productImage} />
          </TouchableOpacity>
        ) : (
          <Text>No Cover Photo Available</Text>
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{''}</Text>
          <Ranker rank="C" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            {recognizedTextSecond || 'No text recognized from the photo.'}
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
          {modalImage && (
            <Image source={{ uri: modalImage }} style={styles.modalImage} />
          )}
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
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
