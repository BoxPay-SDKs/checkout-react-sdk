import React, { useEffect, useState } from 'react';
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
    const [appState, setAppState] = useState(AppState.currentState);
    const [isGpayInstalled, setIsGpayInstalled] = useState(false)
    const [isPhonePeInstalled, setIsPhonePeInstalled] = useState(false)
    const [isPaytmInstalled, setIsPaytmInstalled] = useState(false)
    const [loadingState, setLoadingState] = useState(false)
    const [isFirstLoading, setIsFirstLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState("");
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
            if (response.status.status === 'RequiresAction' && response.actions?.length > 0) {
                urlToBase64(response.actions[0].url);
            }  else if (['FAILED', 'REJECTED'].includes(response.status.status)) {
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
            // Decode Base64 string to a normal string
            const decodedString = atob(base64String);
            openUPIIntent(decodedString)
        } catch (error) {
            setFailedModalState(true)
            setLoadingState(false)
        }
    };

    const openUPIIntent = async (url: string) => {
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);  // Open the UPI app
                AppState.addEventListener('change', handleAppStateChange)
            } else {
                console.log(`cant open the file ${url}`)
                setFailedModalState(true)
                setLoadingState(false)
            }
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
            if (['FAILED', 'REJECTED', 'PENDING'].includes(response.status)) {
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
                setIsFirstLoading(true); // Set loading to true when API request starts
                const response = await axios.get(`https://test-apis.boxpay.tech/v0/checkout/sessions/${token}`);
                const paymentMethods = response.data.configs.paymentMethods;
                const amount = response.data.paymentDetails
                console.log(response)
                const upiIntent = paymentMethods.find((method: any) => method.type === 'Upi' && method.brand === 'UpiIntent');
                setIsUpiIntentVisible(upiIntent)
                setAmount(`${amount.money.currencySymbol}${amount.money.amountLocaleFull}`)
                setTotalItems(amount.order.items.length)
                setPrimaryButtonColor(response.data.merchantDetails.checkoutTheme.primaryButtonColor)
                setEmail(amount.shopper.email)
                setFirstName(amount.shopper.firstName)
                setLastName(amount.shopper.lastName)
                setPhone(amount.shopper.phoneNumber)
                setUniqueRef(amount.shopper.uniqueReference)
                setDob(amount.shopper.dateOfBirth)
                setpan(amount.shopper.panNumber)
                startCountdown(response.data.sessionExpiryTimestamp)
                const isInstalled = await Linking.canOpenURL("phonepe://")
                const gpay = await Linking.canOpenURL("tez://upi/")
                setIsGpayInstalled(gpay)
                const paytm = await Linking.canOpenURL("paytmmp://")
                setIsPaytmInstalled(paytm)
                setIsPhonePeInstalled(isInstalled)
            } catch (error) {
                ToastAndroid.show('Internal server occured', ToastAndroid.SHORT);
                console.error('Error fetching payment methods:', error);
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
            // console.log(currentTimeIST)
            const timeDiff = expiryTimeIST.getTime() - currentTimeIST.getTime();
            if (timeDiff <= 0) {
                clearInterval(timerInterval);
                setStatus('EXPIRED')
                setSessionExppireModalState(true)
            }

            // // // Convert new remaining time to hours, minutes, seconds
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

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.addressText}>Pay by any UPI App</Text>
                        <Image
                            source={require("../../assets/images/upi-icon.png")}
                            style={{ height: 28, width: 54, marginTop: 12, marginStart: 4 }}
                        />
                    </View>

                    {isUpiIntentVisibile && (
                        <View style={styles.intentBackground}>
                            <View style={styles.upiIntentRow}>
                                {isGpayInstalled && (
                                    <View style={styles.intentContainer}>
                                        <Pressable
                                            style={[
                                                styles.intentIconBorder,
                                                selectedIntent === 'GPay' && { borderColor: primaryButtonColor, borderWidth: 2 }
                                            ]}
                                            onPress={() => setSelectedIntent("GPay")}
                                        >
                                            <Image
                                                source={require("../../assets/images/gpay-icon.png")}
                                                style={styles.intentIcon}
                                            />
                                        </Pressable>
                                        <Text style={styles.intentTitle}>GPay</Text>
                                    </View>
                                )}
                                {isPhonePeInstalled && (
                                    <View style={styles.intentContainer}>
                                        <Pressable
                                            style={[
                                                styles.intentIconBorder,
                                                selectedIntent === 'PhonePe' && { borderColor: primaryButtonColor, borderWidth: 2 },
                                            ]}
                                            onPress={() => setSelectedIntent("PhonePe")}
                                        >
                                            <Image
                                                source={require("../../assets/images/phonepe-icon.png")}
                                                style={styles.intentIcon}
                                            />
                                        </Pressable>

                                        <Text style={styles.intentTitle}>PhonePe</Text>
                                    </View>
                                )}
                                {isPaytmInstalled && (
                                    <View style={styles.intentContainer}>
                                        <Pressable
                                            style={[
                                                styles.intentIconBorder,
                                                selectedIntent === 'PayTm' && { borderColor: primaryButtonColor, borderWidth: 2 }
                                            ]}
                                            onPress={() => setSelectedIntent("PayTm")}
                                        >
                                            <Image
                                                source={require("../../assets/images/paytm-icon.png")}
                                                style={{ height: 28, width: 42 }}
                                            />
                                        </Pressable>
                                        <Text style={styles.intentTitle}>PayTm</Text>
                                    </View>
                                )}
                                <View style={styles.intentContainer}>
                                    <Pressable style={styles.intentIconBorder} onPress={() => setSelectedIntent("")}>
                                        <Image
                                            source={require("../../assets/images/other-intent-icon.png")}
                                            style={styles.intentIcon}
                                        />
                                    </Pressable>
                                    <Text style={styles.intentTitle}>Others</Text>
                                </View>
                            </View>

                            {(selectedIntent !== null && selectedIntent !== "") && (
                                <Pressable style={[styles.buttonContainer, { backgroundColor: primaryButtonColor }]} onPress={handlePayment}>
                                    <Text style={styles.buttonText}>Pay {amount} via {selectedIntent}</Text>
                                </Pressable>
                            )}

                        </View>
                    )}
                </View>
            )}

            {/* Modals for Different Payment Statuses */}
            {failedModalOpen && (
                <PaymentFailed
                    onClick={() => setFailedModalState(false)}
                    buttonColor={primaryButtonColor}
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
    addressText: {
        marginStart: 16,
        marginTop: 12,
        fontWeight: '800',
        fontSize: 16,
        color: '#020815B5'
    },
    upiIntentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16
    },
    intentIcon: {
        height: 28,
        width: 28,
        padding: 13
    },
    intentIconBorder: {
        height: 52,
        width: 52,
        borderWidth: 1,
        borderColor: "#DCDEE3",
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    intentContainer: {
        alignItems: 'center',
        marginEnd: 20
    },
    intentTitle: {
        color: "#363840",
        fontSize: 14
    },
    intentBackground: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 12,
        backgroundColor: "white",
        alignSelf: "stretch",
        flexDirection: 'column',
        borderRadius: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 12,
        marginHorizontal: 16
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        paddingVertical: 12
    }
});
