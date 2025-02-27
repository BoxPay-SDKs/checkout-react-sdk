import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import React from 'react';

interface HeaderProps {
  items: string,
  amount: string,
  onBackPress: () => void;  // Accepting the function as a prop
}

const Header: React.FC<HeaderProps> = ({ items, amount, onBackPress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Pressable onPress={() => {
          onBackPress(); // Trigger the passed function
        }}>
          <Image source={require("../../../assets/images/arrow-left.png")} style={styles.backArrow} />
        </Pressable>
        <View style={styles.headerColumn}>
          <Text style={styles.headerTitle}>Payment Details</Text>
          <Text style={styles.headerDesc}>
            {items} items . Total:
            <Text style={styles.amount}> {amount}</Text>
          </Text>

        </View>
        <View style={styles.headerSecure}>
          <Image source={require("../../../assets/images/Lock.png")} style={styles.lockIcon} />
          <Text style={styles.secureText}>100% Secure</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: { backgroundColor: "white", padding: 16, paddingTop: 30 },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerColumn: { flex: 1 },
  backArrow: { height: 24, width: 24, marginRight: 8 },
  headerTitle: { fontSize: 16, color: "#363840", fontWeight: "600", fontFamily: 'Poppins-SemiBold' },
  headerDesc: { fontSize: 12, color: "#4F4D55", fontWeight: "400", fontFamily: 'Poppins-Regular' },
  headerSecure: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: "#E8F6F1",
    borderRadius: 6,
  },
  lockIcon: { height: 12, width: 12, marginRight: 4 },
  secureText: { fontSize: 10, color: "#1CA672", fontWeight: "600", fontFamily: 'Poppins-SemiBold' },
  amount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    fontWeight: 600,
    color: '#4F4D55'
  }
});
