import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import documentRequestService from "../../services/documentRequest.service";

export function DocumentListScreen({ navigation }: any) {

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRequests = useCallback(async () => {

        try {

            const response =
                await documentRequestService
                    .getDocumentRequests();

            setRequests(
                response.data.data
            );

        } catch (error) {

            console.error(
                "Failed to load document requests:",
                error
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    }, []);

    useFocusEffect(
        useCallback(() => {

            loadRequests();

        }, [loadRequests])
    );

    function handleRefresh() {

        setRefreshing(true);

        loadRequests();

    }

    if (loading) {

        return (
            <SafeAreaView
                className="flex-1 items-center justify-center bg-gray-100"
            >
                <ActivityIndicator />
            </SafeAreaView>
        );

    }

    return (
        <SafeAreaView
            className="flex-1 bg-gray-100"
        >

            <View className="flex-row items-center justify-between px-5 py-4">

                <View>

                    <Text className="text-2xl font-bold text-gray-900">
                        My Documents
                    </Text>

                    <Text className="mt-1 text-sm text-gray-500">
                        Track your document requests
                    </Text>

                </View>

                <Pressable
                    onPress={() =>
                        navigation.navigate(
                            "DocumentRequest"
                        )
                    }
                    className="
                        rounded-full
                        bg-green-700
                        px-4
                        py-2
                    "
                >

                    <Text className="font-semibold text-white">
                        + Request
                    </Text>

                </Pressable>

            </View>

            <FlatList

                data={requests}

                keyExtractor={(item) =>
                    String(item.id)
                }

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }

                contentContainerClassName="px-5 pb-6"

                ListEmptyComponent={

                    <View className="items-center py-16">

                        <Text className="text-lg font-semibold text-gray-700">
                            No document requests
                        </Text>

                        <Text className="mt-2 text-center text-sm text-gray-500">
                            You haven't submitted any document requests yet.
                        </Text>

                    </View>

                }

                renderItem={({ item }) => {

                    const statusConfig =
                        getStatusConfig(item.status);

                    return (

                        <Pressable
                            onPress={() =>
                                navigation.navigate(
                                    "DocumentDetails",
                                    {
                                        requestId: item.id,
                                    }
                                )
                            }
                            className="
                                mb-3
                                rounded-2xl
                                bg-white
                                p-4
                                shadow-sm
                            "
                        >

                            <View className="flex-row items-start justify-between">

                                <View className="flex-1">

                                    <Text className="text-base font-bold text-gray-900">
                                        {item.document_type?.name}
                                    </Text>

                                    <Text className="mt-1 text-xs text-gray-500">
                                        {item.request_no}
                                    </Text>

                                </View>

                                <View
                                    className={`
                                        rounded-full
                                        px-3
                                        py-1
                                        ${statusConfig.badgeClass}
                                    `}
                                >

                                    <Text
                                        className={`
                                            text-xs
                                            font-semibold
                                            ${statusConfig.textClass}
                                        `}
                                    >
                                        {item.status_label}
                                    </Text>

                                </View>

                            </View>

                            <View className="mt-4">

                                <Text className="text-xs text-gray-500">
                                    Requested for
                                </Text>

                                <Text className="mt-1 text-sm text-gray-800">
                                    {item.requested_for?.name}
                                </Text>

                            </View>

                            <Text className="mt-3 text-xs text-gray-400">
                                {item.requested_at_label}
                            </Text>

                        </Pressable>

                    );

                }}

            />

        </SafeAreaView>
    );
}

function getStatusConfig(status: string) {
    switch (status) {

        case "pending":
            return {
                badgeClass: "bg-yellow-100",
                textClass: "text-yellow-800",
            };

        case "approved":
            return {
                badgeClass: "bg-blue-100",
                textClass: "text-blue-800",
            };

        case "awaiting_payment":
            return {
                badgeClass: "bg-orange-100",
                textClass: "text-orange-800",
            };

        case "payment_received":
            return {
                badgeClass: "bg-indigo-100",
                textClass: "text-indigo-800",
            };

        case "for_signature":
            return {
                badgeClass: "bg-purple-100",
                textClass: "text-purple-800",
            };

        case "generating":
            return {
                badgeClass: "bg-blue-100",
                textClass: "text-blue-800",
            };

        case "ready_for_release":
            return {
                badgeClass: "bg-green-100",
                textClass: "text-green-800",
            };

        case "released":
            return {
                badgeClass: "bg-green-100",
                textClass: "text-green-800",
            };

        case "downloaded":
            return {
                badgeClass: "bg-green-100",
                textClass: "text-green-800",
            };

        case "rejected":
            return {
                badgeClass: "bg-red-100",
                textClass: "text-red-800",
            };

        case "cancelled":
            return {
                badgeClass: "bg-gray-100",
                textClass: "text-gray-800",
            };

        default:
            return {
                badgeClass: "bg-gray-100",
                textClass: "text-gray-800",
            };
    }
}