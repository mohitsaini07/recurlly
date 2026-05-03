import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-5">
      <Text className="text-5xl font-extrabold mb-5">Recurlly</Text>

      <Link href="/onboarding" className="bg-primary px-4 py-2 rounded-full text-white">
        <Text>Go to Onboarding</Text>
      </Link>

      <Link href="/(auth)/sign-in" className="bg-primary px-4 py-2 rounded-full text-white">
        <Text>Sign In</Text>
      </Link>

      <Link href="/(auth)/sign-up" className="bg-primary px-4 py-2 rounded-full text-white">
        <Text>Create Account</Text>
      </Link>

      <Link href={"/subscriptions/spotify" as any} className="bg-primary px-4 py-2 rounded-full text-accent">
        <Text>Spotify Subscription</Text>
      </Link>

      <Link href={
        {
          pathname: "/subscriptions/[id]",
          params: { id: "claude" }
        } as any
      }>
        <Text>Claude Max Subscriptions</Text>
      </Link>
    </View>
  );
}
 