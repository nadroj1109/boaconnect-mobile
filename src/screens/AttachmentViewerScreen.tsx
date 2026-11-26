import React, {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    File,
    Paths,
} from "expo-file-system";

import {
    RouteProp,
    useNavigation,
    useRoute,
} from "@react-navigation/native";

import type {
    AppStackParamList,
} from "@/navigation/AppNavigator";

import documentRequestService from "@/services/documentRequest.service";
import complaintService from "@/services/complaint.service";

type AttachmentViewerRouteProp =
    RouteProp<
        AppStackParamList,
        "AttachmentViewer"
    >;

export function AttachmentViewerScreen() {

    const navigation =
        useNavigation();

    const route =
        useRoute<AttachmentViewerRouteProp>();

    const {
        attachmentUuid,
        filename,
        mimeType,
    } = route.params;

    const [
        fileUri,
        setFileUri,
    ] = useState<string | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    useEffect(() => {

        loadAttachment();

    }, []);

    async function loadAttachment() {

        try {

            setLoading(true);
            setError(null);

            let response;

            if (route.params.type === "document") {
                console.log(
                    "Loading document attachment:",
                    route.params.documentRequestId,
                    route.params.attachmentUuid
                );

                response =
                    await documentRequestService
                        .viewAttachment(
                            route.params.documentRequestId,
                            attachmentUuid
                        );

            } else {

                console.log(
                    "Loading complaint attachment:",
                    route.params.complaintId,
                    route.params.attachmentUuid
                );

                response =
                    await complaintService
                        .viewAttachment(
                            route.params.complaintId,
                            attachmentUuid
                        );

            }

            console.log(
                "Attachment response:",
                {
                    status: response.status,
                    contentType:
                        response.headers?.["content-type"],
                    contentDisposition:
                        response.headers?.["content-disposition"],
                    dataType:
                        typeof response.data,
                    dataLength:
                        response.data?.byteLength,
                }
            );

            const safeFilename =
                filename ||
                `attachment-${attachmentUuid}`;

            const destination =
                new File(
                    Paths.cache,
                    safeFilename
                );

            const bytes =
                new Uint8Array(
                    response.data
                );

            destination.write(bytes);

            setFileUri(
                destination.uri
            );

        } catch (error: any) {

            console.log(
                "Attachment request failed:",
                {
                    message: error.message,
                    code: error.code,
                    status: error.response?.status,
                    responseData: error.response?.data,
                    requestUrl:
                        error.config?.url,
                }
            );


            const message =
                error.response?.data?.message ??
                error.message ??
                "Unable to load the attachment.";

            setError(message);

            Alert.alert(
                "Unable to View",
                message
            );

        } finally {

            setLoading(false);

        }
    }

    const isPdf =
        mimeType ===
        "application/pdf";

    const isImage =
        mimeType?.startsWith(
            "image/"
        );

    return (
        <SafeAreaView
            className="
                flex-1
                bg-gray-950
            "
        >

            {/* Header */}

            <View
                className="
                    flex-row
                    items-center
                    border-b
                    border-gray-800
                    bg-gray-950
                    px-4
                    py-3
                "
            >

                <Pressable
                    onPress={() =>
                        navigation.goBack()
                    }
                    className="
                        mr-3
                        rounded-lg
                        bg-gray-800
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
                        Back
                    </Text>
                </Pressable>

                <Text
                    numberOfLines={1}
                    className="
                        flex-1
                        text-base
                        font-semibold
                        text-white
                    "
                >
                    {filename || "Attachment"}
                </Text>

            </View>

            {/* Viewer */}

            <View className="flex-1">

                {loading && (
                    <View
                        className="
                            flex-1
                            items-center
                            justify-center
                        "
                    >

                        <ActivityIndicator
                            size="large"
                            color="#ffffff"
                        />

                        <Text
                            className="
                                mt-3
                                text-sm
                                text-gray-300
                            "
                        >
                            Loading attachment...
                        </Text>

                    </View>
                )}

                {!loading &&
                    error && (
                        <View
                            className="
                                flex-1
                                items-center
                                justify-center
                                px-6
                            "
                        >

                            <Text
                                className="
                                    text-center
                                    text-gray-300
                                "
                            >
                                {error}
                            </Text>

                        </View>
                    )}

                {!loading &&
                    !error &&
                    fileUri &&
                    isImage && (
                        <Image
                            source={{
                                uri: fileUri,
                            }}
                            resizeMode="contain"
                            style={{
                                flex: 1,
                                width: "100%",
                            }}
                        />
                    )}

                {!loading &&
                    !error &&
                    fileUri &&
                    !isPdf &&
                    !isImage && (
                        <View
                            className="
                                flex-1
                                items-center
                                justify-center
                                px-6
                            "
                        >

                            <Text
                                className="
                                    text-center
                                    text-gray-300
                                "
                            >
                                This file type cannot be
                                previewed directly.
                            </Text>

                        </View>
                    )}

            </View>

        </SafeAreaView>
    );
}