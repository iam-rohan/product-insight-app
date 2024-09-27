import React, {useState, useEffect} from 'react';
import {View, Text, ActivityIndicator, Image, StyleSheet} from 'react-native';
import {getPhotos} from '../database/database';

const ResultScreen: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const fetchedPhotos: string[] = await getPhotos();
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error('Error fetching photos:', error);
        setPhotos([]); // Set to an empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Captured Photos</Text>
      {photos.length > 0 ? (
        photos.map((uri, index) => (
          <Image key={index} source={{uri}} style={styles.image} />
        ))
      ) : (
        <Text style={styles.noPhotos}>No photos found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A8D5BA',
  },
  header: {
    color: 'black',
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    width: '90%',
    height: 200,
    borderWidth: 1,
    borderColor: '#fff',
    margin: 5,
  },
  noPhotos: {
    color: 'black',
    fontSize: 18,
  },
});

export default ResultScreen;
