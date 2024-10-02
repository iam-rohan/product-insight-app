import React, {useState, useEffect, useRef} from 'react';
import {View, TouchableOpacity, Image, StyleSheet, Text} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Navigation params type
type RootStackParamList = {
  Camera: undefined;
  Confirmation: {photos: string[]};
};

type NavigationProps = StackNavigationProp<RootStackParamList, 'Camera'>;

const CameraComponent: React.FC = () => {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation<NavigationProps>();

  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setCameraPermission(status === 'granted');
    };
    requestCameraPermission();
  }, []);

  const handleTakePhoto = async () => {
    if (cameraRef.current && cameraPermission) {
      try {
        const photo = await cameraRef.current.takePhoto({
          enableAutoDistortionCorrection: true,
          enableAutoRedEyeReduction: false,
          enableShutterSound: true,
          flash: 'auto',
        });

        console.log(`Captured photo path: ${photo.path}`);

        // Ensure the path is prefixed with 'file://' for proper URI handling
        const photoUri = `file://${photo.path}`;
        setPhotos(prevPhotos => {
          const newPhotos = [...prevPhotos, photoUri];

          // Navigate to confirmation screen if two photos are captured
          if (newPhotos.length === 2) {
            setTimeout(() => {
              navigation.navigate('Confirmation', {photos: newPhotos});
            }, 100);
          }
          return newPhotos;
        });
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  // Loading state while checking permissions
  if (cameraPermission === null) {
    return (
      <View style={styles.errorContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (cameraPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  if (device == null) {
    return <Text>No back camera available</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        ref={cameraRef}
        photo={true}
      />
      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
      {/* Show thumbnails of captured photos */}
      <View style={styles.previewContainer}>
        {photos.map((photo, index) => (
          <Image
            key={index}
            source={{uri: photo}}
            style={styles.preview}
            resizeMode="cover"
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
  },
  preview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8, // Optional: add border radius for aesthetics
    borderWidth: 1, // Optional: add border for better visibility
    borderColor: '#ccc', // Optional: border color
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#CAE5D5',
    borderRadius: 10,
    padding: 10,
    width: '40%',
    alignSelf: 'center', // Center the button horizontally
    marginVertical: 10, // Add some vertical margin
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CameraComponent;
