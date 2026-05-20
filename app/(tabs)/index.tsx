import "@/global.css"
import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { HOME_USER } from "@/constants/data";
import { UpcomingCard } from "@/components/UpcomingCard";
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { formatCurrency } from "@/lib/utils";
import images from "@/constants/images";
import dayjs from "dayjs";
import { CreateSubscriptionModal } from "@/components/CreateSubscriptionModal";
import { useSubscriptions } from "@/context/SubscriptionContext";
import Animated, { FadeIn } from 'react-native-reanimated';

function ListHeader({ onAddPress }: { onAddPress: () => void }) {
  const posthog = usePostHog();
  const { subscriptions, currency } = useSubscriptions();

  // Dynamic calculations
  const totalBalance = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.price, 0);

  // Calculate upcoming
  const now = dayjs();
  const upcoming = subscriptions
    .filter(s => s.status === 'active')
    .map(s => {
      let renewal = dayjs(s.renewalDate);
      while (renewal.isBefore(now)) {
        renewal = renewal.add(1, s.frequency === 'Yearly' ? 'year' : 'month');
      }
      return { ...s, daysLeft: renewal.diff(now, 'day'), renewalDate: renewal.toISOString() };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nextRenewalDate = upcoming.length > 0 ? upcoming[0].renewalDate : new Date().toISOString();

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
        <TouchableOpacity
          className="home-add-icon items-center justify-center rounded-full bg-black/5"
          onPress={() => {
            posthog.capture('home_add_subscription_tapped');
            onAddPress();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={28} color="#081126" />
        </TouchableOpacity>
      </View>

       <View className="home-balance-card">
         <Text className="home-balance-label">Total Balance</Text>
         <View className="home-balance-row">
           <Text className="home-balance-amount">{formatCurrency(totalBalance, currency)}</Text>
           <Text className="home-balance-date">{dayjs(nextRenewalDate).format('MM/DD')}</Text>
         </View>
       </View>

      <View className="list-head mt-6">
        <Text className="list-title">Upcoming</Text>
        <TouchableOpacity
          className="list-action"
          onPress={() => posthog.capture('home_see_all_upcoming_tapped')}
          activeOpacity={0.7}
        >
          <Text className="list-action-text">See All</Text>
        </TouchableOpacity>
      </View>

      {upcoming.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcoming}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <UpcomingCard {...item} index={index} />}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      ) : (
        <Text className="text-sm font-sans-medium text-primary/60 mb-2">No upcoming subscriptions.</Text>
      )}

      <View className="list-head mt-8">
        <Text className="list-title">All Subscriptions</Text>
        <TouchableOpacity
          className="list-action"
          onPress={() => posthog.capture('home_subscriptions_filter_tapped')}
          activeOpacity={0.7}
        >
          <Text className="list-action-text">Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Home() {
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <Animated.View entering={FadeIn.duration(400)} className="flex-1 bg-background">
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <SubscriptionCard {...item} index={index} />}
          ListHeaderComponent={<ListHeader onAddPress={() => setModalVisible(true)} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
      <CreateSubscriptionModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onCreate={addSubscription} 
      />
    </SafeAreaView>
  );
}