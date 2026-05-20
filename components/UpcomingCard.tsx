import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { icons } from '@/constants/icons';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { formatCurrency } from '@/lib/utils';

export function UpcomingCard({ name, price, daysLeft, icon, color = '#081126', index = 0 }: any) {
  const [iconError, setIconError] = useState(false);
  const { currency } = useSubscriptions();

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify().damping(14)}
      className="upcoming-card"
    >
      <View className="upcoming-row">
        <View className="upcoming-icon items-center justify-center rounded-xl bg-black/5 overflow-hidden">
          {typeof icon === 'string' ? null : (
            <Image 
              source={iconError ? icons.wallet : icon} 
              style={{ width: 38, height: 38 }} 
              resizeMode="contain" 
              onError={() => setIconError(true)}
            />
          )}
        </View>
        <View>
          <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
          <Text className="upcoming-meta">{daysLeft} days left</Text>
        </View>
      </View>
      <Text className="upcoming-name" numberOfLines={1}>{name}</Text>
    </Animated.View>
  );
}
