import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    useNavigation,
    useRoute,
} from "@react-navigation/native";

import { AuthService } from "@/services/auth.service";
import { OtpInput } from "@/components/forms/OtpInput";

export function OtpVerificationScreen() {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const {
        recipient,
        channel,
        purpose,
        resend_after,
    } = route.params;

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const [counter, setCounter] = useState<number>(
        resend_after ?? 60
    );

    /*
    |--------------------------------------------------------------------------
    | Countdown Timer
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (counter <= 0) {
            return;
        }

        const timer = setTimeout(() => {

            setCounter(
                (previous: number) => previous - 1
            );

        }, 1000);

        return () => clearTimeout(timer);

    }, [counter]);

    /*
    |--------------------------------------------------------------------------
    | Verify OTP
    |--------------------------------------------------------------------------
    */

    const handleVerify = async () => {

        if (code.length !== 6) {

            Alert.alert(
                "Verification",
                "Please enter the 6-digit verification code."
            );

            return;
        }

        try {

            setLoading(true);

            const response =
                await AuthService.verifyOtp({

                    recipient,
                    purpose,
                    code,

                });

            console.log(response);

            if (!response.success) {

                Alert.alert(
                    "Verification",
                    response.message
                );

                return;
            }

            navigation.replace(
                // "ResidentMatch",
                "Register",
                {
                    verification_token: response.verification_token,
                    expires_at: response.expires_at,
                    recipient,
                    purpose,
                }
            );

        } catch (error: any) {

            Alert.alert(
                "Verification",
                error?.response?.data?.message ??
                    "Unable to verify code."
            );

        } finally {

            setLoading(false);

        }

    };

    /*
    |--------------------------------------------------------------------------
    | Resend OTP
    |--------------------------------------------------------------------------
    */

    const handleResend = async () => {

        try {

            setLoading(true);

            const response =
                await AuthService.sendVerification({

                    recipient,
                    channel,
                    purpose,

                });

            Alert.alert(
                "Verification",
                response.message
            );

            setCounter(
                response.resend_after ?? 60
            );

            setCode("");

        } catch (error: any) {

            Alert.alert(
                "Verification",
                error?.response?.data?.message ??
                    "Unable to resend verification code."
            );

        } finally {

            setLoading(false);

        }

    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <SafeAreaView className="flex-1 bg-white">

            <View className="flex-1 px-8 py-10">

                <Text className="text-3xl font-bold text-green-800">

                    Verification Code

                </Text>

                <Text className="mt-3 text-center text-gray-500">

                    A verification code has been sent to

                </Text>

                <Text className="mt-2 text-center font-semibold text-green-700">

                    {recipient}

                </Text>

                <Text className="mb-2 mt-10 text-gray-700">

                    Verification Code

                </Text>

                {/* <OtpInput 
                    value={code}
                    onChangeText={setCode}
                    length={6}
                ></OtpInput> */}

                <TextInput
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-center text-2xl tracking-[10px]"
                />

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={
                        loading ||
                        code.length !== 6
                    }
                    className={`mt-8 rounded-xl py-4 ${
                        code.length === 6
                            ? "bg-green-800"
                            : "bg-gray-400"
                    }`}
                >

                    {loading ? (

                        <ActivityIndicator color="white" />

                    ) : (

                        <Text className="text-center text-base font-semibold text-white">

                            Verify Code

                        </Text>

                    )}

                </TouchableOpacity>

                {counter > 0 ? (

                    <Text className="mt-6 text-center text-gray-500">

                        Resend code in {counter} seconds

                    </Text>

                ) : (

                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={loading}
                        className="mt-6"
                    >

                        <Text className="text-center font-medium text-green-800">

                            Resend Verification Code

                        </Text>

                    </TouchableOpacity>

                )}

            </View>

        </SafeAreaView>

    );

}