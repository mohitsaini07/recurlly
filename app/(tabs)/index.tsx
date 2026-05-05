import "@/global.css"
import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UPCOMING_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS, HOME_BALANCE, HOME_USER } from "@/constants/data";
import { UpcomingCard } from "@/components/UpcomingCard";
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { formatCurrency } from "@/lib/utils";
import images from "@/constants/images";
import dayjs from "dayjs";

function ListHeader() {
  return (
    <View className="mb-2">
      <View className="home-header">
        <View className="home-user">
          <Image
            source={images.avatar}
            className="home-avatar"
          />
          <Text className="home-user-name">Hi, {HOME_USER.name}!</Text>
        </View>
        <View className="home-add-icon items-center justify-center rounded-full bg-black/5">
          <Ionicons name="add" size={28} color="#081126" />
        </View>
      </View>
 
       <View className="home-balance-card">
         <Text className="home-balance-label">Total Balance</Text>
         <View className="home-balance-row">
           <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
           <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
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
          data={HOME_SUBSCRIPTIONS}
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