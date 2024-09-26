import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ResultScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Check your results here!</Text>
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
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
