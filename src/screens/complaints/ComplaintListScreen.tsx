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

import {
    ChevronRightIcon,
    ClipboardDocumentListIcon,
} from "react-native-heroicons/outline";

import complaintService from "@/services/complaint.service";

import type { Complaint } from "@/types/complaint";

export function ComplaintListScreen({ navigation }: any) {

    const [complaints, setComplaints] =
        useState<Complaint[]>([]);

    const [complaintHistoryCount, setComplaintHistoryCount] =
    useState(0);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const loadComplaints =
        useCallback(async () => {

            try {

                const [
                    complaintsResponse,
                    historyResponse,
                ] = await Promise.all([
                    complaintService.getComplaints(),
                    complaintService.myComplaintHistory(),
                ]);

                setComplaints(
                    complaintsResponse.data.data
                );

                setComplaintHistoryCount(
                historyResponse.data.data?.length ?? 0
            );

            } catch (error) {

                console.error(
                    "Failed to load complaints:",
                    error
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        }, []);

    useFocusEffect(
        useCallback(() => {

            loadComplaints();

        }, [loadComplaints])
    );

    function handleRefresh() {

        setRefreshing(true);

        loadComplaints();

    }

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

                <ActivityIndicator />

            </SafeAreaView>
        );

    }

    return (

        <SafeAreaView
            className="flex-1 bg-gray-100"
        >

            {/* Header */}

            <View className="
                flex-row
                items-center
                justify-between
                px-5
                py-4
            ">

                <View>

                    <Text className="
                        text-2xl
                        font-bold
                        text-gray-900
                    ">
                        My Complaints
                    </Text>

                    <Text className="
                        mt-1
                        text-sm
                        text-gray-500
                    ">
                        Track your submitted complaints
                    </Text>

                </View>

                <Pressable
                    onPress={() =>
                        navigation.navigate(
                            "ComplaintCreate"
                        )
                    }
                    className="
                        rounded-full
                        bg-green-700
                        px-4
                        py-2
                    "
                >

                    <Text className="
                        font-semibold
                        text-white
                    ">
                        + Complaint
                    </Text>

                </Pressable>

            </View>

            {/* Complaint History */}

            <View className="
                px-5
                pb-3
            ">

                <Pressable
                    onPress={() =>
                        navigation.navigate(
                            "ComplaintHistory"
                        )
                    }
                    className="
                        flex-row
                        items-center
                        rounded-2xl
                        bg-green-700
                        px-4
                        py-4
                        shadow-sm
                    "
                >

                    {/* Icon */}

                    <View className="
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/20
                    ">

                        <ClipboardDocumentListIcon
                            size={26}
                            color="white"
                        />

                    </View>

                    {/* Content */}

                    <View className="
                        ml-3
                        flex-1
                    ">

                        <View className="
                            flex-row
                            items-center
                        ">

                            <Text className="
                                text-base
                                font-bold
                                text-white
                            ">
                                Complaint History
                            </Text>

                            <View className="
                                ml-2
                                min-w-[24px]
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                px-2
                                py-0.5
                            ">

                                <Text className="
                                    text-xs
                                    font-bold
                                    text-green-700
                                ">
                                    {complaintHistoryCount}
                                </Text>

                            </View>

                        </View>

                        <Text className="
                            mt-1
                            text-xs
                            leading-4
                            text-green-100
                        ">
                            View complaints recorded against you.
                        </Text>

                    </View>

                    {/* Arrow */}

                    <View className="
                        ml-2
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-white/15
                    ">

                        <ChevronRightIcon
                            size={22}
                            color="white"
                        />

                    </View>

                </Pressable>

            </View>

            {/* Complaint List */}

            <FlatList

                data={complaints}

                keyExtractor={(item) =>
                    String(item.id)
                }

                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }

                contentContainerClassName="
                    px-5
                    pb-6
                "

                ListEmptyComponent={

                    <View className="
                        items-center
                        py-16
                    ">

                        <Text className="
                            text-lg
                            font-semibold
                            text-gray-700
                        ">
                            No complaints
                        </Text>

                        <Text className="
                            mt-2
                            text-center
                            text-sm
                            text-gray-500
                        ">
                            You haven't submitted any complaints yet.
                        </Text>

                    </View>

                }

                renderItem={({ item }) => {

                    const statusConfig =
                        getStatusConfig(
                            item.status
                        );

                    return (

                        <Pressable
                            onPress={() =>
                                navigation.navigate(
                                    "ComplaintDetails",
                                    {
                                        complaintId:
                                            item.id,
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

                            {/* Header */}

                            <View className="
                                flex-row
                                items-start
                                justify-between
                            ">

                                <View className="
                                    flex-1
                                    pr-3
                                ">

                                    <Text className="
                                        text-base
                                        font-bold
                                        text-gray-900
                                    ">
                                        {
                                            item.complaint_type?.name ??
                                            "Complaint"
                                        }
                                    </Text>

                                    <Text className="
                                        mt-1
                                        text-xs
                                        text-gray-500
                                    ">
                                        {item.complaint_no}
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

                            {/* Subject */}

                            <View className="
                                mt-4
                            ">

                                <Text className="
                                    text-xs
                                    text-gray-500
                                ">
                                    Subject
                                </Text>

                                <Text
                                    numberOfLines={2}
                                    className="
                                        mt-1
                                        text-sm
                                        text-gray-800
                                    "
                                >
                                    {item.subject}
                                </Text>

                            </View>

                            {/* Respondent */}

                            <View className="
                                mt-3
                            ">

                                <Text className="
                                    text-xs
                                    text-gray-500
                                ">
                                    Respondent
                                </Text>

                                <Text className="
                                    mt-1
                                    text-sm
                                    text-gray-800
                                ">
                                    {
                                        item.respondent?.name ??
                                        "-"
                                    }
                                </Text>

                            </View>

                            {/* Incident Date */}

                            <View className="
                                mt-3
                            ">

                                <Text className="
                                    text-xs
                                    text-gray-500
                                ">
                                    Incident Date
                                </Text>

                                <Text className="
                                    mt-1
                                    text-sm
                                    text-gray-800
                                ">
                                    {
                                        item.incident_date_label ??
                                        item.incident_date
                                    }
                                </Text>

                            </View>

                            {/* Submitted */}

                            <Text className="
                                mt-3
                                text-xs
                                text-gray-400
                            ">
                                {
                                    item.created_at_label ??
                                    item.created_at ??
                                    ""
                                }
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

        case "submitted":

            return {
                badgeClass: "bg-yellow-100",
                textClass: "text-yellow-800",
            };

        case "under_review":

            return {
                badgeClass: "bg-blue-100",
                textClass: "text-blue-800",
            };

        case "assigned":

            return {
                badgeClass: "bg-indigo-100",
                textClass: "text-indigo-800",
            };

        case "scheduled":

            return {
                badgeClass: "bg-purple-100",
                textClass: "text-purple-800",
            };

        case "hearing":

            return {
                badgeClass: "bg-orange-100",
                textClass: "text-orange-800",
            };

        case "resolved":

            return {
                badgeClass: "bg-green-100",
                textClass: "text-green-800",
            };

        case "closed":

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