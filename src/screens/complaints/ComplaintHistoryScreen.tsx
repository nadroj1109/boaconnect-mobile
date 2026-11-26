import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    View,
} from "react-native";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import complaintService from "@/services/complaint.service";

import type {
    ResidentComplaintHistory,
} from "@/types/complaint";

export function ComplaintHistoryScreen() {

    const [
        complaints,
        setComplaints,
    ] = useState<ResidentComplaintHistory[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const loadHistory = useCallback(
        async () => {

            try {

                setError(null);

                const response =
                    await complaintService
                        .myComplaintHistory();

                setComplaints(
                    response.data?.data ?? []
                );

            } catch (error: any) {

                console.error(
                    error
                );

                setError(
                    error?.response?.data?.message ??
                    "Unable to load your complaint history."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        },
        []
    );

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    function handleRefresh() {

        setRefreshing(true);

        loadHistory();

    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">

            {error && (
                <View className="mx-4 mt-4 rounded-xl bg-red-50 p-4">
                    <Text className="text-sm text-red-700">
                        {error}
                    </Text>
                </View>
            )}

            <FlatList
                data={complaints}
                keyExtractor={(item) =>
                    String(item.id)
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={
                            handleRefresh
                        }
                    />
                }
                contentContainerStyle={{
                    padding: 16,
                    flexGrow: 1,
                }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-base font-semibold text-slate-700">
                            No complaint history
                        </Text>

                        <Text className="mt-1 text-center text-sm text-slate-500">
                            There are no complaints recorded
                            against you.
                        </Text>
                    </View>
                }
                renderItem={({
                    item,
                }) => (
                    <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">

                        <View className="flex-row items-start justify-between">

                            <View className="mr-3 flex-1">

                                <Text className="text-xs font-medium text-slate-500">
                                    {item.complaint_no}
                                </Text>

                                <Text className="mt-1 text-base font-semibold text-slate-900">
                                    {item.subject}
                                </Text>

                            </View>

                            <View className="rounded-full bg-slate-100 px-3 py-1">
                                <Text className="text-xs font-medium text-slate-700">
                                    {item.status_label}
                                </Text>
                            </View>

                        </View>

                        {item.complaint_type && (
                            <Text className="mt-3 text-sm text-slate-600">
                                {item.complaint_type.name}
                            </Text>
                        )}

                        {item.incident_date_label && (
                            <Text className="mt-1 text-sm text-slate-500">
                                Incident:{" "}
                                {item.incident_date_label}
                            </Text>
                        )}

                        {item.resolution && (
                            <View className="mt-3 rounded-xl bg-slate-50 p-3">
                                <Text className="text-xs font-semibold uppercase text-slate-500">
                                    Resolution
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-slate-700">
                                    {item.resolution}
                                </Text>
                            </View>
                        )}

                    </View>
                )}
            />

        </View>
    );
}