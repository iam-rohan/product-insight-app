import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../types'; // Ensure this file includes the updated RootStackParamList
import {getPhotos, deletePhoto} from '../database/database';

// Define the type for photos, which should include `rank` and `ingredientList`
type Photo = {
  id: number;
  coverPhoto: string;
  ocrPhoto: string;
  ingredientList: string; // Stored as JSON string
  rank: string;
};

const HistoryScreen = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const loadPhotos = async () => {
    setIsLoading(true);
    const storedPhotos = await getPhotos();

    const photosWithParsedIngredients = storedPhotos.map(photo => ({
      ...photo,
      ingredientList: JSON.parse(photo.ingredientList),
    }));

    setPhotos(photosWithParsedIngredients);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    await deletePhoto(id);
    loadPhotos();
  };

  const handlePhotoClick = async (photo: Photo) => {
    navigation.navigate('Result', {
      coverPhoto: photo.coverPhoto,
      ocrPhoto: photo.ocrPhoto,
      ingredientList: photo.ingredientList, // Pass the parsed ingredient list
      rank: photo.rank,
    });
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const renderItem = ({item, index}: {item: Photo; index: number}) => (
    <TouchableOpacity
      onPress={() => handlePhotoClick(item)}
      style={styles.photoItem}>
      <Image source={{uri: item.coverPhoto}} style={styles.photoImage} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle}>Click {index + 1}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{item.rank}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  list: {
    flexGrow: 1,
  },
  photoItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  photoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rankContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
