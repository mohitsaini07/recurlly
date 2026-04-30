import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-accent">
      <Text className="text-5xl font-extrabold mb-5 text-white">Recurlly</Text>
      <Link href="/(auth)/sign-in" className="bg-primary px-4 py-2 rounded-full text-white">
        <Text>Get Started</Text>
      </Link>
    </View>
  );
}
