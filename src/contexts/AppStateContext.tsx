import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppState, ConnectionStatus, Location } from '../types';
import { DEFAULT_RADIUS } from '../constants/config';

interface AppStateContextType extends AppState {
  setStatus: (status: ConnectionStatus) => void;
  setRadius: (radius: number) => void;
  setLocation: (location: Location | null) => void;
  addConnectedUser: (userId: string) => void;
  removeConnectedUser: (userId: string) => void;
  clearConnectedUsers: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    status: ConnectionStatus.OFFLINE,
    radius: DEFAULT_RADIUS,
    location: null,
    connectedUsers: [],
  });

  const setStatus = (status: ConnectionStatus) => {
    setState(prev => ({ ...prev, status }));
  };

  const setRadius = (radius: number) => {
    setState(prev => ({ ...prev, radius }));
  };

  const setLocation = (location: Location | null) => {
    setState(prev => ({ ...prev, location }));
  };

  const addConnectedUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      connectedUsers: [...prev.connectedUsers, userId],
    }));
  };

  const removeConnectedUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      connectedUsers: prev.connectedUsers.filter(id => id !== userId),
    }));
  };

  const clearConnectedUsers = () => {
    setState(prev => ({ ...prev, connectedUsers: [] }));
  };

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        setStatus,
        setRadius,
        setLocation,
        addConnectedUser,
        removeConnectedUser,
        clearConnectedUsers,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
