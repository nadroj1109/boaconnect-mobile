import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "@/screens/auth/LoginScreen";
import { VerificationScreen } from "@/screens/auth/VerificationScreen";
import { OtpVerificationScreen } from "@/screens/auth/OtpVerificationScreen";
import { ResidentMatchScreen } from "@/screens/auth/ResidentMatchScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export function AuthNavigator() {

    return (

        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
            }}
        >

            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="Verification"
                component={VerificationScreen}
            />

            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

            <Stack.Screen
                name="ResidentMatch"
                component={ResidentMatchScreen}
            />

            <Stack.Screen
                name="Register"
                component={RegisterScreen}
            />

        </Stack.Navigator>

    );

}