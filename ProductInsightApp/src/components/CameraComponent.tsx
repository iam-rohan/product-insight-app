import React, {useState, useEffect, useRef} from 'react';
import {View, TouchableOpacity, Image, StyleSheet, Text} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

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
  const device = devices[0]; // Assuming the first device in the array is the back camera

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setCameraPermission(status === 'granted'); // Check if the status is 'granted'
    };
    requestCameraPermission();
  }, []);

  const handleTakePhoto = async () => {
    if (cameraRef.current && cameraPermission) {
      try {
        const photo = await cameraRef.current.takePhoto({
          enableAutoDistortionCorrection: true,
          enableShutterSound: true,
          flash: 'auto',
        });

        const photoUri = `file://${photo.path}`;
        setPhotos(prevPhotos => {
          const newPhotos = [...prevPhotos, photoUri];

          // Crop only the second photo
          if (newPhotos.length === 2) {
            ImageCropPicker.openCropper({
              path: newPhotos[1],
              width: 400,
              height: 400,
              freeStyleCropEnabled: true, // Enable adjustable rectangle
              cropping: true,
              mediaType: 'photo',
            })
              .then(croppedImage => {
                const croppedPhotoUri = croppedImage.path;
                newPhotos[1] = croppedPhotoUri; // Update second photo with cropped version
                navigation.navigate('Confirmation', {photos: newPhotos});
              })
              .catch(error => {
                console.error('Error cropping photo:', error);
              });
          }
          return newPhotos;
        });
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  // Render loading, no access, and camera UI conditions
  if (cameraPermission === null) {
    return <Text>Loading...</Text>;
  }

  if (cameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (!device) {
    return <Text>No camera available</Text>;
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#CAE5D5',
    borderRadius: 10,
    padding: 10,
    width: '40%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CameraComponent;
