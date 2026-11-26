import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
} from "react-native";

interface Props {

    title: string;

    onPress: () => void;

    loading?: boolean;

    disabled?: boolean;

}

export function AppButton({

    title,

    onPress,

    loading = false,

    disabled = false,

}: Props) {

    const isDisabled = loading || disabled;

    return (

        <TouchableOpacity

            activeOpacity={0.8}

            disabled={isDisabled}

            onPress={onPress}

            className={`rounded-xl py-4 ${
                isDisabled
                    ? "bg-green-400"
                    : "bg-green-800"
            }`}

        >

            {

                loading

                    ? (

                        <ActivityIndicator
                            color="white"
                        />

                    )

                    : (

                        <Text className="text-center text-base font-semibold text-white">

                            {title}

                        </Text>

                    )

            }

        </TouchableOpacity>

    );

}