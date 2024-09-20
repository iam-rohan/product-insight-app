import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

// Mock Data for the product history
const historyData = [
  {
    id: '1',
    productName: 'Coca-Cola',
    scanDate: '2 days ago',
    rank: 'C', // Nutri-Score
    productImage: require('../assets/coca-cola.jpg'), // Put the img path to cola here
  },
  {
    id: '2',
    productName: 'Chips',
    scanDate: '5 days ago',
    rank: 'D',
    productImage: require('../assets/chips.jpg'), // Put the img path to chips here
  },
  {
    id: '3',
    productName: 'Noodles',
    scanDate: '1 week ago',
    rank: 'B',
    productImage: require('../assets/noodles.jpg'), // Put the img path to noodles here
  },
];

// Function to map rank to background color
const getRankColor = (rank: string) => {
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
      return '#BDBDBD'; // Grey for unranked
  }
};

// Rank component to display all the ranks (A, B, C, D, E) and scale the correct rank
const Ranker = ({rank}: {rank: string}) => {
  const ranks = ['A', 'B', 'C', 'D', 'E'];
  return (
    <View style={styles.rankerContainer}>
      {ranks.map(r => (
        <View
          key={r}
          style={[
            styles.rankBox,
            {
              backgroundColor: getRankColor(r),
              transform: r === rank ? [{scale: 1.5}] : [{scale: 1}],
              // Only add margin for the actual rank, all others should have no gaps
              marginHorizontal: r === rank ? 5 : 0,
            },
          ]}>
          <Text style={styles.rankText}>{r}</Text>
        </View>
      ))}
    </View>
  );
};

const HistoryScreen: React.FC = () => {
  const renderHistoryItem = ({item}: {item: (typeof historyData)[0]}) => (
    <TouchableOpacity style={styles.card}>
      {/* Product Image */}
      <Image source={item.productImage} style={styles.productImage} />

      {/* Product Name and Search Date */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.scanDate}>{item.scanDate}</Text>
      </View>

      {/* Nutri-Score Ranker */}
      <Ranker rank={item.rank} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#A8D5BA',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CAE5D5',
    borderRadius: 10,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 120,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scanDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  rankerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
  },
  rankBox: {
    width: 20, // Each rank box width
    height: 25, // Each rank box height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default HistoryScreen;
