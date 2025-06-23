# Mobile App - Garbage Collection System

React Native + Expo + NativeWind mobile application for field personnel.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- An iOS or Android simulator, or a physical device with the Expo Go app.

### Installation

1. **Navigate to the mobile-app directory:**
```bash
cd mobile-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the Expo development server:**
```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or run on a simulator by pressing `i` (for iOS) or `a` (for Android).

## 🎨 Tech Stack

- **Framework**: React Native
- **Development Environment**: Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand / Redux Toolkit
- **Offline Storage**: WatermelonDB / MMKV
- **Navigation**: React Navigation
- **HTTP Client**: Axios

## ✨ Key Features

- **Offline-First Architecture**: Queue actions locally and sync with the server when a connection is available.
- **Secure Authentication**: Biometric login support (Face ID/Touch ID) and secure JWT storage.
- **Location Tracking**: Background location tracking for pickers on duty, with battery optimization.
- **Task Management**: View assigned pickup requests, update statuses, and capture verification photos.
- **Real-time Notifications**: Push notifications for new assignments and alerts.
- **Hardware Integration**: Camera for QR code scanning and photo uploads.
- **UX Guidelines**: Adheres to **Apple Human Interface Guidelines** and **Samsung UX Guidelines**.

## 📁 Folder Structure (Proposed)

```
mobile-app/
├── assets/             # Images, fonts, icons
├── app/                # Main app components and screens
│   ├── (tabs)/         # Tab navigator layout
│   ├── auth/           # Auth screens (Login, Register)
│   └── index.js        # Entry point screen
├── components/         # Reusable UI components
├── constants/          # Colors, styles, layout values
├── hooks/              # Custom hooks
├── lib/                # Helper functions, API client
├── services/           # API service calls
├── store/              # State management
├── providers/          # Context providers
├── app.json            # Expo configuration
├── babel.config.js
├── package.json
└── tailwind.config.js
```

## 🧪 Testing

- **Unit/Component Tests**: Jest + React Native Testing Library.
- **End-to-End Tests**: Detox or Maestro for user flow testing.

## 📦 Building for Production

### Android
```bash
# Build an APK/AAB
npx expo build:android
```

### iOS
```bash
# Build an IPA
npx expo build:ios
```

### Over-The-Air (OTA) Updates

Publish updates without a new store submission:
```bash
npx expo publish
```

## 🔒 Security & Offline Storage

- **Secrets Management**: Use `expo-secure-store` to securely store API tokens.
- **Offline Sync**: Implement a sync engine to manage data between the local database and the remote server.
- **Request Queue**: Queue mutations (POST, PUT, DELETE) when offline and execute them upon reconnection. 