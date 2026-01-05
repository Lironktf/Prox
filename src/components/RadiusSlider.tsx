import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';
import { useAppState } from '../contexts/AppStateContext';
import { MIN_RADIUS, MAX_RADIUS } from '../constants/config';

export const RadiusSlider: React.FC = () => {
  const { colors } = useTheme();
  const { radius, setRadius } = useAppState();

  const formatRadius = (value: number): string => {
    if (value < 1) {
      return `${(value * 1000).toFixed(0)}m`;
    }
    return `${value.toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Proximity Radius</Text>
      <Text style={[styles.value, { color: colors.sliderThumb }]}>
        {formatRadius(radius)}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={MIN_RADIUS}
        maximumValue={MAX_RADIUS}
        value={radius}
        onValueChange={setRadius}
        minimumTrackTintColor={colors.sliderThumb}
        maximumTrackTintColor={colors.sliderTrack}
        thumbTintColor={colors.sliderThumb}
        step={0.1}
      />
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeText, { color: colors.text }]}>
          {formatRadius(MIN_RADIUS)}
        </Text>
        <Text style={[styles.rangeText, { color: colors.text }]}>
          {formatRadius(MAX_RADIUS)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
