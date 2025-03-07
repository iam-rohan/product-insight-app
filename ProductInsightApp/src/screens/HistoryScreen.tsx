import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types'; // Ensure this file includes the updated RootStackParamList
import { getPhotos, deletePhoto } from '../database/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';


// Define the type for photos, which should include `rank`
type Photo = {
  id: number;
  coverPhoto: string;
  ocrPhoto: string;
  rank: string; // Make sure 'rank' is part of the type definition
  timestamp: number; // Timestamp stored in seconds
};
const getTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const diffInSeconds = now - timestamp;

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
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
  
    // Filter out duplicate entries and ensure each photo has a rank
    const uniquePhotos = storedPhotos.reduce((acc: Photo[], photo) => {
      const exists = acc.find((p) => p.coverPhoto === photo.coverPhoto);
      if (!exists && photo.rank) {
        acc.push(photo);
      }
      return acc;
    }, []);
  
    setPhotos(uniquePhotos);
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
      timestamp: photo.timestamp
   
    });// Removed rank from navigation
  };

  // Fetch photos when the component mounts
  useFocusEffect(
    useCallback(() => {
      loadPhotos();  // Refresh photos when coming back to the screen
    }, [])
  );

  // Render each item in the FlatList
  // Render each item in the FlatList
  const renderItem = ({ item, index }: { item: Photo; index: number }) => (
    <TouchableOpacity onPress={() => handlePhotoClick(item)} style={styles.photoItem}>
      <Image source={{ uri: item.coverPhoto }} style={styles.photoImage} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle}>Click {index + 1}</Text>
        <View style={styles.scanInfo}>
          <Icon name="undo" size={14} color="#555" style={styles.scanIcon} />
          <Text style={styles.scanDate}>{getTimeAgo(item.timestamp)}</Text>
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
     <View style={styles.header}>
        <Text style={styles.headerText}>Product History</Text>
      </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f4f4f4',
  },
  header: {
    width: 'auto',
    height: 40,
    backgroundColor: '#3B7A57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
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
