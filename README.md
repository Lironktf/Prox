# ProximityDrive

A React Native app that enables proximity-based voice communication using WebRTC. Users can automatically connect and communicate with others within a customizable radius.

## Features

- **Proximity-based voice chat**: Automatically connect with users in your area
- **Customizable radius**: Set your connection range from 100m to 5km
- **Real-time location tracking**: GPS-based proximity detection
- **Group conference calls**: All users within range can communicate together
- **Dark/Light mode**: Toggle between elegant light and dark themes
- **Minimal UI**: Clean, simple interface with online/offline status indicator

## Architecture

### Frontend (React Native + Expo)
- **WebRTC**: Peer-to-peer voice communication
- **Location Services**: GPS tracking with Expo Location
- **Socket.io Client**: Real-time signaling with backend
- **Context API**: Theme and app state management

### Backend (Node.js)
- **Express**: HTTP server
- **Socket.io**: WebRTC signaling and user coordination
- **Proximity Matching**: Calculate distances between users and manage connections

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS testing) or Android Emulator (for Android testing)
- Physical device recommended for testing location features

## Installation

### 1. Install dependencies

#### Frontend:
```bash
npm install
```

#### Backend:
```bash
cd server
npm install
```

### 2. Start the signaling server

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

### 3. Update server URL (if needed)

If your signaling server is not running on `localhost:3000`, update the URL in:
`src/constants/config.ts`

```typescript
export const SERVER_URL = 'http://YOUR_SERVER_IP:3000';
```

**Important**: When testing on a physical device, you need to use your computer's local network IP address instead of `localhost`.

### 4. Start the React Native app

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan the QR code with Expo Go app on your physical device

## Usage

1. **Grant Permissions**: When you first open the app, grant location and microphone permissions
2. **Toggle Theme**: Tap the moon/sun icon in the top right to switch between light and dark mode
3. **Set Radius**: Use the slider to set your preferred proximity radius (100m to 5km)
4. **Go Online**: Tap the center circle to go online
   - **Red border**: Offline
   - **Blue border**: Connecting
   - **Green border**: Online
5. **Automatic Connection**: When other users are within your set radius, you'll automatically connect and can hear each other
6. **User Count**: When online, the circle shows how many users you're connected to

## Project Structure

```
proximityDrive/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── StatusCircle.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── RadiusSlider.tsx
│   ├── contexts/           # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── AppStateContext.tsx
│   ├── screens/            # App screens
│   │   └── HomeScreen.tsx
│   ├── services/           # Business logic services
│   │   ├── LocationService.ts
│   │   ├── WebRTCService.ts
│   │   ├── SignalingService.ts
│   │   └── ProximityService.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/          # Configuration constants
│   │   ├── config.ts
│   │   └── themes.ts
│   └── utils/              # Utility functions and hooks
│       └── useProximity.ts
├── server/                 # Node.js signaling server
│   ├── index.js
│   └── package.json
├── App.tsx                 # App entry point
└── package.json
```

## How It Works

1. **User Goes Online**:
   - App requests location and microphone permissions
   - Initializes WebRTC local audio stream
   - Connects to signaling server via Socket.io
   - Sends initial location and radius to server

2. **Location Updates**:
   - App continuously tracks user's location
   - Sends location updates to server every 5 seconds or when user moves 10+ meters
   - Server calculates distances between all users

3. **Proximity Matching**:
   - Server uses Haversine formula to calculate distances
   - When two users are within each other's radius:
     - Server notifies both users
     - WebRTC peer connection is established
     - Audio streams are exchanged

4. **Voice Communication**:
   - WebRTC handles peer-to-peer audio streaming
   - Server only handles signaling (SDP offers/answers, ICE candidates)
   - Multiple users in range form a mesh network for group chat

5. **User Leaves Range**:
   - Server detects when users move out of range
   - Notifies both users to close the connection
   - WebRTC peer connection is terminated

## Configuration

### Location Update Settings
Edit `src/constants/config.ts`:

```typescript
export const LOCATION_UPDATE_INTERVAL = 5000; // Update every 5 seconds
export const MIN_RADIUS = 0.1; // Minimum 100 meters
export const MAX_RADIUS = 5; // Maximum 5 kilometers
export const DEFAULT_RADIUS = 1; // Default 1 kilometer
```

### WebRTC ICE Servers
Edit `src/constants/config.ts`:

```typescript
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
```

## Testing

To test the app properly:

1. **Run the signaling server**
2. **Use multiple devices or simulators**:
   - Each device represents a different user
   - Use different physical devices or multiple simulators
3. **Mock location (for testing)**:
   - In iOS Simulator: Debug → Location → Custom Location
   - In Android Emulator: Extended Controls → Location
4. **Set locations within proximity range**
5. **Go online on both devices**
6. **Verify voice connection**

## Troubleshooting

### Can't connect to server
- Ensure server is running on port 3000
- Check SERVER_URL in `src/constants/config.ts`
- On physical device, use your computer's local IP (not localhost)
- Disable firewall or allow port 3000

### Location not working
- Check location permissions are granted
- On iOS simulator, set a custom location
- On Android emulator, set location in extended controls

### Microphone not working
- Check microphone permissions are granted
- Physical device recommended for audio testing
- Ensure no other app is using the microphone

### No users connecting
- Verify both users are within each other's radius
- Check server logs for proximity calculations
- Ensure WebRTC peer connections are established (check console logs)

## Future Enhancements

- User authentication and profiles
- Push-to-talk mode
- Mute/unmute controls
- Background location tracking
- User blocking/reporting
- Text chat alongside voice
- User avatars and display names
- Connection history
- Advanced matching (interests, groups)

## License

0BSD

## Author

Built with Claude Code
# Prox
