import * as React from 'react'; // Importing React
import {useEffect} from 'react'; // Importing useEffect
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

// Importing Screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ResultScreen from './src/screens/ResultScreen';
import CameraComponent from './src/components/CameraComponent';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import {initDatabase} from './src/database'; // Import the initDatabase function

// Type for bottom tab navigator
type TabParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
};

// Type for stack navigator
type RootStackParamList = {
  Camera: undefined;
  Confirmation: {photos: string[]};
  Result: undefined;
  MainHome: undefined; // Renamed to avoid confusion
};

// Navigators
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// TabBarIcon function
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

// Stack Navigator for the process after Scan Ingredient
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraComponent} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize the database when the app starts
    const initializeApp = async () => {
      await initDatabase(); // Ensure the database is initialized
    };

    initializeApp(); // Call the initialization function
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({color}) => (
            <TabBarIcon
              route={route.name as keyof TabParamList}
              color={color}
            />
          ),
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#2B7A5A',
            height: 60,
            padding: 10,
          },
          tabBarLabel: () => null,
        })}>
        {/* Use HomeStack for Home to include Camera in the stack */}
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
