import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/services/auth.service";

import { ResidentRegistrationForm } from "@/components/resident-registration/ResidentRegistrationForm";

import {
    mapResidentToRegistrationForm,
} from "@/utils/residentRegistrationForm";

import type { ResidentRegistrationFormData } from "@/utils/residentRegistrationForm";
import type { ResidentRegistrationResubmissionPayload } from "@/types/registration";

export function ResidentRegistrationResubmissionScreen() {
    const navigation = useNavigation<any>();

    const { resident, restore } = useAuth();

    const [loading, setLoading] = useState(false);

    const isRejected =
        resident?.household_registration?.status === "rejected";

    const initialValues = useMemo(() => {
        if (!resident) {
            return null;
        }

        return mapResidentToRegistrationForm(resident);
    }, [resident]);

    useEffect(() => {
        if (resident && !isRejected) {
            Alert.alert(
                "Resubmission Unavailable",
                "Your registration is not currently marked as rejected.",
                [
                    {
                        text: "Go Back",
                        onPress: () => navigation.goBack(),
                    },
                ],
            );
        }
    }, [resident, isRejected, navigation]);

    const handleSubmit = async (
        form: ResidentRegistrationFormData,
    ) => {
        if (!resident || !isRejected) {
            Alert.alert(
                "Unable to Submit",
                "Only rejected resident registrations can be resubmitted.",
            );
            return;
        }

        setLoading(true);

        try {
            // Email is intentionally excluded because it cannot be changed.
            const {
                email_address: _emailAddress,
                ...resubmissionData
            } = form;

            const payload =
                resubmissionData as ResidentRegistrationResubmissionPayload;

            const response = await AuthService.resubmit(payload);

            if (!response.success) {
                throw new Error(
                    response.message || "Unable to resubmit your registration.",
                );
            }

            // Refresh the authenticated resident information from /me.
            await restore();

            Alert.alert(
                "Registration Resubmitted",
                "Your registration details have been submitted successfully. Please wait for the Secretary to review your updated information.",
                [
                    {
                        text: "Okay",
                        onPress: () => navigation.goBack(),
                    },
                ],
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while resubmitting your registration.";

            Alert.alert("Resubmission Failed", message);
        } finally {
            setLoading(false);
        }
    };

    if (!resident || !initialValues) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-3 text-sm text-gray-600">
                    Loading resident information...
                </Text>
            </SafeAreaView>
        );
    }

    if (!isRejected) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-6">
                <Text className="text-center text-lg font-semibold text-gray-900">
                    Resubmission Unavailable
                </Text>

                <Text className="mt-2 text-center text-sm text-gray-600">
                    Your registration does not currently require resubmission.
                </Text>

                <Pressable
                    onPress={() => navigation.goBack()}
                    className="mt-5 rounded-lg bg-blue-600 px-6 py-3"
                >
                    <Text className="font-semibold text-white">
                        Go Back
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="border-b border-gray-200 bg-white px-5 py-4">
                <Text className="text-xl font-bold text-gray-900">
                    Correct Registration Information
                </Text>

                <Text className="mt-1 text-sm text-gray-600">
                    Please review the reason for rejection, correct the
                    necessary information, and resubmit your registration.
                </Text>

                {resident.household_registration?.rejection_reason && (
                    <View className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <Text className="text-sm font-semibold text-red-800">
                            Reason for Rejection
                        </Text>

                        <Text className="mt-1 text-sm text-red-700">
                            {resident.household_registration.rejection_reason}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-1">
                <ResidentRegistrationForm
                    initialValues={initialValues}
                    emailEditable={false}
                    loading={loading}
                    submitLabel="Resubmit Registration"
                    onSubmit={handleSubmit}
                />
            </View>

            {loading && (
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <View className="rounded-xl bg-white p-5">
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text className="mt-3 text-sm font-medium text-gray-700">
                            Resubmitting your registration...
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
