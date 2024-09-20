import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NavigationProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons

type HomeScreenProps = {
  navigation: NavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Search')}>
        <Text style={styles.buttonText}>Search Ingredient</Text>
        <Icon name="search" size={20} color="#ffffff" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Scan Ingredient</Text>
        <Icon name="camera" size={15} color="#ffffff" style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('History')}>
        <Text style={styles.buttonText}>Search History</Text>
        <Icon name="history" size={20} color="#ffffff" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9', // Background color #A8D5BA
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#3B7A57', // Button color #3B7A57
    width: 257,
    height: 50,
    flexDirection: 'row', // Align items horizontally (text and icon)
    justifyContent: 'space-between', // Space between text and icon
    alignItems: 'center',
    paddingHorizontal: 15, // Add padding inside the button for space
    marginVertical: 25,
    borderRadius: 30,
  },
  buttonText: {
    color: '#ffffff', // Text color #ffffff
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10, // Space between text and icon
  },
});

export default HomeScreen;
