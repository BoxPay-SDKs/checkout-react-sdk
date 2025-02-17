import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal'
import LottieView from 'lottie-react-native'

interface SessionExpireProps {
    onClick:()=> void,
    buttonColor:string
}

const SessionExpire: React.FC<SessionExpireProps> = ({ onClick , buttonColor}) => {
    return (
        <View style={styles.container}>

            <Modal
                isVisible={true}
                style={styles.modal}
            >
                <View style={styles.sheet}>
                    <LottieView
                        source={require('../../../assets/animations/payment_status_pending.json')}
                        autoPlay
                        loop
                        style={{ width: 90, height: 90, alignSelf: 'center' }}
                    />
                    <Text style={styles.successfulHeading}>Payment session has expired.</Text>
                    <Text style={{ fontSize: 14, fontWeight: 200, color: '#000000' , textAlign:'center', alignSelf:'center', paddingTop:8, paddingBottom:16, lineHeight:20}}>For your security, your session has expired due to inactivity. Please restart the payment process.</Text>
                    <Pressable style={[styles.buttonContainer, {backgroundColor:buttonColor}]} onPress={onClick}>
                        <Text style={styles.buttonText}>Go back to Home</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
}

export default SessionExpire

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    successfulHeading: {
        color: '#DB7C1D',
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
    }
});