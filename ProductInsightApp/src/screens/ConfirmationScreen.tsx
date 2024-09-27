import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert, // Import Alert from react-native
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {storePhoto} from '../database/database'; // Import the storePhoto function

type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: undefined;
  Confirmation: {photos: string[]};
};

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
    const timer = setTimeout(() => {
      const validImages = photos.map(photo => `file://${photo}`);
      setImages(validImages);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [photos]);

  const handleRetake = () => {
    navigation.replace('Camera');
  };

  const handleConfirm = async () => {
    console.log('Photos confirmed');
    // Store each confirmed photo in the database
    try {
      for (const photo of images) {
        await storePhoto(photo); // Store each photo path
      }
      navigation.navigate('Result'); // Navigate to Result screen
    } catch (error) {
      console.error('Error storing photos:', error);
      Alert.alert(
        'Error',
        'There was an error saving the photos. Please try again.',
      ); // Use Alert instead of alert
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
    width: '55%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#fff',
    margin: 5,
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
