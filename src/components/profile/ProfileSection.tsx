import { ReactNode } from "react";

import {
    Text,
    View,
} from "react-native";

import { AppCard } from "@/components/common/AppCard";

interface Props {

    title: string;

    children: ReactNode;

}

export function ProfileSection({

    title,

    children,

}: Props) {

    return (

        <View className="mb-6">

            <Text className="mb-3 text-lg font-semibold text-gray-800">

                {title}

            </Text>

            <AppCard>

                {children}

            </AppCard>

        </View>

    );

}