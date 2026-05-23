import { HOME_USER } from '@/constants/data';
import images from '@/constants/images';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { formatCurrency } from '@/lib/utils';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";

// Custom Toggle Switch
const PremiumToggle = ({ active, onPress }: { active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    className={`w-12 h-7 rounded-full p-1 flex-row items-center ${active ? 'bg-accent justify-end' : 'bg-white justify-start'}`}
  >
    <View className={`w-5 h-5 rounded-full ${active ? 'bg-white shadow-sm' : 'bg-black shadow-sm'}`} />
  </TouchableOpacity>
);

// Unified Settings Line Item
const SettingsItem = ({
  icon,
  title,
  value,
  isDestructive = false,
  onPress,
  rightComponent,
  index = 0
}: {
  icon: string;
  title: string;
  value?: string;
  isDestructive?: boolean;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  index?: number;
}) => (
  <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(15)}>
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center justify-between py-4 px-4"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3.5">
        <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isDestructive ? 'bg-destructive/10' : 'bg-black/5'}`}>
          <Ionicons name={icon as any} size={20} color={isDestructive ? '#dc2626' : '#081126'} />
        </View>
        <View>
          <Text className={`text-base font-sans-semibold ${isDestructive ? 'text-destructive' : 'text-primary'}`}>
            {title}
          </Text>
          {value && (
            <Text className="text-xs font-sans-medium text-primary/50 mt-0.5">
              {value}
            </Text>
          )}
        </View>
      </View>

      {rightComponent ? rightComponent : (
        onPress && <Ionicons name="chevron-forward" size={18} color={isDestructive ? '#dc2626' : 'rgba(0,0,0,0.3)'} />
      )}
    </TouchableOpacity>
  </Animated.View>
);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const { subscriptions, currency, setCurrency } = useSubscriptions();

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [securityEnabled, setSecurityEnabled] = useState(false);

  // Dynamic values
  const activeSubsCount = subscriptions.filter(s => s.status === 'active').length;
  const totalMonthlySpend = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.frequency === 'Yearly' || s.billing === 'Yearly') {
        return sum + (s.price / 12);
      }
      return sum + s.price;
    }, 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'INR', symbol: '₹' },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <Animated.View entering={FadeIn.duration(400)} className="flex-1 bg-background">
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Area */}
          <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>

          {/* Profile Card */}
          <Animated.View
            entering={FadeInDown.springify()}
            className="rounded-[28px] p-6 mb-6 shadow-xl"
          >
            <View className="flex-row items-center mb-5">
              <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                className="w-16 h-16 rounded-2xl border-2 border-white/20"
              />
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-sans-bold text-primary">
                  {user?.fullName || HOME_USER.name}
                </Text>
                <Text className="text-sm font-sans-medium text-primary/60 mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress || 'mohit@recurlly.com'}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-pxw-full mb-4" />

            {/* Quick Stats Grid */}
            <View className="flex-row justify-between items-center px-2">
              <View>
                <Text className="text-xs font-sans-semibold text-primary/60 uppercase tracking-wider">Active Subs</Text>
                <Text className="text-xl font-sans-bold text-primary mt-1">{activeSubsCount}</Text>
              </View>
              <View className="h-8 w-px bg-white/10" />
              <View className="items-end">
                <Text className="text-xs font-sans-semibold text-primary/60 uppercase tracking-wider">Monthly Spend</Text>
                <Text className="text-xl font-sans-bold text-accent mt-1">
                  {formatCurrency(totalMonthlySpend, currency)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* General settings group */}
          <View className="list-head mt-2 mb-4">
            <Text className="list-title">General Preferences</Text>
          </View>

          <View className="border border-primary rounded-2xl overflow-hidden mb-6">
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              value="Alerts for upcoming renewals"
              rightComponent={
                <PremiumToggle
                  active={notificationsEnabled}
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                />
              }
              index={2}
            />
            <SettingsItem
              icon="lock-closed-outline"
              title="Passcode Security"
              value="Secure access on app launch"
              rightComponent={
                <PremiumToggle
                  active={securityEnabled}
                  onPress={() => setSecurityEnabled(!securityEnabled)}
                />
              }
              index={3}
            />
          </View>

          {/* Currency preferences group */}
          <View className="list-head mt-4 mb-4">
            <Text className="list-title">Currency Settings</Text>
          </View>

          <View className="p-4 mb-4 border border-primary rounded-2xl">
            <Text className="text-sm font-sans-medium text-primary/60 mb-3 px-1">
              Select your global display currency:
            </Text>
            <View className="flex-row gap-2">
              {currencies.map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <TouchableOpacity
                    key={curr.code}
                    activeOpacity={0.7}
                    onPress={() => setCurrency(curr.code)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      backgroundColor: isSelected ? '#081126' : '#00000033',
                      borderColor: isSelected ? '#081126' : '#00000033',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: isSelected ? '#ffffff' : '#081126',
                      }}
                    >
                      {curr.symbol} {curr.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sign Out Button */}
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 mb-2 bg-primary/70 rounded-full active:bg-accent/50"
              onPress={handleSignOut}
              activeOpacity={0.75}
            >
              <Ionicons name="log-out-outline" size={20} color="#ffffff" />
              <Text className="ml-2 text-base font-sans-bold text-white">
                Sign Out
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Settings;