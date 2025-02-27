import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';


interface CancelPaymentModalProps {
    onYesClick: () => void;
    onNoClick: () => void;
    brandcolor: string;
}

const CancelPaymentModal: React.FC<CancelPaymentModalProps> = ({ onYesClick, onNoClick, brandcolor }) => {

    return (
        <View style={styles.modalContainer}>
            <Modal
                isVisible={true}
                style={styles.modal}
            >

                <View style={styles.modalContent}>
                    <View style={styles.iconContainer}>
                        <Image source={require("../../../assets/images/ic_info.png")} style={styles.iconImage} />
                        <Text style={styles.modalTitle}>Cancel Transaction?</Text>
                    </View>
                    <Text style={styles.modalText}>
                        Are you sure you want to cancel the transaction?
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Pressable style={[styles.cancelButton, { borderColor: '#E6E6E6', borderWidth: 1 }]} onPress={onNoClick}>
                            <Text style={[styles.buttonText, { color: brandcolor }]}>Not now</Text>
                        </Pressable>
                        <Pressable style={[styles.confirmButton, { backgroundColor: brandcolor }]} onPress={onYesClick}>
                            <Text style={styles.confirmButtonText}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        margin: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
    },
    modalContent: {
        backgroundColor: '#F5F6FB',
        borderRadius: 16,
        padding: 16,
        width: '80%',
        margin: 'auto',
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
    iconImage: {
        height: 26,
        width: 26,
        tintColor: '#DB7C1D',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 20,
        flex: 1,
        marginLeft: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center'
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 700
    },
});

export default CancelPaymentModal;