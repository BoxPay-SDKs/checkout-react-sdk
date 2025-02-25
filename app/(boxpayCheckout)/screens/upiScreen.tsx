import { View, Text, StyleSheet, Pressable, Image, Animated, ImageBackground } from 'react-native'
import React, { useRef, useState } from 'react'
import { TextInput } from 'react-native-paper';

interface UpiScreenProps {
    selectedColor: string,
    isUpiIntentVisible: boolean,
    isGpayVisible: boolean,
    isPaytmVisible: boolean,
    isPhonePeVisible: boolean,
    isUpiCollectVisible: boolean,
    selectedIntent: string | null,
    setSelectedIntent: (intent: string | null) => void,
    amount: string,
    handleUpiPayment: () => void,
    handleCollectPayment: (upiId: string) => void
}

const UpiScreen: React.FC<UpiScreenProps> = ({ selectedColor, isUpiIntentVisible, isGpayVisible, isPaytmVisible, isPhonePeVisible, isUpiCollectVisible, selectedIntent, setSelectedIntent, amount, handleUpiPayment, handleCollectPayment }) => {
    const [upiCollectVisible, setUpiCollectVisible] = useState(false)
    const [upiCollectError, setUpiCollectError] = useState(false)
    const [upiCollectValid, setUpiCollectValid] = useState(false)
    const [upiCollectTextInput, setUpiCollectTextInput] = useState("")
    const [isRotated, setIsRotated] = useState(false)

    const handleUpiChevronClick = () => {
        setSelectedIntent(null)
        setUpiCollectVisible(!upiCollectVisible)
        setIsRotated(!isRotated)
    }

    const handleTextChange = (text: string) => {
        console.log(text);
        setUpiCollectTextInput(text);
        setUpiCollectError(false);
    
        if (text.trim() !== "" && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{3,64}$/.test(text)) {
            setUpiCollectError(false);
            setUpiCollectValid(true)
        } else {
            if (text.includes('@') && (text.split('@')[1]?.length ?? 0) >= 2) {
                setUpiCollectError(true);
                setUpiCollectValid(false)
            }
        }
    };
    

    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.addressText}>Pay by any UPI App</Text>
                <Image
                    source={require("../../../assets/images/upi-icon.png")}
                    style={{ height: 28, width: 54, marginTop: 12, marginStart: 4 }}
                />
            </View>
            {isUpiIntentVisible && (
                <View style={styles.intentBackground}>
                    <View style={styles.upiIntentRow}>
                        {isGpayVisible && (
                            <View style={styles.intentContainer}>
                                <Pressable
                                    style={[
                                        styles.intentIconBorder,
                                        selectedIntent === 'GPay' && { borderColor: selectedColor, borderWidth: 2 }
                                    ]}
                                    onPress={() => {
                                        setUpiCollectVisible(false)
                                        setIsRotated(false)
                                        setSelectedIntent("GPay")
                                    }}
                                >
                                    <Image
                                        source={require("../../../assets/images/gpay-icon.png")}
                                        style={styles.intentIcon}
                                    />
                                </Pressable>
                                <Text style={styles.intentTitle}>GPay</Text>
                            </View>
                        )}
                        {isPhonePeVisible && (
                            <View style={styles.intentContainer}>
                                <Pressable
                                    style={[
                                        styles.intentIconBorder,
                                        selectedIntent === 'PhonePe' && { borderColor: selectedColor, borderWidth: 2 },
                                    ]}
                                    onPress={() => {
                                        setUpiCollectVisible(false)
                                        setIsRotated(false)
                                        setSelectedIntent("PhonePe")
                                    }}
                                >
                                    <Image
                                        source={require("../../../assets/images/phonepe-icon.png")}
                                        style={styles.intentIcon}
                                    />
                                </Pressable>

                                <Text style={styles.intentTitle}>PhonePe</Text>
                            </View>
                        )}
                        {isPaytmVisible && (
                            <View style={styles.intentContainer}>
                                <Pressable
                                    style={[
                                        styles.intentIconBorder,
                                        selectedIntent === 'PayTm' && { borderColor: selectedColor, borderWidth: 2 }
                                    ]}
                                    onPress={() => {
                                        setUpiCollectVisible(false)
                                        setIsRotated(false)
                                        setSelectedIntent("PayTm")
                                    }}
                                >
                                    <Image
                                        source={require("../../../assets/images/paytm-icon.png")}
                                        style={{ height: 28, width: 44 }}
                                    />
                                </Pressable>
                                <Text style={styles.intentTitle}>PayTm</Text>
                            </View>
                        )}
                        <View style={styles.intentContainer}>
                            <Pressable style={styles.intentIconBorder} onPress={() => {
                                setUpiCollectVisible(false)
                                setIsRotated(false)
                                setSelectedIntent("")
                            }}>
                                <Image
                                    source={require("../../../assets/images/other-intent-icon.png")}
                                    style={styles.intentIcon}
                                />
                            </Pressable>
                            <Text style={styles.intentTitle}>Others</Text>
                        </View>
                    </View>

                    {(selectedIntent !== null && selectedIntent !== "") && (
                        <Pressable style={[styles.buttonContainer, { backgroundColor: selectedColor }]} onPress={handleUpiPayment}>
                            <Text style={styles.buttonText}>Pay {amount} via {selectedIntent}</Text>
                        </Pressable>
                    )}

                    {isUpiCollectVisible && (
                        <View>
                            {isRotated ? (
                                <ImageBackground
                                    source={require("../../../assets/images/add_upi_id_background.png")} // Replace with your background image
                                    resizeMode="cover"
                                    style={{ paddingBottom: 34, marginTop: 24 }}
                                >
                                    <Pressable
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center', // Ensures vertical alignment of items
                                            paddingTop: 16,
                                            paddingStart: 16,
                                            marginEnd: 16,
                                            justifyContent: 'space-between', // Spaces items between the start and end
                                        }}
                                        onPress={() => handleUpiChevronClick()}
                                    >
                                        {/* Icon and Text Wrapper */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={require("../../../assets/images/add_icon.png")}
                                                style={{ height: 14, width: 14 }}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    color: '#1CA672',
                                                    paddingStart: 10
                                                }}
                                            >
                                                Add new UPI Id
                                            </Text>
                                        </View>

                                        <Animated.Image
                                            source={require("../../../assets/images/chervon-down.png")}
                                            style={{
                                                alignSelf: 'center', height: 10, width: 28, transform: [{
                                                    rotate: isRotated ? "180deg" : "0deg"
                                                }]
                                            }}
                                        />
                                    </Pressable>
                                </ImageBackground>
                            ) : (
                                <View>
                                    <View style={{ flexDirection: 'row', height: 2, backgroundColor: '#F1F1F1', marginTop: 20 }} />
                                    <Pressable
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center', // Ensures vertical alignment of items
                                            paddingTop: 16,
                                            paddingStart: 16,
                                            marginEnd: 16,
                                            justifyContent: 'space-between', // Spaces items between the start and end
                                        }}
                                        onPress={() => handleUpiChevronClick()}
                                    >
                                        {/* Icon and Text Wrapper */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={require("../../../assets/images/add_icon.png")}
                                                style={{ height: 14, width: 14 }}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    color: '#1CA672',
                                                    paddingStart: 10
                                                }}
                                            >
                                                Add new UPI Id
                                            </Text>
                                        </View>

                                        <Animated.Image
                                            source={require("../../../assets/images/chervon-down.png")}
                                            style={{
                                                alignSelf: 'center', height: 10, width: 28, transform: [{
                                                    rotate: isRotated ? "180deg" : "0deg"
                                                }]
                                            }}
                                        />
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    )}

                    {upiCollectVisible && (
                        <View>
                            <TextInput
                                mode='outlined'
                                label='Enter UPI ID'
                                value={upiCollectTextInput}
                                onChangeText={(it) => {
                                    handleTextChange(it)
                                }}
                                theme={{
                                    colors: {
                                        primary: selectedColor,
                                        outline: '#E6E6E6'
                                    }
                                }}
                                style={styles.textInput}
                                error={upiCollectError}
                            />
                            {upiCollectError && (
                                <Text style={{
                                    fontSize: 14, fontWeight: 400, color: '#E12121', marginStart: 16, marginHorizontal: 16
                                }}>Please enter a valid UPI Id</Text>
                            )}
                            <Pressable style={[styles.buttonContainer, { backgroundColor: selectedColor }]} onPress={() => {
                                if (upiCollectValid) {
                                    handleCollectPayment(upiCollectTextInput)
                                } else {
                                    setUpiCollectError(true)
                                }
                            }}>
                                <Text style={styles.buttonText}>Verify & Pay {amount}</Text>
                            </Pressable>
                        </View>
                    )}

                </View>
            )}
        </View>
    )
}

export default UpiScreen

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
        paddingHorizontal: 16
    },
    textInput: {
        marginHorizontal: 16,
        borderRadius: 8,
        backgroundColor: 'white'
    },
    intentIcon: {
        height: 34,
        width: 34
    },
    intentIconBorder: {
        height: 56,
        width: 56,
        borderWidth: 1,
        borderColor: "#DCDEE3",
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    intentContainer: {
        alignItems: 'center',
        marginEnd: 22
    },
    intentTitle: {
        color: "#363840",
        fontSize: 14
    },
    intentBackground: {
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 16,
        backgroundColor: "white",
        flexDirection: 'column',
        borderRadius: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 20,
        marginHorizontal: 16
    },
    buttonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
        paddingVertical: 12
    }
});