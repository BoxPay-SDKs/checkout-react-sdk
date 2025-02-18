import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, BackHandler, ToastAndroid, AppState } from 'react-native';
import Header from './components/header';
import axios from 'axios';
import upiPostRequest from './postRequest/upiPostRequest';
import { decode as atob } from 'base-64';
import { Linking } from 'react-native';
import LottieView from 'lottie-react-native';
import PaymentSuccess from './components/paymentSuccess';
import SessionExpire from './components/sessionExpire';
import PaymentFailed from './components/paymentFailed';
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import { IntentAction } from 'react-native-launcher-kit';
import fetchStatus from './postRequest/fetchStatus';
import UpiScreen from './screens/upiScreen';

// Define the PaymentResult type (you can adjust it as per your actual result structure)
type PaymentResult = {
    status: String;
    transactionId: string
};

// Define the props interface
interface BoxpayCheckoutProps {
    token: string;
    onPaymentResult: (result: PaymentResult) => void;
}

const BoxpayCheckout: React.FC<BoxpayCheckoutProps> = ({ token, onPaymentResult }) => {
    const [status, setStatus] = useState("NoAction")
    const [transactionId, setTransactionId] = useState("")
    const [isUpiIntentVisibile, setIsUpiIntentVisible] = useState(false)
    const [isUpiCollectVisible, setisUpiCollectVisible] = useState(false)
    const [appState, setAppState] = useState(AppState.currentState);
    const [isGpayInstalled, setIsGpayInstalled] = useState(false)
    const [isPhonePeInstalled, setIsPhonePeInstalled] = useState(false)
    const [isPaytmInstalled, setIsPaytmInstalled] = useState(false)
    const [loadingState, setLoadingState] = useState(false)
    const [isFirstLoading, setIsFirstLoading] = useState(true)
    const [amount, setAmount] = useState("")
    const [totalItems, setTotalItems] = useState("")
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
    const [primaryButtonColor, setPrimaryButtonColor] = useState("#1CA672")
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [uniqueRef, setUniqueRef] = useState("")
    const [dob, setDob] = useState("")
    const [pan, setpan] = useState("")
    const [failedModalOpen, setFailedModalState] = useState(false)
    const [successModalOpen, setSuccessModalState] = useState(false)
    const lastOpenendUrl = useRef<string>("")
    const paymentFailedMessage = useRef<string>("")
    const [sessionExpireModalOpen, setSessionExppireModalState] = useState(false)
    let timerInterval: NodeJS.Timeout
    let backgroundApiInterval: NodeJS.Timeout;


    const handlePayment = async () => {
        setLoadingState(true)
        const response = await upiPostRequest(
            selectedIntent ? selectedIntent : "",
            token,
            email,
            firstName,
            lastName,
            phone,
            uniqueRef,
            dob,
            pan
        )
        try {
            setStatus(response.status.status)
            setTransactionId(response.transactionId)
            const reason = response.status.statusReason
            const reasonCode = response.status.reasonCode
            if (response.status.status === 'RequiresAction' && response.actions?.length > 0) {
                urlToBase64(response.actions[0].url);
            } else if (['FAILED', 'REJECTED'].includes(response.status.status)) {
                paymentFailedMessage.current = reason.substringAfter(":")
                if (!reasonCode.startsWith("uf", true)) {
                    paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                }
                setFailedModalState(true)
                setLoadingState(false)
            } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(response.status.status)) {
                setSuccessModalState(true)
                setLoadingState(false)
            } else if (['EXPIRED'].includes(response.status.status)) {
                setSessionExppireModalState(true)
                setLoadingState(false)
            }
        } catch (error) {
            setFailedModalState(true)
            setLoadingState(false)
        }
    };


    const urlToBase64 = (base64String: string) => {
        try {
            const decodedString = atob(base64String);
            lastOpenendUrl.current = decodedString
            openUPIIntent(decodedString)
        } catch (error) {
            setFailedModalState(true)
            setLoadingState(false)
        }
    };

    const openUPIIntent = async (url: string) => {
        try {
            await Linking.openURL(url);  // Open the UPI app
            AppState.addEventListener('change', handleAppStateChange)
        } catch (error) {
            setFailedModalState(true)
            setLoadingState(false)
        }
    };

    const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'background') {
            startBackgroundApiTask();
        }
    };

    const startBackgroundApiTask = () => {
        backgroundApiInterval = setInterval(() => {
            callFetchStatusApi()
        }, 4000);
    };

    const stopBackgroundApiTask = () => {
        if (backgroundApiInterval) {
            clearInterval(backgroundApiInterval)
        }
    };

    const callFetchStatusApi = async () => {
        const response = await fetchStatus(token)
        if (appState == 'active') {
            setStatus(response.status)
            setTransactionId(response.transactionId)
            const reason = response.statusReason
            const reasonCode = response.reasonCode
            if (['PENDING'].includes(response.status) && lastOpenendUrl.current.startsWith("tez:")) {
                paymentFailedMessage.current = "Payment failed with GPay. Please retry payment with a different UPI app"
                setFailedModalState(true)
            } else if (['PENDING'].includes(response.status) && lastOpenendUrl.current.startsWith("phonepe:")) {
                paymentFailedMessage.current = "Payment failed with PhonePe. Please retry payment with a different UPI app"
                setFailedModalState(true)
            } else if (['PENDING'].includes(response.status) && lastOpenendUrl.current.startsWith("paytmmp:")) {
                paymentFailedMessage.current = "Payment failed with PayTm. Please retry payment with a different UPI app"
                setFailedModalState(true)
            } else if (['PENDING'].includes(response.status) && lastOpenendUrl.current.startsWith("upi:")) {
                paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                setFailedModalState(true)
            } else if (['PENDING'].includes(response.status)) {
                paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                setFailedModalState(true)
            } else if (['FAILED', 'REJECTED'].includes(response.status)) {
                paymentFailedMessage.current = reason.substringAfter(":")
                if (!reasonCode.startsWith("uf", true)) {
                    paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                }
                setFailedModalState(true)
            } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(response.status)) {
                setSuccessModalState(true)
            } else if (['EXPIRED'].includes(response.status)) {
                setSessionExppireModalState(true)
            }
            setLoadingState(false)
            stopBackgroundApiTask()
        }
    }

    const onExitCheckout = () => {
        clearInterval(timerInterval)
        const mockPaymentResult: PaymentResult = {
            status: status,
            transactionId: transactionId,
        };
        onPaymentResult(mockPaymentResult);
        return true
    }


    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onExitCheckout);
        return () => {
            backHandler.remove();
        };
    }, []);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                setIsFirstLoading(true); 
                const response = await axios.get(`https://test-apis.boxpay.tech/v0/checkout/sessions/${token}`);
                const paymentMethods = response.data.configs.paymentMethods;
                const paymentDetails = response.data.paymentDetails
                setIsUpiIntentVisible(paymentMethods.find((method: any) => method.type === 'Upi' && method.brand === 'UpiIntent'))
                setisUpiCollectVisible(paymentMethods.find((method: any) => method.type === 'Upi' && method.brand === 'UpiCollect'))
                setAmount(`${paymentDetails.money.currencySymbol}${paymentDetails.money.amountLocaleFull}`)
                setTotalItems(paymentDetails.order.items.length)
                setPrimaryButtonColor(response.data.merchantDetails.checkoutTheme.primaryButtonColor)
                setEmail(paymentDetails.shopper.email)
                setFirstName(paymentDetails.shopper.firstName)
                setLastName(paymentDetails.shopper.lastName)
                setPhone(paymentDetails.shopper.phoneNumber)
                setUniqueRef(paymentDetails.shopper.uniqueReference)
                setDob(paymentDetails.shopper.dateOfBirth)
                setpan(paymentDetails.shopper.panNumber)
                startCountdown(response.data.sessionExpiryTimestamp)
                const isInstalled = await Linking.canOpenURL("phonepe://")
                const gpay = await Linking.canOpenURL("tez://upi/")
                setIsGpayInstalled(gpay)
                const paytm = await Linking.canOpenURL("paytmmp://")
                setIsPaytmInstalled(paytm)
                setIsPhonePeInstalled(isInstalled)
            } catch (error) {
                ToastAndroid.show('Internal server occured', ToastAndroid.SHORT);
            } finally {
                setIsFirstLoading(false); // Set loading to false when API request is finished
            }
        };

        fetchPaymentMethods();
    }, [token]);

    useEffect(() => {
        if (selectedIntent === "") {
            handlePayment();
        }
    }, [selectedIntent]);

    function startCountdown(sessionExpiryTimestamp: string) {
        if (sessionExpiryTimestamp === "") {
            return;
        }
        const expiryTime = new Date(sessionExpiryTimestamp)
        const expiryTimeIST = new Date(expiryTime.getTime() + 5.5 * 60 * 60 * 1000);

        timerInterval = setInterval(() => {
            const currentTimeIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
            const timeDiff = expiryTimeIST.getTime() - currentTimeIST.getTime();
            if (timeDiff <= 0) {
                clearInterval(timerInterval);
                setStatus('EXPIRED')
                setSessionExppireModalState(true)
            }
            // const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
            // const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            // const seconds = Math.floor((timeDiff / 1000) % 60);

            // console.log(`${hours}hr ${minutes}min ${seconds}sec`)
        }, 1000);
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
            {isFirstLoading ? (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <ShimmerPlaceHolder visible={false} style={{ width: '100%', height: 90, marginTop: 10 }} />
                    <ShimmerPlaceHolder visible={false} style={{ width: '100%', height: 50, borderRadius: 10, marginTop: 30 }} />
                    <ShimmerPlaceHolder visible={false} style={{ width: '100%', height: 50, borderRadius: 10, marginTop: 25 }} />
                    <ShimmerPlaceHolder visible={false} style={{ width: '100%', height: 50, borderRadius: 10, marginTop: 25 }} />
                    <ShimmerPlaceHolder visible={false} style={{ width: '100%', height: 50, borderRadius: 10, marginTop: 25 }} />
                </View>
            ) : loadingState ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <LottieView source={require('../../assets/animations/boxpayLogo.json')} autoPlay loop style={{ width: 80, height: 80 }} />
                    <Text>Loading...</Text>
                </View>
            ) : (
                <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
                    {/* Main UI Content */}
                    <Header onBackPress={onExitCheckout} items={totalItems} amount={amount} />

                    <UpiScreen
                        selectedColor={primaryButtonColor}
                        isUpiIntentVisible={isUpiIntentVisibile}
                        isGpayVisible={isGpayInstalled}
                        isPaytmVisible={isPaytmInstalled}
                        isPhonePeVisible={isPhonePeInstalled}
                        isUpiCollectVisible={isUpiCollectVisible}
                        selectedIntent={selectedIntent}
                        setSelectedIntent={(it) => setSelectedIntent(it)}
                        amount={amount}
                        handleUpiPayment={handlePayment}
                        handleCollectPayment={(it)=> {console.log(it)}}
                    />
                </View>
            )}

            {/* Modals for Different Payment Statuses */}
            {failedModalOpen && (
                <PaymentFailed
                    onClick={() => setFailedModalState(false)}
                    buttonColor={primaryButtonColor}
                    errorMessage={paymentFailedMessage.current}
                />
            )}

            {successModalOpen && (
                <PaymentSuccess
                    onClick={onExitCheckout}
                    buttonColor={primaryButtonColor}
                />
            )}

            {sessionExpireModalOpen && (
                <SessionExpire
                    onClick={onExitCheckout}
                    buttonColor={primaryButtonColor}
                />
            )}
        </View>
    );
};

export default BoxpayCheckout;

const styles = StyleSheet.create({

});
