import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/context/SubscriptionContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { formatCurrency } from '@/lib/utils';

const Insights = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions, currency } = useSubscriptions();

  // Dynamic expenses calculation
  const totalExpenses = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.frequency === 'Yearly' || s.billing === 'Yearly') {
        return sum + (s.price / 12);
      }
      return sum + s.price;
    }, 0);

  // Mock a dynamic chart distribution based on total expenses
  const baseChartVal = totalExpenses / 7 || 10;
  const chartData = [
    { day: 'Mon', value: Math.round(baseChartVal * 0.8) },
    { day: 'Tue', value: Math.round(baseChartVal * 1.2) },
    { day: 'Wed', value: Math.round(baseChartVal * 0.5) },
    { day: 'Thr', value: Math.round(baseChartVal * 1.5), highlighted: true },
    { day: 'Fri', value: Math.round(baseChartVal * 1.1) },
    { day: 'Sat', value: Math.round(baseChartVal * 0.4) },
    { day: 'Sun', value: Math.round(baseChartVal * 0.9) },
  ];

  const maxVal = Math.max(...chartData.map(d => d.value), 45);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <Animated.ScrollView entering={FadeIn.duration(400)} className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <TouchableOpacity 
            className="w-12 h-12 rounded-full border border-black/10 items-center justify-center bg-transparent"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#081126" />
          </TouchableOpacity>
          <Text className="text-2xl font-sans-bold text-primary">Monthly Insights</Text>
          <TouchableOpacity 
            className="w-12 h-12 rounded-full border border-black/10 items-center justify-center bg-transparent"
            onPress={() => posthog.capture('insights_menu_tapped')}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#081126" />
          </TouchableOpacity>
        </View>

        {/* Upcoming Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-sans-bold text-primary">Upcoming</Text>
          <TouchableOpacity 
            className="px-4 py-1.5 rounded-full border border-black/10"
            onPress={() => posthog.capture('insights_view_all_upcoming_tapped')}
          >
            <Text className="text-sm font-sans-semibold text-primary">View all</Text>
          </TouchableOpacity>
        </View>

        {/* Bar Chart Card */}
        <View className="bg-[#f8eed1] rounded-3xl p-5 mb-6">
          <View className="h-[220px] flex-row">
            {/* Y Axis Labels */}
            <View className="justify-between items-end mr-3 py-6">
              {[45, 35, 25, 5, 0].map(val => (
                <Text key={val} className="text-xs font-sans-semibold text-primary/50">{val}</Text>
              ))}
            </View>
            
            {/* Chart Area */}
            <View className="flex-1 relative">
              {/* Grid Lines */}
              <View className="absolute inset-0 justify-between py-8">
                {[...Array(5)].map((_, i) => (
                  <View key={i} className="border-b border-dashed border-black/10 w-full h-0" />
                ))}
              </View>

              {/* Bars */}
              <View className="flex-1 flex-row justify-between items-end pt-8 pb-8 px-2">
                {chartData.map((d, i) => (
                  <View key={i} className="items-center relative h-full justify-end w-10">
                    {d.highlighted && (
                      <View 
                        className="absolute bg-accent px-2.5 py-1 rounded-lg items-center justify-center shadow-sm z-20"
                        style={{ bottom: `${(d.value / maxVal) * 100}%`, marginBottom: 8 }}
                      >
                        <Text className="text-white text-xs font-sans-bold">${d.value}</Text>
                      </View>
                    )}
                    <View 
                      style={{ height: `${(d.value / maxVal) * 100}%` }}
                      className={clsx("w-3.5 rounded-full z-10", d.highlighted ? "bg-accent" : "bg-primary")}
                    />
                    <Text className="absolute -bottom-6 left-0 right-0 text-center text-xs font-sans-semibold text-primary/50">{d.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Expenses Summary */}
        <View className="border border-black/10 rounded-3xl p-5 mb-8 bg-transparent">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xl font-sans-bold text-primary">Expenses</Text>
            <Text className="text-xl font-sans-bold text-primary">-{formatCurrency(totalExpenses, currency)}</Text>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-base font-sans-medium text-primary/60">{dayjs().format('MMMM YYYY')}</Text>
            <Text className="text-base font-sans-medium text-primary/60">+12%</Text>
          </View>
        </View>

        {/* History Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-sans-bold text-primary">History</Text>
          <TouchableOpacity 
            className="px-4 py-1.5 rounded-full border border-black/10"
            onPress={() => posthog.capture('insights_view_all_history_tapped')}
          >
            <Text className="text-sm font-sans-semibold text-primary">View all</Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <View className="pb-24">
          {subscriptions.map((item, index) => (
            <SubscriptionCard key={item.id || index} {...item} index={index} />
          ))}
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  )
}

export default Insights