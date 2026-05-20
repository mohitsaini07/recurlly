import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut, FadeInDown } from 'react-native-reanimated';
import { formatCurrency } from '@/lib/utils';
import { usePostHog } from 'posthog-react-native';
import dayjs from 'dayjs';
import { useSubscriptions } from '@/context/SubscriptionContext';

export function SubscriptionCard({
  id,
  name,
  price,
  billing,
  renewalDate,
  startDate,
  icon,
  currency,
  plan,
  paymentMethod,
  status,
  color,
  index = 0,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const posthog = usePostHog();
  const { removeSubscription } = useSubscriptions();

  const handleToggleExpand = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      posthog.capture('subscription_expanded', { name, billing, price });
    }
  };

  const handleCancel = () => {
    posthog.capture('subscription_cancel_tapped', { name, billing, price });
    if (id) {
      removeSubscription(id);
    }
  };

  const formattedPrice = formatCurrency(price, currency);

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify().damping(14)}
      layout={LinearTransition.springify().damping(14)} 
      style={{ backgroundColor: color || '#fff' }} 
      className="p-5 rounded-[28px] mb-4 overflow-hidden"
    >
      <Pressable 
        className="flex-row items-center justify-between"
        onPress={handleToggleExpand}
      >
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-2xl bg-white/30 justify-center items-center">
            <Image source={icon} className="w-8 h-8" resizeMode="contain" />
          </View>
          <View className="ml-4">
            <Text className="text-xl font-sans-bold text-primary">{name}</Text>
            <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
              {dayjs(startDate).format("MMMM D, HH:mm")}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xl font-sans-bold text-primary">{formattedPrice}</Text>
          <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
            per {billing.toLowerCase()}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="mt-4 border-t border-black/10 pt-4 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-medium text-primary/70">Plan</Text>
            <Text className="text-sm font-sans-bold text-primary">{plan}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-medium text-primary/70">Payment Method</Text>
            <Text className="text-sm font-sans-bold text-primary">{paymentMethod}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-sans-medium text-primary/70">Status</Text>
            <Text className="text-sm font-sans-bold text-primary capitalize">{status}</Text>
          </View>
          <TouchableOpacity 
            className="mt-2 items-center rounded-full bg-white/30 py-3"
            activeOpacity={0.7}
            onPress={handleCancel}
          >
            <Text className="font-sans-bold text-primary">Cancel Subscription</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}
