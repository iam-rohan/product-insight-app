import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
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
  const [isCropping, setIsCropping] = useState<boolean>(false);
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
    if (cameraRef.current && cameraPermission && device && !isCropping) {
      try {
        const photo = await cameraRef.current.takePhoto({
          enableAutoDistortionCorrection: true,
          enableShutterSound: true,
          flash: 'auto',
        });

        const photoUri = `file://${photo.path}`;
        setPhotos(prevPhotos => {
          const newPhotos = [...prevPhotos, photoUri];
          if (newPhotos.length === 2) {
            cropPhoto(newPhotos[1], newPhotos);
          }
          return newPhotos;
        });
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'There was an error taking the photo.');
      }
    }
  };

  const cropPhoto = (photoUri: string, newPhotos: string[]) => {
    setIsCropping(true);

    ImageCropPicker.openCropper({
      path: photoUri,
      width: 400,
      height: 400,
      freeStyleCropEnabled: true,
      cropping: true,
      mediaType: 'photo',
    })
      .then(croppedImage => {
        const croppedPhotoUri = croppedImage.path;
        const updatedPhotos = [...newPhotos];
        updatedPhotos[1] = croppedPhotoUri;
        navigation.navigate('Confirmation', {photos: updatedPhotos});
      })
      .catch(error => {
        console.error('Error cropping photo:', error);
        Alert.alert('Error', 'There was an error cropping the photo.');
      })
      .finally(() => {
        setIsCropping(false);
      });
  };

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
      {!isCropping && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          ref={cameraRef}
          photo={true}
        />
      )}

      {/* Capture button */}
      <TouchableOpacity style={styles.button} onPress={handleTakePhoto} />

      {/* Overlay Image at Bottom-Left */}
      {photos.length > 0 && (
        <View style={styles.overlayContainer}>
          <Image
            source={{uri: photos[photos.length - 1]}}
            style={styles.overlay}
            resizeMode="cover"
          />
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
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  overlay: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default CameraComponent;
