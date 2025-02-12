import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* Logo Container */}
      <View style={styles.LogoContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={[styles.logo, {tintColor: '#D9D9D9'}]}
        />
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Search')}>
          <Text style={styles.buttonText}>Search Ingredient</Text>
          <Icon name="search" size={20} color="#D9D9D9" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.buttonText}>Scan Ingredient</Text>
          <Icon name="camera" size={20} color="#D9D9D9" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('History')}>
          <Text style={styles.buttonText}>Search History</Text>
          <Icon name="history" size={20} color="#D9D9D9" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B7A57',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  logo: {
    width: '80%',
    height: '90%',
    resizeMode: 'contain',
    marginTop: 30,
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: Dimensions.get('window').height * 0.35 + 125,
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
