import {
    ActivityIndicator,
    Alert,
    AppState,
    Modal,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    type AppStateStatus,
} from "react-native";

import {
    File,
    Paths,
} from "expo-file-system";

import * as Sharing from "expo-sharing";

import { useEffect, useRef, useState } from "react";

import {
    RouteProp,
    useNavigation,
    useRoute,
} from "@react-navigation/native";

import type {
    NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { SafeAreaView } from "react-native-safe-area-context";

import type {
    AppStackParamList,
} from "@/navigation/AppNavigator";

import * as WebBrowser from "expo-web-browser";

import documentRequestService from "@/services/documentRequest.service";
import documentFileService from "@/services/documentFile.service";

import type {
    DocumentRequest,
    DocumentRequestStatus,
    DocumentPayment,
    DocumentDeliveryMethod,
    DocumentRequestAttachment,
} from "@/types/documentRequest";


// -----------------------------------------------------------------------------
// Navigation Types
// -----------------------------------------------------------------------------

type DocumentDetailsRouteProp = RouteProp<
    AppStackParamList,
    "DocumentDetails"
>;

type DocumentDetailsNavigationProp =
    NativeStackNavigationProp<
        AppStackParamList
    >;


// -----------------------------------------------------------------------------
// Screen
// -----------------------------------------------------------------------------

export function DocumentDetailsScreen() {

    const route =
        useRoute<DocumentDetailsRouteProp>();

    const navigation =
        useNavigation<DocumentDetailsNavigationProp>();

    const {
        requestId,
    } = route.params;


    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const [
        documentRequest,
        setDocumentRequest,
    ] = useState<DocumentRequest | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        paymentLoading,
        setPaymentLoading,
    ] = useState(false);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        downloading,
        setDownloading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [paymentMethodModalVisible, setPaymentMethodModalVisible] =
    useState(false);

    const confirmingPaymentRef =
        useRef(false);


    // -------------------------------------------------------------------------
    // Derived Data
    // -------------------------------------------------------------------------

    const logs =
        documentRequest?.logs ?? [];

    const payments =
        documentRequest?.payments ?? [];

    const attachments =
        documentRequest?.attachments ?? [];

    const fields =
        documentRequest?.fields ?? [];


    const latestPayment =
        payments.length > 0
            ? payments[0]
            : undefined;

    const pendingPayMongoPayment =
        payments.find(
            (payment) =>
                payment.status === "pending" &&
                payment.provider === "paymongo"
        );

    const pendingCashPayment =
        payments.find(
            (payment) =>
                payment.status === "pending" &&
                payment.provider === "manual" &&
                payment.payment_method ===
                    "over_the_counter"
        );

    const paidPayment =
        payments.find(
            (payment) => payment.status === "paid"
        );


    // -------------------------------------------------------------------------
    // Load Request
    // -------------------------------------------------------------------------

    useEffect(() => {

        loadDocumentRequest();

    }, [requestId]);


    async function loadDocumentRequest(
        showRefreshing = false
    ) {

        try {

            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);

            const response =
                await documentRequestService
                    .getDocumentRequest(
                        requestId
                    );

            setDocumentRequest(
                response.data.data
            );

            console.log(
                response.data.data
            );

        } catch (error: any) {

            console.error(
                "Document Request Details Error:",
                error.response?.data ?? error
            );

            setError(
                error.response?.data?.message ??
                "Unable to load document request."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }
    }


    // -------------------------------------------------------------------------
    // Automatic Payment Confirmation
    // -------------------------------------------------------------------------

    useEffect(() => {

        let currentState =
            AppState.currentState;

        const subscription =
            AppState.addEventListener(
                "change",
                async (
                    nextState: AppStateStatus
                ) => {

                    const wasBackgrounded =
                        currentState === "inactive" ||
                        currentState === "background";

                    const becameActive =
                        nextState === "active";

                    currentState =
                        nextState;

                    if (
                        !wasBackgrounded ||
                        !becameActive
                    ) {
                        return;
                    }

                    const hasPendingPayMongoPayment =
                        documentRequest?.payments?.some(
                            (payment) =>
                                payment.status === "pending" &&
                                payment.provider === "paymongo"
                        );

                    if (!hasPendingPayMongoPayment) {
                        return;
                    }


                    if (
                        confirmingPaymentRef.current
                    ) {
                        return;
                    }


                    try {

                        confirmingPaymentRef.current =
                            true;

                        console.log(
                            "BOAConnect: App returned to foreground."
                        );

                        console.log(
                            "BOAConnect: Confirming payment..."
                        );

                        await documentRequestService
                            .confirmPayment(
                                requestId
                            );

                        console.log(
                            "BOAConnect: Payment confirmed."
                        );


                        const response =
                            await documentRequestService
                                .getDocumentRequest(
                                    requestId
                                );

                        const updatedDocumentRequest =
                            response.data.data;

                        setDocumentRequest(
                            updatedDocumentRequest
                        );

                        console.log(
                            "BOAConnect: Document request refreshed."
                        );

                    } catch (error: any) {

                        console.error(
                            "Automatic Payment Confirmation Error:",
                            error.response?.data ??
                            error
                        );

                    } finally {

                        confirmingPaymentRef.current =
                            false;

                    }

                }
            );


        return () => {

            subscription.remove();

        };

    }, [
        requestId,
        documentRequest,
    ]);


    // -------------------------------------------------------------------------
    // Payment
    // -------------------------------------------------------------------------

    async function handlePayment(
        paymentMethod:
            | "gcash"
            | "over_the_counter"
    ) {
        try {
            setPaymentLoading(true);

            if (
                paymentMethod ===
                "over_the_counter"
            ) {
                let payment =
                    pendingCashPayment;

                if (!payment) {
                    const response =
                        await documentRequestService.createPayment(
                            requestId,
                            {
                                payment_method:
                                    "over_the_counter",
                            }
                        );

                    payment =
                        response.data.data;
                }

                if (!payment) {
                    throw new Error(
                        "Cash payment information is unavailable."
                    );
                }

                await loadDocumentRequest(true);

                Alert.alert(
                    "Cash Payment Selected",
                    `Please visit your barangay office to pay ₱${Number(
                        payment.amount
                    ).toFixed(
                        2
                    )}. The payment will be recorded by the barangay staff after you pay.`
                );

                return;
            }

            // Online / PayMongo payment
            let payment =
                pendingPayMongoPayment;

            if (!payment) {
                const response =
                    await documentRequestService.createPayment(
                        requestId,
                        {
                            payment_method:
                                "gcash",
                        }
                    );

                payment =
                    response.data.data;
            }

            if (!payment) {
                throw new Error(
                    "Payment information is unavailable."
                );
            }

            if (!payment.checkout_url) {
                throw new Error(
                    "Payment checkout URL is unavailable."
                );
            }

            await WebBrowser.openBrowserAsync(
                payment.checkout_url
            );

            try {
                await documentRequestService
                    .confirmPayment(requestId);

                await loadDocumentRequest(true);

                Alert.alert(
                    "Payment Successful",
                    "Your payment has been received and verified."
                );
            } catch (confirmError: any) {
                console.error(
                    "Payment confirmation failed:",
                    confirmError
                );

                await loadDocumentRequest(true);

                Alert.alert(
                    "Payment Not Confirmed",
                    confirmError.response?.data
                        ?.message ??
                        "The payment could not be confirmed yet. Please check your payment status again shortly."
                );
            }
        } catch (error: any) {
            console.error(
                "Payment error:",
                error
            );

            Alert.alert(
                "Payment Error",
                error.response?.data?.message ??
                    error.message ??
                    "Unable to process payment."
            );
        } finally {
            setPaymentLoading(false);
        }
    }

    async function handleChoosePaymentMethod() {
        setPaymentMethodModalVisible(true);
    }

    // -------------------------------------------------------------------------
    // Confirm Payment
    // -------------------------------------------------------------------------

    async function handleConfirmPayment() {

        if (!pendingPayMongoPayment) {
            return;
        }

        try {

            setRefreshing(true);

            await documentRequestService
                .confirmPayment(
                    requestId
                );

            await loadDocumentRequest(
                true
            );


            Alert.alert(
                "Payment Confirmed",
                "Your payment has been received and verified."
            );

        } catch (error: any) {

            console.error(
                "Payment Confirmation Error:",
                error.response?.data ??
                error
            );

            await loadDocumentRequest(
                true
            );


            Alert.alert(
                "Payment Not Confirmed",
                error.response?.data?.message ??
                "The payment has not been confirmed yet."
            );

        } finally {

            setRefreshing(false);

        }
    }

    async function handleChangePaymentMethod() {
        Alert.alert(
            "Change Payment Method",
            "Your current cash payment selection will be cancelled. You can then choose another payment method.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Continue",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setPaymentLoading(true);

                            await documentRequestService
                                .cancelPayment(
                                    requestId
                                );

                            await loadDocumentRequest(
                                true
                            );

                            Alert.alert(
                                "Payment Method Reset",
                                "Your cash payment selection has been cancelled. You can now choose another payment method."
                            );

                        } catch (error: any) {

                            console.error(
                                "Cancel Payment Error:",
                                error.response?.data ??
                                error
                            );

                            Alert.alert(
                                "Unable to Change Payment Method",
                                error.response?.data?.message ??
                                "The current payment could not be cancelled."
                            );

                        } finally {
                            setPaymentLoading(false);
                        }
                    },
                },
            ]
        );
    }


    // -------------------------------------------------------------------------
    // View Attachment
    // -------------------------------------------------------------------------

    function handleViewAttachment(
        attachment: DocumentRequestAttachment
    ) {

        if (!documentRequest) {
            return;
        }


        navigation.navigate(
            "AttachmentViewer",
            {
                type: "document",
                documentRequestId:
                    documentRequest.id,

                attachmentUuid:
                    attachment.uuid,

                filename:
                    attachment.filename,

                mimeType:
                    attachment.mime_type,
            }
        );
    }


    // -------------------------------------------------------------------------
    // Download Generated Document
    // -------------------------------------------------------------------------

    async function handleDownload() {

        if (!documentRequest) {
            return;
        }


        const file =
            documentRequest.files?.[0];


        if (!file?.uuid) {

            Alert.alert(
                "Unavailable",
                "The document file is not yet available."
            );

            return;
        }


        try {

            setDownloading(true);


            const response =
                await documentFileService
                    .download(
                        file.uuid
                    );


            const filename =
                file.filename ??
                `document-${documentRequest.request_no}.pdf`;


            const destination =
                new File(
                    Paths.cache,
                    filename
                );


            const bytes =
                new Uint8Array(
                    response.data
                );


            destination.write(
                bytes
            );


            if (
                await Sharing.isAvailableAsync()
            ) {

                await Sharing.shareAsync(
                    destination.uri,
                    {
                        mimeType:
                            "application/pdf",

                        dialogTitle:
                            "Document",
                    }
                );

            } else {

                Alert.alert(
                    "Download Complete",
                    "Your document has been downloaded successfully."
                );

            }


            await documentRequestService
                .releaseAfterDownload(
                    documentRequest.id
                );


            await loadDocumentRequest(
                true
            );

        } catch (error: unknown) {

            console.error(
                "Document download failed:",
                error
            );


            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to download the document.";


            Alert.alert(
                "Download Failed",
                message
            );

        } finally {

            setDownloading(false);

        }
    }


    // -------------------------------------------------------------------------
    // Loading State
    // -------------------------------------------------------------------------

    if (loading) {

        return (
            <SafeAreaView
                className="
                    flex-1
                    items-center
                    justify-center
                    bg-gray-100
                "
            >

                <ActivityIndicator
                    size="large"
                    color="#166534"
                />

                <Text
                    className="
                        mt-3
                        text-gray-500
                    "
                >
                    Loading document request...
                </Text>

            </SafeAreaView>
        );
    }


    // -------------------------------------------------------------------------
    // Error State
    // -------------------------------------------------------------------------

    if (
        error ||
        !documentRequest
    ) {

        return (
            <SafeAreaView
                className="
                    flex-1
                    items-center
                    justify-center
                    bg-gray-100
                    px-6
                "
            >

                <Text
                    className="
                        text-center
                        text-lg
                        font-semibold
                        text-gray-800
                    "
                >
                    Unable to load request
                </Text>


                <Text
                    className="
                        mt-2
                        text-center
                        text-gray-500
                    "
                >
                    {
                        error ??
                        "Document request not found."
                    }
                </Text>

            </SafeAreaView>
        );
    }


    // -------------------------------------------------------------------------
    // Main UI
    // -------------------------------------------------------------------------

    return (

        <SafeAreaView
            className="
                flex-1
                bg-gray-100
            "
        >

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    padding: 20,
                }}
                showsVerticalScrollIndicator={
                    false
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={() =>
                            loadDocumentRequest(
                                true
                            )
                        }
                    />
                }
            >

                {/* --------------------------------------------------------- */}
                {/* Header */}
                {/* --------------------------------------------------------- */}

                <View className="mb-5">

                    <Text
                        className="
                            text-2xl
                            font-bold
                            text-gray-900
                        "
                    >
                        Document Request
                    </Text>


                    <Text
                        className="
                            mt-1
                            text-gray-500
                        "
                    >
                        {
                            documentRequest
                                .request_no
                        }
                    </Text>

                </View>


                {/* --------------------------------------------------------- */}
                {/* Status */}
                {/* --------------------------------------------------------- */}

                <StatusCard
                    status={
                        documentRequest.status
                    }
                    statusLabel={
                        documentRequest.status_label
                    }
                    deliveryMethod={
                        documentRequest.delivery_method
                    }
                />


                {/* --------------------------------------------------------- */}
                {/* Request Information */}
                {/* --------------------------------------------------------- */}

                <View
                    className="
                        mb-5
                        rounded-2xl
                        bg-white
                        p-5
                    "
                >

                    <Text
                        className="
                            mb-4
                            text-lg
                            font-semibold
                            text-gray-900
                        "
                    >
                        Request Information
                    </Text>


                    <InfoRow
                        label="Document"
                        value={
                            documentRequest
                                .document_type
                                ?.name ??
                            "-"
                        }
                    />


                    <InfoRow
                        label="Delivery Method"
                        value={
                            getDeliveryMethodLabel(
                                documentRequest
                                    .delivery_method
                            )
                        }
                    />


                    <InfoRow
                        label="Requested For"
                        value={
                            documentRequest
                                .requested_for
                                ?.name ??
                            "-"
                        }
                    />


                    <InfoRow
                        label="Purpose"
                        value={
                            documentRequest
                                .purpose
                        }
                    />


                    <InfoRow
                        label="Requested At"
                        value={
                            documentRequest
                                .requested_at_label
                        }
                    />

                </View>


                {/* --------------------------------------------------------- */}
                {/* Additional Information */}
                {/* --------------------------------------------------------- */}

                {fields.length > 0 && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-white
                            p-5
                        "
                    >

                        <Text
                            className="
                                mb-4
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Additional Information
                        </Text>


                        {fields.map(
                            (
                                field,
                                index
                            ) => (

                                <View
                                    key={
                                        field.id ??
                                        `${field.field_key}-${index}`
                                    }
                                    className="
                                        mb-4
                                    "
                                >

                                    <Text
                                        className="
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        {
                                            field.name ??
                                            field.field_key ??
                                            "Field"
                                        }
                                    </Text>


                                    <Text
                                        className="
                                            mt-1
                                            font-semibold
                                            text-gray-900
                                        "
                                    >
                                        {
                                            formatFieldValue(
                                                field.display_value ?? field.value
                                            )
                                        }
                                    </Text>

                                </View>

                            )
                        )}

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Supporting Documents */}
                {/* --------------------------------------------------------- */}

                {attachments.length > 0 && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-white
                            p-5
                        "
                    >

                        <Text
                            className="
                                mb-4
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Supporting Documents
                        </Text>


                        {attachments.map(
                            (
                                attachment,
                                index
                            ) => (

                                <View
                                    key={
                                        attachment.uuid ??
                                        index
                                    }
                                    className="
                                        mb-3
                                        rounded-xl
                                        border
                                        border-gray-200
                                        p-4
                                    "
                                >

                                    <View
                                        className="
                                            flex-row
                                            items-center
                                        "
                                    >

                                        <View
                                            className="
                                                flex-1
                                                pr-3
                                            "
                                        >

                                            <Text
                                                className="
                                                    font-semibold
                                                    text-gray-900
                                                "
                                                numberOfLines={
                                                    2
                                                }
                                            >
                                                {
                                                    attachment.filename
                                                }
                                            </Text>


                                            <Text
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-gray-500
                                                "
                                            >
                                                {
                                                    formatFileSize(
                                                        attachment.size
                                                    )
                                                }
                                            </Text>

                                        </View>


                                        <Pressable
                                            onPress={() =>
                                                handleViewAttachment(
                                                    attachment
                                                )
                                            }
                                            className="
                                                rounded-lg
                                                bg-green-700
                                                px-4
                                                py-2
                                            "
                                        >

                                            <Text
                                                className="
                                                    font-semibold
                                                    text-white
                                                "
                                            >
                                                View
                                            </Text>

                                        </Pressable>

                                    </View>

                                </View>

                            )
                        )}

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Payment */}
                {/* --------------------------------------------------------- */}

                {shouldShowPayment(
                    documentRequest,
                    latestPayment
                ) && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-white
                            p-5
                        "
                    >

                        <Text
                            className="
                                mb-4
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Payment
                        </Text>


                        {latestPayment && (

                            <PaymentDetails
                                payment={
                                    latestPayment
                                }
                            />

                        )}


                        {(
                            documentRequest.status ===
                                "payment_received" ||

                            paidPayment
                        ) && (

                            <View
                                className="
                                    rounded-xl
                                    bg-green-50
                                    p-4
                                "
                            >

                                <Text
                                    className="
                                        font-semibold
                                        text-green-800
                                    "
                                >
                                    Payment Received
                                </Text>


                                <Text
                                    className="
                                        mt-1
                                        text-green-700
                                    "
                                >
                                    Your payment has been
                                    received and verified.
                                    Your document will now
                                    proceed to processing.
                                </Text>

                            </View>

                        )}


                        {(
                            (
                                documentRequest.status ===
                                    "awaiting_payment"
                            )
                            &&
                            !paidPayment
                        ) && (

                            <>

                                <View
                                    className="
                                        mb-4
                                        rounded-xl
                                        bg-yellow-50
                                        p-4
                                    "
                                >

                                    <Text
                                        className="
                                            font-semibold
                                            text-yellow-800
                                        "
                                    >
                                        Payment Required
                                    </Text>


                                    <Text
                                        className="
                                            mt-1
                                            text-yellow-700
                                        "
                                    >
                                        Please complete the
                                        required payment to
                                        continue processing
                                        your document request.
                                    </Text>

                                </View>

                                {pendingCashPayment && (
                                    <>
                                    <View
                                        className="
                                            mb-4
                                            rounded-xl
                                            bg-blue-50
                                            p-4
                                        "
                                    >
                                        <Text
                                            className="
                                                font-semibold
                                                text-blue-800
                                            "
                                        >
                                            Cash Payment Pending
                                        </Text>

                                        <Text
                                            className="
                                                mt-1
                                                leading-6
                                                text-blue-700
                                            "
                                        >
                                            Please visit your barangay office to pay
                                            the required amount. The barangay staff
                                            will record your payment after receiving it.
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleChangePaymentMethod}
                                        disabled={paymentLoading}
                                        activeOpacity={0.8}
                                        className="
                                            items-center
                                            rounded-xl
                                            border
                                            border-green-700
                                            py-3
                                            mb-3
                                        "
                                    >
                                        {paymentLoading ? (
                                            <ActivityIndicator
                                                color="#166534"
                                            />
                                        ) : (
                                            <Text
                                                className="
                                                    font-semibold
                                                    text-green-700
                                                "
                                            >
                                                Change Payment Method
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                    </>
                                )}

                                <TouchableOpacity
                                    onPress={() => {
                                        if (pendingPayMongoPayment) {
                                            handlePayment("gcash");
                                        } else {
                                            handleChoosePaymentMethod();
                                        }
                                    }}
                                    disabled={
                                        paymentLoading ||
                                        !!pendingCashPayment
                                    }
                                    activeOpacity={0.8}
                                    className="
                                        items-center
                                        rounded-xl
                                        bg-green-700
                                        px-4
                                        py-4
                                    "
                                >
                                    {paymentLoading ? (
                                        <ActivityIndicator
                                            color="white"
                                        />
                                    ) : (
                                        <Text
                                            className="
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {pendingCashPayment
                                                ? "Cash Payment Pending"
                                                : pendingPayMongoPayment
                                                    ? "Continue Online Payment"
                                                    : "Choose Payment Method"}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {pendingPayMongoPayment && (
                                    <TouchableOpacity
                                        onPress={
                                            handleConfirmPayment
                                        }
                                        disabled={refreshing}
                                        className="
                                            mt-3
                                            items-center
                                            rounded-xl
                                            border
                                            border-green-700
                                            py-3
                                        "
                                    >
                                        {refreshing ? (
                                            <ActivityIndicator
                                                color="#166534"
                                            />
                                        ) : (
                                            <Text
                                                className="
                                                    font-semibold
                                                    text-green-700
                                                "
                                            >
                                                Refresh Payment Status
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                            </>

                        )}

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Ready for Release */}
                {/* --------------------------------------------------------- */}

                {documentRequest.status ===
                    "ready_for_release" && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-green-700
                            p-5
                        "
                    >

                        <Text
                            className="
                                text-lg
                                font-bold
                                text-white
                            "
                        >
                            Your Document is Ready!
                        </Text>


                        {documentRequest.delivery_method ===
                            "pickup" ? (

                            <Text
                                className="
                                    mt-2
                                    leading-6
                                    text-green-100
                                "
                            >
                                Your requested document is
                                ready for pickup. Please visit
                                the barangay office during
                                office hours to claim your
                                document.
                            </Text>

                        ) : (

                            <View>

                                <Text
                                    className="
                                        mt-2
                                        leading-6
                                        text-green-100
                                    "
                                >
                                    Your requested document
                                    is ready and can now be
                                    downloaded digitally.
                                </Text>


                                <Pressable
                                    onPress={
                                        handleDownload
                                    }
                                    disabled={
                                        downloading
                                    }
                                    className="
                                        mt-4
                                        rounded-xl
                                        bg-white
                                        px-5
                                        py-3
                                    "
                                >

                                    <Text
                                        className="
                                            text-center
                                            font-semibold
                                            text-green-700
                                        "
                                    >
                                        {
                                            downloading
                                                ? "Downloading..."
                                                : "Download Document"
                                        }
                                    </Text>

                                </Pressable>

                            </View>

                        )}

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Cancelled */}
                {/* --------------------------------------------------------- */}

                {documentRequest.status ===
                    "cancelled" && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-gray-200
                            p-5
                        "
                    >

                        <Text
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Request Cancelled
                        </Text>


                        <Text
                            className="
                                mt-2
                                leading-6
                                text-gray-600
                            "
                        >
                            {
                                documentRequest
                                    .remarks ??
                                "This document request has been cancelled."
                            }
                        </Text>

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Released */}
                {/* --------------------------------------------------------- */}

                {documentRequest.status ===
                    "released" && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-green-50
                            p-5
                        "
                    >

                        <Text
                            className="
                                text-lg
                                font-semibold
                                text-green-800
                            "
                        >
                            Document Released
                        </Text>


                        <Text
                            className="
                                mt-2
                                text-green-700
                            "
                        >
                            This document has already been
                            released.
                        </Text>

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Remarks */}
                {/* --------------------------------------------------------- */}

                {documentRequest.remarks &&
                    documentRequest.status !==
                        "rejected" &&
                    documentRequest.status !==
                        "cancelled" && (

                    <View
                        className="
                            mb-5
                            rounded-2xl
                            bg-white
                            p-5
                        "
                    >

                        <Text
                            className="
                                mb-2
                                text-lg
                                font-semibold
                                text-gray-900
                            "
                        >
                            Remarks
                        </Text>


                        <Text
                            className="
                                text-gray-600
                            "
                        >
                            {
                                documentRequest
                                    .remarks
                            }
                        </Text>

                    </View>

                )}


                {/* --------------------------------------------------------- */}
                {/* Request History */}
                {/* --------------------------------------------------------- */}

                <View
                    className="
                        mb-5
                        rounded-2xl
                        bg-white
                        p-5
                    "
                >

                    <Text
                        className="
                            mb-4
                            text-lg
                            font-semibold
                            text-gray-900
                        "
                    >
                        Request History
                    </Text>


                    {logs.length === 0 ? (

                        <Text
                            className="
                                text-gray-500
                            "
                        >
                            No history available.
                        </Text>

                    ) : (

                        logs.map(
                            (
                                log,
                                index
                            ) => (

                                <View
                                    key={
                                        `${log.created_at}-${index}`
                                    }
                                    className="
                                        mb-5
                                    "
                                >

                                    <View
                                        className="
                                            flex-row
                                            items-center
                                        "
                                    >

                                        <View
                                            className="
                                                h-3
                                                w-3
                                                rounded-full
                                                bg-green-700
                                            "
                                        />


                                        <Text
                                            className="
                                                ml-3
                                                font-semibold
                                                text-gray-800
                                            "
                                        >
                                            {
                                                log.status_label
                                            }
                                        </Text>

                                    </View>


                                    {log.remarks && (

                                        <Text
                                            className="
                                                ml-6
                                                mt-1
                                                text-gray-500
                                            "
                                        >
                                            {
                                                log.remarks
                                            }
                                        </Text>

                                    )}


                                    <Text
                                        className="
                                            ml-6
                                            mt-1
                                            text-xs
                                            text-gray-400
                                        "
                                    >
                                        {
                                            formatDate(
                                                log.created_at
                                            )
                                        }
                                    </Text>

                                </View>

                            )
                        )

                    )}

                </View>

                <Modal
                    visible={paymentMethodModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() =>
                        setPaymentMethodModalVisible(false)
                    }
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-6">
                            <View className="mb-5 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-xl font-bold text-gray-900">
                                        Payment Method
                                    </Text>

                                    <Text className="mt-1 text-gray-500">
                                        Choose how you would like to pay.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() =>
                                        setPaymentMethodModalVisible(false)
                                    }
                                    className="rounded-full bg-gray-100 px-3 py-2"
                                >
                                    <Text className="text-lg font-semibold text-gray-600">
                                        ×
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    setPaymentMethodModalVisible(false);
                                    handlePayment("gcash");
                                }}
                                disabled={paymentLoading}
                                activeOpacity={0.8}
                                className="mb-3 rounded-2xl border border-green-700 p-4"
                            >
                                <Text className="text-base font-semibold text-green-700">
                                    Pay Online
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-gray-500">
                                    Pay securely through the available online
                                    payment options.
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setPaymentMethodModalVisible(false);
                                    handlePayment("over_the_counter");
                                }}
                                disabled={paymentLoading}
                                activeOpacity={0.8}
                                className="rounded-2xl border border-gray-300 p-4"
                            >
                                <Text className="text-base font-semibold text-gray-900">
                                    Cash / Over the Counter
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-gray-500">
                                    Pay the required amount at your barangay
                                    office.
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() =>
                                    setPaymentMethodModalVisible(false)
                                }
                                activeOpacity={0.8}
                                className="mt-4 items-center py-3"
                            >
                                <Text className="font-semibold text-gray-500">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ScrollView>

        </SafeAreaView>
    );
}


