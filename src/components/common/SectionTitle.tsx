import {
    Text,
} from "react-native";

interface Props {

    title: string;

}

export function SectionTitle({

    title,

}: Props) {

    return (

        <Text className="mb-4 text-lg font-semibold text-gray-800">

            {title}

        </Text>

    );

}