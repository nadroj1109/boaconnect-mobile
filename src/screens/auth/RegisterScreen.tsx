import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ClockIcon } from "react-native-heroicons/outline";

import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";

import { ResidentRegistrationForm } from "@/components/resident-registration/ResidentRegistrationForm";

import {
    initialResidentRegistrationForm,
    type ResidentRegistrationFormData,
} from "@/utils/residentRegistrationForm";

import type { RegisterResidentPayload } from "@/types/registration";

interface RegisterRouteParams {
    verification_token: string;
    expires_at: string;
    recipient: string;
    purpose: string;
}

export function RegisterScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const {
        verification_token,
        expires_at,
        recipient,
    } = route.params as RegisterRouteParams;

    const { initializeSession } = useAuth();

    const isEmailVerification = recipient?.includes("@") ?? false;

    const initialValues = useMemo(
        () => ({
            ...initialResidentRegistrationForm,
            email_address: isEmailVerification
                ? recipient
                : initialResidentRegistrationForm.email_address,
        }),
        [isEmailVerification, recipient],
    );

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    useEffect(() => {
        if (!expires_at) {
            setRemainingSeconds(0);
            return;
        }

        const updateCountdown = () => {
            const expiry = new Date(expires_at).getTime();
            const remaining = Math.max(
                0,
                Math.floor((expiry - Date.now()) / 1000),
            );

            setRemainingSeconds(remaining);
        };

        updateCountdown();

        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [expires_at]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remaining,
        ).padStart(2, "0")}`;
    };

    const handleRegister = async (
        form: ResidentRegistrationFormData,
    ) => {
        if (!verification_token) {
            Alert.alert(
                "Verification Required",
                "Your verification session is invalid. Please verify your account again.",
            );
            return;
        }

        if (remainingSeconds <= 0) {
            Alert.alert(
                "Verification Expired",
                "Your verification code has expired. Please verify your account again.",
            );
            return;
        }

        if (!password.trim()) {
            Alert.alert("Required", "Please enter your password.");
            return;
        }

        if (password.length < 8) {
            Alert.alert(
                "Invalid Password",
                "Your password must be at least 8 characters long.",
            );
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert(
                "Password Mismatch",
                "Your password confirmation does not match.",
            );
            return;
        }

        setLoading(true);

        try {
            const isHouseholdHead =
                form.relationship_to_hh_head === "household_head";

            const payload: RegisterResidentPayload = {
                ...form,
                requested_household_no: isHouseholdHead
                    ? null
                    : form.requested_household_no?.trim() || null,
                household_details: isHouseholdHead
                    ? form.household_details
                    : null,
                verification_token,
                password,
                password_confirmation: passwordConfirmation,
            };

            const response = await AuthService.register(payload);

            if (!response.success || !response.data) {
                throw new Error(
                    response.message || "Registration failed.",
                );
            }

            await initializeSession(
                response.data.token,
                response.data.user,
                response.data.resident,
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to complete your registration.";

            Alert.alert("Registration Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 pt-4 pb-3">
                <Text className="text-2xl font-bold text-gray-900">
                    Resident Registration
                </Text>

                <Text className="mt-1 text-sm text-gray-600">
                    Complete your information to create your BOAConnect
                    account.
                </Text>

                <View className="mt-4 flex-row items-center rounded-lg bg-blue-50 p-3">
                    <ClockIcon size={20} color="#2563EB" />

                    <View className="ml-2 flex-1">
                        <Text className="text-sm font-medium text-blue-900">
                            Verification session expires in
                        </Text>

                        <Text className="text-lg font-bold text-blue-700">
                            {formatTime(remainingSeconds)}
                        </Text>
                    </View>
                </View>

                {remainingSeconds <= 0 && (
                    <Text className="mt-2 text-sm text-red-600">
                        Your verification session has expired. Please
                        verify your account again.
                    </Text>
                )}
            </View>

            <View className="flex-1">
                <ResidentRegistrationForm
                    initialValues={initialValues}
                    emailEditable={!isEmailVerification}
                    loading={loading}
                    submitLabel="Complete Registration"
                    onSubmit={handleRegister}
                    footer={
                        <View className="mt-6">
                            <Text className="mb-4 text-lg font-semibold text-gray-800">
                                Account Password
                            </Text>

                            {/* Password */}
                            <Text className="mb-2 text-sm font-medium text-gray-700">
                                Password *
                            </Text>

                            <View className="mb-4 flex-row items-center rounded-xl border border-gray-300 bg-white px-4">
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="flex-1 py-3 text-gray-900"
                                />

                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text className="text-sm font-medium text-blue-700">
                                        {showPassword ? "Hide" : "Show"}
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Confirm Password */}
                            <Text className="mb-2 text-sm font-medium text-gray-700">
                                Confirm Password *
                            </Text>

                            <View className="flex-row items-center rounded-xl border border-gray-300 bg-white px-4">
                                <TextInput
                                    value={passwordConfirmation}
                                    onChangeText={setPasswordConfirmation}
                                    placeholder="Confirm your password"
                                    secureTextEntry={!showPasswordConfirmation}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="flex-1 py-3 text-gray-900"
                                />

                                <Pressable
                                    onPress={() =>
                                        setShowPasswordConfirmation(
                                            !showPasswordConfirmation
                                        )
                                    }
                                >
                                    <Text className="text-sm font-medium text-blue-700">
                                        {showPasswordConfirmation ? "Hide" : "Show"}
                                    </Text>
                                </Pressable>
                            </View>

                            <Text className="mt-2 text-xs text-gray-500">
                                Your password must be at least 8 characters long.
                            </Text>
                        </View>
                    }
                />
            </View>

            <View className="border-t border-gray-200 bg-white px-5 py-3">
                <Pressable
                    onPress={() => navigation.navigate("Login")}
                    disabled={loading}
                    className="items-center py-2"
                >
                    <Text className="font-semibold text-blue-700">
                        Back to Login
                    </Text>
                </Pressable>
            </View>

            {loading && (
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <View className="rounded-xl bg-white p-5">
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text className="mt-3 text-sm font-medium text-gray-700">
                            Creating your account...
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
