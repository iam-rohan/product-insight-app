import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

// Importing Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ResultScreen from './src/screens/ResultScreen';
import CameraComponent from './src/components/CameraComponent'; // Import your CameraComponent

// Type for bottom tab navigator
type TabParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
  Result: undefined;
};

// Type for stack navigator (only for Home and Camera)
type HomeStackParamList = {
  MainHome: undefined;
  Camera: undefined;
};

// Create navigators
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<HomeStackParamList>();

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

// Create Stack Navigator (only for Home and CameraComponent)
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainHome"
        component={HomeScreen}
        options={{headerShown: false}} // Hide header
      />
      <Stack.Screen
        name="Camera"
        component={CameraComponent}
        options={{headerShown: false}} // Hide header
      />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false, // Hide the header in the tab navigation
          tabBarIcon: ({color}) => (
            <TabBarIcon
              route={route.name as keyof TabParamList}
              color={color}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#2B7A5A', // Maintain your custom style
            height: 60,
            padding: 10,
          },
          tabBarLabel: () => null, // Hide labels
        })}>
        {/* Use HomeStack for Home to include Camera in the stack */}
        <Tab.Screen name="Home" component={HomeStack} />
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
