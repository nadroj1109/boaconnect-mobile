import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

import { RootNavigator } from "@/navigation/RootNavigator";

export default function App() {

    return (

        <QueryProvider>

            <AuthProvider>

                <NavigationContainer>

                    <RootNavigator />

                </NavigationContainer>

                <StatusBar style="dark" />

            </AuthProvider>

        </QueryProvider>

    );

}