// -----------------------------------------------------------------------------
// Status Card
// -----------------------------------------------------------------------------

type StatusCardProps = {
    status: DocumentRequestStatus;
    statusLabel: string;
    deliveryMethod: DocumentDeliveryMethod;
};


function StatusCard({
    status,
    statusLabel,
    deliveryMethod,
}: StatusCardProps) {

    const config =
        getStatusConfig(
            status,
            deliveryMethod
        );


    return (

        <View
            className="
                mb-5
                rounded-2xl
                bg-white
                p-5
            "
        >

            <Text
                className="
                    mb-2
                    text-sm
                    text-gray-500
                "
            >
                Current Status
            </Text>


            <View
                className={`
                    self-start
                    rounded-full
                    px-4
                    py-2
                    ${config.badgeClass}
                `}
            >

                <Text
                    className={`
                        font-semibold
                        ${config.textClass}
                    `}
                >
                    {statusLabel}
                </Text>

            </View>


            <Text
                className="
                    mt-4
                    leading-6
                    text-gray-600
                "
            >
                {config.message}
            </Text>

        </View>
    );
}


// -----------------------------------------------------------------------------
// Payment Details
// -----------------------------------------------------------------------------

type PaymentDetailsProps = {
    payment: DocumentPayment;
};


function PaymentDetails({
    payment,
}: PaymentDetailsProps) {

    return (

        <>

            <InfoRow
                label="Amount"
                value={
                    `₱${Number(
                        payment.amount
                    ).toFixed(2)}`
                }
            />


            <InfoRow
                label="Payment Method"
                value={
                    payment
                        .payment_method_label
                }
            />


            <InfoRow
                label="Payment Status"
                value={
                    payment
                        .status_label
                }
            />


            {payment.reference_no && (

                <InfoRow
                    label="Reference No."
                    value={
                        payment.reference_no
                    }
                />

            )}


            {payment.paid_at && (

                <InfoRow
                    label="Paid At"
                    value={
                        formatDate(
                            payment.paid_at
                        )
                    }
                />

            )}

        </>
    );
}


