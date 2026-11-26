import {
    Text,
    View,
} from "react-native";

import {

    ExclamationTriangleIcon,

} from "react-native-heroicons/outline";

interface Props {

    message: string;

}

export function ErrorView({

    message,

}: Props) {

    return (

        <View className="flex-1 items-center justify-center px-8">

            <ExclamationTriangleIcon

                size={60}

                color="#DC2626"

            />

            <Text className="mt-5 text-xl font-semibold text-red-700">

                Something went wrong

            </Text>

            <Text className="mt-2 text-center text-gray-500">

                {message}

            </Text>

        </View>

    );

}