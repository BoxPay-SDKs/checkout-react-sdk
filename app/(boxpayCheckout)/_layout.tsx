import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const BoxpayCheckoutLayout = () => {
  return (
    <Stack>
        <Stack.Screen name='index'/>
        <Stack.Screen name='mainScreen'/>
    </Stack>
  )
}

export default BoxpayCheckoutLayout