// -----------------------------------------------------------------------------
// Information Row
// -----------------------------------------------------------------------------

type InfoRowProps = {
    label: string;
    value: string;
};


function InfoRow({
    label,
    value,
}: InfoRowProps) {

    return (

        <View className="mb-4">

            <Text
                className="
                    text-sm
                    text-gray-500
                "
            >
                {label}
            </Text>


            <Text
                className="
                    mt-1
                    font-semibold
                    text-gray-900
                "
            >
                {value}
            </Text>

        </View>
    );
}


// -----------------------------------------------------------------------------
// Status Configuration
// -----------------------------------------------------------------------------

function getStatusConfig(
    status: DocumentRequestStatus,
    deliveryMethod: DocumentDeliveryMethod
) {

    switch (status) {

        case "pending":

            return {
                badgeClass:
                    "bg-yellow-100",

                textClass:
                    "text-yellow-800",

                message:
                    "Your document request has been submitted and is awaiting review.",
            };


        case "under_review":

            return {
                badgeClass:
                    "bg-blue-100",

                textClass:
                    "text-blue-800",

                message:
                    "Your document request is currently being reviewed by the barangay.",
            };


        case "approved":

            return {
                badgeClass:
                    "bg-green-100",

                textClass:
                    "text-green-800",

                message:
                    "Your document request has been approved. Please check the next steps below.",
            };


        case "awaiting_payment":

            return {
                badgeClass:
                    "bg-yellow-100",

                textClass:
                    "text-yellow-800",

                message:
                    "Payment is required before your document can proceed to processing.",
            };


        case "payment_received":

            return {
                badgeClass:
                    "bg-green-100",

                textClass:
                    "text-green-800",

                message:
                    "Your payment has been received and verified. Your document will now proceed to processing.",
            };


        case "for_signature":

            return {
                badgeClass:
                    "bg-blue-100",

                textClass:
                    "text-blue-800",

                message:
                    "Your document has been approved and is currently awaiting the required signature.",
            };


        case "generating":

            return {
                badgeClass:
                    "bg-blue-100",

                textClass:
                    "text-blue-800",

                message:
                    "Your document is currently being prepared. Please wait for further updates.",
            };


        case "ready_for_release":

            return {
                badgeClass:
                    "bg-green-100",

                textClass:
                    "text-green-800",

                message:
                    deliveryMethod === "pickup"
                        ? "Your document is ready for pickup at the barangay office."
                        : "Your document is ready and can be downloaded digitally.",
            };


        case "released":

            return {
                badgeClass:
                    "bg-green-100",

                textClass:
                    "text-green-800",

                message:
                    deliveryMethod === "pickup"
                        ? "Your document has been released by the barangay."
                        : "Your document has been released and is available for digital download.",
            };


        case "downloaded":

            return {
                badgeClass:
                    "bg-green-100",

                textClass:
                    "text-green-800",

                message:
                    "Your document has been downloaded successfully.",
            };


        case "rejected":

            return {
                badgeClass:
                    "bg-red-100",

                textClass:
                    "text-red-800",

                message:
                    "Unfortunately, your document request was not approved.",
            };


        case "cancelled":

            return {
                badgeClass:
                    "bg-gray-200",

                textClass:
                    "text-gray-700",

                message:
                    "This document request has been cancelled.",
            };
    }
}


