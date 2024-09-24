import {useEffect, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';

export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        return false;
      }
    } else {
      // For iOS, you may want to use a different method for permissions
      setHasPermission(true); // Assume permission is granted for simplicity
      return true;
    }
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const status = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        setHasPermission(status);
      } else {
        // Check permission on iOS if necessary
        setHasPermission(true); // Assume permission is granted for simplicity
      }
    })();
  }, []);

  return {hasPermission, requestPermission};
};
