import "@/global.css"
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);


export default function Index() {
  return (
    <SafeAreaView className="flex-1 gap-5 p-5">
      <Text className="text-5xl font-sans-extrabold mb-5">Home</Text>

      <Link href="/onboarding" className="bg-primary font-sans-bold px-4 py-2 rounded-lg text-white">
        <Text>Go to Onboarding</Text>
      </Link>

      <Link href="/(auth)/sign-in" className="bg-primary font-sans-bold px-4 py-2 rounded-lg text-white">
        <Text>Sign In</Text>
      </Link>

      <Link href="/(auth)/sign-up" className="bg-primary font-sans-bold px-4 py-2 rounded-lg text-white">
        <Text>Create Account</Text>
      </Link>

    </SafeAreaView>
  );
}
 