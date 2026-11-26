import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import {
    ChevronLeftIcon,
} from "react-native-heroicons/outline";

interface Props {

    title: string;

    subtitle?: string;

    showBack?: boolean;

}

export function AppHeader({

    title,

    subtitle,

    showBack = true,

}: Props) {

    const navigation = useNavigation();

    return (

        <View className="bg-green-800 px-6 pb-6 pt-8 rounded-b-3xl">

            {

                showBack && (

                    <TouchableOpacity

                        onPress={() => navigation.goBack()}

                        className="mb-5"

                    >

                        <ChevronLeftIcon

                            color="white"

                            size={26}

                        />

                    </TouchableOpacity>

                )

            }

            <Text className="text-3xl font-bold text-white">

                {title}

            </Text>

            {

                subtitle && (

                    <Text className="mt-2 text-green-100">

                        {subtitle}

                    </Text>

                )

            }

        </View>

    );

}