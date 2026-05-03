import { Link, useLocalSearchParams } from 'expo-router'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SubscriptionDetail = () => {
    const {id} = useLocalSearchParams<{id: string}>()
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6">
        <Text className="text-3xl font-bold text-primary">Subscription Detail: {id} </Text>
      </View>
    </SafeAreaView>
  )
}

export default SubscriptionDetail