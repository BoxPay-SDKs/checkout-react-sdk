import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { Modal } from 'react-native';
import { FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Button } from 'react-native';
import { useNavigation } from 'expo-router';
import BoxpayCheckout, { setTestEnv } from './(boxpayCheckout)';
import { setPaymentHandler } from './(boxpayCheckout)/postRequest/paymentStatus';

const EnterTokenScreen = () => {
  const [tokenTextInput, setTokenTextInput] = useState("");
  const [environment, setEnvironment] = useState("test");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation()

  const environments = [
    { label: "Test", value: "test" },
    { label: "Sandbox", value: "sandbox" },
    { label: "Production", value: "prod" },
  ];

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const selectEnvironment = (value: string) => {
    setEnvironment(value);
    setIsDropdownVisible(false);
  };

  const handleProceedPress = () => {
    setToken(tokenTextInput)
  };

  const handlePaymentResult = (result: { status: String; transactionId: string }) => {
    alert(`Payment ${result.status} :  + ${result.transactionId}`);
    navigation.goBack()
  };

  useEffect(() => {
    setPaymentHandler({
      onPaymentResult: handlePaymentResult,
    });
    setTestEnv({
      testEnv: environment == "test"
    })
  })

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {token ? (
        <BoxpayCheckout
          token={token}
          sandboxEnv={environment == "sandbox"}
        />
      ) : (
        <View style={styles.container}>
          <TextInput
            mode="outlined"
            label="Enter Token"
            value={tokenTextInput}
            onChangeText={(it) => {
              setTokenTextInput(it);
            }}
            style={styles.textInput}
          />

          <Text style={styles.label}>Select Environment:</Text>

          <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
            <Text>
              {environments.find((env) => env.value === environment)?.label || "Select Environment"}
            </Text>
          </TouchableOpacity>

          <Pressable style={styles.proceedButton} onPress={handleProceedPress}>
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </Pressable>

          <Modal visible={isDropdownVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={environments}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectEnvironment(item.value)}
                    >
                      <Text>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
                <Button title="Close" onPress={toggleDropdown} />
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );

};

export default EnterTokenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 14
  },
  textInput: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    alignSelf: 'flex-start',
    fontFamily: 'Poppins-Regular'
  },
  pressableText: {
    color: 'blue',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  dropdownButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    alignItems: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  proceedButton: {
    width: '100%',
    backgroundColor: '#007bff', // Example color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular'
  },

});