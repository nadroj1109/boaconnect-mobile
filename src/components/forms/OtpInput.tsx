import {
    Text,
    TextInput,
    View,
} from "react-native";

interface Props {

    label?: string;

    value: string;

    onChangeText: (value: string) => void;

    length?: number;

}

export function OtpInput({

    label = "Verification Code",

    value,

    onChangeText,

    length = 6,

}: Props) {

    const handleChange = (text: string) => {

        const digits = text.replace(/\D/g, "");

        onChangeText(
            digits.slice(0, length)
        );

    };

    return (

        <View>

            <Text className="mb-2 text-gray-700">

                {label}

            </Text>

            <TextInput

                value={value}

                onChangeText={handleChange}

                keyboardType="number-pad"

                maxLength={length}

                placeholder={`Enter ${length}-digit code`}

                className="rounded-xl border border-gray-300 bg-white px-4 py-4 text-center text-2xl tracking-[10px]"

            />

        </View>

    );

}