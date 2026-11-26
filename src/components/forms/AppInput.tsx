import {
    Text,
    TextInput,
    View,
} from "react-native";

interface Props {

    label: string;

    value: string;

    onChangeText: (text: string) => void;

    placeholder?: string;

    keyboardType?:
        | "default"
        | "email-address"
        | "number-pad"
        | "phone-pad";

}

export function AppInput({

    label,

    value,

    onChangeText,

    placeholder,

    keyboardType = "default",

}: Props) {

    return (

        <View>

            <Text className="mb-2 text-gray-700">

                {label}

            </Text>

            <TextInput

                value={value}

                onChangeText={onChangeText}

                placeholder={placeholder}

                keyboardType={keyboardType}

                className="rounded-xl border border-gray-300 bg-white px-4 py-4"

            />

        </View>

    );

}