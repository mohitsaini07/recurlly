import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { HOME_USER } from '@/constants/data';
import images from '@/constants/images';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { formatCurrency } from '@/lib/utils';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Custom Premium Toggle Switch
const PremiumToggle = ({ active, onPress }: { active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    className={`w-12 h-7 rounded-full p-1 flex-row items-center ${active ? 'bg-accent justify-end' : 'bg-black/10 justify-start'}`}
  >
    <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
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
  const [accountModalVisible, setAccountModalVisible] = useState(false);

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

          {/* Premium Profile Stats Card */}
          <Animated.View 
            entering={FadeInDown.springify()} 
            className="bg-primary rounded-[28px] p-6 mb-6 shadow-xl"
          >
            <View className="flex-row items-center mb-5">
              <Image 
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                className="w-16 h-16 rounded-2xl border-2 border-white/20"
              />
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-sans-bold text-white">
                  {user?.fullName || HOME_USER.name}
                </Text>
                <Text className="text-sm font-sans-medium text-white/60 mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress || 'mohit@recurlly.com'}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-white/10 w-full mb-4" />

            {/* Quick Stats Grid */}
            <View className="flex-row justify-between items-center px-2">
              <View>
                <Text className="text-xs font-sans-semibold text-white/50 uppercase tracking-wider">Active Subs</Text>
                <Text className="text-xl font-sans-bold text-white mt-1">{activeSubsCount}</Text>
              </View>
              <View className="h-8 w-px bg-white/10" />
              <View className="items-end">
                <Text className="text-xs font-sans-semibold text-white/50 uppercase tracking-wider">Monthly Spend</Text>
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
          
          <View className="overflow-hidden mb-6">
            <SettingsItem 
              icon="person-outline" 
              title="Account" 
              value="Manage your profile metadata"
              onPress={() => setAccountModalVisible(true)} 
              index={1}
            />
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
          
          <View className="rounded-3xl border border-border bg-[#f8eed1]/30 p-4 mb-8">
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
                      backgroundColor: isSelected ? '#ff9a9e' : 'rgba(255,255,255,0.4)',
                      borderColor: isSelected ? '#ff9a9e' : '#00000033',
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
              className="flex-row items-center justify-center py-4 bg-destructive/10 rounded-2xl border border-destructive/20 active:bg-destructive/20"
              onPress={handleSignOut}
              activeOpacity={0.75}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text className="ml-2 text-base font-sans-bold text-destructive">
                Sign Out Account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {/* Account Info Modal */}
      <Modal 
        visible={accountModalVisible} 
        animationType="slide" 
        transparent 
        statusBarTranslucent
      >
        <View className="modal-overlay justify-end">
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={() => setAccountModalVisible(false)} 
          />
          <View 
            className="modal-container bg-[#fff9e3] p-6 rounded-t-[32px] border-t border-border"
            style={{ paddingBottom: 40 }}
          >
            <View className="flex-row items-center justify-between mb-6 pb-2 border-b border-black/5">
              <Text className="text-xl font-sans-bold text-primary">Account Details</Text>
              <TouchableOpacity 
                className="w-8 h-8 rounded-full bg-black/5 items-center justify-center"
                onPress={() => setAccountModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#081126" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
              <Image 
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                className="w-20 h-20 rounded-3xl mb-3 border-2 border-accent/20"
              />
              <Text className="text-xl font-sans-bold text-primary">{user?.fullName || HOME_USER.name}</Text>
              <Text className="text-sm font-sans-medium text-primary/60 mt-1">
                {user?.primaryEmailAddress?.emailAddress || 'mohit@recurlly.com'}
              </Text>
            </View>

            <View className="bg-white/40 border border-border rounded-2xl p-4 gap-4 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-sm font-sans-medium text-primary/60">User ID</Text>
                <Text className="text-sm font-sans-bold text-primary select-all" numberOfLines={1}>
                  {user?.id ? user.id.slice(0, 15) + '...' : 'usr_8v3x92mN'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm font-sans-medium text-primary/60">Status</Text>
                <Text className="text-sm font-sans-bold text-[#10b981] capitalize">Verified</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm font-sans-medium text-primary/60">Clerk Auth Session</Text>
                <Text className="text-sm font-sans-bold text-primary">Active</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm font-sans-medium text-primary/60">PostHog Analytics</Text>
                <Text className="text-sm font-sans-bold text-[#10b981]">Connected</Text>
              </View>
            </View>

            <TouchableOpacity 
              className="w-full bg-primary py-4 rounded-2xl items-center justify-center"
              onPress={() => setAccountModalVisible(false)}
            >
              <Text className="text-base font-sans-bold text-white">Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;