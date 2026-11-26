import { useAuth } from "@/hooks/useAuth";

import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";

import { SplashScreen } from "@/screens/SplashScreen";

export function RootNavigator() {

    const {
        loading,
        authenticated,
    } = useAuth();

    if (loading) {
        return <SplashScreen />;
    }

    return authenticated
        ? <AppNavigator />
        : <AuthNavigator />;
}