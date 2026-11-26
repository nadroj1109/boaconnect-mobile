import {
    Text,
    View,
} from "react-native";

interface Props {

    name: string;

}

export function SectorBadge({

    name,

}: Props) {

    return (

        <View className="mr-2 mb-2 rounded-full bg-green-100 px-4 py-2">

            <Text className="font-medium text-green-800">

                {name}

            </Text>

        </View>

    );

}