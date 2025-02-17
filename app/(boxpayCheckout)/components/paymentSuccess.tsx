import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import React, { useState } from 'react'
import Modal from 'react-native-modal'
import LottieView from 'lottie-react-native'

interface PaymentSuccessProps {
    onClick:()=> void,
    buttonColor:string
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onClick, buttonColor }) => {
    return (
        <View style={styles.container}>

            <Modal
                isVisible={true}
                style={styles.modal}
            >
                <View style={styles.sheet}>
                    <LottieView
                        source={require('../../../assets/animations/payment_successful.json')}
                        autoPlay
                        loop
                        style={{ width: 90, height: 90, alignSelf: 'center' }}
                    />
                    <Text style={styles.successfulHeading}>Payment Successful!</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 24 }}>
                        <Text style={{ fontSize: 14, fontWeight: 200, color: '#000000' }}>Transaction ID</Text>
                        <Text style={{ fontSize: 14, fontWeight: 900, color: '#000000' }}>000085752257</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 }}>
                        <Text style={{ fontSize: 14, fontWeight: 200, color: '#000000' }}>Date</Text>
                        <Text style={{ fontSize: 14, fontWeight: 900, color: '#000000' }}>Mar 28, 2024</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 }}>
                        <Text style={{ fontSize: 14, fontWeight: 200, color: '#000000' }}>Time</Text>
                        <Text style={{ fontSize: 14, fontWeight: 900, color: '#000000' }}>07:30 AM</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 }}>
                        <Text style={{ fontSize: 14, fontWeight: 200, color: '#000000' }}>Payment Method</Text>
                        <Text style={{ fontSize: 14, fontWeight: 900, color: '#000000' }}>Credit Card(EMI)</Text>
                    </View>
                    <View style={styles.dashedLine} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: 900, color: '#000000' }}>Total Amount</Text>
                        <Text style={{ fontSize: 14, fontWeight: 900, color: '#000000' }}>₹2,590</Text>
                    </View>
                    <View style={styles.dashedLine} />
                    <Text
                        style={{
                            fontSize: 14, fontWeight: 400,
                            color: '#4F4D55', alignSelf: 'center', paddingBottom: 16, paddingTop: 12
                        }}
                    >You will be redirected to the merchant's page</Text>
                    <Pressable style={[styles.buttonContainer,{backgroundColor:buttonColor}]} onPress={onClick}>
                        <Text style={styles.buttonText}>Done</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
}

export default PaymentSuccess

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    openButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'blue',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    sheet: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    closeButton: {
        marginTop: 10,
        fontSize: 16,
        color: 'red',
    },
    successfulHeading: {
        color: '#019939',
        fontSize: 22,
        fontWeight: 800,
        alignSelf: 'center',
        paddingTop: 8
    },
    buttonContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 12,
        backgroundColor: '#1CA672'
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        paddingVertical: 12
    },
    dashedLine: {
        borderBottomWidth: 2, // Thickness of the line
        borderBottomColor: '#E6E6E6', // Color of the line
        borderStyle: 'dashed', // Makes it dashed
        width: '100%', // Full width
        marginVertical: 10, // Some spacing
        marginTop: 16
    }
});