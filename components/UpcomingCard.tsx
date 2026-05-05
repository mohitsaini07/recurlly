import React from 'react';
import { View, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export function UpcomingCard({ name, price, daysLeft, icon, color = '#081126' }: UpcomingSubscription) {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <View className="upcoming-icon items-center justify-center rounded-xl bg-black/5">
          <AntDesign name={icon as any} size={28} color={color} />
        </View>
        <View>
          <Text className="upcoming-price">{price}</Text>
          <Text className="upcoming-meta">{daysLeft} days left</Text>
        </View>
      </View>
      <Text className="upcoming-name" numberOfLines={1}>{name}</Text>
    </View>
  );
}
