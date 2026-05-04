import "@/global.css"
import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { UpcomingCard } from "@/components/UpcomingCard";

const SUBSCRIPTIONS = [
  { id: '1', name: 'Spotify Premium', price: '$5.99', billing: 'Monthly', date: 'Next bill on Feb 12', icon: 'logo-github' as const, color: '#1DB954' },
  { id: '2', name: 'YouTube Premium', price: '$18.99', billing: 'Monthly', date: 'Next bill on Feb 14', icon: 'logo-youtube' as const, color: '#FF0000' },
  { id: '3', name: 'Figma Professional', price: '$15.00', billing: 'Monthly', date: 'Next bill on Feb 16', icon: 'logo-figma' as const, color: '#F24E1E' },
  { id: '4', name: 'Netflix', price: '$12.99', billing: 'Monthly', date: 'Next bill on Feb 18', icon: 'play' as const, color: '#E50914' },
  { id: '5', name: 'Adobe CC', price: '$54.99', billing: 'Monthly', date: 'Next bill on Feb 20', icon: 'color-palette' as const, color: '#FF0000' },
];

function ListHeader() {
  return (
    <View className="mb-2">
      <View className="home-header">
        <View className="home-user">
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }}
            className="home-avatar"
          />
          <Text className="home-user-name">Hi, Mohit!</Text>
        </View>
        <View className="home-add-icon items-center justify-center rounded-full bg-black/5">
          <Ionicons name="add" size={28} color="#081126" />
        </View>
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Total Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">$2,663.00</Text>
          <Text className="home-balance-date">Jan 11, 2024</Text>
        </View>
      </View>

      <View className="list-head mt-6">
        <Text className="list-title">Upcoming</Text>
        <View className="list-action">
          <Text className="list-action-text">See All</Text>
        </View>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={UPCOMING_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UpcomingCard {...item} />}
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <View className="list-head mt-8">
        <Text className="list-title">All Subscriptions</Text>
        <View className="list-action">
          <Text className="list-action-text">Filter</Text>
        </View>
      </View>
    </View>
  );
}

export default function Home() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <View className="flex-1 bg-background">
        <FlatList
          data={SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SubscriptionCard {...item} />}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}