// -----------------------------------------------------------------------------
// Payment Visibility
// -----------------------------------------------------------------------------

function shouldShowPayment(
    documentRequest: DocumentRequest,
    latestPayment?: DocumentPayment
): boolean {

    return (
        documentRequest.status ===
            "awaiting_payment" ||

        documentRequest.status ===
            "payment_received" ||

        latestPayment !== undefined
    );
}


// -----------------------------------------------------------------------------
// Delivery Method
// -----------------------------------------------------------------------------

function getDeliveryMethodLabel(
    deliveryMethod: DocumentDeliveryMethod
): string {

    switch (deliveryMethod) {

        case "pickup":
            return "Pick up at Barangay Hall";

        case "download":
            return "Download Digitally";

        default:
            return "-";
    }
}


// -----------------------------------------------------------------------------
// Field Value Formatting
// -----------------------------------------------------------------------------

function formatFieldValue(
    value: unknown
): string {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }


    if (Array.isArray(value)) {

        return value
            .map(
                (item) =>
                    formatFieldValue(
                        item
                    )
            )
            .join(", ");
    }


    if (
        typeof value === "object"
    ) {

        return JSON.stringify(
            value
        );
    }


    return String(value);
}


// -----------------------------------------------------------------------------
// File Size Formatting
// -----------------------------------------------------------------------------

function formatFileSize(
    size: number
): string {

    if (
        !size ||
        size <= 0
    ) {
        return "Unknown size";
    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB",
    ];


    let value = size;

    let unitIndex = 0;


    while (
        value >= 1024 &&
        unitIndex <
            units.length - 1
    ) {

        value /= 1024;

        unitIndex++;
    }


    return `${value.toFixed(
        unitIndex === 0
            ? 0
            : 1
    )} ${units[unitIndex]}`;
}


// -----------------------------------------------------------------------------
// Date Formatting
// -----------------------------------------------------------------------------

function formatDate(
    value: string
): string {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }


    return date.toLocaleString(
        "en-PH",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );
}