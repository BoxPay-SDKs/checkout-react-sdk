import React from 'react'
import axios from 'axios';

const fetchStatus = async (
    token: string,
) => {

  const API_URL = `https://test-apis.boxpay.tech/v0/checkout/sessions/${token}/status`;
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'X-Trace-Id':generateRandomAlphanumericString(10),
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

export default fetchStatus