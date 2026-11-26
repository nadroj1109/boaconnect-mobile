import {
    Text,
    View,
} from "react-native";

interface Props {

    label: string;

    value?: string | number | null;

}

export function ProfileInfoRow({

    label,

    value,

}: Props) {

    return (

        <View className="py-3 border-b border-gray-100">

            <Text className="text-sm text-gray-500">

                {label}

            </Text>

            <Text className="mt-1 text-base font-medium text-gray-900">

                {value || "-"}

            </Text>

        </View>

    );

}