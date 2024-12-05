import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {storePhotos, initDatabase} from '../database/database';
import {recognizeTextFromImage} from '../services/mlkit'; // Importing OCR service

// Define the parameter list for navigation
type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: {
    coverPhoto: string;
    ocrPhoto: string;
    ingredientList: string[];
    rank: string;
  };
  Confirmation: {photos: string[]};
};

// Define the props for the ConfirmationScreen
type ConfirmationScreenProps = {
  route: RouteProp<RootStackParamList, 'Confirmation'>;
  navigation: StackNavigationProp<RootStackParamList, 'Confirmation'>;
};

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const {photos} = route.params; // Destructure the photos from the route params
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      await initDatabase(); // Ensure the database is initialized
      const validImages = photos.map(photo => `file://${photo}`);
      setImages(validImages);
      setIsLoading(false);
    };

    initializeDatabase();
  }, [photos]);

  const handleRetake = () => {
    navigation.replace('Camera');
  };

  const handleConfirm = async () => {
    try {
      console.log('Photos confirmed:', images);

      // Store photos in the database
      const coverPhoto = images[0]; // First image as cover photo
      const ocrPhoto = images[1]; // Second image as OCR photo

      // Extract ingredient list from OCR photo
      const recognizedText = await recognizeTextFromImage(ocrPhoto);
      if (recognizedText) {
        // Split recognized text by commas instead of spaces
        const ingredientList = recognizedText
          .split(',')
          .map(item => item.trim()) // Trim spaces around each ingredient
          .filter(item => item.length > 0); // Filter out any empty strings

        console.log('Ingredient list extracted:', ingredientList);

        // Default rank for the product
        const rank = 'C';

        // Store photos, ingredient list, and rank in the database
        await storePhotos(coverPhoto, ocrPhoto, ingredientList, rank);

        console.log('Photos and ingredient list stored successfully');

        // Navigate to Result screen, passing the ingredientList and photo URIs
        navigation.navigate('Result', {
          coverPhoto,
          ocrPhoto,
          ingredientList,
          rank,
        });
      } else {
        console.warn('Failed to extract ingredient list.');
      }
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Your Photos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.imageContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{uri}} style={styles.image} />
          ))}
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetake}>
          <Text style={styles.buttonText}>Retake Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm Photos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#A8D5BA',
  },
  header: {
    color: 'black',
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3%',
  },
  image: {
    width: '50%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#fff',
    margin: 5,
    borderRadius: 8,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#CAE5D5',
    borderRadius: 10,
    padding: 10,
    width: '40%',
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ConfirmationScreen;
