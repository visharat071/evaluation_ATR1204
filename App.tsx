import React, { useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/pages/LoginScreen';
import { RegisterScreen } from './src/pages/RegisterScreen';
import { AuctionListScreen } from './src/pages/AuctionListScreen';
import { AuctionDetailScreen } from './src/pages/AuctionDetailScreen';
import { theme } from './src/utils/theme';

import { OnboardingScreen } from './src/pages/OnboardingScreen';
import { CreateAuctionScreen } from './src/pages/CreateAuctionScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  AuctionList: undefined;
  AuctionDetail: { auctionId: string };
  CreateAuction: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
            <Stack.Screen name="AuctionList" component={AuctionListScreen} />
            <Stack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
            <Stack.Screen name="CreateAuction" component={CreateAuctionScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <AppNavigation />
      </SafeAreaProvider>
    </AuthProvider>
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
