import { View, Text , StyleSheet} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const EnterTokenScreen = () => {
  return (
    <View style={styles.container}>
      <Text>enterTokenScreen</Text>
      <Link href={"/(boxpayCheckout)"} style = {{fontSize:40}}>BoxpayCheckout</Link>
    </View>
  )
}

export default EnterTokenScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems:'center',
      justifyContent:'center'
    },
    buttonText:{
      fontSize:20,
      fontWeight:600,
      marginBottom:14
    }
  });