import {
    ReactNode,
} from "react";

import {
    View,
} from "react-native";

interface Props {

    children: ReactNode;

}

export function AppCard({

    children,

}: Props) {

    return (

        <View className="rounded-2xl bg-white p-5 shadow-sm">

            {children}

        </View>

    );

}