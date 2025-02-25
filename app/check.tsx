import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BoxpayCheckout from '../app/(boxpayCheckout)/index';  // Import the SDK component
import { useNavigation } from 'expo-router';
import { SharedContextProvider } from './(boxpayCheckout)/sharedContent/sharedContext';

const Check = () => {
  const navigation = useNavigation()
  const [token, setToken] = useState<string | null>(null); // Store the token
  const [error, setError] = useState<string | null>(null); // Store any error messages

  // Function to fetch the token
  const handleApiCall = async () => {
    try {
      const result = await fetchToken();  // Get the token
      setToken(result.token); // Set the token in state
      console.log((result.token))
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Set the error message in state if the API call fails
      } else {
        setError('An unknown error occurred'); // Handle case where err is not an instance of Error
      }
    }

  };

  useEffect(() => {
    handleApiCall();  // Call the function to fetch the token when the component mounts
  }, []);

  // Handle payment result from BoxpayCheckout
  const handlePaymentResult = (result: { status: String; transactionId: string }) => {
    alert(`Payment ${result.status} :  + ${result.transactionId}`);
    navigation.goBack()
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {token ? (
        // Render BoxpayCheckout when token is available
        // <SharedContextProvider>
        <BoxpayCheckout
          token={token}
          onPaymentResult={handlePaymentResult}
        />
        // </SharedContextProvider>
      ) : (
        <Text style={{ alignSelf: 'center', justifyContent: 'center', paddingTop: 100 }}>{error ? `Error: ${error}` : 'Loading token...'}</Text>
      )}
    </View>
  );
};

const API_URL = 'https://test-apis.boxpay.tech/v0/merchants/lGfqzNSKKA/sessions';

// Fetch the token from API
const fetchToken = async () => {
  try {
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        Authorization: 'Bearer 3z3G6PT8vDhxQCKRQzmRsujsO5xtsQAYLUR3zcKrPwVrphfAqfyS20bvvCg2X95APJsT5UeeS5YdD41aHbz6mg',
      },
    });
    return response.data;
  } catch (error) {
    console.error('fetch token error', error);
    throw error;
  }
};

const requestBody = {
  context: {
    countryCode: 'IN',
    legalEntity: {
      code: 'payu',
    },
    orderId: 'test12',
  },
  paymentType: 'S',
  money: {
    amount: '10000',
    currencyCode: 'INR',
  },
  descriptor: {
    line1: 'Some descriptor',
  },
  shopper: {
    firstName: 'Ishika',
    lastName: 'Bansal',
    phoneNumber: '+918520852085',
    email: 'ishika.bansal@boxpay.tech',
    uniqueReference: 'x123y',
    deliveryAddress: {
      address1: 'first line',
      address2: 'second line Chandigarh',
      city: 'Chandigarh',
      state: 'Chandigarh',
      countryCode: 'IN',
      postalCode: '160002',
    },
    panNumber: 'CTGPA0002G',
  },
  order: {
    items: [
      {
        id: 'test',
        itemName: 'La Fille Regular Solid Handheld Bag Blue',
        description: 'testProduct',
        quantity: 1,
        imageUrl:
          'https://assetscdn1.paytm.com/images/catalog/product/B/BA/BAGLAFILLE-BLUEINTO887307A255D05/1563381583133_0..jpg',
        amountWithoutTax: 50000,
      },
    ],
  },
  statusNotifyUrl: 'https://www.boxpay.tech',
  frontendBackUrl: 'https://www.boxp.tech',
  expiryDurationSec: 900,
};

export default Check;
