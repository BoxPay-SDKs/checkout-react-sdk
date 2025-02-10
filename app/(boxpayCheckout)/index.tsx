import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, BackHandler, ActivityIndicator } from 'react-native';
import Header from './components/header';
import axios from 'axios';


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
    const [isGpayInstalled, setIsGpayInstalled] = useState(false)
    const [isPhonePeInstalled, setIsPhonePeInstalled] = useState(false)
    const [isPaytmInstalled, setIsPaytmInstalled] = useState(false)
    const [loadingState, setLoadingState] = useState(true)
    const [amount, setAmount] = useState("")
    const [totalItems, setTotalItems] = useState("")
    const [selectedIntent, setSelectedIntent] = useState("")
    const [primaryButtonColor, setPrimaryButtonColor] = useState("#1CA672")

    const handlePayment = () => {
        const mockPaymentResult: PaymentResult = {
            status: status,
            transactionId: transactionId,
        };
        onPaymentResult(mockPaymentResult);
        return true
    };


    useEffect(() => {
        // Add back press handler
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handlePayment);

        // Cleanup the back press handler on component unmount
        return () => {
            backHandler.remove();
        };
    }, []);

    useEffect(() => {
        // Call the API to get payment methods
        const fetchPaymentMethods = async () => {
            try {
                setLoadingState(true); // Set loading to true when API request starts
                const response = await axios.get(`https://test-apis.boxpay.tech/v0/checkout/sessions/${token}`);
                const paymentMethods = response.data.configs.paymentMethods;
                const amount = response.data.paymentDetails
                // Check if the UPI Intent is present in the paymentMethods array
                const upiIntent = paymentMethods.find((method: any) => method.type === 'Upi' && method.brand === 'UpiIntent');
                setIsUpiIntentVisible(upiIntent)
                setAmount(`${amount.money.currencySymbol}${amount.money.amountLocaleFull}`)
                setTotalItems(amount.order.items.length)
                setPrimaryButtonColor(response.data.merchantDetails.checkoutTheme.primaryButtonColor)
                
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            } finally {
                setLoadingState(false); // Set loading to false when API request is finished
            }
        };

        fetchPaymentMethods();
    }, [token]);

    const handleSelectedIntent = (selected: string) => {
        setSelectedIntent(selected)
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F6FB", marginTop: 30 }}>
            {loadingState ? (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text>Loading...</Text>
                </View>
            ) : (
                <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
                    <Header onBackPress={handlePayment} items={totalItems} amount={amount} />

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.addressText}>Pay by any UPI App</Text>
                        <Image
                            source={require("../../assets/images/upi-icon.png")}
                            style={{ height: 28, width: 54, marginTop: 12, marginStart: 4 }}
                        />
                    </View>

                    {/* Conditionally render UPI intent UI if upiIntent is true */}
                    {isUpiIntentVisibile && (
                        <View style={styles.intentBackground}>
                            <View style={styles.upiIntentRow}>
                                <View style={styles.intentContainer}>
                                    <Pressable
                                        style={[
                                            styles.intentIconBorder,
                                            selectedIntent === 'GPay' && {borderColor:primaryButtonColor,borderWidth: 2}
                                        ]}
                                        onPress={() => handleSelectedIntent("GPay")}
                                    >
                                        <Image
                                            source={require("../../assets/images/gpay-icon.png")}
                                            style={styles.intentIcon}
                                        />
                                    </Pressable>
                                    <Text style={styles.intentTitle}>GPay</Text>
                                </View>
                                <View style={styles.intentContainer}>
                                    <Pressable
                                        style={[
                                            styles.intentIconBorder,
                                            selectedIntent === 'PhonePe' && {borderColor:primaryButtonColor,borderWidth: 2}
                                        ]}
                                        onPress={() => handleSelectedIntent("PhonePe")}
                                    >
                                        <Image
                                            source={require("../../assets/images/phonepe-icon.png")}
                                            style={styles.intentIcon}
                                        />
                                    </Pressable>

                                    <Text style={styles.intentTitle}>PhonePe</Text>
                                </View>
                                <View style={styles.intentContainer}>
                                    <Pressable
                                        style={[
                                            styles.intentIconBorder,
                                            selectedIntent === 'Paytm' && {borderColor:primaryButtonColor,borderWidth: 2}
                                        ]}
                                        onPress={() => handleSelectedIntent("Paytm")}
                                    >
                                        <Image
                                            source={require("../../assets/images/paytm-icon.png")}
                                            style={{ height: 28, width: 42 }}
                                        />
                                    </Pressable>
                                    <Text style={styles.intentTitle}>Paytm</Text>
                                </View>
                                <View style={styles.intentContainer}>
                                    <Pressable style={styles.intentIconBorder} onPress={() => handleSelectedIntent("")}>
                                        <Image
                                            source={require("../../assets/images/other-intent-icon.png")}
                                            style={styles.intentIcon}
                                        />
                                    </Pressable>
                                    <Text style={styles.intentTitle}>Others</Text>
                                </View>
                            </View>

                            {selectedIntent !== "" && (
                                <Pressable style={[styles.buttonContainer,{backgroundColor:primaryButtonColor}]} onPress={handlePayment}>
                                    <Text style={styles.buttonText}>Pay {amount} via {selectedIntent}</Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
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
        justifyContent: 'space-between',
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
