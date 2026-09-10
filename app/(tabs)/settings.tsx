import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/expo';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { clsx } from 'clsx';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { formatCurrency } from '@/lib/utils';
import { HOME_USER } from '@/constants/data';
import images from '@/constants/images';

// Safe haptic feedback trigger
const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'selection' = 'light') => {
  try {
    if (Platform.OS === 'web') return;
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === 'selection') Haptics.selectionAsync();
  } catch {
    // Fallback gracefully
  }
};

// Recurlly Toggle Switch matching app theme
const RecurllyToggle = ({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) => {
  const handleToggle = () => {
    triggerHaptic('light');
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      className={clsx(
        'w-12 h-7 rounded-full p-1 justify-center',
        active ? 'bg-accent' : 'bg-black/10'
      )}
    >
      <View
        className={clsx(
          'w-5 h-5 rounded-full bg-white shadow-sm',
          active ? 'self-end' : 'self-start'
        )}
      />
    </TouchableOpacity>
  );
};

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const {
    subscriptions,
    currency,
    setCurrency,
    resetSubscriptions,
    clearSubscriptions,
  } = useSubscriptions();

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(2);

  // Dynamic values
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;
  const totalMonthlySpend = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      if (s.frequency === 'Yearly' || s.billing === 'Yearly') {
        return sum + s.price / 12;
      }
      return sum + s.price;
    }, 0);

  const handleSignOut = () => {
    triggerHaptic('medium');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Recurlly?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    triggerHaptic('medium');
    try {
      const exportContent = {
        exportedAt: new Date().toISOString(),
        currency,
        totalMonthlySpend,
        subscriptionsCount: subscriptions.length,
        subscriptions: subscriptions.map((s) => ({
          name: s.name,
          price: s.price,
          currency: s.currency || currency,
          billing: s.billing || s.frequency,
          status: s.status,
          category: s.category,
          renewalDate: s.renewalDate,
        })),
      };

      await Share.share({
        title: 'Recurlly Subscriptions Backup',
        message: JSON.stringify(exportContent, null, 2),
      });
      triggerHaptic('success');
    } catch (e) {
      console.error('Export error', e);
    }
  };

  const handleResetData = () => {
    triggerHaptic('medium');
    Alert.alert(
      'Restore Demo Subscriptions',
      'This will reset your subscriptions list to the default demo data (Adobe, GitHub, Claude, Canva). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'default',
          onPress: () => {
            resetSubscriptions();
            triggerHaptic('success');
            Alert.alert('Restored', 'Demo subscriptions have been restored.');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    triggerHaptic('medium');
    Alert.alert(
      'Clear All Subscriptions',
      'Are you sure you want to delete all subscriptions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            clearSubscriptions();
            triggerHaptic('success');
            Alert.alert('Cleared', 'All subscriptions have been removed.');
          },
        },
      ]
    );
  };

  const handleCycleReminder = () => {
    const cycle = [1, 2, 3, 7];
    const nextIdx = (cycle.indexOf(reminderDays) + 1) % cycle.length;
    setReminderDays(cycle[nextIdx]);
    triggerHaptic('selection');
  };

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
    { code: 'CAD', symbol: '$' },
    { code: 'AUD', symbol: '$' },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <Animated.ScrollView
        entering={FadeIn.duration(400)}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Matching Insights Screen */}
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <TouchableOpacity
            className="w-12 h-12 rounded-full border border-black/10 items-center justify-center bg-transparent"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#081126" />
          </TouchableOpacity>
          <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
          <View className="w-12 h-12 rounded-full border border-black/10 items-center justify-center bg-transparent">
            <Ionicons name="shield-checkmark-outline" size={20} color="#081126" />
          </View>
        </View>

        {/* Hero Profile Card - Matching Insights & Home aesthetic */}
        <Animated.View
          entering={FadeInDown.springify()}
          className="bg-[#f8eed1] rounded-3xl p-5 mb-6"
        >
          {/* Top user row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-2">
              <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                className="w-14 h-14 rounded-full border border-black/10"
              />
              <View className="ml-4 flex-1">
                <Text className="text-xl font-sans-bold text-primary" numberOfLines={1}>
                  {user?.fullName || HOME_USER.name}
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5" numberOfLines={1}>
                  {user?.primaryEmailAddress?.emailAddress || 'mohit@recurlly.com'}
                </Text>
              </View>
            </View>

            <View className="px-3 py-1 rounded-full border border-black/10 bg-black/5">
              <Text className="text-xs font-sans-bold text-primary">PRO</Text>
            </View>
          </View>

          {/* Dashed divider matching Insights chart grid lines */}
          <View className="border-b border-dashed border-black/10 my-4" />

          {/* Two stats columns */}
          <View className="flex-row justify-between items-center px-1">
            <View>
              <Text className="text-xs font-sans-semibold text-primary/50 uppercase tracking-wider">
                Active Subscriptions
              </Text>
              <Text className="text-2xl font-sans-bold text-primary mt-0.5">
                {activeSubsCount}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-xs font-sans-semibold text-primary/50 uppercase tracking-wider">
                Monthly Spend
              </Text>
              <Text className="text-2xl font-sans-bold text-accent mt-0.5">
                {formatCurrency(totalMonthlySpend, currency)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Currency Section */}
        <View className="list-head mb-3">
          <Text className="list-title">Currency</Text>
          <View className="list-action">
            <Text className="list-action-text">{currency}</Text>
          </View>
        </View>

        <View className="border border-black/10 rounded-3xl p-5 mb-6 bg-transparent">
          <Text className="text-base font-sans-bold text-primary mb-1">
            Default Currency
          </Text>
          <Text className="text-sm font-sans-medium text-primary/60 mb-4">
            Display currency used across all subscription charges and charts.
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {currencies.map((curr) => {
              const isSelected = currency === curr.code;
              return (
                <TouchableOpacity
                  key={curr.code}
                  activeOpacity={0.7}
                  onPress={() => {
                    triggerHaptic('selection');
                    setCurrency(curr.code);
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-full border',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-black/10 bg-transparent'
                  )}
                >
                  <Text
                    className={clsx(
                      'text-sm font-sans-bold',
                      isSelected ? 'text-white' : 'text-primary'
                    )}
                  >
                    {curr.symbol} {curr.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences Section */}
        <View className="list-head mb-3">
          <Text className="list-title">Preferences</Text>
        </View>

        <View className="border border-black/10 rounded-3xl p-5 mb-6 bg-transparent">
          {/* Notifications Item */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-black/5 items-center justify-center">
                <Ionicons name="notifications-outline" size={22} color="#081126" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  Push Notifications
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  Upcoming renewal alerts
                </Text>
              </View>
            </View>

            <RecurllyToggle
              active={notificationsEnabled}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          </View>

          <View className="border-b border-black/5 my-4" />

          {/* Reminder Timing Item */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-black/5 items-center justify-center">
                <Ionicons name="alarm-outline" size={22} color="#081126" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  Reminder Window
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  Advance notification timing
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCycleReminder}
              className="list-action"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-bold text-primary">
                {reminderDays}d before
              </Text>
            </TouchableOpacity>
          </View>

          <View className="border-b border-black/5 my-4" />

          {/* Security Item */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-black/5 items-center justify-center">
                <Ionicons name="finger-print-outline" size={22} color="#081126" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  Biometric Passcode
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  Require auth on app launch
                </Text>
              </View>
            </View>

            <RecurllyToggle
              active={securityEnabled}
              onPress={() => setSecurityEnabled(!securityEnabled)}
            />
          </View>
        </View>

        {/* Data & Backup Section */}
        <View className="list-head mb-3">
          <Text className="list-title">Data & Storage</Text>
        </View>

        <View className="border border-black/10 rounded-3xl p-5 mb-6 bg-transparent">
          {/* Export Item */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-black/5 items-center justify-center">
                <Ionicons name="share-outline" size={22} color="#081126" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  Export Data
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  Share JSON subscription backup
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleExportData}
              className="list-action"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-bold text-primary">Export</Text>
            </TouchableOpacity>
          </View>

          <View className="border-b border-black/5 my-4" />

          {/* Restore Demo Item */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-black/5 items-center justify-center">
                <Ionicons name="refresh-outline" size={22} color="#081126" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  Restore Demo Data
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  Re-add Adobe, GitHub, Canva
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleResetData}
              className="list-action"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-bold text-primary">Restore</Text>
            </TouchableOpacity>
          </View>

          <View className="border-b border-black/5 my-4" />

          {/* Clear Subscriptions Item */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-destructive/10 items-center justify-center">
                <Ionicons name="trash-outline" size={22} color="#dc2626" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-destructive">
                  Clear All Data
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  Delete all subscriptions
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClearData}
              className="px-4 py-1 rounded-full border border-destructive/30"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-sans-bold text-destructive">Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account & Session Section */}
        <View className="list-head mb-3">
          <Text className="list-title">Account</Text>
        </View>

        <View className="border border-black/10 rounded-3xl p-5 mb-8 bg-transparent">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 rounded-2xl bg-black/5 items-center justify-center">
                <Ionicons name="information-circle-outline" size={22} color="#081126" />
              </View>
              <View className="ml-3.5 flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  Recurlly Version
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  v1.0.0 (Build 42)
                </Text>
              </View>
            </View>
            <View className="px-3 py-1 rounded-full border border-black/10 bg-black/5">
              <Text className="text-xs font-sans-bold text-primary">Latest</Text>
            </View>
          </View>

          {/* Sign Out Button - Matching Recurlly cancel/action button style */}
          <TouchableOpacity
            className="w-full rounded-full bg-black/5 py-3.5 items-center justify-center border border-black/10 active:bg-black/10"
            onPress={handleSignOut}
            activeOpacity={0.75}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="log-out-outline" size={20} color="#081126" />
              <Text className="font-sans-bold text-primary text-base">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default Settings;