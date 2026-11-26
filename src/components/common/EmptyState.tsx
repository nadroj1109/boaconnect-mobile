import {
    Text,
    View,
} from "react-native";

import {

    InboxIcon,

} from "react-native-heroicons/outline";

interface Props {

    title: string;

    description: string;

}

export function EmptyState({

    title,

    description,

}: Props) {

    return (

        <View className="flex-1 items-center justify-center px-8">

            <InboxIcon

                size={60}

                color="#9CA3AF"

            />

            <Text className="mt-5 text-xl font-semibold">

                {title}

            </Text>

            <Text className="mt-2 text-center text-gray-500">

                {description}

            </Text>

        </View>

    );

}