import {  Text } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  return (
    <SafeAreaView className='p-5'>
      <Text>settings</Text>
    </SafeAreaView>
  )
}

export default Settings