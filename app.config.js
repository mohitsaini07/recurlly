export default {
  expo: {
    name: "recurlly",
    slug: "recurlly",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "recurlly",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
    },
    android: {
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    plugins: [
      "expo-router",
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/PlusJakartaSans-Light.ttf",
            "./assets/fonts/PlusJakartaSans-Regular.ttf",
            "./assets/fonts/PlusJakartaSans-Medium.ttf",
            "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
            "./assets/fonts/PlusJakartaSans-Bold.ttf",
            "./assets/fonts/PlusJakartaSans-Bold.ttf",
          ],
        },
      ],
      "@clerk/expo",
      "expo-secure-store",
    ],
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      eas: {
        projectId: "ef98848f-2a5b-461c-a9a5-37d43c78ed71",
      },
    },
  },
};
