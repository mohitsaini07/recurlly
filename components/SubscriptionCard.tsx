import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';
import { formatCurrency } from '@/lib/utils';
import { usePostHog } from 'posthog-react-native';

export function SubscriptionCard({
  name,
  price,
  billing,
  renewalDate,
  startDate,
  icon,
  currency,
  plan,
  paymentMethod,
}: Subscription) {
  const [expanded, setExpanded] = useState(false);
  const posthog = usePostHog();

  const handleToggleExpand = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      posthog.capture('subscription_expanded', { name, billing, price });
    }
  };

  const formatSubDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formattedPrice = formatCurrency(price, currency);

  return (
    <Animated.View layout={LinearTransition} className={`sub-card mb-4 ${expanded ? 'sub-card-expanded' : ''}`}>
      <Pressable onPress={handleToggleExpand} className="sub-head">
        <View className="sub-main">
          <View className="sub-icon items-center justify-center bg-black/5">
            <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
          </View>
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>{name}</Text>
            <Text className="sub-meta">Next bill: {formatSubDate(renewalDate)}</Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formattedPrice}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn} exiting={FadeOut} className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <Text className="sub-label">Plan</Text>
              <Text className="sub-value text-right">{plan}</Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Payment Method</Text>
              <Text className="sub-value text-right">{paymentMethod}</Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Started on</Text>
              <Text className="sub-value text-right">{formatSubDate(startDate)}</Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Billing Cycle</Text>
              <Text className="sub-value text-right">{billing}</Text>
            </View>
          </View>
          <TouchableOpacity
            className="sub-cancel"
            activeOpacity={0.8}
            onPress={() => posthog.capture('subscription_cancel_tapped', { name, billing, price })}
          >
            <Text className="sub-cancel-text">Cancel Subscription</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}
