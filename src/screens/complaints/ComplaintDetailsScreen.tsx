import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigation,
    useRoute,
    type RouteProp,
} from "@react-navigation/native";

import type {
    NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
    ArrowLeftIcon,
} from "react-native-heroicons/outline";

import { SafeAreaView } from "react-native-safe-area-context";

import complaintService from "@/services/complaint.service";

import type {
    Complaint,
} from "@/types/complaint";

import type {
    AppStackParamList,
} from "@/navigation/AppNavigator";

type ComplaintDetailsRouteProp =
    RouteProp<
        AppStackParamList,
        "ComplaintDetails"
    >;

export function ComplaintDetailsScreen() {

    const navigation =
        useNavigation<
            NativeStackNavigationProp<
                AppStackParamList
            >
        >();

    const route =
        useRoute<
            ComplaintDetailsRouteProp
        >();

    const {
        complaintId,
    } = route.params;

    const [
        complaint,
        setComplaint,
    ] = useState<Complaint | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const loadComplaint =
        useCallback(
            async (
                isRefresh = false
            ) => {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                try {

                    const response =
                        await complaintService
                            .getComplaint(
                                complaintId
                            );

                    setComplaint(
                        response.data.data
                    );

                } catch (error: any) {

                    console.error(
                        "Failed to load complaint:",
                        error
                    );

                    if (!isRefresh) {

                        Alert.alert(
                            "Unable to Load",
                            error.response?.data?.message ??
                            "Unable to load complaint details.",
                            [
                                {
                                    text: "Go Back",
                                    onPress: () =>
                                        navigation.goBack(),
                                },
                            ]
                        );

                    } else {

                        Alert.alert(
                            "Refresh Failed",
                            "Unable to refresh complaint details."
                        );

                    }

                } finally {

                    setLoading(false);
                    setRefreshing(false);

                }

            },
            [
                complaintId,
                navigation,
            ]
        );

    useEffect(() => {

        loadComplaint();

    }, [loadComplaint]);

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

    if (!complaint) {

        return (

            <SafeAreaView
                className="
                    flex-1
                    items-center
                    justify-center
                    bg-gray-100
                    px-5
                "
            >

                <Text className="
                    text-lg
                    font-semibold
                    text-gray-700
                ">
                    Complaint not found.
                </Text>

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    className="
                        mt-5
                        rounded-xl
                        bg-green-800
                        px-5
                        py-3
                    "
                >

                    <Text className="
                        font-semibold
                        text-white
                    ">
                        Go Back
                    </Text>

                </TouchableOpacity>

            </SafeAreaView>

        );

    }

    const statusConfig =
        getStatusConfig(
            complaint.status
        );

    const attachments =
        complaint.attachments ?? [];

    return (

        <SafeAreaView
            className="flex-1 bg-gray-100"
        >

            {/* Header */}

            <View className="
                flex-row
                items-center
                bg-green-800
                px-5
                py-4
            ">

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    className="
                        mr-4
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-green-700
                    "
                >

                    <ArrowLeftIcon
                        color="white"
                        size={22}
                    />

                </TouchableOpacity>

                <View className="flex-1">

                    <Text className="
                        text-xl
                        font-bold
                        text-white
                    ">
                        Complaint Details
                    </Text>

                    <Text className="
                        mt-1
                        text-sm
                        text-green-100
                    ">
                        {complaint.complaint_no}
                    </Text>

                </View>

            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() =>
                            loadComplaint(true)
                        }
                    />
                }
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 40,
                }}
            >

                {/* Status */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <View className="
                        flex-row
                        items-start
                        justify-between
                    ">

                        <View className="flex-1 pr-3">

                            <Text className="
                                text-lg
                                font-bold
                                text-gray-900
                            ">
                                {
                                    complaint
                                        .complaint_type
                                        ?.name ??
                                    "Complaint"
                                }
                            </Text>

                            <Text className="
                                mt-1
                                text-sm
                                text-gray-500
                            ">
                                {complaint.complaint_no}
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
                                {
                                    complaint.status_label
                                }
                            </Text>

                        </View>

                    </View>

                </View>

                {/* Complaint Information */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-4
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Complaint Information
                    </Text>

                    <InfoRow
                        label="Complaint Type"
                        value={
                            complaint
                                .complaint_type
                                ?.name ??
                            "-"
                        }
                    />

                    <InfoRow
                        label="Respondent"
                        value={
                            complaint
                                .respondent
                                ?.name ??
                            "-"
                        }
                    />

                    <InfoRow
                        label="Subject"
                        value={
                            complaint.subject
                        }
                    />

                </View>

                {/* Description */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Description
                    </Text>

                    <Text className="
                        text-base
                        leading-6
                        text-gray-700
                    ">
                        {
                            complaint.description
                        }
                    </Text>

                </View>

                {/* Supporting Documents */}

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

                        {attachments.map((attachment) => (
                            <View
                                key={attachment.uuid}
                                className="
                                    mb-3
                                    flex-row
                                    items-center
                                    rounded-xl
                                    bg-gray-50
                                    p-4
                                "
                            >

                                <View
                                    className="
                                        mr-3
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-green-100
                                    "
                                >

                                    <Text
                                        className="
                                            text-xs
                                            font-bold
                                            text-green-800
                                        "
                                    >
                                        FILE
                                    </Text>

                                </View>

                                <View
                                    className="
                                        flex-1
                                        pr-3
                                    "
                                >

                                    <Text
                                        numberOfLines={2}
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        {attachment.filename}
                                    </Text>

                                    <Text
                                        className="
                                            mt-1
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        {formatFileSize(
                                            attachment.size
                                        )}
                                    </Text>

                                </View>

                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate(
                                            "AttachmentViewer",
                                            {
                                                type: "complaint",

                                                complaintId:
                                                    complaint.id,

                                                attachmentUuid:
                                                    attachment.uuid,

                                                filename:
                                                    attachment.filename,

                                                mimeType:
                                                    attachment.mime_type,
                                            }
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
                                            text-xs
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        View
                                    </Text>

                                </TouchableOpacity>

                            </View>
                        ))}

                    </View>
                )}

                {/* Incident Information */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-4
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Incident Information
                    </Text>

                    <InfoRow
                        label="Incident Date"
                        value={
                            complaint
                                .incident_date_label ??
                            complaint.incident_date
                        }
                    />

                    <InfoRow
                        label="Incident Time"
                        value={
                            complaint
                                .incident_time ??
                            "-"
                        }
                    />

                    <InfoRow
                        label="Location"
                        value={
                            complaint
                                .incident_location ??
                            "-"
                        }
                    />

                </View>

                {/* Resolution */}

                {complaint.resolution && (

                    <View className="
                        mb-5
                        rounded-2xl
                        bg-white
                        p-5
                    ">

                        <Text className="
                            mb-3
                            text-lg
                            font-semibold
                            text-gray-900
                        ">
                            Resolution
                        </Text>

                        <Text className="
                            text-base
                            leading-6
                            text-gray-700
                        ">
                            {
                                complaint.resolution
                            }
                        </Text>

                        {complaint.resolved_at_label && (

                            <Text className="
                                mt-3
                                text-xs
                                text-gray-400
                            ">
                                Resolved on{" "}
                                {
                                    complaint
                                        .resolved_at_label
                                }
                            </Text>

                        )}

                    </View>

                )}

                {/* Submission Information */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-4
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Submission Information
                    </Text>

                    <InfoRow
                        label="Source"
                        value={
                            complaint
                                .source_label ??
                            "-"
                        }
                    />

                    <InfoRow
                        label="Submitted"
                        value={
                            complaint
                                .created_at_label ??
                            complaint.created_at ??
                            "-"
                        }
                    />

                    {complaint.closed_at_label && (

                        <InfoRow
                            label="Closed"
                            value={
                                complaint
                                    .closed_at_label
                            }
                        />

                    )}

                </View>

            </ScrollView>

        </SafeAreaView>

    );

}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {

    return (

        <View className="mb-4">

            <Text className="
                text-xs
                text-gray-500
            ">
                {label}
            </Text>

            <Text className="
                mt-1
                text-sm
                leading-5
                text-gray-800
            ">
                {value}
            </Text>

        </View>

    );

}

function formatFileSize(
    bytes: number
): string {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}

function getStatusConfig(
    status: string
) {

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