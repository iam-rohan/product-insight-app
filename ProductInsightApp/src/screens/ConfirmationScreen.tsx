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
import {storePhotos, initDatabase} from '../database/database'; // Import the storePhotos and initDatabase functions

// Define the parameter list for navigation
type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: undefined;
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
    // Initialize the database
    const initializeDatabase = async () => {
      await initDatabase(); // Ensure the database is initialized
      const validImages = photos.map(photo => `file://${photo}`);
      setImages(validImages);
      setIsLoading(false);
    };

    initializeDatabase();
  }, [photos]);

  const handleRetake = () => {
    navigation.replace('Camera'); // Navigate back to the camera
  };

  const handleConfirm = async () => {
    try {
      console.log('Photos confirmed:', images);
      // Store photos in the database
      const coverPhoto = images[0]; // First image as cover photo
      const ocrPhoto = images[1]; // Second image as OCR photo

      await storePhotos(coverPhoto, ocrPhoto); // Store cover and OCR photos
      console.log('Photos stored successfully');
      navigation.navigate('Result'); // Navigate to the Result screen
    } catch (error) {
      console.error('Error storing photos:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Your Photos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" /> // Spinner while loading
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
    width: '50%', // Adjusted width for better fit
    height: '100%',
    borderWidth: 1,
    borderColor: '#fff',
    margin: 5,
    borderRadius: 8, // Optional: added border radius for aesthetics
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
