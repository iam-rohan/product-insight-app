import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Ensure this file includes the updated RootStackParamList
import { getPhotos, deletePhoto } from '../database/database';
import Icon from 'react-native-vector-icons/FontAwesome';


// Define the type for photos, which should include `rank`
type Photo = {
  id: number;
  coverPhoto: string;
  ocrPhoto: string;
  rank: string; // Make sure 'rank' is part of the type definition
};

// Get the color associated with a rank
const getRankColor = (rank: string) => {
  switch (rank) {
    case 'A': return '#2E7D32'; // Dark green
    case 'B': return '#66BB6A'; // Light green
    case 'C': return '#FFEB3B'; // Yellow
    case 'D': return '#FF9800'; // Orange
    case 'E': return '#F44336'; // Red
    default: return '#BDBDBD'; // Grey (Unranked)
  }
};

// Ranker component for displaying ranks
const Ranker = ({ rank }: { rank: string }) => {
  const ranks = ['A', 'B', 'C', 'D', 'E'];
  return (
    <View style={styles.rankerContainer}>
      {ranks.map((r) => (
        <View
          key={r}
          style={[
            styles.rankBox,
            {
              backgroundColor: getRankColor(r),
              transform: r === rank ? [{ scale: 1.5 }] : [{ scale: 1 }],
              marginHorizontal: r === rank ? 5 : 0,
            },
          ]}
        >
          <Text style={styles.rankText}>{r}</Text>
        </View>
      ))}
    </View>
  );
};

const HistoryScreen = () => {
  // Define the state to hold the photos
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Load photos from the database and add a fallback rank if missing
  const loadPhotos = async () => {
    setIsLoading(true);
    const storedPhotos = await getPhotos();

    // Ensure each photo has a rank property (set a default rank if missing)
    const photosWithRank = storedPhotos.map(photo => ({
      ...photo,
      rank: 'C',  
    }));

    setPhotos(photosWithRank);
    setIsLoading(false);
  };

  // Handle deleting a photo
  const handleDelete = async (id: number) => {
    await deletePhoto(id);
    loadPhotos(); // Refresh the list after deletion
  };

  // Handle photo click and pass recognized text to the Result screen
  const handlePhotoClick = async (photo: Photo) => {
    navigation.navigate('Result', { 
      coverPhoto: photo.coverPhoto,
      ocrPhoto: photo.ocrPhoto,
   
    });// Removed rank from navigation
  };

  // Fetch photos when the component mounts
  useEffect(() => {
    loadPhotos();
  }, []);

  // Render each item in the FlatList
  // Render each item in the FlatList
const renderItem = ({ item, index }: { item: Photo; index: number }) => (
  <TouchableOpacity onPress={() => handlePhotoClick(item)} style={styles.photoItem}>
    <Image source={{ uri: item.coverPhoto }} style={styles.photoImage} />
    <View style={styles.photoInfo}>
      <Text style={styles.photoTitle}>Click {index + 1}</Text>
      <View style={styles.scanInfo}>
        <Icon name="undo" size={14} color="#555" style={styles.scanIcon} />
        <Text style={styles.scanDate}>1 min ago</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
    <Ranker rank={item.rank} />
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity onPress={loadPhotos} style={styles.reloadButton}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#3498db" />
        ) : (
          <>
            <Icon name="refresh" size={30} color="#3498db" />
            <Text style={styles.reloadText}>Reload</Text>
          </>
        )}
      </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 2 },
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
  scanDate: {
    fontSize: 14,
    color: '#555',
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
  reloadButton: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadText: {
    display: 'none', 
  },

  loader: {
    marginTop: 20,
  },
  rankerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  rankBox: {
    width: 20,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scanIcon: {
    marginRight: 5,
  },
});

export default HistoryScreen;
