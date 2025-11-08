import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SQLite from 'expo-sqlite';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import ContributionsScreen from './src/screens/ContributionsScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import ContributorsScreen from './src/screens/ContributorsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import database initialization
import { initDatabase } from './src/database/database';

// Import theme
import { theme } from './src/theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize database
    initDatabase()
      .then(() => {
        console.log('Database initialized successfully');
        setIsReady(true);
      })
      .catch((error) => {
        console.error('Error initializing database:', error);
        setIsReady(true); // Still allow app to load
      });
  }, []);

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              } else if (route.name === 'Contributions') {
                iconName = focused ? 'cash-plus' : 'cash-plus';
              } else if (route.name === 'Expenses') {
                iconName = focused ? 'cash-minus' : 'cash-minus';
              } else if (route.name === 'Contributors') {
                iconName = focused ? 'account-group' : 'account-group-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'cog' : 'cog-outline';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Kagoma BBC Treasurer' }}
          />
          <Tab.Screen 
            name="Contributions" 
            component={ContributionsScreen}
            options={{ title: 'Contributions' }}
          />
          <Tab.Screen 
            name="Expenses" 
            component={ExpensesScreen}
            options={{ title: 'Expenses' }}
          />
          <Tab.Screen 
            name="Contributors" 
            component={ContributorsScreen}
            options={{ title: 'Team Members' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

