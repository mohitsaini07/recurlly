import { Link } from 'expo-router'
import { Text } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  return (
    <SafeAreaView className='flex-1 items-center justify-center gap-5'>
        <Link href='/(auth)/sign-in'>   
            <Text className='text-primary text-2xl font-sans-bold'>Sign In</Text>
        </Link>   
    </SafeAreaView>
  )
}

export default SignUp