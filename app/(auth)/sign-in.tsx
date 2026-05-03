import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const SignIn = () => {
  return (
    <View className='flex-1 items-center justify-center gap-5'>
        <Link href='/(auth)/sign-up'>   
            <Text className='text-primary text-2xl'>Sign Up</Text>
        </Link>   
        <Link href='/(tabs)'>
            <Text className='text-primary text-2xl'>Home</Text>
        </Link>
    </View>
  )
}

export default SignIn