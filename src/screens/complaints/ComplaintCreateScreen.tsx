import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import DateTimePicker, {
    type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";

import * as DocumentPicker from "expo-document-picker";

import {
    ChevronDownIcon,
    PaperClipIcon,
    XMarkIcon,
} from "react-native-heroicons/outline";

import { SafeAreaView } from "react-native-safe-area-context";

import complaintService from "@/services/complaint.service";

import type {
    ComplaintRespondent,
    ComplaintType,
} from "@/types/complaint";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const MAX_FILE_SIZE =
    10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/*
|--------------------------------------------------------------------------
| Attachment Type
|--------------------------------------------------------------------------
*/

type ComplaintAttachmentFile = {
    uri: string;
    name: string;
    size: number;
    mimeType: string;
};

export function ComplaintCreateScreen({
    navigation,
}: any) {

    /*
    |--------------------------------------------------------------------------
    | Form State
    |--------------------------------------------------------------------------
    */

    const [
        respondentId,
        setRespondentId,
    ] = useState<number | null>(null);

    const [
        complaintTypeId,
        setComplaintTypeId,
    ] = useState<number | null>(null);

    const [
        subject,
        setSubject,
    ] = useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        incidentDate,
        setIncidentDate,
    ] = useState<Date | null>(null);

    const [
        incidentTime,
        setIncidentTime,
    ] = useState<Date | null>(null);

    const [
        incidentLocation,
        setIncidentLocation,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Lookup State
    |--------------------------------------------------------------------------
    */

    const [
        respondents,
        setRespondents,
    ] = useState<ComplaintRespondent[]>([]);

    const [
        complaintTypes,
        setComplaintTypes,
    ] = useState<ComplaintType[]>([]);

    const [
        loadingRespondents,
        setLoadingRespondents,
    ] = useState(true);

    const [
        loadingComplaintTypes,
        setLoadingComplaintTypes,
    ] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Modal State
    |--------------------------------------------------------------------------
    */

    const [
        respondentModalVisible,
        setRespondentModalVisible,
    ] = useState(false);

    const [
        complaintTypeModalVisible,
        setComplaintTypeModalVisible,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Date / Time Picker State
    |--------------------------------------------------------------------------
    */

    const [
        showDatePicker,
        setShowDatePicker,
    ] = useState(false);

    const [
        showTimePicker,
        setShowTimePicker,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Attachment State
    |--------------------------------------------------------------------------
    */

    const [
        attachments,
        setAttachments,
    ] = useState<
        ComplaintAttachmentFile[]
    >([]);

    const [
        pickingAttachment,
        setPickingAttachment,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Submit State
    |--------------------------------------------------------------------------
    */

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        uploadingAttachment,
        setUploadingAttachment,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Respondents
    |--------------------------------------------------------------------------
    */

    const loadRespondents =
        useCallback(async () => {

            setLoadingRespondents(true);

            try {

                const response =
                    await complaintService
                        .getRespondents();

                setRespondents(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "Failed to load respondents:",
                    error
                );

                Alert.alert(
                    "Unable to Load",
                    "Unable to load the list of respondents."
                );

            } finally {

                setLoadingRespondents(false);

            }

        }, []);

    /*
    |--------------------------------------------------------------------------
    | Load Complaint Types
    |--------------------------------------------------------------------------
    */

    const loadComplaintTypes =
        useCallback(async () => {

            setLoadingComplaintTypes(true);

            try {

                const response =
                    await complaintService
                        .getComplaintTypes();

                setComplaintTypes(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "Failed to load complaint types:",
                    error
                );

                Alert.alert(
                    "Unable to Load",
                    "Unable to load complaint types."
                );

            } finally {

                setLoadingComplaintTypes(false);

            }

        }, []);

    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadRespondents();
        loadComplaintTypes();

    }, [
        loadRespondents,
        loadComplaintTypes,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Selected Labels
    |--------------------------------------------------------------------------
    */

    const selectedRespondent =
        respondents.find(
            (item) =>
                item.value === respondentId
        );

    const selectedComplaintType =
        complaintTypes.find(
            (item) =>
                item.id === complaintTypeId
        );

    /*
    |--------------------------------------------------------------------------
    | Date Picker
    |--------------------------------------------------------------------------
    */

    function handleDateValueChange(
        event: DateTimePickerChangeEvent,
        selectedDate: Date,
    ) {
        setIncidentDate(selectedDate);
        setShowDatePicker(false);
    }

    function handleDateDismiss() {
        setShowDatePicker(false);
    }

    /*
    |--------------------------------------------------------------------------
    | Time Picker
    |--------------------------------------------------------------------------
    */

    function handleTimeValueChange(
        event: DateTimePickerChangeEvent,
        selectedTime: Date,
    ) {
        setIncidentTime(selectedTime);
        setShowTimePicker(false);
    }

    function handleTimeDismiss() {
        setShowTimePicker(false);
    }

    /*
    |--------------------------------------------------------------------------
    | Format Date for Display
    |--------------------------------------------------------------------------
    */

    function formatDate(
        date: Date | null
    ): string {

        if (!date) {
            return "Select incident date";
        }

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Format Date for API
    |--------------------------------------------------------------------------
    */

    function formatDateForApi(
        date: Date
    ): string {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

    /*
    |--------------------------------------------------------------------------
    | Format Time for Display
    |--------------------------------------------------------------------------
    */

    function formatTime(
        date: Date | null
    ): string {

        if (!date) {
            return "Select incident time";
        }

        return date.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Format Time for API
    |--------------------------------------------------------------------------
    */

    function formatTimeForApi(
        date: Date
    ): string {

        const hours =
            String(
                date.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                date.getMinutes()
            ).padStart(2, "0");

        return `${hours}:${minutes}`;

    }

    /*
    |--------------------------------------------------------------------------
    | Format File Size
    |--------------------------------------------------------------------------
    */

    function formatFileSize(
        size: number
    ): string {

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(
                size / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} MB`;

    }

    /*
    |--------------------------------------------------------------------------
    | Pick Attachments
    |--------------------------------------------------------------------------
    */

    async function handlePickAttachments() {

        if (submitting) {
            return;
        }

        setPickingAttachment(true);

        try {

            const result =
                await DocumentPicker
                    .getDocumentAsync({
                        type: ALLOWED_FILE_TYPES,
                        multiple: true,
                        copyToCacheDirectory: true,
                    });

            if (
                result.canceled ||
                !result.assets?.length
            ) {
                return;
            }

            const validFiles:
                ComplaintAttachmentFile[] = [];

            const rejectedFiles:
                string[] = [];

            for (
                const file
                of result.assets
            ) {

                const fileSize =
                    file.size ?? 0;

                const mimeType =
                    file.mimeType ??
                    "application/octet-stream";

                if (
                    fileSize >
                    MAX_FILE_SIZE
                ) {

                    rejectedFiles.push(
                        `${file.name} is larger than 10 MB.`
                    );

                    continue;
                }

                validFiles.push({
                    uri:
                        file.uri,

                    name:
                        file.name,

                    size:
                        fileSize,

                    mimeType,
                });

            }

            if (validFiles.length > 0) {

                setAttachments(
                    (current) => [
                        ...current,
                        ...validFiles,
                    ]
                );

            }

            if (
                rejectedFiles.length > 0
            ) {

                Alert.alert(
                    "Some Files Were Not Added",
                    rejectedFiles.join("\n")
                );

            }

        } catch (error) {

            console.error(
                "Failed to select attachments:",
                error
            );

            Alert.alert(
                "Unable to Select Files",
                "Unable to select the attachment files."
            );

        } finally {

            setPickingAttachment(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Remove Attachment
    |--------------------------------------------------------------------------
    */

    function handleRemoveAttachment(
        index: number
    ) {

        if (submitting) {
            return;
        }

        setAttachments(
            (current) =>
                current.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Upload Attachments
    |--------------------------------------------------------------------------
    */

    async function uploadAttachments(
        complaintId: number
    ) {

        if (
            attachments.length === 0
        ) {
            return;
        }

        setUploadingAttachment(true);

        try {

            for (
                const attachment
                of attachments
            ) {

                await complaintService
                    .uploadAttachment(
                        complaintId,
                        {
                            uri:
                                attachment.uri,

                            name:
                                attachment.name,

                            type:
                                attachment.mimeType,
                        }
                    );

            }

        } finally {

            setUploadingAttachment(false);

        }

    }

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    async function handleSubmit() {

        if (!respondentId) {

            Alert.alert(
                "Required Field",
                "Please select a respondent."
            );

            return;
        }

        if (!complaintTypeId) {

            Alert.alert(
                "Required Field",
                "Please select a complaint type."
            );

            return;
        }

        if (!subject.trim()) {

            Alert.alert(
                "Required Field",
                "Please enter the complaint subject."
            );

            return;
        }

        if (!description.trim()) {

            Alert.alert(
                "Required Field",
                "Please enter the complaint description."
            );

            return;
        }

        if (!incidentDate) {

            Alert.alert(
                "Required Field",
                "Please select the incident date."
            );

            return;
        }

        if (
            attachments.some(
                (file) =>
                    file.size >
                    MAX_FILE_SIZE
            )
        ) {

            Alert.alert(
                "Invalid Attachment",
                "Each attachment must be 10 MB or smaller."
            );

            return;
        }

        setSubmitting(true);

        try {

            /*
            |--------------------------------------------------------------------------
            | Create Complaint
            |--------------------------------------------------------------------------
            */

            const response =
                await complaintService
                    .createComplaint({
                        respondent_id:
                            respondentId,

                        complaint_type_id:
                            complaintTypeId,

                        subject:
                            subject.trim(),

                        description:
                            description.trim(),

                        incident_date:
                            formatDateForApi(
                                incidentDate
                            ),

                        incident_time:
                            incidentTime
                                ? formatTimeForApi(
                                    incidentTime
                                )
                                : null,

                        incident_location:
                            incidentLocation.trim()
                                ? incidentLocation.trim()
                                : null,
                    });

            const complaint =
                response.data.data;

            /*
            |--------------------------------------------------------------------------
            | Upload Attachments
            |--------------------------------------------------------------------------
            */

            try {

                await uploadAttachments(
                    complaint.id
                );

            } catch (attachmentError) {

                console.error(
                    "Failed to upload complaint attachment:",
                    attachmentError
                );

                Alert.alert(
                    "Complaint Submitted",
                    "Your complaint was submitted, but one or more attachments could not be uploaded. You can continue to the complaint details.",
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                navigation.replace(
                                    "ComplaintDetails",
                                    {
                                        complaintId:
                                            complaint.id,
                                    }
                                ),
                        },
                    ]
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            Alert.alert(
                "Complaint Submitted",
                attachments.length > 0
                    ? "Your complaint and attachments were submitted successfully."
                    : "Your complaint has been submitted successfully.",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            navigation.replace(
                                "ComplaintDetails",
                                {
                                    complaintId:
                                        complaint.id,
                                }
                            ),
                    },
                ]
            );

        } catch (error: any) {

            console.error(
                "Failed to submit complaint:",
                error
            );

            const message =
                error.response?.data?.message ??
                "Unable to submit your complaint. Please try again.";

            Alert.alert(
                "Submission Failed",
                message
            );

        } finally {

            setSubmitting(false);

        }

    }

    return (

        <SafeAreaView
            className="flex-1 bg-gray-100"
        >

            {/* Header */}

            <View className="
                flex-row
                items-center
                bg-green-800
                px-5
                py-4
            ">

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    disabled={submitting}
                    className="
                        mr-4
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-green-700
                    "
                >

                    <XMarkIcon
                        color="white"
                        size={22}
                    />

                </TouchableOpacity>

                <View className="flex-1">

                    <Text className="
                        text-2xl
                        font-bold
                        text-white
                    ">
                        Submit Complaint
                    </Text>

                    <Text className="
                        mt-1
                        text-sm
                        text-green-100
                    ">
                        Provide the details of your complaint
                    </Text>

                </View>

            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 40,
                }}
            >

                {/* Respondent */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-2
                        text-sm
                        font-semibold
                        text-gray-800
                    ">
                        Respondent
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            setRespondentModalVisible(
                                true
                            )
                        }
                        disabled={
                            loadingRespondents ||
                            submitting
                        }
                        className="
                            flex-row
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                        "
                    >

                        <Text
                            className={`
                                flex-1
                                text-base
                                ${
                                    selectedRespondent
                                        ? "text-gray-800"
                                        : "text-gray-400"
                                }
                            `}
                        >
                            {
                                loadingRespondents
                                    ? "Loading respondents..."
                                    : selectedRespondent?.label ??
                                      "Select respondent"
                            }
                        </Text>

                        {loadingRespondents ? (

                            <ActivityIndicator
                                size="small"
                            />

                        ) : (

                            <ChevronDownIcon
                                size={20}
                                color="#6B7280"
                            />

                        )}

                    </TouchableOpacity>

                </View>

                {/* Complaint Type */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-2
                        text-sm
                        font-semibold
                        text-gray-800
                    ">
                        Complaint Type
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            setComplaintTypeModalVisible(
                                true
                            )
                        }
                        disabled={
                            loadingComplaintTypes ||
                            submitting
                        }
                        className="
                            flex-row
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                        "
                    >

                        <Text
                            className={`
                                flex-1
                                text-base
                                ${
                                    selectedComplaintType
                                        ? "text-gray-800"
                                        : "text-gray-400"
                                }
                            `}
                        >
                            {
                                loadingComplaintTypes
                                    ? "Loading complaint types..."
                                    : selectedComplaintType?.name ??
                                      "Select complaint type"
                            }
                        </Text>

                        {loadingComplaintTypes ? (

                            <ActivityIndicator
                                size="small"
                            />

                        ) : (

                            <ChevronDownIcon
                                size={20}
                                color="#6B7280"
                            />

                        )}

                    </TouchableOpacity>

                </View>

                {/* Subject */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-2
                        text-sm
                        font-semibold
                        text-gray-800
                    ">
                        Subject
                    </Text>

                    <TextInput
                        value={subject}
                        onChangeText={setSubject}
                        editable={!submitting}
                        placeholder="Enter complaint subject"
                        placeholderTextColor="#9CA3AF"
                        maxLength={255}
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                            text-base
                            text-gray-800
                        "
                    />

                </View>

                {/* Description */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-2
                        text-sm
                        font-semibold
                        text-gray-800
                    ">
                        Description
                    </Text>

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        editable={!submitting}
                        multiline
                        textAlignVertical="top"
                        placeholder="Describe what happened"
                        placeholderTextColor="#9CA3AF"
                        className="
                            min-h-[140px]
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                            text-base
                            text-gray-800
                        "
                    />

                </View>

                {/* Incident Information */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-4
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Incident Information
                    </Text>

                    {/* Incident Date */}

                    <Text className="
                        mb-2
                        text-sm
                        font-semibold
                        text-gray-800
                    ">
                        Incident Date
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            setShowDatePicker(true)
                        }
                        disabled={submitting}
                        className="
                            mb-5
                            flex-row
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                        "
                    >

                        <Text
                            className={`
                                text-base
                                ${
                                    incidentDate
                                        ? "text-gray-800"
                                        : "text-gray-400"
                                }
                            `}
                        >
                            {
                                formatDate(
                                    incidentDate
                                )
                            }
                        </Text>

                        <Text className="
                            text-sm
                            text-green-700
                        ">
                            Select
                        </Text>

                    </TouchableOpacity>

                    {showDatePicker && (

                        <DateTimePicker
                            value={
                                incidentDate ??
                                new Date()
                            }
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onValueChange={
                                handleDateValueChange
                            }
                            onDismiss={
                                handleDateDismiss
                            }
                        />

                    )}

                    {/* Incident Time */}

                    <View className="
                        flex-row
                        items-center
                        justify-between
                    ">

                        <Text className="
                            text-sm
                            font-semibold
                            text-gray-800
                        ">
                            Incident Time
                        </Text>

                        <Text className="
                            text-xs
                            font-normal
                            text-gray-400
                        ">
                            Optional
                        </Text>

                    </View>

                    <TouchableOpacity
                        onPress={() =>
                            setShowTimePicker(true)
                        }
                        disabled={submitting}
                        className="
                            mt-2
                            flex-row
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                        "
                    >

                        <Text
                            className={`
                                text-base
                                ${
                                    incidentTime
                                        ? "text-gray-800"
                                        : "text-gray-400"
                                }
                            `}
                        >
                            {
                                formatTime(
                                    incidentTime
                                )
                            }
                        </Text>

                        <Text className="
                            text-sm
                            text-green-700
                        ">
                            Select
                        </Text>

                    </TouchableOpacity>

                    {showTimePicker && (

                        <DateTimePicker
                            value={
                                incidentTime ??
                                new Date()
                            }
                            mode="time"
                            display="default"
                            onValueChange={
                                handleTimeValueChange
                            }
                            onDismiss={
                                handleTimeDismiss
                            }
                        />

                    )}

                </View>

                {/* Incident Location */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <View className="
                        mb-2
                        flex-row
                        items-center
                        justify-between
                    ">

                        <Text className="
                            text-sm
                            font-semibold
                            text-gray-800
                        ">
                            Incident Location
                        </Text>

                        <Text className="
                            text-xs
                            text-gray-400
                        ">
                            Optional
                        </Text>

                    </View>

                    <TextInput
                        value={incidentLocation}
                        onChangeText={setIncidentLocation}
                        editable={!submitting}
                        placeholder="Enter incident location"
                        placeholderTextColor="#9CA3AF"
                        maxLength={255}
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-4
                            text-base
                            text-gray-800
                        "
                    />

                </View>

                {/* Attachments */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <View className="
                        flex-row
                        items-center
                        justify-between
                    ">

                        <View className="flex-1">

                            <Text className="
                                text-lg
                                font-semibold
                                text-gray-900
                            ">
                                Attachments
                            </Text>

                            <Text className="
                                mt-1
                                text-xs
                                text-gray-500
                            ">
                                Optional • Max 10 MB per file
                            </Text>

                        </View>

                        <PaperClipIcon
                            size={22}
                            color="#166534"
                        />

                    </View>

                    <TouchableOpacity
                        onPress={
                            handlePickAttachments
                        }
                        disabled={
                            submitting ||
                            pickingAttachment
                        }
                        className="
                            mt-4
                            flex-row
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            border-green-300
                            bg-green-50
                            px-4
                            py-4
                        "
                    >

                        {pickingAttachment ? (

                            <ActivityIndicator
                                color="#166534"
                            />

                        ) : (

                            <PaperClipIcon
                                size={20}
                                color="#166534"
                            />

                        )}

                        <Text className="
                            ml-2
                            text-sm
                            font-semibold
                            text-green-800
                        ">
                            {
                                pickingAttachment
                                    ? "Selecting files..."
                                    : "Add Attachments"
                            }
                        </Text>

                    </TouchableOpacity>

                    {/* Selected Files */}

                    {attachments.length > 0 && (

                        <View className="mt-4">

                            <Text className="
                                mb-2
                                text-xs
                                font-semibold
                                text-gray-500
                            ">
                                Selected Files
                            </Text>

                            {attachments.map(
                                (
                                    attachment,
                                    index
                                ) => (

                                    <View
                                        key={`${attachment.uri}-${index}`}
                                        className="
                                            mb-2
                                            flex-row
                                            items-center
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-gray-50
                                            px-3
                                            py-3
                                        "
                                    >

                                        <PaperClipIcon
                                            size={18}
                                            color="#6B7280"
                                        />

                                        <View className="
                                            ml-3
                                            flex-1
                                        ">

                                            <Text
                                                numberOfLines={1}
                                                className="
                                                    text-sm
                                                    font-medium
                                                    text-gray-800
                                                "
                                            >
                                                {
                                                    attachment.name
                                                }
                                            </Text>

                                            <Text className="
                                                mt-1
                                                text-xs
                                                text-gray-500
                                            ">
                                                {
                                                    formatFileSize(
                                                        attachment.size
                                                    )
                                                }
                                            </Text>

                                        </View>

                                        <TouchableOpacity
                                            onPress={() =>
                                                handleRemoveAttachment(
                                                    index
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                ml-2
                                                h-9
                                                w-9
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-gray-200
                                            "
                                        >

                                            <XMarkIcon
                                                size={18}
                                                color="#4B5563"
                                            />

                                        </TouchableOpacity>

                                    </View>

                                )
                            )}

                        </View>

                    )}

                </View>

                {/* Submit */}

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={
                        submitting ||
                        pickingAttachment
                    }
                    className={`
                        items-center
                        rounded-xl
                        px-5
                        py-4
                        ${
                            submitting
                                ? "bg-green-400"
                                : "bg-green-800"
                        }
                    `}
                >

                    {submitting ? (

                        <View className="
                            flex-row
                            items-center
                        ">

                            <ActivityIndicator
                                color="white"
                            />

                            <Text className="
                                ml-3
                                text-base
                                font-semibold
                                text-white
                            ">
                                {
                                    uploadingAttachment
                                        ? "Uploading attachments..."
                                        : "Submitting..."
                                }
                            </Text>

                        </View>

                    ) : (

                        <Text className="
                            text-base
                            font-semibold
                            text-white
                        ">
                            Submit Complaint
                        </Text>

                    )}

                </TouchableOpacity>

            </ScrollView>

            {/* Respondent Modal */}

            <Modal
                visible={
                    respondentModalVisible
                }
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setRespondentModalVisible(
                        false
                    )
                }
            >

                <View className="
                    flex-1
                    justify-end
                    bg-black/40
                ">

                    <View className="
                        max-h-[70%]
                        rounded-t-3xl
                        bg-white
                        p-5
                    ">

                        <View className="
                            mb-4
                            flex-row
                            items-center
                            justify-between
                        ">

                            <Text className="
                                text-xl
                                font-bold
                                text-gray-900
                            ">
                                Select Respondent
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setRespondentModalVisible(
                                        false
                                    )
                                }
                                className="
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gray-100
                                "
                            >

                                <XMarkIcon
                                    size={22}
                                    color="#374151"
                                />

                            </TouchableOpacity>

                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={
                                false
                            }
                        >

                            {respondents.length === 0 ? (

                                <View className="
                                    items-center
                                    py-10
                                ">

                                    <Text className="
                                        text-sm
                                        text-gray-500
                                    ">
                                        No respondents available.
                                    </Text>

                                </View>

                            ) : (

                                respondents.map(
                                    (item) => (

                                        <TouchableOpacity
                                            key={
                                                item.value
                                            }
                                            onPress={() => {

                                                setRespondentId(
                                                    item.value
                                                );

                                                setRespondentModalVisible(
                                                    false
                                                );

                                            }}
                                            className="
                                                mb-2
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                px-4
                                                py-4
                                            "
                                        >

                                            <Text className="
                                                text-base
                                                text-gray-800
                                            ">
                                                {
                                                    item.label
                                                }
                                            </Text>

                                        </TouchableOpacity>

                                    )
                                )

                            )}

                        </ScrollView>

                    </View>

                </View>

            </Modal>

            {/* Complaint Type Modal */}

            <Modal
                visible={
                    complaintTypeModalVisible
                }
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setComplaintTypeModalVisible(
                        false
                    )
                }
            >

                <View className="
                    flex-1
                    justify-end
                    bg-black/40
                ">

                    <View className="
                        max-h-[70%]
                        rounded-t-3xl
                        bg-white
                        p-5
                    ">

                        <View className="
                            mb-4
                            flex-row
                            items-center
                            justify-between
                        ">

                            <Text className="
                                text-xl
                                font-bold
                                text-gray-900
                            ">
                                Select Complaint Type
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setComplaintTypeModalVisible(
                                        false
                                    )
                                }
                                className="
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-gray-100
                                "
                            >

                                <XMarkIcon
                                    size={22}
                                    color="#374151"
                                />

                            </TouchableOpacity>

                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={
                                false
                            }
                        >

                            {complaintTypes.length === 0 ? (

                                <View className="
                                    items-center
                                    py-10
                                ">

                                    <Text className="
                                        text-sm
                                        text-gray-500
                                    ">
                                        No complaint types available.
                                    </Text>

                                </View>

                            ) : (

                                complaintTypes.map(
                                    (item) => (

                                        <TouchableOpacity
                                            key={
                                                item.id
                                            }
                                            onPress={() => {

                                                setComplaintTypeId(
                                                    item.id
                                                );

                                                setComplaintTypeModalVisible(
                                                    false
                                                );

                                            }}
                                            className="
                                                mb-2
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                px-4
                                                py-4
                                            "
                                        >

                                            <Text className="
                                                text-base
                                                font-medium
                                                text-gray-800
                                            ">
                                                {
                                                    item.name
                                                }
                                            </Text>

                                            {item.description && (

                                                <Text className="
                                                    mt-1
                                                    text-sm
                                                    text-gray-500
                                                ">
                                                    {
                                                        item.description
                                                    }
                                                </Text>

                                            )}

                                        </TouchableOpacity>

                                    )
                                )

                            )}

                        </ScrollView>

                    </View>

                </View>

            </Modal>

        </SafeAreaView>
    );
}