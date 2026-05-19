import { useState } from 'react'
import { View, Text, TextInput, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { SubscriptionCard } from '@/components/SubscriptionCard'
import { HOME_SUBSCRIPTIONS } from '@/constants/data'

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSubscriptions = HOME_SUBSCRIPTIONS.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <View className="flex-1 bg-background">
        <View className="px-5 pt-6 pb-2">
          <Text className="text-3xl font-sans-bold text-primary mb-6">Subscriptions</Text>
          
          {/* Search Bar */}
          <View className="flex-row items-center bg-white/40 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-sm shadow-black/5">
            <Ionicons name="search-outline" size={20} color="rgba(0,0,0,0.4)" />
            <TextInput
              className="flex-1 ml-3 text-base font-sans-medium text-primary"
              placeholder="Search subscriptions..."
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Subscriptions List */}
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SubscriptionCard {...item} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="search-outline" size={48} color="rgba(0,0,0,0.1)" />
              <Text className="mt-4 text-lg font-sans-semibold text-muted-foreground">
                No subscriptions found
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground text-center px-10">
                We couldn't find any subscriptions matching "{searchQuery}"
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default Subscriptions