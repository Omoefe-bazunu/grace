GKS Mobile App: Towards God's Perfect Government

The GKS Mobile App is the official digital platform for God's Kingdom Society (The Church of the Living God), designed to help members and believers worldwide read, listen, and grow in faith. Founded in 1934, the GKS is committed to preaching the pure truth of God's word and exposing false doctrines through a multilingual ministry.

Key Features
 * Multilingual Support: Fully localized in English, Yoruba, Hausa, Igbo, Urhobo, Swahili, Isoko, Hausa, Itsekiri, French, and Chinese.
 * Edifying Sermons: Access sermons in text, audio, and video formats organized by volume, subject, and year.
 * Sacred Music: A vast collection of Theocratic Songs of Praise (Hymns and Psalms) and spiritual melodies.
 * Bible-Based Stories: Spiritual values brought to life through narrative animations and visual illustrations.
 * Digital Archive: A comprehensive history of the church containing photos and videos of past events.
 * Live Events: Real-time streaming of church services and special events via YouTube and HLS integration.
 * Quiz Resources: Study materials, including downloadable PDFs, to help users sharpen their biblical knowledge.
 * Daily Guide: A digital devotional to nourish your spirit with daily scriptural guidance.
 * Thematic UI: Full support for Light and Dark modes with dynamic theme context.

Tech Stack
 * Framework: React Native (Expo SDK)
 * Navigation: Expo Router (File-based routing)
 * State Management: React Context API (Theme, Language, and Auth)
 * Database & Storage: Firebase (Firestore, Storage, and Authentication)
 * Video Playback: expo-av and react-native-webview
 * UI Components: lucide-react-native, expo-linear-gradient
 * Local Storage: AsyncStorage for user preferences

Getting Started
Prerequisites
 * Node.js (LTS version)
 * Expo Go app on your mobile device OR an emulator/simulator
 * A Firebase project configured for the application
Installation
 * Clone the repository:
   git clone https://github.com/your-username/grace.git
cd grace

 * Install dependencies:
   npm install

 * Environment Setup:
   Create a .env file in the root directory and add your Firebase configuration:
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

 * Start the development server:
   npx expo start

📂 Project Structure
├── app/                  # Expo Router directory
│   ├── (tabs)/           # Main bottom-tab navigation
│   ├── (onboarding)/     # Language selection and intro slides
│   └── profile/          # Gallery, Quiz, and About screens
├── assets/               # Local images and fonts
├── components/           # Reusable UI components
├── contexts/             # Theme and Language context providers
├── constants/            # Global configuration (e.g., language lists)
└── services/             # Firebase and Data service logic

🌍 Localization
The application uses a custom LanguageProvider to manage translations across 10 languages. It detects saved user preferences from AsyncStorage and defaults to English if no preference is found.

🤝 Contribution
Contributions are welcome! If you'd like to improve the app, please:
 * Fork the project.
 * Create your feature branch (git checkout -b feature/AmazingFeature).
 * Commit your changes (git commit -m 'Add some AmazingFeature').
 * Push to the branch (git push origin feature/AmazingFeature).
 * Open a Pull Request.

📄 License
Distributed under the MIT License. See LICENSE for more information.

Developed by HIGH-ER ENTERPRISES
Towards God's perfect government
