import React, {useEffect, useState} from 'react';
import {View, Text, Alert, Linking} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera'; // Adjust import based on your setup
import {useCameraPermission} from '../hooks/useCameraPermission'; // Adjust based on your hooks

const CameraComponent: React.FC = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [cameraReady, setCameraReady] = useState(false);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back'); // Get the back camera device

  useEffect(() => {
    const checkPermissions = async () => {
      if (!hasPermission) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          Alert.alert(
            'Permission Required',
            'Camera permission is needed to use this feature. Please enable it in settings.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: () => Linking.openSettings()},
            ],
          );
        }
      } else {
        setCameraReady(true);
      }
    };

    checkPermissions();
  }, [hasPermission, requestPermission]);

  if (!cameraReady || !device) {
    return <Text>Requesting camera permission or loading camera...</Text>;
  }

  return (
    <View style={{flex: 1}}>
      <Camera style={{flex: 1}} device={device} isActive={cameraReady} />
    </View>
  );
};

export default CameraComponent;
