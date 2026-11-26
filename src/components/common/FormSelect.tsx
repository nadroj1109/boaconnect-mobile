import { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

import type { SelectOption } from "@/types/registration";

interface FormSelectProps {
    label: string;
    value: string | number | boolean | undefined | null;
    options: SelectOption<string | number | boolean>[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    onChange: (value: string | number | boolean) => void;
}

export function FormSelect({
    label,
    value,
    options,
    placeholder = "Select an option",
    disabled = false,
    error,
    onChange,
}: FormSelectProps) {
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState("");

    const selected = options.find(
        (option) => String(option.value) === String(value)
    );

    const filtered = options.filter((option) =>
        option.name.toLowerCase().includes(search.toLowerCase())
    );

    const select = (
        option: SelectOption<string | number | boolean>
    ) => {
        onChange(option.value);
        setVisible(false);
        setSearch("");
    };

    return (
        <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
                {label}
            </Text>

            <Pressable
                disabled={disabled}
                onPress={() => setVisible(true)}
                className={`min-h-12 justify-center rounded-xl border px-4 ${
                    error ? "border-red-500" : "border-gray-300"
                } ${disabled ? "bg-gray-100" : "bg-white"}`}
            >
                <Text className={selected ? "text-gray-900" : "text-gray-400"}>
                    {selected?.name ?? placeholder}
                </Text>
            </Pressable>

            {error ? (
                <Text className="mt-1 text-xs text-red-500">{error}</Text>
            ) : null}

            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <View className="max-h-[75%] rounded-t-3xl bg-white p-5">
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-gray-900">
                                {label}
                            </Text>

                            <Pressable onPress={() => setVisible(false)}>
                                <Text className="font-semibold text-green-700">
                                    Close
                                </Text>
                            </Pressable>
                        </View>

                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search..."
                            className="mb-3 rounded-xl border border-gray-300 px-4 py-3"
                        />

                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => String(item.value)}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => select(item)}
                                    className="border-b border-gray-100 py-4"
                                >
                                    <Text className="text-gray-800">
                                        {item.name}
                                    </Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <Text className="py-6 text-center text-gray-500">
                                    No options found.
                                </Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
