import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    UserCircleIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    BellIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ExclamationCircleIcon,
    ClockIcon,
} from "react-native-heroicons/outline";

import { useNavigation } from "@react-navigation/native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppNavigator";

import { useAuth } from "@/hooks/useAuth";

export function DashboardScreen() {
    const navigation =
        useNavigation<
            NativeStackNavigationProp<AppStackParamList>
        >();

    const { resident, logout } = useAuth();

    const isResidentVerified = Boolean(resident?.household_id);

    const registrationStatus =
        resident?.household_registration?.status;

    const isRegistrationRejected =
        !isResidentVerified && registrationStatus === "rejected";

    const isRegistrationPending =
        !isResidentVerified && registrationStatus === "pending";

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: logout,
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="rounded-b-3xl bg-green-800 px-6 pb-8 pt-8">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-3xl font-bold text-white">
                            BOAConnect
                        </Text>

                        <Text className="mt-2 text-green-100">
                            Welcome back,
                        </Text>

                        <Text className="text-xl font-semibold text-white">
                            {resident?.full_name}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={handleLogout}>
                        <ArrowRightOnRectangleIcon
                            color="white"
                            size={28}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: 20,
                }}
            >
                <View className="mb-6 rounded-2xl bg-white p-5">
                    <Text className="mb-4 text-lg font-semibold text-gray-800">
                        Resident Information
                    </Text>

                    <InfoRow
                        label="Barangay"
                        value={resident?.barangay_name ?? "-"}
                    />

                    <InfoRow
                        label="Email"
                        value={resident?.email_address ?? "-"}
                    />

                    <InfoRow
                        label="Mobile"
                        value={resident?.mobile_no ?? "-"}
                    />
                </View>

                {/* Registration Status */}
                {isRegistrationPending && (
                    <View className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <View className="flex-row items-center">
                            <ClockIcon
                                color="#D97706"
                                size={24}
                            />

                            <Text className="ml-2 text-lg font-semibold text-amber-800">
                                Registration Pending
                            </Text>
                        </View>

                        <Text className="mt-3 text-sm leading-6 text-amber-800">
                            Your resident registration is awaiting
                            verification by the Barangay Secretary.
                            You will be able to access resident services
                            once your registration has been approved and
                            a household has been assigned.
                        </Text>
                    </View>
                )}

                {isRegistrationRejected && (
                    <View className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                        <View className="flex-row items-center">
                            <ExclamationCircleIcon
                                color="#DC2626"
                                size={24}
                            />

                            <Text className="ml-2 text-lg font-semibold text-red-800">
                                Registration Rejected
                            </Text>
                        </View>

                        <Text className="mt-3 text-sm leading-6 text-red-800">
                            Your registration was not approved.
                            Please review the reason below and correct
                            your information before resubmitting.
                        </Text>

                        {resident?.household_registration?.rejection_reason && (
                            <View className="mt-3 rounded-lg bg-white p-3">
                                <Text className="text-xs font-semibold uppercase text-gray-500">
                                    Reason for Rejection
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-gray-800">
                                    {resident.household_registration.rejection_reason}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                navigation.navigate(
                                    "ResidentRegistrationResubmission"
                                )
                            }
                            className="mt-4 items-center rounded-xl bg-red-700 px-4 py-3"
                        >
                            <Text className="font-semibold text-white">
                                Correct Information and Resubmit
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text className="mb-4 text-lg font-semibold text-gray-800">
                    Quick Actions
                </Text>

                <DashboardCard
                    icon={
                        <UserCircleIcon
                            color="#166534"
                            size={28}
                        />
                    }
                    title="My Profile"
                    description="View your resident information."
                />

                <DashboardCard
                    icon={
                        <DocumentTextIcon
                            color={isResidentVerified ? "#166534" : "#9CA3AF"}
                            size={28}
                        />
                    }
                    title="Document Requests"
                    description="Request barangay certificates."
                    disabled={!isResidentVerified}
                    disabledNote="Unavailable until your account is verified by the Barangay Secretary."
                    onPress={() =>
                        navigation.navigate("MainTabs", {
                            screen: "RequestsTab",
                        })
                    }
                />

                <DashboardCard
                    icon={
                        <ChatBubbleLeftRightIcon
                            color={isResidentVerified ? "#166534" : "#9CA3AF"}
                            size={28}
                        />
                    }
                    title="Complaints"
                    description="Submit and monitor complaints."
                    disabled={!isResidentVerified}
                    disabledNote="Unavailable until your account is verified by the Barangay Secretary."
                    onPress={() =>
                        navigation.navigate("ComplaintList")
                    }
                />

                <DashboardCard
                    icon={
                        <BellIcon
                            color="#166534"
                            size={28}
                        />
                    }
                    title="Notifications"
                    description="Latest barangay announcements."
                />

                <DashboardCard
                    icon={
                        <Cog6ToothIcon
                            color="#166534"
                            size={28}
                        />
                    }
                    title="Settings"
                    description="Manage your account."
                />
            </ScrollView>
        </SafeAreaView>
    );
}

type DashboardCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    onPress?: () => void;
    disabled?: boolean;
    disabledNote?: string;
};

function DashboardCard({
    icon,
    title,
    description,
    onPress,
    disabled = false,
    disabledNote,
}: DashboardCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={disabled ? 1 : 0.8}
            onPress={onPress}
            disabled={disabled}
            className={`mb-4 rounded-2xl border p-5 ${
                disabled
                    ? "border-gray-200 bg-gray-100"
                    : "border-gray-200 bg-white"
            }`}
        >
            <View className="flex-row items-center">
                <View
                    className={`h-14 w-14 items-center justify-center rounded-xl ${
                        disabled ? "bg-gray-200" : "bg-green-100"
                    }`}
                >
                    {icon}
                </View>

                <View className="ml-4 flex-1">
                    <Text
                        className={`text-lg font-semibold ${
                            disabled ? "text-gray-400" : "text-gray-900"
                        }`}
                    >
                        {title}
                    </Text>

                    <Text
                        className={`mt-1 ${
                            disabled ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                        {description}
                    </Text>
                </View>
            </View>

            {disabled && disabledNote && (
                <View className="mt-4 flex-row items-start rounded-lg bg-amber-50 p-3">
                    <Text className="mr-2 text-amber-600">
                        ℹ
                    </Text>

                    <Text className="flex-1 text-xs leading-5 text-amber-800">
                        {disabledNote}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

type InfoRowProps = {
    label: string;
    value: string;
};

function InfoRow({
    label,
    value,
}: InfoRowProps) {
    return (
        <View className="mb-3 flex-row justify-between">
            <Text className="text-gray-500">
                {label}
            </Text>

            <Text className="font-semibold text-gray-900">
                {value}
            </Text>
        </View>
    );
}
