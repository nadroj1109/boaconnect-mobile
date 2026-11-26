import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

import { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import {
    ChevronDownIcon,
    XMarkIcon,
} from "react-native-heroicons/outline";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/hooks/useAuth";

import documentRequestService, { type DocumentDeliveryMethod } from "@/services/documentRequest.service";
import documentTypeService, {
    type DocumentType,
    type DocumentTypeField,
    type DocumentTypeFieldOption,
} from "@/services/documentType.service";
import householdService, {
    type HouseholdMember
} from "@/services/household.service";

import type {
    DocumentRequestAttachmentFile,
} from "@/types/documentRequest";

import type { AppStackParamList } from "@/navigation/AppNavigator";

export function DocumentRequestScreen() {

    const navigation =
        useNavigation<
            NativeStackNavigationProp<AppStackParamList>
        >();

    const { resident } = useAuth();

    const [houseHoldMembers, setHouseHoldMembers] = useState<HouseholdMember[]>([]);

    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

    const [residentId, setResidentId] = useState<number | null>(null);

    const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);

    const [deliveryMethod, setDeliveryMethod] = useState<DocumentDeliveryMethod | null>(null);

    const [purpose, setPurpose] = useState("");

    const [remarks, setRemarks] = useState("");

    const [fieldValues, setFieldValues] =
        useState<
            Record<
                string,
                string | number | (string | number)[]
            >
        >({});

    const [attachments, setAttachments] = useState<
        Record<
            number,
            DocumentRequestAttachmentFile
        >
    >({});

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [showHouseholdMembers, setShowHouseholdMembers] = useState(false);

    const [showDocumentTypes, setShowDocumentTypes] = useState(false);

    const [showFieldOptions, setShowFieldOptions] = useState(false);

    const [activeField, setActiveField] = useState<DocumentTypeField | null>(null);

    useEffect(() => {

        loadHouseholdMembers();
        // loadDocumentTypes();

    }, []);

    useEffect(() => {

        if (!residentId) {
            setDocumentTypes([]);
            return;
        }

        loadDocumentTypes();

    }, [residentId]);

    async function loadHouseholdMembers()
    {
        setLoading(true);

        try {

            const response = await householdService.getMembers();
            console.log(response.data.data);

            setHouseHoldMembers(
                response.data.data
            );

        } catch (error: any) {

            console.log(
                "Household Member Error:",
                error.response?.data
            );

            Alert.alert(
                "Unable to Load",
                "Unable to load available household members."
            );

        } finally {

            setLoading(false);

        }
    }

    async function loadDocumentTypes() {
        if (!residentId) {
            return;
        }

        setLoading(true);

        try {

            const response = await documentTypeService.getAvailableDocumentTypes(residentId);
            // console.log(response.data.data);

            setDocumentTypes(
                response.data.data
            );

        } catch (error: any) {

            console.log(
                "Document Types Error:",
                error.response?.data
            );

            Alert.alert(
                "Unable to Load",
                "Unable to load available document types."
            );

        } finally {

            setLoading(false);

        }

    }

    const selectedHouseholdMember =
        houseHoldMembers.find(
            member => member.id === residentId
        );

    const selectedDocumentType =
        documentTypes.find(
            type => type.id === documentTypeId
        );

    useEffect(() => {
        if (!selectedDocumentType) {
            return;
        }

        console.log(
            "Selected Document Type:",
            JSON.stringify(
                selectedDocumentType,
                null,
                2
            )
        );
    }, [selectedDocumentType]);
    
    const fields =
        selectedDocumentType?.fields
            ?.filter(
                field =>
                    field.is_active
            )
            ?.sort(
                (a, b) =>
                    a.sort_order -
                    b.sort_order
            ) ?? [];

    const requirements =
        selectedDocumentType?.requirements
            ?.filter(
                requirement =>
                    requirement.is_active
            )
            ?.sort(
                (a, b) =>
                    a.sort_order -
                    b.sort_order
            ) ?? [];

    async function handleSubmit() {

        if (!resident?.id || !residentId) {

            Alert.alert(
                "Error",
                "Resident information is required."
            );

            return;

        }

        if (!documentTypeId) {

            Alert.alert(
                "Required",
                "Please select a document type."
            );

            return;

        }

        if (!deliveryMethod) {

            Alert.alert(
                "Required",
                "Please select a delivery method."
            );

            return;

        }

        if (!purpose.trim()) {

            Alert.alert(
                "Required",
                "Please enter the purpose of your request."
            );

            return;

        }   

        const missingFields = fields.filter(field => {
            const value = fieldValues[field.field_key];

            if (!field.is_required) {
                return false;
            }

            if (value === undefined || value === "") {
                return true;
            }

            if (Array.isArray(value) && value.length === 0) {
                return true;
            }

            return false;
        });

        if (
            missingFields.length > 0
        ) {
            Alert.alert(
                "Required Fields",
                `Please provide: ${missingFields
                    .map(
                        field =>
                            field.name
                    )
                    .join(", ")}.`
            );

            return;
        }

        const missingRequirements =
            requirements.filter(
                requirement =>
                    requirement.is_required &&
                    !attachments[requirement.id]
            );

        if (
            missingRequirements.length > 0
        ) {

            Alert.alert(
                "Required Documents",
                `Please attach: ${missingRequirements
                    .map(
                        requirement =>
                            requirement.name
                    )
                    .join(", ")}.`
            );

            return;

        }

        setSubmitting(true);

        try {

            console.log(
                "Document Request Field Values:",
                JSON.stringify(
                    fieldValues,
                    null,
                    2
                )
            );

            const response =
                await documentRequestService
                    .createDocumentRequest({

                        requested_for_resident_id:
                            residentId,

                        document_type_id:
                            documentTypeId,

                        delivery_method:
                            deliveryMethod,

                        purpose:
                            purpose.trim(),

                        remarks:
                            remarks.trim() ||
                            undefined,

                        fields: fieldValues,

                        attachments,

                    });

            const request =
                response.data.data;

            Alert.alert(
                "Request Submitted",
                "Your document request has been submitted successfully.",
                [
                    {
                        text: "View Request",

                        onPress: () => {

                            navigation.replace(
                                "DocumentDetails",
                                {
                                    requestId:
                                        request.id,
                                }
                            );

                        },
                    },
                ]
            );

        } catch (error: any) {

            console.log(
                "Document Request Error:",
                error.response?.data
            );

            const message =
                error.response?.data?.message ??
                "Unable to submit your document request.";

            Alert.alert(
                "Request Failed",
                message
            );

        } finally {

            setSubmitting(false);

        }
    }

    async function handlePickAttachment(
        requirementId: number,
        allowedFileTypes: string[]
    ) {
        try {
            const result =
                await DocumentPicker.getDocumentAsync({
                    type:
                        allowedFileTypes.length > 0
                            ? allowedFileTypes
                            : "*/*",

                    copyToCacheDirectory: true,
                    multiple: false,
                });

            if (result.canceled) {
                return;
            }

            const file =
                result.assets?.[0];

            if (!file) {
                return;
            }

            const requirement =
                requirements.find(
                    item =>
                        item.id === requirementId
                );

            if (
                requirement &&
                file.size != null &&
                file.size >
                    requirement.max_file_size * 1024
            ) {
                Alert.alert(
                    "File Too Large",
                    `${requirement.name} must not exceed ${requirement.max_file_size} KB.`
                );

                return;
            }

            setAttachments(
                current => ({
                    ...current,

                    [requirementId]: {
                        uri: file.uri,

                        name:
                            file.name ??
                            "document",

                        type:
                            file.mimeType ??
                            "application/octet-stream",

                        size:
                            file.size,
                    },
                })
            );

        } catch (error) {
            console.log(
                "Document Picker Error:",
                error
            );

            Alert.alert(
                "Unable to Select File",
                "Unable to select the document."
            );
        }
    }

    function handleRemoveAttachment(
        requirementId: number
    ) {

        setAttachments(
            current => {

                const next = {
                    ...current,
                };

                delete next[
                    requirementId
                ];

                return next;
            }
        );

    }

    function handleFieldChange(
        fieldKey: string,
        value:
            | string
            | number
            | (string | number)[]
    ) {
        setFieldValues(current => ({
            ...current,
            [fieldKey]: value,
        }));
    }

    // console.log(
    //     JSON.stringify(
    //         documentTypes,
    //         null,
    //         2
    //     )
    // );

    function getFieldValue(
        field: DocumentTypeField
    ) {
        return fieldValues[field.field_key];
    }

    function openFieldOptions(
        field: DocumentTypeField
    ) {
        setActiveField(field);
        setShowFieldOptions(true);
    }

    function closeFieldOptions() {
        setShowFieldOptions(false);
        setActiveField(null);
    }

    function selectFieldOption(
        field: DocumentTypeField,
        option: DocumentTypeFieldOption
    ) {
        handleFieldChange(
            field.field_key,
            option.value
        );

        closeFieldOptions();
    }

    function renderDocumentField(
        field: DocumentTypeField
    ) {
        const value =
            getFieldValue(field);

        switch (field.field_type) {

            /*
            |--------------------------------------------------------------------------
            | TEXT
            |--------------------------------------------------------------------------
            */

            case "text":

                return (
                    <TextInput
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }

                        onChangeText={text =>
                            handleFieldChange(
                                field.field_key,
                                text
                            )
                        }

                        placeholder={field.name}

                        className="
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3
                            text-gray-900
                        "
                    />
                );


            /*
            |--------------------------------------------------------------------------
            | TEXTAREA
            |--------------------------------------------------------------------------
            */

            case "textarea":

                return (
                    <TextInput
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }

                        onChangeText={text =>
                            handleFieldChange(
                                field.field_key,
                                text
                            )
                        }

                        placeholder={field.name}

                        multiline

                        numberOfLines={4}

                        textAlignVertical="top"

                        className="
                            min-h-[110px]
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3
                            text-gray-900
                        "
                    />
                );


            /*
            |--------------------------------------------------------------------------
            | NUMBER
            |--------------------------------------------------------------------------
            */

            case "number":

                return (
                    <TextInput
                        value={
                            value === undefined
                                ? ""
                                : String(value)
                        }

                        onChangeText={text => {

                            if (text === "") {

                                handleFieldChange(
                                    field.field_key,
                                    ""
                                );

                                return;
                            }

                            const numericValue =
                                Number(text);

                            if (
                                !Number.isNaN(
                                    numericValue
                                )
                            ) {

                                handleFieldChange(
                                    field.field_key,
                                    numericValue
                                );

                            }

                        }}

                        placeholder={field.name}

                        keyboardType="numeric"

                        className="
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3
                            text-gray-900
                        "
                    />
                );


            /*
            |--------------------------------------------------------------------------
            | DATE
            |--------------------------------------------------------------------------
            */

            case "date":

                return (
                    <TextInput
                        value={
                            typeof value === "string"
                                ? value
                                : ""
                        }

                        onChangeText={text =>
                            handleFieldChange(
                                field.field_key,
                                text
                            )
                        }

                        placeholder="YYYY-MM-DD"

                        keyboardType="numbers-and-punctuation"

                        className="
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3
                            text-gray-900
                        "
                    />
                );


            /*
            |--------------------------------------------------------------------------
            | SELECT
            |--------------------------------------------------------------------------
            */

            case "select": {

                const selectedOption =
                    field.options?.find(
                        option =>
                            String(
                                option.value
                            ) ===
                            String(value)
                    );

                return (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                            openFieldOptions(field)
                        }

                        className="
                            flex-row
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3
                        "
                    >

                        <Text
                            className={
                                selectedOption
                                    ? "text-gray-900"
                                    : "text-gray-400"
                            }
                        >
                            {
                                selectedOption
                                    ? selectedOption.label
                                    : `Select ${field.name}`
                            }
                        </Text>

                        <ChevronDownIcon
                            size={20}
                            color="#6B7280"
                        />

                    </TouchableOpacity>
                );
            }


            /*
            |--------------------------------------------------------------------------
            | RADIO
            |--------------------------------------------------------------------------
            */

            case "radio":

                return (
                    <View className="gap-3">

                        {field.options?.map(
                            option => {

                                const selected =
                                    String(
                                        value
                                    ) ===
                                    String(
                                        option.value
                                    );

                                return (
                                    <TouchableOpacity
                                        key={
                                            String(
                                                option.value
                                            )
                                        }

                                        activeOpacity={0.8}

                                        onPress={() =>
                                            handleFieldChange(
                                                field.field_key,
                                                option.value
                                            )
                                        }

                                        className="
                                            flex-row
                                            items-center
                                        "
                                    >

                                        <View
                                            className={`
                                                h-5
                                                w-5
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                ${
                                                    selected
                                                        ? "border-blue-600"
                                                        : "border-gray-400"
                                                }
                                            `}
                                        >

                                            {selected && (
                                                <View
                                                    className="
                                                        h-2.5
                                                        w-2.5
                                                        rounded-full
                                                        bg-blue-600
                                                    "
                                                />
                                            )}

                                        </View>

                                        <Text
                                            className="
                                                ml-3
                                                text-gray-700
                                            "
                                        >
                                            {
                                                option.label
                                            }
                                        </Text>

                                    </TouchableOpacity>
                                );

                            }
                        )}

                    </View>
                );


            /*
            |--------------------------------------------------------------------------
            | CHECKBOX
            |--------------------------------------------------------------------------
            */

            case "checkbox": {

                const selectedValues =
                    Array.isArray(value)
                        ? value.map(String)
                        : [];

                return (
                    <View className="gap-3">

                        {field.options?.map(
                            option => {

                                const optionValue =
                                    String(
                                        option.value
                                    );

                                const selected =
                                    selectedValues.includes(
                                        optionValue
                                    );

                                return (
                                    <TouchableOpacity
                                        key={
                                            optionValue
                                        }

                                        activeOpacity={0.8}

                                        onPress={() => {

                                            const current =
                                                Array.isArray(
                                                    value
                                                )
                                                    ? value
                                                    : [];

                                            const exists =
                                                current.some(
                                                    item =>
                                                        String(
                                                            item
                                                        ) ===
                                                        optionValue
                                                );

                                            const updated =
                                                exists
                                                    ? current.filter(
                                                        item =>
                                                            String(
                                                                item
                                                            ) !==
                                                            optionValue
                                                    )
                                                    : [
                                                        ...current,
                                                        option.value,
                                                    ];

                                            handleFieldChange(
                                                field.field_key,
                                                updated
                                            );

                                        }}

                                        className="
                                            flex-row
                                            items-center
                                        "
                                    >

                                        <View
                                            className={`
                                                h-5
                                                w-5
                                                items-center
                                                justify-center
                                                rounded-md
                                                border
                                                ${
                                                    selected
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-gray-400 bg-white"
                                                }
                                            `}
                                        >

                                            {selected && (
                                                <Text
                                                    className="
                                                        text-xs
                                                        font-bold
                                                        text-white
                                                    "
                                                >
                                                    ✓
                                                </Text>
                                            )}

                                        </View>

                                        <Text
                                            className="
                                                ml-3
                                                text-gray-700
                                            "
                                        >
                                            {
                                                option.label
                                            }
                                        </Text>

                                    </TouchableOpacity>
                                );

                            }
                        )}

                    </View>
                );
            }


            default:
                return null;
        }
    }
        
    return (

        <SafeAreaView className="flex-1 bg-gray-100">

            {/* Header */}

            <View className="
                flex-row
                items-center
                justify-between
                bg-green-800
                px-5
                py-4
            ">

                <View>

                    <Text className="
                        text-2xl
                        font-bold
                        text-white
                    ">
                        Document Request
                    </Text>

                    <Text className="
                        mt-1
                        text-green-100
                    ">
                        Request a barangay document
                    </Text>

                </View>

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                    className="
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
                        size={24}
                    />

                </TouchableOpacity>

            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 40,
                }}
            >

                {/* Requester */}

                {/* <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Request Information
                    </Text>

                    <Text className="
                        mb-1
                        text-sm
                        text-gray-500
                    ">
                        Requested For
                    </Text>

                    <View className="
                        rounded-xl
                        border
                        border-gray-200
                        bg-gray-50
                        px-4
                        py-3
                    ">

                        <Text className="
                            text-base
                            font-medium
                            text-gray-900
                        ">
                            {resident?.full_name ?? "-"}
                        </Text>

                        <Text className="
                            mt-1
                            text-sm
                            text-gray-500
                        ">
                            Myself
                        </Text>

                    </View>

                </View> */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Request Information
                    </Text>

                    <Text className="
                        mb-2
                        text-sm
                        font-medium
                        text-gray-700
                    ">
                        Requested For
                    </Text>

                    <TouchableOpacity
                        disabled={loading}
                        onPress={() =>
                            setShowHouseholdMembers(true)
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
                            className={
                                selectedHouseholdMember
                                    ? "text-base text-gray-900"
                                    : "text-base text-gray-400"
                            }
                        >

                            {loading

                                ? "Loading household members..."

                                : selectedHouseholdMember?.full_name ??
                                "Select household member"

                            }

                        </Text>

                        {!loading && (

                            <ChevronDownIcon
                                color="#6b7280"
                                size={20}
                            />

                        )}

                    </TouchableOpacity>

                </View>

                {/* Document Type */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Document
                    </Text>

                    <Text className="
                        mb-2
                        text-sm
                        font-medium
                        text-gray-700
                    ">
                        Document Type
                    </Text>

                    <TouchableOpacity
                        disabled={loading || !residentId}
                        onPress={() =>
                            setShowDocumentTypes(true)
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
                            className={
                                selectedDocumentType
                                    ? "text-base text-gray-900"
                                    : "text-base text-gray-400"
                            }
                        >

                            {loading

                                ? "Loading document types..."

                                : !residentId

                                    ? "Select household member first"

                                    : selectedDocumentType?.name ??
                                    "Select document type"

                            }

                        </Text>

                        {!loading && residentId && (

                            <ChevronDownIcon
                                color="#6b7280"
                                size={20}
                            />

                        )}

                    </TouchableOpacity>

                </View>

                {/* Required Documents */}

                {requirements.length > 0 && (

                    <View className="
                        mb-5
                        rounded-2xl
                        bg-white
                        p-5
                    ">

                        <Text className="
                            mb-2
                            text-lg
                            font-semibold
                            text-gray-900
                        ">
                            Required Documents
                        </Text>

                        <Text className="
                            mb-4
                            text-sm
                            leading-5
                            text-gray-500
                        ">
                            Please attach the required documents
                            for this request.
                        </Text>


                        {requirements.map(
                            requirement => {

                                const attachment =
                                    attachments[
                                        requirement.id
                                    ];

                                return (

                                    <View
                                        key={
                                            requirement.id
                                        }
                                        className="
                                            mb-4
                                            rounded-xl
                                            border
                                            border-gray-200
                                            bg-gray-50
                                            p-4
                                        "
                                    >

                                        <View className="
                                            mb-3
                                        ">

                                            <Text className="
                                                text-base
                                                font-semibold
                                                text-gray-900
                                            ">

                                                {
                                                    requirement.name
                                                }

                                                {requirement.is_required && (

                                                    <Text className="
                                                        text-red-500
                                                    ">
                                                        {" *"}
                                                    </Text>

                                                )}

                                            </Text>


                                            {requirement.description && (

                                                <Text className="
                                                    mt-1
                                                    text-sm
                                                    leading-5
                                                    text-gray-500
                                                ">
                                                    {
                                                        requirement.description
                                                    }
                                                </Text>

                                            )}

                                        </View>


                                        {attachment ? (

                                            <View className="
                                                rounded-xl
                                                border
                                                border-green-200
                                                bg-green-50
                                                p-3
                                            ">

                                                <View className="
                                                    flex-row
                                                    items-center
                                                ">

                                                    <View className="
                                                        flex-1
                                                    ">

                                                        <Text
                                                            numberOfLines={1}
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-gray-900
                                                            "
                                                        >
                                                            {
                                                                attachment.name
                                                            }
                                                        </Text>

                                                        {attachment.size != null && (

                                                            <Text className="
                                                                mt-1
                                                                text-xs
                                                                text-gray-500
                                                            ">
                                                                {(
                                                                    attachment.size /
                                                                    1024
                                                                ).toFixed(1)} KB
                                                            </Text>

                                                        )}

                                                    </View>


                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            handleRemoveAttachment(
                                                                requirement.id
                                                            )
                                                        }
                                                        className="
                                                            ml-3
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            bg-red-100
                                                        "
                                                    >

                                                        <XMarkIcon
                                                            color="#dc2626"
                                                            size={20}
                                                        />

                                                    </TouchableOpacity>

                                                </View>


                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handlePickAttachment(
                                                            requirement.id,
                                                            requirement.allowed_file_types
                                                        )
                                                    }
                                                    className="
                                                        mt-3
                                                        items-center
                                                        rounded-lg
                                                        border
                                                        border-green-700
                                                        px-4
                                                        py-2
                                                    "
                                                >

                                                    <Text className="
                                                        text-sm
                                                        font-semibold
                                                        text-green-800
                                                    ">
                                                        Replace Document
                                                    </Text>

                                                </TouchableOpacity>

                                            </View>

                                        ) : (

                                            <TouchableOpacity
                                                onPress={() =>
                                                    handlePickAttachment(
                                                        requirement.id,
                                                        requirement.allowed_file_types_mobile
                                                    )
                                                }
                                                className="
                                                    items-center
                                                    rounded-xl
                                                    border
                                                    border-dashed
                                                    border-green-600
                                                    bg-green-50
                                                    px-4
                                                    py-4
                                                "
                                            >

                                                <Text className="
                                                    text-sm
                                                    font-semibold
                                                    text-green-800
                                                ">
                                                    Attach Document
                                                </Text>

                                                <Text className="
                                                    mt-1
                                                    text-xs
                                                    text-gray-500
                                                ">
                                                    Maximum size:{" "}
                                                    {
                                                        requirement.max_file_size
                                                    } KB
                                                </Text>

                                            </TouchableOpacity>

                                        )}

                                    </View>

                                );

                            }
                        )}

                    </View>

                )}

                {/* Purpose */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Purpose
                    </Text>

                    <TextInput
                        value={purpose}
                        onChangeText={setPurpose}
                        placeholder="Enter the purpose of your request"
                        placeholderTextColor="#9ca3af"
                        multiline
                        textAlignVertical="top"
                        className="
                            min-h-[120px]
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-3
                            text-base
                            text-gray-900
                        "
                    />

                </View>

                {/* Dynamic Fields */}

                {fields.length > 0 && (

                    <View className="mt-4">

                        <Text className="
                            mb-3
                            text-base
                            font-semibold
                            text-gray-900
                        ">
                            Additional Information
                        </Text>

                        {fields.map(field => (

                            <View
                                key={field.id}
                                className="mb-5"
                            >

                                <Text className="
                                    mb-2
                                    text-sm
                                    font-medium
                                    text-gray-700
                                ">
                                    {field.name}

                                    {field.is_required && (
                                        <Text className="text-red-500">
                                            {" *"}
                                        </Text>
                                    )}
                                </Text>

                                {field.description && (
                                    <Text className="
                                        mb-2
                                        text-xs
                                        leading-5
                                        text-gray-500
                                    ">
                                        {field.description}
                                    </Text>
                                )}

                                {renderDocumentField(field)}

                            </View>

                        ))}

                    </View>

                )}

                {/* Delivery Method */}

                <View className="
                    mb-5
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Delivery Method
                    </Text>

                    <Text className="
                        mb-3
                        text-sm
                        font-medium
                        text-gray-700
                    ">
                        How would you like to receive your document?
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            setDeliveryMethod("pickup")
                        }
                        className={`
                            mb-3
                            rounded-xl
                            border
                            px-4
                            py-4
                            ${
                                deliveryMethod === "pickup"
                                    ? "border-green-600 bg-green-50"
                                    : "border-gray-200 bg-gray-50"
                            }
                        `}
                    >

                        <View className="
                            flex-row
                            items-center
                        ">

                            <View className={`
                                h-5
                                w-5
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                ${
                                    deliveryMethod === "pickup"
                                        ? "border-green-600"
                                        : "border-gray-300"
                                }
                            `}>

                                {deliveryMethod === "pickup" && (
                                    <View className="
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        bg-green-600
                                    " />
                                )}

                            </View>

                            <View className="ml-3 flex-1">

                                <Text className="
                                    text-base
                                    font-semibold
                                    text-gray-900
                                ">
                                    Pick up at Barangay Hall
                                </Text>

                                <Text className="
                                    mt-1
                                    text-sm
                                    leading-5
                                    text-gray-500
                                ">
                                    Pick up the physical document
                                    at the barangay office.
                                </Text>

                            </View>

                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            setDeliveryMethod("download")
                        }
                        className={`
                            rounded-xl
                            border
                            px-4
                            py-4
                            ${
                                deliveryMethod === "download"
                                    ? "border-green-600 bg-green-50"
                                    : "border-gray-200 bg-gray-50"
                            }
                        `}
                    >

                        <View className="
                            flex-row
                            items-center
                        ">

                            <View className={`
                                h-5
                                w-5
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                ${
                                    deliveryMethod === "download"
                                        ? "border-green-600"
                                        : "border-gray-300"
                                }
                            `}>

                                {deliveryMethod === "download" && (
                                    <View className="
                                        h-2.5
                                        w-2.5
                                        rounded-full
                                        bg-green-600
                                    " />
                                )}

                            </View>

                            <View className="ml-3 flex-1">

                                <Text className="
                                    text-base
                                    font-semibold
                                    text-gray-900
                                ">
                                    Download Digitally
                                </Text>

                                <Text className="
                                    mt-1
                                    text-sm
                                    leading-5
                                    text-gray-500
                                ">
                                    Download the completed document
                                    through BOAConnect.
                                </Text>

                            </View>

                        </View>

                    </TouchableOpacity>

                </View>

                {/* Remarks */}

                <View className="
                    mb-6
                    rounded-2xl
                    bg-white
                    p-5
                ">

                    <Text className="
                        mb-3
                        text-lg
                        font-semibold
                        text-gray-900
                    ">
                        Remarks
                    </Text>

                    <TextInput
                        value={remarks}
                        onChangeText={setRemarks}
                        placeholder="Additional remarks (optional)"
                        placeholderTextColor="#9ca3af"
                        multiline
                        textAlignVertical="top"
                        className="
                            min-h-[100px]
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-3
                            text-base
                            text-gray-900
                        "
                    />

                </View>

                {/* Submit */}

                <TouchableOpacity
                    disabled={submitting || loading}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    className={`
                        items-center
                        rounded-xl
                        px-5
                        py-4
                        ${
                            submitting || loading
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
                                size="small"
                            />

                            <Text className="
                                ml-3
                                text-base
                                font-semibold
                                text-white
                            ">
                                Submitting...
                            </Text>

                        </View>

                    ) : (

                        <Text className="
                            text-base
                            font-semibold
                            text-white
                        ">
                            Submit Request
                        </Text>

                    )}

                </TouchableOpacity>

            </ScrollView>

            {/* Household Member Modal */}

            <Modal
                visible={showHouseholdMembers}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setShowHouseholdMembers(false)
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
                                Select Member
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setShowHouseholdMembers(false)
                                }
                            >

                                <XMarkIcon
                                    color="#374151"
                                    size={24}
                                />

                            </TouchableOpacity>

                        </View>

                        <ScrollView>

                            {houseHoldMembers.map(
                                houseHoldMember => (

                                    <TouchableOpacity
                                        key={
                                            houseHoldMember.id
                                        }
                                        onPress={() => {

                                            setResidentId(
                                                houseHoldMember.id
                                            );

                                            setDocumentTypeId(null);

                                            setDocumentTypes([]);

                                            setFieldValues({});

                                            setAttachments({});

                                            setShowHouseholdMembers(
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
                                            font-semibold
                                            text-gray-900
                                        ">
                                            {
                                                houseHoldMember.full_name
                                            }
                                        </Text>

                                    </TouchableOpacity>

                                )
                            )}

                        </ScrollView>

                    </View>

                </View>

            </Modal>

            {/* Document Type Modal */}

            <Modal
                visible={showDocumentTypes}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setShowDocumentTypes(false)
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
                                Select Document
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setShowDocumentTypes(false)
                                }
                            >

                                <XMarkIcon
                                    color="#374151"
                                    size={24}
                                />

                            </TouchableOpacity>

                        </View>

                        <ScrollView>

                            {documentTypes.map(
                                documentType => (

                                    <TouchableOpacity
                                        key={
                                            documentType.id
                                        }
                                        onPress={() => {

                                            setDocumentTypeId(
                                                documentType.id
                                            );
                                            setFieldValues({});
                                            setAttachments({});
                                            setShowDocumentTypes(
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
                                            font-semibold
                                            text-gray-900
                                        ">
                                            {
                                                documentType.name
                                            }
                                        </Text>

                                        {documentType.description && (

                                            <Text className="
                                                mt-1
                                                text-sm
                                                text-gray-500
                                            ">
                                                {
                                                    documentType.description
                                                }
                                            </Text>

                                        )}

                                    </TouchableOpacity>

                                )
                            )}

                        </ScrollView>

                    </View>

                </View>

            </Modal>

            <Modal
                visible={showFieldOptions}
                transparent
                animationType="slide"
                onRequestClose={
                    closeFieldOptions
                }
            >
                <View className="flex-1 justify-end bg-black/40">

                    <View
                        className="
                            max-h-[75%]
                            rounded-t-3xl
                            bg-white
                            px-5
                            pb-8
                            pt-5
                        "
                    >

                        <View
                            className="
                                mb-4
                                flex-row
                                items-center
                                justify-between
                            "
                        >

                            <Text
                                className="
                                    text-lg
                                    font-bold
                                    text-gray-900
                                "
                            >
                                {activeField?.name}
                            </Text>

                            <TouchableOpacity
                                onPress={
                                    closeFieldOptions
                                }
                                className="
                                    rounded-full
                                    bg-gray-100
                                    p-2
                                "
                            >
                                <XMarkIcon
                                    size={22}
                                    color="#374151"
                                />
                            </TouchableOpacity>

                        </View>

                        {/* <ScrollView
                            showsVerticalScrollIndicator={false}
                        > */}

                            <FlatList
                                data={activeField?.options ?? []}
                                keyExtractor={option =>
                                    String(option.value)
                                }
                                renderItem={({ item: option }) => {
                                    const currentValue =
                                        activeField
                                            ? fieldValues[
                                                activeField.field_key
                                            ]
                                            : undefined;

                                    const selected =
                                        String(currentValue) ===
                                        String(option.value);

                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (activeField) {
                                                    selectFieldOption(
                                                        activeField,
                                                        option
                                                    );
                                                }
                                            }}
                                            className="
                                                border-b
                                                border-gray-100
                                                px-5
                                                py-4
                                            "
                                        >
                                            <Text
                                                className={
                                                    selected
                                                        ? "font-semibold text-green-700"
                                                        : "text-base text-gray-800"
                                                }
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                                initialNumToRender={15}
                                maxToRenderPerBatch={15}
                                windowSize={10}
                                keyboardShouldPersistTaps="handled"
                            />

                            {(
                                activeField
                                    ?.options?.length ?? 0
                            ) === 0 && (

                                <View className="py-8">

                                    <Text
                                        className="
                                            text-center
                                            text-gray-500
                                        "
                                    >
                                        No options available.
                                    </Text>

                                </View>

                            )}

                        {/* </ScrollView> */}

                    </View>

                </View>
            </Modal>

        </SafeAreaView>

    );

}