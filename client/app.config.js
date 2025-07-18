require('dotenv').config();

export default {
  expo: {
    name: "Foodie",
    slug: "client",
    version: "1.0.0",
    orientation: "portrait",
    developmentClient: {
      timeout: 200000,
    },
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "foodie.food12",
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN
          // password:"Y4!n/FHjQB5e6,$"
        },
      ],
    ],
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FCFBF4",
    },
    assetBundlePatterns: ["**/*",
      "src/components/data/*.json"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.foodie.client",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      softwareKeyboardLayoutMode: "pan",
      package: "foodie.food12",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      googleSignIn: {
        certificateHash: "d402c2323d6d8da4faae6a4337502c7b06ebc109",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "3d69b5cc-738d-4178-8e8c-60f0ec80b3d6",
        firebaseApiKey: process.env.FIREBASE_API_KEY,
        firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
        firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        firebaseAppId: process.env.FIREBASE_APP_ID,
        clientId: process.env.CLIENT_ID,
        android_clientId: process.env.ANDROID_CLIENT_ID,
        
      },
    },
  },
};
