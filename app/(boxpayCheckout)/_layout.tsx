import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { SharedContextProvider } from './sharedContent/sharedContext'

const BoxpayCheckoutLayout = () => {
  return (
    <Stack>
      {/* <SharedContextProvider> */}
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='screens/upiTimerScreen' options={{ headerShown: false }} />
      {/* </SharedContextProvider> */}
    </Stack>
  )
}

export default BoxpayCheckoutLayout