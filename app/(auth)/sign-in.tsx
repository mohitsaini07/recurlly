import { Link } from 'expo-router'
import { Text } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  return (
    <SafeAreaView className='flex-1 items-center justify-center gap-5'>
        <Link href='/(auth)/sign-up'>   
            <Text className='text-primary text-2xl'>Sign Up</Text>
        </Link>   
        <Link href='/(tabs)'>
            <Text className='text-primary text-2xl'>Home</Text>
        </Link>
    </SafeAreaView>
  )
}

export default SignIn