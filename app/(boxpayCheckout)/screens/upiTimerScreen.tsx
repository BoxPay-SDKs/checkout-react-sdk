import { View, Text, Image, BackHandler, StyleSheet } from 'react-native'; // Import Modal
import React, { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '../components/header';
import CircularProgress from 'react-native-circular-progress-indicator';
import fetchStatus from '../postRequest/fetchStatus';
import PaymentFailed from '../components/paymentFailed';
import PaymentSuccess from '../components/paymentSuccess';
import SessionExpire from '../components/sessionExpire';
import CancelPaymentModal from '../components/cancelPaymentModal';
import { paymentHandler, PaymentResult } from '../postRequest/paymentStatus';


const UpiTimeScreen = () => { // Remove the Props Interface
  const { amount, token, itemsLength, upiId, brandColor, env } = useLocalSearchParams();

  const amountStr = Array.isArray(amount) ? amount[0] : amount;
  const tokenStr = Array.isArray(token) ? token[0] : token;
  const itemsLengthStr = Array.isArray(itemsLength) ? itemsLength[0] : itemsLength;
  const upiIdStr = Array.isArray(upiId) ? upiId[0] : upiId;
  const brandColorStr = Array.isArray(brandColor) ? brandColor[0] : brandColor;
  const envStr = Array.isArray(env) ? env[0] : env;

  const [timerValue, setTimerValue] = useState(5 * 60);
  const [cancelClicked, setCancelClicked] = useState(false);
  const [failedModalOpen, setFailedModalState] = useState(false);
  const [successModalOpen, setSuccessModalState] = useState(false);
  const paymentFailedMessage = useRef<string>("You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods.");
  const [sessionExpireModalOpen, setSessionExppireModalState] = useState(false);
  const [successfulTimeStamp, setSuccessfulTimeStamp] = useState("");
  const [status, setStatus] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const backgroundApiInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerInterval.current = setInterval(() => {
        setTimerValue((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval.current!);
            stopBackgroundApiTask();
            setFailedModalState(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (failedModalOpen || successModalOpen || sessionExpireModalOpen) {
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
    }
  }, [failedModalOpen, successModalOpen, sessionExpireModalOpen]);

  const onExitCheckout = () => {
    const mockPaymentResult: PaymentResult = {
      status: status,
      transactionId: transactionId,
    };
    paymentHandler.onPaymentResult(mockPaymentResult);
    router.dismissAll()
  };

  const onProceedBack = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    stopBackgroundApiTask();
    router.back();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onProceedBack);
    return () => {
      backHandler.remove();
    };
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(timerValue / 60);
    const seconds = timerValue % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const startBackgroundApiTask = () => {
      backgroundApiInterval.current = setInterval(() => {
        callFetchStatusApi();
      }, 4000);
    };
    startBackgroundApiTask();
  }, []);

  const stopBackgroundApiTask = () => {
    if (backgroundApiInterval.current) {
      clearInterval(backgroundApiInterval.current);
    }
  };

  const callFetchStatusApi = async () => {
    const response = await fetchStatus(tokenStr, envStr);
    setStatus(response.status);
    setTransactionId(response.transactionId);
    const reasonCode = response.reasonCode;
    const status = response.status.toUpperCase();
    if (['FAILED', 'REJECTED'].includes(status)) {
      if (!reasonCode?.startsWith("uf", true)) {
        paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods.";
      }
      setFailedModalState(true);
      stopBackgroundApiTask();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(status)) {
      setSuccessfulTimeStamp(response.transactionTimestampLocale);
      setSuccessModalState(true);
      stopBackgroundApiTask();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    } else if (['EXPIRED'].includes(status)) {
      setSessionExppireModalState(true);
      stopBackgroundApiTask();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
      <Header onBackPress={onProceedBack} items={itemsLengthStr} amount={amountStr} />

      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 16, marginTop: 32 }}>
        <Text style={{ color: '#2D2B32', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
          Complete your payment
        </Text>
        <Text style={{ color: '#2D2B32', fontSize: 16, fontWeight: '500', paddingTop: 12, textAlign: 'center', lineHeight: 24 }}>
          Open your UPI application and confirm the payment before the time expires
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderColor: '#BABABA', borderWidth: 2, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, marginTop: 12 }}>
          <Image source={require("../../../assets/images/upi-timer-sheet-upi-icon.png")} style={{ height: 20, width: 20, marginRight: 4 }} />
          <Text style={{ color: '#1D1C20', fontSize: 14, fontWeight: '400' }}>UPI Id : {upiIdStr}</Text>
        </View>
        <Text style={{ color: '#1D1C20', fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 32 }}>
          Expires in
        </Text>
        <View style={{ marginTop: 14, alignItems: 'center' }}>
          <CircularProgress
            value={timerValue}
            radius={90}
            maxValue={5 * 60}
            initialValue={5 * 60}
            progressValueColor={'#F53535'}
            activeStrokeColor='#1CA672'
            activeStrokeWidth={10}
            inActiveStrokeWidth={10}
            inActiveStrokeColor='#E7E7E7'
            onAnimationComplete={() => { }}
            title={formatTime()}
            titleColor='#F53535'
            showProgressValue={false}
          />
        </View>
        <View style={{ flexDirection: 'row', borderColor: '#ECECED', borderWidth: 2, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 16, marginTop: 32 }}>
          <Image source={require("../../../assets/images/ic_info.png")} style={{ height: 26, width: 26 }} />
          <Text style={{ color: '#1D1C20', fontSize: 14, fontWeight: '400', paddingStart: 16, lineHeight: 18 }}>
            Kindly avoid using the back button until the transaction process is complete
          </Text>
        </View>
      </View>

      <View style={styles.cancelPaymentContainer}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: brandColorStr }} onPress={() => { setCancelClicked(true) }}>
          Cancel Payment
        </Text>
      </View>
      {failedModalOpen && (
        <PaymentFailed
          onClick={() => {
            setFailedModalState(false);
            onProceedBack();
          }}
          buttonColor={brandColorStr}
          errorMessage={paymentFailedMessage.current}
        />
      )}

      {successModalOpen && (
        <PaymentSuccess
          onClick={onExitCheckout}
          buttonColor={brandColorStr}
          amount={amountStr}
          transactionId={transactionId}
          method="UPI"
          localDateTime={successfulTimeStamp}
        />
      )}

      {sessionExpireModalOpen && (
        <SessionExpire
          onClick={onExitCheckout}
          buttonColor={brandColorStr}
        />
      )}

      {cancelClicked && (
        <CancelPaymentModal
          onNoClick={() => {
            setCancelClicked(false);
          }}
          onYesClick={() => {
            setCancelClicked(false);
            onProceedBack();
          }}
          brandcolor={brandColorStr}
        />
      )}
    </View>
  );
};

export default UpiTimeScreen;

const styles = StyleSheet.create({
  cancelPaymentContainer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});