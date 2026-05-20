import React from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export function UpcomingCard({ name, price, daysLeft, icon, color = '#081126', index = 0 }: any) {
  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).springify().damping(14)}
      className="upcoming-card"
    >
      <View className="upcoming-row">
        <View className="upcoming-icon items-center justify-center rounded-xl bg-black/5">
          {typeof icon === 'string' ? null : (
            <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
          )}
        </View>
        <View>
          <Text className="upcoming-price">${price}</Text>
          <Text className="upcoming-meta">{daysLeft} days left</Text>
        </View>
      </View>
      <Text className="upcoming-name" numberOfLines={1}>{name}</Text>
    </Animated.View>
  );
}
