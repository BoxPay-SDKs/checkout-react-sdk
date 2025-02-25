import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface CancelPaymentModalProps {
    onYesClick: () => void,
    onNoClick: () => void,
    brandcolor: string
}

const CancelPaymentModal: React.FC<CancelPaymentModalProps> = ({ onYesClick, onNoClick, brandcolor }) => {
    return (
        <View style={styles.modalContainer}>
            {/* Optional BlurView for background effect */}
            <BlurView intensity={30} style={styles.blurView} tint="dark" />

            <View style={styles.modalContent}>
                <View style={styles.iconContainer}>
                    <Image source={require("../../../assets/images/ic_info.png")} style={{ height: 26, width: 26 }} />
                    <Text style={styles.modalTitle}>Cancel Transaction?</Text>
                </View>
                <Text style={styles.modalText}>
                    Are you sure you want to cancel the transaction?
                </Text>

                <View style={styles.buttonContainer}>
                    <Pressable style={styles.cancelButton} onPress={onNoClick}>
                        <Text style={styles.buttonText}>Not now</Text>
                    </Pressable>
                    <Pressable style={styles.confirmButton} onPress={onYesClick}>
                        <Text style={styles.confirmButtonText}>Yes</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        width: '80%',  // Adjust width as needed
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#eee',
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    confirmButton: {
        backgroundColor: '#2E7D32', // Green color
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default CancelPaymentModal;