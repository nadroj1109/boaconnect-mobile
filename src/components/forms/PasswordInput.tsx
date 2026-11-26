import { useState } from "react";

import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {

    EyeIcon,

    EyeSlashIcon,

} from "react-native-heroicons/outline";

interface Props {

    label: string;

    value: string;

    onChangeText: (text: string) => void;

    placeholder?: string;

}

export function PasswordInput({

    label,

    value,

    onChangeText,

    placeholder,

}: Props) {

    const [visible, setVisible] =
        useState(false);

    return (

        <View>

            <Text className="mb-2 text-gray-700">

                {label}

            </Text>

            <View className="flex-row items-center rounded-xl border border-gray-300 bg-white px-4">

                <TextInput

                    className="flex-1 py-4"

                    secureTextEntry={!visible}

                    value={value}

                    onChangeText={onChangeText}

                    placeholder={placeholder}

                />

                <TouchableOpacity

                    onPress={() =>
                        setVisible(!visible)
                    }

                >

                    {

                        visible

                            ? (

                                <EyeSlashIcon

                                    color="#6B7280"

                                    size={22}

                                />

                            )

                            : (

                                <EyeIcon

                                    color="#6B7280"

                                    size={22}

                                />

                            )

                    }

                </TouchableOpacity>

            </View>

        </View>

    );

}