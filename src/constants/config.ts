// Server configuration
export const SERVER_URL = 'http://localhost:3000';

// WebRTC configuration
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// Location configuration
export const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds
export const MIN_RADIUS = 0.1; // 100 meters
export const MAX_RADIUS = 5; // 5 kilometers
export const DEFAULT_RADIUS = 1; // 1 kilometer

// UI configuration
export const CIRCLE_SIZE = 200;
export const ANIMATION_DURATION = 300;
