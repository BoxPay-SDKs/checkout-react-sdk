import React, { useEffect, useRef, useState } from 'react';
import { View, Text, BackHandler, ToastAndroid, AppState, Image, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'; // Added ScrollView
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
import fetchStatus from './postRequest/fetchStatus';
import UpiScreen from './screens/upiScreen';
import { router } from 'expo-router';
import { PaymentResult } from './postRequest/paymentStatus';
import { paymentHandler } from "../(boxpayCheckout)/postRequest/paymentStatus";

// Define the props interface
interface BoxpayCheckoutProps {
    token: string;
    sandboxEnv: boolean
}

const BoxpayCheckout: React.FC<BoxpayCheckoutProps> = ({ token, sandboxEnv }) => {
    const [status, setStatus] = useState("NOACTION")
    const [transactionId, setTransactionId] = useState("")
    const tokenState = useRef(token)
    const sandboxEnvState = useRef(sandboxEnv)
    const testEnv = testHandler.testEnv
    const env = sandboxEnvState.current ? 'sandbox' : 'prod'
    const [isUpiIntentVisibile, setIsUpiIntentVisible] = useState(false)
    const [isUpiCollectVisible, setisUpiCollectVisible] = useState(false)
    const [appState] = useState(AppState.currentState);
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
    const [address, setAddress] = useState("")
    const [labelType, setLabelType] = useState("")
    const [phone, setPhone] = useState("")
    const [uniqueRef, setUniqueRef] = useState("")
    const [dob, setDob] = useState("")
    const [pan, setpan] = useState("")
    const [failedModalOpen, setFailedModalState] = useState(false)
    const [successModalOpen, setSuccessModalState] = useState(false)
    const lastOpenendUrl = useRef<string>("")
    const paymentFailedMessage = useRef<string>("You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods.")
    const [sessionExpireModalOpen, setSessionExppireModalState] = useState(false)
    const [successfulTimeStamp, setSuccessfulTimeStamp] = useState("")
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    let backgroundApiInterval: NodeJS.Timeout;


    const handlePaymentIntent = async () => {
        setLoadingState(true)
        const response = await upiPostRequest(
            tokenState.current,
            email,
            firstName,
            lastName,
            phone,
            uniqueRef,
            dob,
            pan,
            {
                type: "upi/intent",
                ...(selectedIntent && { upiAppDetails: { upiApp: selectedIntent } }) // Conditionally add upiAppDetails only if upiIntent is present
            },
            testEnv ? 'test' : env
        )
        try {
            setStatus(response.status.status)
            setTransactionId(response.transactionId)
            const reason = response.status.statusReason
            const reasonCode = response.status.reasonCode
            const status = response.status.status.toUpperCase()
            if (status === 'REQUIRESACTION' && response.actions?.length > 0) {
                urlToBase64(response.actions[0].url);
            } else if (['FAILED', 'REJECTED'].includes(status)) {
                paymentFailedMessage.current = reason.substringAfter(":")
                if (!reasonCode.startsWith("uf", true)) {
                    paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                }
                setFailedModalState(true)
                setLoadingState(false)
            } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(status)) {
                setSuccessfulTimeStamp(response.transactionTimestampLocale)
                setSuccessModalState(true)
                setLoadingState(false)
            } else if (['EXPIRED'].includes(status)) {
                setSessionExppireModalState(true)
                setLoadingState(false)
            }
        } catch (error) {
            setFailedModalState(true)
            setLoadingState(false)
        }
    };

    const handleUpiCollectPayment = async (upiId: string) => {
        setLoadingState(true)
        const response = await upiPostRequest(
            tokenState.current,
            email,
            firstName,
            lastName,
            phone,
            uniqueRef,
            dob,
            pan,
            {
                type: "upi/collect",
                upi: {
                    shopperVpa: upiId
                }
            },
            testEnv ? 'test' : env
        )
        try {
            setStatus(response.status.status)
            setTransactionId(response.transactionId)
            const reason = response.status.statusReason
            const reasonCode = response.status.reasonCode
            const status = response.status.status.toUpperCase()
            if (status === 'REQUIRESACTION') {
                navigateToUpiTimerModal(upiId)
            } else if (['FAILED', 'REJECTED'].includes(status)) {
                paymentFailedMessage.current = reason.substringAfter(":")
                if (!reasonCode.startsWith("uf", true)) {
                    paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                }
                setFailedModalState(true)
                setLoadingState(false)
            } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(status)) {
                setSuccessfulTimeStamp(response.transactionTimestampLocale)
                setSuccessModalState(true)
                setLoadingState(false)
            } else if (['EXPIRED'].includes(status)) {
                setSessionExppireModalState(true)
                setLoadingState(false)
            }
        } catch (error) {
            setFailedModalState(true)
            setLoadingState(false)
        }
    };

    const navigateToUpiTimerModal = (upiId: string) => {
        console.log(`onpaymentresult ${paymentHandler.onPaymentResult}`)
        setLoadingState(false)
        router.push({
            pathname: "/screens/upiTimerScreen",
            params: {
                amount: amount,
                token: tokenState.current,
                itemsLength: totalItems,
                upiId: upiId,
                brandColor: primaryButtonColor,
                env: testEnv ? 'test' : env
            }
        })
    }


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

    const stopExpireTimerCountDown = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    const callFetchStatusApi = async () => {
        const response = await fetchStatus(tokenState.current, testEnv ? 'test' : env)
        if (appState == 'active') {
            setStatus(response.status)
            setTransactionId(response.transactionId)
            const reason = response.statusReason
            const reasonCode = response.reasonCode
            const status = response.status.toUpperCase()
            if (['PENDING'].includes(status) && lastOpenendUrl.current.startsWith("tez:")) {
                paymentFailedMessage.current = "Payment failed with GPay. Please retry payment with a different UPI app"
                setFailedModalState(true)
                stopBackgroundApiTask()
            } else if (['PENDING'].includes(status) && lastOpenendUrl.current.startsWith("phonepe:")) {
                paymentFailedMessage.current = "Payment failed with PhonePe. Please retry payment with a different UPI app"
                setFailedModalState(true)
                stopBackgroundApiTask()
            } else if (['PENDING'].includes(status) && lastOpenendUrl.current.startsWith("paytmmp:")) {
                paymentFailedMessage.current = "Payment failed with PayTm. Please retry payment with a different UPI app"
                setFailedModalState(true)
                stopBackgroundApiTask()
            } else if (['PENDING'].includes(status) && lastOpenendUrl.current.startsWith("upi:")) {
                paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                setFailedModalState(true)
                stopBackgroundApiTask()
            } else if (['PENDING'].includes(status) && lastOpenendUrl.current != "") {
                paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                setFailedModalState(true)
                stopBackgroundApiTask()
            } else if (['FAILED', 'REJECTED'].includes(status)) {
                paymentFailedMessage.current = reason.substringAfter(":")
                if (!reasonCode.startsWith("uf", true)) {
                    paymentFailedMessage.current = "You may have cancelled the payment or there was a delay in response from the Bank's page. Please retry payment or try using other methods."
                }
                setFailedModalState(true)
                stopBackgroundApiTask()
            } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(status)) {
                setSuccessfulTimeStamp(response.transactionTimestampLocale)
                setSuccessModalState(true)
                stopBackgroundApiTask()
            } else if (['EXPIRED'].includes(status)) {
                setSessionExppireModalState(true)
                stopBackgroundApiTask()
            }
            setLoadingState(false)
        }
    }

    const onExitCheckout = () => {
        stopExpireTimerCountDown()
        const mockPaymentResult: PaymentResult = {
            status: status,
            transactionId: transactionId,
        };
        paymentHandler.onPaymentResult(mockPaymentResult);
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
            const endpoint: string = testEnv
                ? 'test-apis.boxpay.tech'
                : env == 'sandbox'
                    ? 'sandbox-apis.boxpay.tech'
                    : 'apis.boxpay.in';
            try {
                setIsFirstLoading(true);
                const response = await axios.get(`https://${endpoint}/v0/checkout/sessions/${tokenState.current}`);
                const paymentMethods = response.data.configs.paymentMethods;
                const paymentDetails = response.data.paymentDetails
                setIsUpiIntentVisible(paymentMethods.find((method: any) => method.type === 'Upi' && method.brand === 'UpiIntent'))
                setisUpiCollectVisible(paymentMethods.find((method: any) => method.type === 'Upi' && method.brand === 'UpiCollect'))
                setAmount(`${paymentDetails.money.currencySymbol}${paymentDetails.money.amountLocaleFull}`)
                if (paymentDetails.order != null && paymentDetails.order.items != null) {
                    setTotalItems(paymentDetails.order.items.length)
                }
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
                if (paymentDetails.shopper.deliveryAddress != null) {
                    const deliveryObject = paymentDetails.shopper.deliveryAddress
                    setLabelType(deliveryObject.labelType)
                    const address1 = deliveryObject.address1
                    const address2 = deliveryObject.address2
                    const city = deliveryObject.city
                    const state = deliveryObject.state
                    const postalCode = deliveryObject.postalCode

                    if (address2 == null || address2 == "") {
                        setAddress(`${address1}, ${city}, ${state}, ${postalCode}`)
                    } else {
                        setAddress(`${address1}, ${address2}, ${city}, ${state}, ${postalCode}`)
                    }

                    if (['FAILED', 'REJECTED'].includes(response.data.status)) {
                        setTransactionId(response.data.lastTransactionId)
                        setStatus(response.data.status)
                        setFailedModalState(true)
                        stopBackgroundApiTask()
                    } else if (['APPROVED', 'SUCCESS', 'PAID'].includes(response.data.status)) {
                        setSuccessfulTimeStamp(response.data.lastPaidAtTimestampLocale)
                        setTransactionId(response.data.lastTransactionId)
                        setStatus(response.data.status)
                        setSuccessModalState(true)
                        stopBackgroundApiTask()
                    } else if (['EXPIRED'].includes(response.data.status)) {
                        setSessionExppireModalState(true)
                        stopBackgroundApiTask()
                    }
                }
            } catch (error) {
                console.log(error)
                ToastAndroid.show("Please check the token and the envirounment selected", ToastAndroid.SHORT);
            } finally {
                setIsFirstLoading(false); // Set loading to false when API request is finished
            }
        };

        fetchPaymentMethods();
    }, [tokenState.current]);

    useEffect(() => {
        if (selectedIntent === "") {
            handlePaymentIntent();
        }
    }, [selectedIntent]);

    function startCountdown(sessionExpiryTimestamp: string) {
        if (sessionExpiryTimestamp === "") {
            return;
        }
        const expiryTime = new Date(sessionExpiryTimestamp)
        const expiryTimeIST = new Date(expiryTime.getTime() + 5.5 * 60 * 60 * 1000);

        timerRef.current = setInterval(() => {
            const currentTimeIST = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
            const timeDiff = expiryTimeIST.getTime() - currentTimeIST.getTime();
            if (timeDiff <= 0) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
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
                    {/* Keyboard Avoiding View */}
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0} // Adjust this value as needed.
                    >
                        <TouchableWithoutFeedback>
                            <ScrollView  // Wrap the content with ScrollView
                                contentContainerStyle={{ flexGrow: 1 }} // Ensure content can grow to take up space
                            >
                                <View style={{ flex: 1 }}>
                                    {/* Main UI Content */}
                                    <Header onBackPress={onExitCheckout} items={totalItems} amount={amount} />
                                    {address != "" && (
                                        <View>
                                            <Text style={{
                                                marginStart: 16,
                                                marginTop: 12,
                                                fontWeight: '800',
                                                fontSize: 16,
                                                color: '#020815B5'
                                            }}>Address</Text>
                                            <View style={{
                                                borderColor: '#F1F1F1',
                                                borderWidth: 1,
                                                marginHorizontal: 16,
                                                marginVertical: 8,
                                                paddingBottom: 16,
                                                backgroundColor: "white",
                                                flexDirection: 'row',
                                                borderRadius: 12,
                                            }}>
                                                <Image source={require("../../assets/images/ic_location.png")} style={{ height: 25, width: 25, marginStart: 12, marginTop: 16 }} />
                                                <View style={{ flexDirection: 'column', marginStart: 8, marginTop: 12, marginEnd: 16, flex: 1 }}>
                                                    <Text style={{
                                                        fontWeight: '400',
                                                        fontSize: 16,
                                                        color: '#4F4D55'
                                                    }}>Deliver at {labelType}</Text>
                                                    <Text style={{
                                                        marginTop: 2,
                                                        fontWeight: '600',
                                                        fontSize: 14,
                                                        color: '#4F4D55',
                                                        flexShrink: 1
                                                    }} numberOfLines={1} ellipsizeMode="tail">
                                                        {address}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}

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
                                        handleUpiPayment={handlePaymentIntent}
                                        handleCollectPayment={(it) => handleUpiCollectPayment(it)}
                                    />
                                    <View>
                                        <Text style={{
                                            marginStart: 16,
                                            marginTop: 12,
                                            fontWeight: '800',
                                            fontSize: 16,
                                            color: '#020815B5'
                                        }}>Order Summary</Text>
                                        <View style={{
                                            borderColor: '#F1F1F1',
                                            borderWidth: 1,
                                            marginHorizontal: 16,
                                            marginVertical: 8,
                                            paddingVertical: 16,
                                            paddingHorizontal: 12,
                                            backgroundColor: "white",
                                            flexDirection: 'row',
                                            borderRadius: 12,
                                            justifyContent: 'space-between'
                                        }}>
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: "#363840" }}>Price Details</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '600', color: "#363840" }}>{amount}</Text>
                                        </View>
                                    </View>

                                    {/* Secured by BoxPay - Fixed at Bottom */}
                                    <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                        backgroundColor: '#F5F6FB',
                                        flexDirection: 'row'
                                    }}>
                                        <Text style={{ fontSize: 14, fontWeight: '500', color: "#888888", marginBottom: 25 }}>Secured by</Text>
                                        <Image
                                            source={require("../../assets/images/boxpay-logo.png")}
                                            style={{ height: 70, width: 70, }}
                                        />
                                    </View>

                                </View>
                            </ScrollView>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
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
                    amount={amount}
                    transactionId={transactionId}
                    method="UPI"
                    localDateTime={successfulTimeStamp}
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


export type TestEnvArg = {
    testEnv: boolean
};

export let testHandler: TestEnvArg = {
    testEnv: false
};

export const setTestEnv = (handler: TestEnvArg) => {
    testHandler = handler;
};