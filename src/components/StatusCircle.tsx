import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAppState } from '../contexts/AppStateContext';
import { ConnectionStatus } from '../types';
import { CIRCLE_SIZE } from '../constants/config';

export const StatusCircle: React.FC = () => {
  const { colors } = useTheme();
  const { status, connectedUsers } = useAppState();

  const getBorderColor = () => {
    switch (status) {
      case ConnectionStatus.ONLINE:
        return colors.onlineColor;
      case ConnectionStatus.CONNECTING:
        return colors.sliderThumb;
      default:
        return colors.offlineColor;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case ConnectionStatus.ONLINE:
        return 'ONLINE';
      case ConnectionStatus.CONNECTING:
        return 'CONNECTING';
      default:
        return 'OFFLINE';
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            backgroundColor: colors.circleBackground,
            borderColor: getBorderColor(),
          },
        ]}
      >
        <Text style={[styles.statusText, { color: colors.text }]}>
          {getStatusText()}
        </Text>
        {status === ConnectionStatus.ONLINE && connectedUsers.length > 0 && (
          <Text style={[styles.userCount, { color: colors.text }]}>
            {connectedUsers.length} {connectedUsers.length === 1 ? 'user' : 'users'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  userCount: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
  },
});
