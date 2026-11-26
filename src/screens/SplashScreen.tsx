import { View, Text, ActivityIndicator } from "react-native";

export function SplashScreen() {

    return (

        <View className="flex-1 items-center justify-center bg-white">

            <ActivityIndicator
                size="large"
                color="#2563EB"
            />

            <Text className="mt-6 text-xl font-bold text-gray-900">
                BOAConnect
            </Text>

            <Text className="mt-2 text-gray-500">
                Loading...
            </Text>

        </View>

    );

}