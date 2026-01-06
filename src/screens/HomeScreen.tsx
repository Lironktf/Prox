import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useProximity } from '../utils/useProximity';
import { ThemeToggle } from '../components/ThemeToggle';
import { StatusCircle } from '../components/StatusCircle';
import { RadiusSlider } from '../components/RadiusSlider';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { toggleOnline } = useProximity();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeToggle />
      <View style={styles.content}>
        <TouchableOpacity onPress={toggleOnline}>
          <StatusCircle />
        </TouchableOpacity>
        <RadiusSlider />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
