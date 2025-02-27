export type PaymentResult = {
    status: string;
    transactionId: string;
};

export type PaymentHandler = {
    onPaymentResult: (result: PaymentResult) => void;
};

export let paymentHandler: PaymentHandler = {
    onPaymentResult: () => {
        console.warn("onPaymentResult is not set yet.");
    },
};

export const setPaymentHandler = (handler: PaymentHandler) => {
    paymentHandler = handler;
};