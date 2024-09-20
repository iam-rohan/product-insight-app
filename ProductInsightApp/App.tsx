import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Importing Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ResultScreen from './src/screens/ResultScreen';

// Type for bottom tab navigator
type TabParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
  Result: undefined;
};

// Bottom Tab Navigator
const Tab = createBottomTabNavigator<TabParamList>();

// Named TabBarIcon function
function TabBarIcon({
  color,
  route,
}: {
  color: string;
  route: keyof TabParamList;
}) {
  let iconName: string;

  switch (route) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Search':
      iconName = 'search';
      break;
    case 'History':
      iconName = 'history';
      break;
    default:
      iconName = 'home';
      break;
  }

  const iconSize = 30;
  return <Icon name={iconName} size={iconSize} color={color} />;
}

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: props => (
            <TabBarIcon route={route.name as keyof TabParamList} {...props} />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#2B7A5A',
            height: 60,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 10,
          },
          tabBarLabel: () => null, // Hide labels
        })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen
          name="Result"
          component={ResultScreen}
          options={{tabBarButton: () => null}} // Hide from bottom nav
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
