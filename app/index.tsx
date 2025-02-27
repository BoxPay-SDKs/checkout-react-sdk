import { Link } from "expo-router";
import { Text, View, StyleSheet, Image } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href={"/check"} style={styles.buttonText}>Open Checkout By Default</Link>
      <Link href={"/enterTokenScreen"} style={styles.buttonText}>Open Checkout By Enter Token</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 30
  }
});


