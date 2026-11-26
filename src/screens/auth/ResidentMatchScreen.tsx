import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    useNavigation,
    useRoute,
} from "@react-navigation/native";

import { AuthService } from "@/services/auth.service";
import type { ResidentMatch } from "@/types/auth";

export function ResidentMatchScreen() {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const {
        verification_token,
    } = route.params;

    const [loading, setLoading] = useState(true);

    const [resident, setResident] =
        useState<ResidentMatch | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Load Resident
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadResident();

    }, []);

    const loadResident = async () => {

        try {

            setLoading(true);

            const response =
                await AuthService.matchResident({

                    verification_token,

                });

            if (
                !response.success ||
                !response.resident
            ) {

                Alert.alert(
                    "Resident Verification",
                    response.message,
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                navigation.goBack(),
                        },
                    ]
                );

                return;
            }

            setResident(
                response.resident
            );

        } catch (error: any) {

            Alert.alert(
                "Resident Verification",
                error?.response?.data?.message ??
                    "Unable to verify resident."
            );

        } finally {

            setLoading(false);

        }

    };

    /*
    |--------------------------------------------------------------------------
    | Continue Registration
    |--------------------------------------------------------------------------
    */

    const handleContinue = () => {

        navigation.navigate(
            "Register",
            {
                verification_token,
            }
        );

    };

    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <SafeAreaView className="flex-1 bg-white">

                <View className="flex-1 items-center justify-center">

                    <ActivityIndicator size="large" />

                    <Text className="mt-4 text-gray-500">

                        Loading resident information...

                    </Text>

                </View>

            </SafeAreaView>

        );

    }

    /*
    |--------------------------------------------------------------------------
    | Resident Information
    |--------------------------------------------------------------------------
    */

    return (

        <SafeAreaView className="flex-1 bg-white">

            <View className="flex-1 px-8 py-10">

                <Text className="text-3xl font-bold text-green-800">

                    Resident Found

                </Text>

                <Text className="mt-2 text-gray-500">

                    We found your resident record. Please verify
                    the information below before continuing.

                </Text>

                <View className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">

                    <View className="mb-5">

                        <Text className="text-sm text-gray-500">

                            Full Name

                        </Text>

                        <Text className="mt-1 text-lg font-semibold text-gray-900">

                            {resident?.full_name}

                        </Text>

                    </View>

                    <View className="mb-5">

                        <Text className="text-sm text-gray-500">

                            Household No.

                        </Text>

                        <Text className="mt-1 text-lg font-semibold text-gray-900">

                            {resident?.household_no}

                        </Text>

                    </View>

                    <View>

                        <Text className="text-sm text-gray-500">

                            Barangay

                        </Text>

                        <Text className="mt-1 text-lg font-semibold text-gray-900">

                            {resident?.barangay}

                        </Text>

                    </View>

                </View>

                <TouchableOpacity
                    onPress={handleContinue}
                    activeOpacity={0.8}
                    className="mt-10 rounded-xl bg-green-800 py-4"
                >

                    <Text className="text-center text-base font-semibold text-white">

                        Continue Registration

                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>

    );

}