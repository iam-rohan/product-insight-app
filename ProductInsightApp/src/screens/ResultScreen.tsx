import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {getCoverPhoto} from '../database/database';
import {RouteProp} from '@react-navigation/native'; // Import RouteProp for navigation types

type RankType = 'A' | 'B' | 'C' | 'D' | 'E';

type ResultScreenProps = {
  route: RouteProp<{params: {productName: string; ingredients: string}}>;
};

const ResultScreen: React.FC<ResultScreenProps> = ({route}) => {
  const [showNegatives, setShowNegatives] = useState(true);
  const [showPositives, setShowPositives] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {productName, ingredients} = route.params || {}; // Ensure route.params exists

  const negatives = [
    {text: 'Phosphoric Acid', color: 'red'},
    {text: 'High Sugar', color: 'red'},
    {text: 'Caffeine', color: 'red'},
  ];

  const positives = [
    {text: 'Low Calories', color: 'green'},
    {text: 'Vitamin C', color: 'green'},
    {text: 'No Artificial Flavors', color: 'green'},
  ];

  const getRankColor = (rank: RankType) => {
    switch (rank) {
      case 'A':
        return '#2E7D32'; // Dark green
      case 'B':
        return '#66BB6A'; // Light green
      case 'C':
        return '#FFEB3B'; // Yellow
      case 'D':
        return '#FF9800'; // Orange
      case 'E':
        return '#F44336'; // Red
      default:
        return '#BDBDBD'; // Gray for unranked
    }
  };

  const Ranker: React.FC<{rank: RankType}> = ({rank}) => {
    const ranks: RankType[] = ['A', 'B', 'C', 'D', 'E'];
    return (
      <View style={styles.rankContainer}>
        {ranks.map(r => (
          <View
            key={r}
            style={[
              styles.rankBox,
              {
                backgroundColor: getRankColor(r),
                transform: r === rank ? [{scale: 1.5}] : [{scale: 1}],
              },
            ]}>
            <Text style={styles.rankText}>{r}</Text>
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    const fetchCoverPhoto = async () => {
      const photoPath = await getCoverPhoto();
      setCoverPhoto(photoPath);
      setLoading(false);
    };
    fetchCoverPhoto();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headers}></View>
      <View style={styles.header}>
        {loading ? (
          <Text>Loading...</Text>
        ) : coverPhoto ? (
          <Image source={{uri: coverPhoto}} style={styles.productImage} />
        ) : (
          <Text>No Cover Photo Available</Text>
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{productName || 'Unknown Product'}</Text>
          <Ranker rank="C" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recognized Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            {ingredients || 'No Ingredients Available'}
          </Text>
        </View>

        {/* Negatives Section */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => setShowNegatives(!showNegatives)}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Negatives</Text>
              <Icon
                name={showNegatives ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#333"
              />
            </View>
          </TouchableOpacity>
          {showNegatives && (
            <View>
              {negatives.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.negativeText}>{item.text}</Text>
                  <View style={[styles.dot, {backgroundColor: item.color}]} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Positives Section */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => setShowPositives(!showPositives)}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Positives</Text>
              <Icon
                name={showPositives ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#333"
              />
            </View>
          </TouchableOpacity>
          {showPositives && (
            <View>
              {positives.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.positiveText}>{item.text}</Text>
                  <View style={[styles.dot, {backgroundColor: item.color}]} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headers: {
    height: 35,
    width: '100%',
    backgroundColor: '#3B7A57',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222222',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rankContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginLeft: 10,
  },
  rankBox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginVertical: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingLeft: 20,
  },
  negativeText: {
    color: '#444444',
  },
  positiveText: {
    color: '#444444',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  ingredientsText: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 20,
  },
});

export default ResultScreen;
