import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const SignUp = () => {
  return (
    <View>
        <Link href='/(auth)/sign-in'>   
            <Text>Sign In</Text>
        </Link>   
    </View>
  )
}

export default SignUp