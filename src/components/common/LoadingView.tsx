import {
    ActivityIndicator,
    Text,
    View,
} from "react-native";

interface Props {

    message?: string;

}

export function LoadingView({

    message = "Loading...",

}: Props) {

    return (

        <View className="flex-1 items-center justify-center">

            <ActivityIndicator
                size="large"
            />

            <Text className="mt-4 text-gray-500">

                {message}

            </Text>

        </View>

    );

}