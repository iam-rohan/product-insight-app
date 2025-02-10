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
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons

// Define navigation params
type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: {coverPhoto: string; ocrPhoto: string};
  Confirmation: {photos: string[]};
};

// Define props for the screen
type ConfirmationScreenProps = {
  route: RouteProp<RootStackParamList, 'Confirmation'>;
  navigation: StackNavigationProp<RootStackParamList, 'Confirmation'>;
};

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const {photos} = route.params;
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDatabase = async () => {
      await initDatabase();
      setImages(photos.map(photo => `file://${photo}`));
      setIsLoading(false);
    };
    initializeDatabase();
  }, [photos]);

  const handleRetake = () => navigation.replace('Camera');

  const handleConfirm = async () => {
    try {
      const coverPhoto = images[0];
      const ocrPhoto = images[1];
      await storePhotos(coverPhoto, ocrPhoto);
      navigation.navigate('Result', {coverPhoto, ocrPhoto});
    } catch (error) {
      console.error('Error during confirmation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Your Photos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={styles.imageContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{uri}} style={styles.image} />
              <View style={styles.iconContainer}>
                {/* Retake Button - Using "refresh" icon for retry */}
                {index === 0 && (
                  <TouchableOpacity
                    onPress={handleRetake}
                    style={[styles.button, styles.refreshButton]}>
                    <Icon name="refresh" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                {/* Confirm Button */}
                {index === 1 && (
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={[styles.button, styles.confirmButton]}>
                    <Icon name="check" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20, // Space between the image and buttons
  },
  imageWrapper: {
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#DDD',
  },
  iconContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center', // This centers the buttons
    marginHorizontal: 5, // Reduce this margin for a more compact layout
  },
  button: {
    width: 50, // Smaller button size for simplicity
    height: 50, // Circular button size
    borderRadius: 25, // Circular button shape
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Light border to keep it minimal
    borderColor: '#000', // Light gray border
    marginHorizontal: 50, // Decrease margin between buttons
  },
  refreshButton: {
    backgroundColor: 'red', // Set red background for the refresh button
    borderColor: 'red', // Set red border for the refresh button
  },
  confirmButton: {
    backgroundColor: 'green', // Set green background for the confirm button
    borderColor: 'green', // Set green border for the confirm button
  },
});

export default ConfirmationScreen;
