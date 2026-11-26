import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";

export function LoginScreen() {

    const navigation = useNavigation<any>();

    const { login } = useAuth();

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {

        if (!username.trim()) {

            Alert.alert(
                "Login",
                "Please enter your username."
            );

            return;

        }

        if (!password.trim()) {

            Alert.alert(
                "Login",
                "Please enter your password."
            );

            return;

        }

        try {

            setLoading(true);

            const response = await login(
                username,
                password,
            );

            console.log(
                "========== LOGIN RESPONSE =========="
            );

            console.log("LOGIN RESPONSE:", response);

            console.log(
                "LOGIN SUCCESS:",
                response.success
            );

            if (!response.success) {

                Alert.alert(
                    "Login Failed",
                    response.message,
                );

                return;

            }

            // RootNavigator will automatically
            // switch to authenticated routes.

        }

        catch (error: any) {

            console.log(
                "========== LOGIN ERROR =========="
            );

            console.log("ERROR:", error);

            console.log(
                "IS AXIOS ERROR:",
                axios.isAxiosError(error)
            );

            if (axios.isAxiosError(error)) {

                console.log(
                    "STATUS:",
                    error.response?.status
                );

                console.log(
                    "DATA:",
                    error.response?.data
                );

                console.log(
                    "REQUEST:",
                    error.request
                );

            }

            Alert.alert(

                "Login Failed",

                error?.response?.data?.message ??
                "Unable to connect to the server."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <SafeAreaView className="flex-1 bg-white">

            <View className="flex-1 justify-center px-6">

                <Text className="mb-8 text-center text-4xl font-bold text-green-800">

                    BOAConnect

                </Text>

                <TextInput

                    value={username}

                    onChangeText={setUsername}

                    placeholder="Username"

                    autoCapitalize="none"

                    className="mb-4 rounded-xl border border-gray-300 p-4"

                />

                <TextInput

                    value={password}

                    onChangeText={setPassword}

                    placeholder="Password"

                    secureTextEntry

                    className="mb-6 rounded-xl border border-gray-300 p-4"

                />

                <TouchableOpacity

                    disabled={loading}

                    onPress={handleLogin}

                    className="rounded-xl bg-green-700 p-4"

                >

                    {

                        loading

                            ? (

                                <ActivityIndicator color="white" />

                            )

                            : (

                                <Text className="text-center font-semibold text-white">

                                    Sign In

                                </Text>

                            )

                    }

                </TouchableOpacity>

                <TouchableOpacity

                    className="mt-8"
                    onPress={() => navigation.navigate("Verification")}

                >

                    <Text className="text-center text-green-700">

                        Register as Resident

                    </Text>

                </TouchableOpacity>

            </View>

        </SafeAreaView>

    );

}