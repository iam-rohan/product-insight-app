import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NavigationProp, ParamListBase} from '@react-navigation/native'; // Import ParamListBase
import Icon from 'react-native-vector-icons/FontAwesome';

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>; // Replace 'any' with ParamListBase
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
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#3B7A57',
    width: 257,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 25,
    borderRadius: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default HomeScreen;
