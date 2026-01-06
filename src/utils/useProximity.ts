import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import ProximityService from '../services/ProximityService';
import { useAppState } from '../contexts/AppStateContext';
import { ConnectionStatus } from '../types';

export const useProximity = () => {
  const {
    status,
    radius,
    setStatus,
    setLocation,
    addConnectedUser,
    removeConnectedUser,
    clearConnectedUsers,
  } = useAppState();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeProximity();

    return () => {
      ProximityService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (isInitialized && ProximityService.isOnline()) {
      ProximityService.updateRadius(radius);
    }
  }, [radius, isInitialized]);

  const initializeProximity = async () => {
    const success = await ProximityService.initialize({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onLocationUpdate: (location) => {
        setLocation(location);
      },
      onUserConnected: (userId) => {
        addConnectedUser(userId);
      },
      onUserDisconnected: (userId) => {
        removeConnectedUser(userId);
      },
      onError: (error) => {
        Alert.alert('Error', error);
        setStatus(ConnectionStatus.OFFLINE);
      },
    });

    setIsInitialized(success);
    if (!success) {
      Alert.alert(
        'Permissions Required',
        'This app requires location and microphone permissions to function.'
      );
    }
  };

  const toggleOnline = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Service not initialized');
      return;
    }

    if (status === ConnectionStatus.OFFLINE) {
      const success = await ProximityService.goOnline(radius);
      if (!success) {
        Alert.alert('Error', 'Failed to go online');
      }
    } else {
      ProximityService.goOffline();
      clearConnectedUsers();
    }
  };

  return {
    isInitialized,
    toggleOnline,
  };
};
