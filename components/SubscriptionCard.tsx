import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type SubscriptionCardProps = {
  name: string;
  price: string;
  billing: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
};

export function SubscriptionCard({ name, price, billing, date, icon, color = '#081126' }: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View layout={LinearTransition} className={`sub-card mb-4 ${expanded ? 'sub-card-expanded' : ''}`}>
      <Pressable onPress={() => setExpanded(!expanded)} className="sub-head">
        <View className="sub-main">
          <View className="sub-icon items-center justify-center bg-black/5">
            <Ionicons name={icon} size={32} color={color} />
          </View>
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>{name}</Text>
            <Text className="sub-meta">{date}</Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{price}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <Text className="sub-label">Started on</Text>
              <Text className="sub-value text-right">Oct 12, 2022</Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Billing Cycle</Text>
              <Text className="sub-value text-right">Monthly</Text>
            </View>
          </View>
          <TouchableOpacity className="sub-cancel" activeOpacity={0.8}>
            <Text className="sub-cancel-text">Cancel Subscription</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}
