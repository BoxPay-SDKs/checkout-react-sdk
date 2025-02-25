import React from 'react'
import { Stack } from 'expo-router'
import { SharedContextProvider } from './(boxpayCheckout)/sharedContent/sharedContext'

const _layout = () => {
  return (
    <SharedContextProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='check' options={{ headerShown: false }} />
        <Stack.Screen name='enterTokenScreen' options={{ headerShown: false }} />
        <Stack.Screen name='(boxpayCheckout)' options={{ headerShown: false }} />
      </Stack>
    </SharedContextProvider>
  )
}

export default _layout
