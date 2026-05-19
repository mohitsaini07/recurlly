import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { HOME_USER } from '@/constants/data'
import images from '@/constants/images'

const SettingsItem = ({ icon, title, isDestructive = false, onPress }: { icon: any, title: string, isDestructive?: boolean, onPress: () => void }) => (
  <TouchableOpacity 
    className="flex-row items-center justify-between py-4 px-4 border-b border-black/5 last:border-b-0"
    onPress={onPress}
  >
    <View className="flex-row items-center gap-3">
      <View className={`w-10 h-10 rounded-full items-center justify-center ${isDestructive ? 'bg-destructive/10' : 'bg-black/5'}`}>
        <Ionicons name={icon} size={20} color={isDestructive ? '#dc2626' : '#081126'} />
      </View>
      <Text className={`text-base font-sans-medium ${isDestructive ? 'text-destructive' : 'text-primary'}`}>
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={isDestructive ? '#dc2626' : 'rgba(0,0,0,0.3)'} />
  </TouchableOpacity>
)

const Settings = () => {
  const { signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff9e3' }}>
      <View className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View className="home-header mb-8">
            <View className="home-user">
              <Image 
                source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} 
                className="home-avatar"
              />
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-sans-bold text-primary">
                  {user?.fullName || HOME_USER.name}
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                  {user?.primaryEmailAddress?.emailAddress || 'mohit@recurlly.com'}
                </Text>
              </View>
            </View>
          </View>

          {/* General Settings */}
          <View className="list-head mt-2 mb-4">
            <Text className="list-title">General</Text>
          </View>
          <View className="rounded-3xl border border-border overflow-hidden mb-10">
            <SettingsItem icon="person-outline" title="Account" onPress={() => {}} />
            <SettingsItem icon="notifications-outline" title="Notifications" onPress={() => {}} />
            <SettingsItem icon="lock-closed-outline" title="Security & Privacy" onPress={() => {}} />
            <SettingsItem icon="wallet-outline" title="Payment Methods" onPress={() => {}} />
          </View>

          {/* Sign Out */}
          <TouchableOpacity 
            className="flex-row items-center justify-center py-4 bg-destructive/10 rounded-2xl border border-destructive/20"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="ml-2 text-base font-sans-bold text-destructive">
              Sign Out
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Settings