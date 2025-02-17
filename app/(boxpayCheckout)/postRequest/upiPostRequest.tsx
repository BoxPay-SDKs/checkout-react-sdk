import { Dimensions, Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from 'axios';

const upiPostRequest = async (
    upiIntent: string, 
    token: string,
    email:string,
    firstName:string,
    lastName:string,
    phone:string,
    uniqueRef:string,
    dob:string,
    pan:string
) => {
  const requestBody = {
    browserData: {
      screenHeight: Constants.platform?.ios?.screenHeight || Constants.platform?.android?.screenHeight || 0,
      screenWidth: Constants.platform?.ios?.screenWidth || Constants.platform?.android?.screenWidth || 0,
      acceptHeader: "application/json",
      userAgentHeader: "Expo App",
      browserLanguage: "en_US",
      ipAddress: "null",
      colorDepth: 24,
      javaEnabled: true,
      timeZoneOffSet: new Date().getTimezoneOffset(),
      packageId: Constants.manifest?.id || "com.boxpay.checkout.demoapp",
    },
    instrumentDetails: {
      type: "upi/intent",
      ...(upiIntent && { upiAppDetails: { upiApp: upiIntent } }) // Conditionally add upiAppDetails only if upiIntent is present
    },
    shopper: {
      email,
      firstName,
      gender: null,
      lastName,
      phoneNumber: phone,
      uniqueReference: uniqueRef,
      dateOfBirth: dob,
      panNumber: pan,
    },
    deviceDetails: {
      browser: Platform.OS,
      platformVersion: Device.osVersion || "Unknown",
      deviceType: Device.deviceType || "Unknown",
      deviceName: Device.modelName || "Unknown",
      deviceBrandName: Device.brand || "Unknown",
    },
  };
  

  const API_URL = `https://test-apis.boxpay.tech/v0/checkout/sessions/${token}`;
  try {
    console.log(requestBody)
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        'X-Request-Id':generateRandomAlphanumericString(10),
      },
    });

    const data = await response.data;
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { error: "API request failed" };
  }

  function generateRandomAlphanumericString(length: number): string {
    const charPool: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      result += charPool[randomIndex];
    }
  
    return result;
  }
  
};

export default upiPostRequest;
