import axios from "axios";
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    EnvelopeIcon,
    DevicePhoneMobileIcon,
} from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";

import { AuthService } from "@/services/auth.service";

export function VerificationScreen() {

    const navigation = useNavigation<any>();

    const [recipient, setRecipient] = useState("");

    const [channel, setChannel] = useState<"email" | "sms">(
        "email"
    );

    const [loading, setLoading] = useState(false);

    const handleSend = async () => {

        if (!recipient.trim()) {

            Alert.alert(
                "Verification",
                channel === "email"
                    ? "Please enter your email address."
                    : "Please enter your mobile number."
            );

            return;

        }

        try {

            setLoading(true);

            const response =
                await AuthService.sendVerification({

                    recipient,

                    channel,

                    purpose: "register",

                });

            Alert.alert(

                "Verification",

                response.message,

                [

                    {

                        text: "Continue",

                        onPress: () =>

                            navigation.navigate(

                                "OtpVerification",

                                {

                                    recipient,

                                    channel,

                                    purpose: "register",

                                    resend_after:
                                        response.resend_after,

                                    expires_in:
                                        response.expires_in,

                                }

                            ),

                    },

                ]

            );

        }

        catch (error: any) {
            console.log(error);

            if (axios.isAxiosError(error)) {

                console.log(
                    "STATUS:",
                    error.response?.status
                );

                console.log(
                    "DATA:",
                    error.response?.data
                );

            }

            Alert.alert(

                "Verification",

                error?.response?.data?.message ??

                "Unable to send verification code."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <SafeAreaView className="flex-1 bg-white">

            <View className="flex-1 px-6 justify-center">

                <Text className="text-3xl font-bold text-green-800 text-center">

                    Resident Registration

                </Text>

                <Text className="mt-2 mb-10 text-center text-gray-500">

                    Verify your email address or mobile number.

                </Text>

                {/* Channel */}

                <View className="mb-6 flex-row">

                    <TouchableOpacity

                        onPress={() => setChannel("email")}

                        className={`flex-1 rounded-xl p-4 mr-2 ${
                            channel === "email"
                                ? "bg-green-700"
                                : "bg-gray-200"
                        }`}

                    >

                        <EnvelopeIcon

                            size={24}

                            color={
                                channel === "email"
                                    ? "white"
                                    : "#4B5563"
                            }

                        />

                        <Text
                            className={`mt-2 text-center font-semibold ${
                                channel === "email"
                                    ? "text-white"
                                    : "text-gray-700"
                            }`}
                        >

                            Email

                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity

                        onPress={() => setChannel("sms")}

                        className={`flex-1 rounded-xl p-4 ml-2 ${
                            channel === "sms"
                                ? "bg-green-700"
                                : "bg-gray-200"
                        }`}

                    >

                        <DevicePhoneMobileIcon

                            size={24}

                            color={
                                channel === "sms"
                                    ? "white"
                                    : "#4B5563"
                            }

                        />

                        <Text
                            className={`mt-2 text-center font-semibold ${
                                channel === "sms"
                                    ? "text-white"
                                    : "text-gray-700"
                            }`}
                        >

                            SMS

                        </Text>

                    </TouchableOpacity>

                </View>

                <TextInput

                    value={recipient}

                    onChangeText={setRecipient}

                    keyboardType={
                        channel === "email"
                            ? "email-address"
                            : "phone-pad"
                    }

                    autoCapitalize="none"

                    placeholder={
                        channel === "email"

                            ? "Email Address"

                            : "09XXXXXXXXX"

                    }

                    className="mb-6 rounded-xl border border-gray-300 p-4"

                />

                <TouchableOpacity

                    onPress={handleSend}

                    disabled={loading}

                    className="rounded-xl bg-green-700 p-4"

                >

                    {

                        loading

                            ? (

                                <ActivityIndicator color="white" />

                            )

                            : (

                                <Text className="text-center font-semibold text-white">

                                    Send Verification Code

                                </Text>

                            )

                    }

                </TouchableOpacity>

                <TouchableOpacity

                    className="mt-8"
                    onPress={() => navigation.navigate("Login")}

                >

                    <Text className="text-center text-green-700">

                        Back to Login

                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>

    );

}