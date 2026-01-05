import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppStateProvider } from './src/contexts/AppStateContext';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <HomeScreen />
        <StatusBar style="auto" />
      </AppStateProvider>
    </ThemeProvider>
  );
}
