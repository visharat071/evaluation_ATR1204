import React, { useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/pages/LoginScreen';
import { RegisterScreen } from './src/pages/RegisterScreen';
import { HomeScreen } from './src/pages/HomeScreen';
import { SettingsScreen } from './src/pages/SettingsScreen';
import { AuctionDetailScreen } from './src/pages/AuctionDetailScreen';
import { theme } from './src/utils/theme';

import { OnboardingScreen } from './src/pages/OnboardingScreen';
import { CreateAuctionScreen } from './src/pages/CreateAuctionScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  AuctionDetail: { auctionId: string };
  CreateAuction: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();


const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderRadius: 20,
          borderColor: theme.colors.black,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {!user ? (
          // Auth flow
          <Stack.Group>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          // Authenticated flow
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
            <Stack.Screen name="CreateAuction" component={CreateAuctionScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <AppNavigation />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
