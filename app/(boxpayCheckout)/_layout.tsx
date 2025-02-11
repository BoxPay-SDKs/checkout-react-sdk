import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const BoxpayCheckoutLayout = () => {
  return (
    <Stack>
        <Stack.Screen name='index' options={{headerShown:false}}/>
        <Stack.Screen name='paymentSuccess' options={{headerShown:false}}/>
        <Stack.Screen name='sessionExpire' options={{headerShown:false}}/>
        <Stack.Screen name='paymentFailed' options={{headerShown:false}}/>
    </Stack>
  )
}

export default BoxpayCheckoutLayout