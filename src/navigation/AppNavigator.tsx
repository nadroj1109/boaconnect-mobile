import React from "react";
import {
    TouchableOpacity,
    type TouchableOpacityProps,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NavigatorScreenParams, CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ChevronDoubleLeftIcon, HomeIcon, DocumentTextIcon, BellIcon, UserIcon, PencilSquareIcon } from "react-native-heroicons/outline";

import { COLORS } from "@/constants/colors";

import { useAuth } from "@/hooks/useAuth";

// Import your screens
import { DashboardScreen } from "@/screens/app/DashboardScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { ResidentRegistrationResubmissionScreen } from "@/screens/auth/ResidentRegistrationResubmissionScreen";
import { DocumentListScreen } from "@/screens/documents/DocumentListScreen";
import { DocumentRequestScreen } from "@/screens/documents/DocumentRequestScreen";
import { DocumentDetailsScreen } from "@/screens/documents/DocumentDetailsScreen";
import { ComplaintListScreen } from "@/screens/complaints/ComplaintListScreen";
import { ComplaintCreateScreen } from "@/screens/complaints/ComplaintCreateScreen";
import { ComplaintDetailsScreen } from "@/screens/complaints/ComplaintDetailsScreen";
import { ComplaintHistoryScreen } from "@/screens/complaints/ComplaintHistoryScreen";
import { NotificationScreen } from "@/screens/notifications/NotificationScreen";
import { SettingsScreen } from "@/screens/settings/SettingsScreen";
import { AttachmentViewerScreen } from "@/screens/AttachmentViewerScreen";


// 1. Define types for the Tabs
export type TabParamList = {
    HomeTab: undefined;          // Displays DashboardScreen
    RequestsTab: undefined;      // Displays DocumentListScreen
    ComplaintTab: undefined;      // Displays ComplaintsListScreen
    NotificationsTab: undefined;  // Displays NotificationScreen
    ProfileTab: undefined;       // Displays ProfileScreen
};

// 2. Define types for the Main Stack (Detail screens stay here)
export type AppStackParamList = {
    MainTabs: NavigatorScreenParams<TabParamList>; // Holds the entire tab bar

    DocumentRequest: undefined;
    DocumentDetails: { requestId: number };

    AttachmentViewer:
    | {
        type: "document";
        documentRequestId: number;
        attachmentUuid: string;
        filename: string;
        mimeType: string;
    }
    | {
        type: "complaint";
        complaintId: number;
        attachmentUuid: string;
        filename: string;
        mimeType: string;
    };

    ComplaintList: undefined;
    ComplaintCreate: undefined;
    ComplaintDetails: { complaintId: number };
    ComplaintHistory: undefined;

    ResidentRegistrationResubmission: undefined;

    Settings: undefined;
};

// 3. TypeScript Helper types for your Screen Components (Optional but recommended)
export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>;
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, T>,
    NativeStackScreenProps<AppStackParamList>
>;

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// 4. Sub-Navigator: The Bottom Tab Bar Layout
function TabNavigator() {
    const { resident } = useAuth();

    const isResidentVerified = Boolean(resident?.household_id);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: isResidentVerified
                    ? COLORS.FOREST_GREEN
                    : "#9CA3AF",

                tabBarInactiveTintColor: isResidentVerified
                    ? COLORS.TEXT
                    : "#9CA3AF",
            }}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={DashboardScreen} 
                options={{ 
                    title: "Home",
                    tabBarIcon: ({focused}) => (
                        <HomeIcon size={25} color={ focused ? COLORS.FOREST_GREEN : COLORS.TEXT}  />
                    )
                }}
            />
            <Tab.Screen
                name="RequestsTab"
                component={DocumentListScreen}
                options={{
                    title: "Requests",
                    headerShown: true,
                    headerTitle: "Document Requests",
                    headerTitleAlign: "left",

                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...(props as unknown as TouchableOpacityProps)}
                            disabled={!isResidentVerified}
                            style={[
                                props.style,
                                !isResidentVerified && { opacity: 0.45 },
                            ]}
                        />
                    ),

                    tabBarIcon: ({ focused }) => (
                        <DocumentTextIcon
                            size={25}
                            color={
                                isResidentVerified && focused
                                    ? COLORS.FOREST_GREEN
                                    : !isResidentVerified
                                        ? "#9CA3AF"
                                        : COLORS.TEXT
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ComplaintTab"
                component={ComplaintListScreen}
                options={{
                    title: "Complaints",
                    headerShown: true,
                    headerTitle: "Complaints",
                    headerTitleAlign: "left",

                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...(props as unknown as TouchableOpacityProps)}
                            disabled={!isResidentVerified}
                            style={[
                                props.style,
                                !isResidentVerified && { opacity: 0.45 },
                            ]}
                        />
                    ),

                    tabBarIcon: ({ focused }) => (
                        <PencilSquareIcon
                            size={25}
                            color={
                                isResidentVerified && focused
                                    ? COLORS.FOREST_GREEN
                                    : !isResidentVerified
                                        ? "#9CA3AF"
                                        : COLORS.TEXT
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="NotificationsTab" 
                component={NotificationScreen} 
                options={{ 
                    title: "Notifications",
                    tabBarIcon: ({focused}) => (
                        <BellIcon size={25} color={ focused ? COLORS.FOREST_GREEN : COLORS.TEXT} />
                    )
                 }}
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileScreen} 
                options={{ 
                    title: "Me",
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <UserIcon size={25} color={ focused ? COLORS.FOREST_GREEN : COLORS.TEXT} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

// 5. Main Navigator: Manages the App Stack Lifecycle
export function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            {/* The Tab bar is registered as a single master screen */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            <Stack.Screen
                name="ResidentRegistrationResubmission"
                component={ResidentRegistrationResubmissionScreen}
                options={{ headerShown: false }}
            />

            {/* Deep/Detail Screens live out here so they slide over the tab bar */}
            <Stack.Screen
                name="DocumentRequest"
                component={DocumentRequestScreen}
            />

            <Stack.Screen
                name="DocumentDetails"
                component={DocumentDetailsScreen}
                options={{
                    headerShown: true,
                    headerBackVisible: true,
                    headerTitle: "Document Details",
                    // headerLeft: () => (
                    //     <ChevronDoubleLeftIcon size={24} color="#000" style={{ marginLeft: 8 }} />
                    // ),
                }}
            />

            {/* <Stack.Screen
                name="ComplaintList"
                component={ComplaintListScreen}
            /> */}

            <Stack.Screen
                name="AttachmentViewer"
                component={AttachmentViewerScreen}
                options={{
                    headerShown: true,
                    headerTitle: "Supporting Document",
                }}
            />

            <Stack.Screen
                name="ComplaintCreate"
                component={ComplaintCreateScreen}
            />

            <Stack.Screen
                name="ComplaintDetails"
                component={ComplaintDetailsScreen}
            />

            <Stack.Screen
                name="ComplaintHistory"
                component={ComplaintHistoryScreen}
                options={{
                    headerShown: true,
                    headerTitle: "Complaint History",
                }}
            />

            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
            />
        </Stack.Navigator>
    );
}