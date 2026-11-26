import { useEffect, useState, type ReactNode } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormSelect } from "@/components/common/FormSelect";
import { useRegistrationOptions } from "@/hooks/useRegistrationOptions";

import type {
    SectorOption,
    RegisterResidentPayload,
} from "@/types/registration";

import type {
    ResidentRegistrationFormData,
} from "@/utils/residentRegistrationForm";

interface ResidentRegistrationFormProps {
    initialValues: ResidentRegistrationFormData;
    emailEditable?: boolean;
    loading?: boolean;
    submitLabel: string;
    onSubmit: (form: ResidentRegistrationFormData) => Promise<void>;
    footer?: ReactNode;
}

/*
|--------------------------------------------------------------------------
| Reusable Input Field
|--------------------------------------------------------------------------
*/

function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    multiline = false,
    secureTextEntry = false,
    editable = true,
}: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    multiline?: boolean;
    secureTextEntry?: boolean;
    editable?: boolean;
}) {
    return (
        <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
                {label}
            </Text>

            <TextInput
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                placeholder={placeholder ?? label}
                keyboardType={keyboardType ?? "default"}
                multiline={multiline}
                secureTextEntry={secureTextEntry}
                textAlignVertical={multiline ? "top" : "center"}
                className={`rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 ${
                    multiline ? "min-h-24" : "min-h-12"
                }`}
            />
        </View>
    );
}

/*
|--------------------------------------------------------------------------
| Form Section
|--------------------------------------------------------------------------
*/

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <View className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="mb-4 text-lg font-bold text-green-800">
                {title}
            </Text>

            {children}
        </View>
    );
}

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/*
|--------------------------------------------------------------------------
| Resident Registration Form
|--------------------------------------------------------------------------
*/

export function ResidentRegistrationForm({
    initialValues,
    emailEditable = true,
    loading = false,
    submitLabel,
    onSubmit,
    footer,
}: ResidentRegistrationFormProps) {
    const [form, setForm] = useState<ResidentRegistrationFormData>(
        () => ({ ...initialValues })
    );

    /*
    |--------------------------------------------------------------------------
    | Update Form When Initial Values Change
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        console.log("INITIAL VALUES CHANGED:", initialValues.date_of_birth);
        setForm({ ...initialValues });
    }, [initialValues]);

    /*
    |--------------------------------------------------------------------------
    | Registration Options
    |--------------------------------------------------------------------------
    */

    const {
        options,
        ethnicities,
        sectors,
        regions,
        provinces,
        cities,
        barangays,
        sitioPuroks,
        loading: loadingOptions,
        error: optionsError,
    } = useRegistrationOptions(
        form.region_id || undefined,
        form.province_id || undefined,
        form.city_id || undefined,
        form.barangay_id
    );

    /*
    |--------------------------------------------------------------------------
    | Form State Helpers
    |--------------------------------------------------------------------------
    */

    const setField = <K extends keyof ResidentRegistrationFormData,>(
        key: K,
        value: ResidentRegistrationFormData[K]
    ) => {
        console.log("SET FIELD:", key, value);

        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const setHouseholdField = <
        K extends keyof NonNullable<
            RegisterResidentPayload["household_details"]
        >
    >(
        key: K,
        value: NonNullable<
            RegisterResidentPayload["household_details"]
        >[K]
    ) => {
        setForm((previous) => ({
            ...previous,
            household_details: {
                ...previous.household_details!,
                [key]: value,
            },
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Address Handlers
    |--------------------------------------------------------------------------
    */

    const handleRegionChange = (value: string | number | boolean) => {
        setForm((previous) => ({
            ...previous,
            region_id: Number(value),
            province_id: 0,
            city_id: 0,
            barangay_id: 0,
            zip_code: "",
        }));
    };

    const handleProvinceChange = (value: string | number | boolean) => {
        setForm((previous) => ({
            ...previous,
            province_id: Number(value),
            city_id: 0,
            barangay_id: 0,
            zip_code: "",
        }));
    };

    const handleCityChange = (value: string | number | boolean) => {
        setForm((previous) => ({
            ...previous,
            city_id: Number(value),
            barangay_id: 0,
            zip_code: "",
        }));
    };

    const handleBarangayChange = (value: number) => {
        setForm((previous) => ({
            ...previous,
            barangay_id: value,
            sitio_purok_id: null,
            sitio_purok: "",
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Personal Information Handlers
    |--------------------------------------------------------------------------
    */

    const handleSexChange = (value: string | number | boolean) => {
        const sex = String(value);

        setForm((previous) => ({
            ...previous,
            sex,
            pregnant_woman:
                sex === "female" ? previous.pregnant_woman : false,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Sector Handlers
    |--------------------------------------------------------------------------
    */

    const toggleSector = (option: SectorOption) => {
        const exists = form.sectors.some(
            (sector) => sector.sector_id === option.value
        );

        if (exists) {
            setField(
                "sectors",
                form.sectors.filter(
                    (sector) => sector.sector_id !== option.value
                )
            );

            return;
        }

        setField("sectors", [
            ...form.sectors,
            {
                sector_id: option.value,
                registered: null,
            },
        ]);
    };

    const setSectorRegistered = (
        sectorId: number,
        registered: boolean
    ) => {
        setField(
            "sectors",
            form.sectors.map((sector) =>
                sector.sector_id === sectorId
                    ? { ...sector, registered }
                    : sector
            )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Form Validation
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {
        const requiredFields: [keyof ResidentRegistrationFormData, string][] = [
            ["type_of_resident", "Please select the type of resident."],
            ["first_name", "Please enter the first name."],
            ["last_name", "Please enter the last name."],
            ["date_of_birth", "Please select the date of birth."],
            ["place_of_birth", "Please enter the place of birth."],
            ["sex", "Please select the sex."],
            ["civil_status", "Please select the civil status."],
            [
                "highest_educ_attainment",
                "Please select educational attainment.",
            ],
            ["region_id", "Please select a region."],
            ["province_id", "Please select a province."],
            ["city_id", "Please select a city."],
            ["barangay_id", "Please select a barangay."],
            ["blood_type", "Please select a blood type."],
            ["nationality", "Please select nationality."],
            ["religion", "Please select religion."],
            [
                "govt_asst_progam",
                "Please select a government assistance program.",
            ],
            [
                "relationship_to_hh_head",
                "Please select your household relationship.",
            ],
        ];

        for (const [field, message] of requiredFields) {
            if (!form[field]) {
                Alert.alert("Registration", message);
                return false;
            }
        }

        if (
            form.gender === "others" &&
            !form.gender_other?.trim()
        ) {
            Alert.alert("Registration", "Please specify your gender.");
            return false;
        }

        if (
            form.religion === "others" &&
            !form.religion_other?.trim()
        ) {
            Alert.alert("Registration", "Please specify your religion.");
            return false;
        }

        if (
            form.govt_asst_progam === "others" &&
            !form.govt_asst_progam_other?.trim()
        ) {
            Alert.alert(
                "Registration",
                "Please specify the government assistance program."
            );
            return false;
        }

        if (
            form.source_of_income === "others" &&
            !form.source_of_income_other?.trim()
        ) {
            Alert.alert(
                "Registration",
                "Please specify your source of income."
            );
            return false;
        }

        if (
            form.relationship_to_hh_head !== "household_head" &&
            !form.requested_household_no?.trim()
        ) {
            Alert.alert(
                "Required Field",
                "Please enter your household number."
            );
            return false;
        }

        const isHouseholdHead =
            form.relationship_to_hh_head === "household_head";

        if (isHouseholdHead) {
            const household = form.household_details;

            if (!household) {
                Alert.alert(
                    "Registration",
                    "Please provide your household details."
                );
                return false;
            }

            if (household.no_of_family < 1) {
                Alert.alert(
                    "Registration",
                    "Number of families must be at least 1."
                );
                return false;
            }

            if (household.no_of_hh_member < 1) {
                Alert.alert(
                    "Registration",
                    "Number of household members must be at least 1."
                );
                return false;
            }

            if (household.no_of_migrant < 0) {
                Alert.alert(
                    "Registration",
                    "Number of migrants cannot be negative."
                );
                return false;
            }

            if (!household.household_type) {
                Alert.alert(
                    "Registration",
                    "Please select a household type."
                );
                return false;
            }

            if (
                household.household_type === "others" &&
                !household.household_type_other?.trim()
            ) {
                Alert.alert(
                    "Registration",
                    "Please specify the household type."
                );
                return false;
            }

            if (!household.tenure_status) {
                Alert.alert(
                    "Registration",
                    "Please select your housing tenure status."
                );
                return false;
            }

            if (
                household.tenure_status === "others" &&
                !household.tenure_status_other?.trim()
            ) {
                Alert.alert(
                    "Registration",
                    "Please specify your tenure status."
                );
                return false;
            }

            if (!household.household_unit) {
                Alert.alert(
                    "Registration",
                    "Please select a household unit."
                );
                return false;
            }

            if (
                household.household_unit === "others" &&
                !household.household_unit_other?.trim()
            ) {
                Alert.alert(
                    "Registration",
                    "Please specify your household unit."
                );
                return false;
            }
        }

        return true;
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const isHouseholdHead =
            form.relationship_to_hh_head === "household_head";

        const payload: ResidentRegistrationFormData = {
            ...form,

            requested_household_no: isHouseholdHead
                ? null
                : form.requested_household_no?.trim() || null,

            household_details: isHouseholdHead
                ? form.household_details
                : null,
        };

        await onSubmit(payload);
    };

    /*
    |--------------------------------------------------------------------------
    | Loading States
    |--------------------------------------------------------------------------
    */

    if (loadingOptions) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#166534" />

                <Text className="mt-3 text-gray-500">
                    Loading registration options...
                </Text>
            </SafeAreaView>
        );
    }

    if (optionsError || !options) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-6">
                <Text className="text-center text-red-600">
                    Unable to load registration options. Please check your
                    connection and try again.
                </Text>
            </SafeAreaView>
        );
    }

    const yesNoOptions = options.yes_no ?? [];

    /*
    |--------------------------------------------------------------------------
    | Form UI
    |--------------------------------------------------------------------------
    */

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-5 py-6"
                keyboardShouldPersistTaps="handled"
            >
                {/* Personal Information */}

                <Section title="Personal Information">
                    <FormSelect
                        label="Type of Resident *"
                        value={form.type_of_resident}
                        options={options.type_residents}
                        onChange={(value) =>
                            setField("type_of_resident", String(value))
                        }
                    />

                    <InputField
                        label="PhilSys Card Number"
                        value={form.philsys_card_no ?? ""}
                        onChangeText={(value) =>
                            setField("philsys_card_no", value)
                        }
                        placeholder="####-####-####-####"
                    />

                    <InputField
                        label="First Name *"
                        value={form.first_name}
                        onChangeText={(value) =>
                            setField("first_name", value)
                        }
                    />

                    <InputField
                        label="Middle Name"
                        value={form.middle_name ?? ""}
                        onChangeText={(value) =>
                            setField("middle_name", value)
                        }
                    />

                    <InputField
                        label="Last Name *"
                        value={form.last_name}
                        onChangeText={(value) =>
                            setField("last_name", value)
                        }
                    />

                    <InputField
                        label="Extension Name"
                        value={form.ext_name ?? ""}
                        onChangeText={(value) =>
                            setField("ext_name", value)
                        }
                        placeholder="Jr., Sr., III..."
                    />

                    <Text className="mb-2 text-sm font-medium text-gray-700">
                        Date of Birth *
                    </Text>

                    <Pressable
                        onPress={() => {
                            const initialDate = form.date_of_birth
                                ? (() => {
                                    const [year, month, day] =
                                        form.date_of_birth.split("-").map(Number);

                                    return new Date(year, month - 1, day);
                                })()
                                : new Date(2000, 0, 1);

                            DateTimePickerAndroid.open({
                                value: initialDate,
                                mode: "date",
                                display: "calendar",
                                maximumDate: new Date(),
                                onValueChange: (_, date) => {
                                    setField("date_of_birth", formatDate(date));
                                },
                            });
                        }}
                        className="mb-4 min-h-12 justify-center rounded-xl border border-gray-300 bg-white px-4"
                    >
                        <Text
                            className={
                                form.date_of_birth
                                    ? "text-gray-900"
                                    : "text-gray-400"
                            }
                        >
                            {form.date_of_birth || "Select date of birth"}
                        </Text>
                    </Pressable>

                    <InputField
                        label="Place of Birth *"
                        value={form.place_of_birth}
                        onChangeText={(value) =>
                            setField("place_of_birth", value)
                        }
                    />

                    <InputField
                        label="Mother's Name Upon Birth"
                        value={form.res_mother_upon_birth ?? ""}
                        onChangeText={(value) =>
                            setField("res_mother_upon_birth", value)
                        }
                    />

                    <FormSelect
                        label="Sex *"
                        value={form.sex}
                        options={options.sex}
                        onChange={handleSexChange}
                    />

                    <FormSelect
                        label="Gender"
                        value={form.gender}
                        options={options.genders}
                        onChange={(value) =>
                            setField("gender", String(value))
                        }
                    />

                    {form.gender === "others" && (
                        <InputField
                            label="Specify Gender *"
                            value={form.gender_other ?? ""}
                            onChangeText={(value) =>
                                setField("gender_other", value)
                            }
                        />
                    )}

                    <FormSelect
                        label="Civil Status *"
                        value={form.civil_status}
                        options={options.civil_statuses}
                        onChange={(value) =>
                            setField("civil_status", String(value))
                        }
                    />

                    {form.sex === "female" && (
                        <FormSelect
                            label="Pregnant Woman"
                            value={form.pregnant_woman}
                            options={yesNoOptions}
                            onChange={(value) =>
                                setField("pregnant_woman", Boolean(value))
                            }
                        />
                    )}

                    <FormSelect
                        label="Highest Educational Attainment *"
                        value={form.highest_educ_attainment}
                        options={options.educational_attainments}
                        onChange={(value) =>
                            setField(
                                "highest_educ_attainment",
                                String(value)
                            )
                        }
                    />

                    <InputField
                        label="Profession / Occupation"
                        value={form.profession_occupation ?? ""}
                        onChangeText={(value) =>
                            setField("profession_occupation", value)
                        }
                    />
                </Section>

                {/* Contact Information */}

                <Section title="Contact Information">
                    <InputField
                        label="Email Address"
                        value={form.email_address ?? ""}
                        onChangeText={(value) =>
                            setField("email_address", value)
                        }
                        keyboardType="email-address"
                        editable={emailEditable}
                    />

                    <InputField
                        label="Mobile Number"
                        value={form.mobile_no ?? ""}
                        onChangeText={(value) =>
                            setField("mobile_no", value)
                        }
                        keyboardType="phone-pad"
                    />

                    <InputField
                        label="Telephone Number"
                        value={form.tel_no ?? ""}
                        onChangeText={(value) =>
                            setField("tel_no", value)
                        }
                        keyboardType="phone-pad"
                    />
                </Section>

                {/* Address Information */}

                <Section title="Address Information">
                    <FormSelect
                        label="Region *"
                        value={form.region_id || ""}
                        options={regions}
                        onChange={handleRegionChange}
                    />

                    <FormSelect
                        label="Province *"
                        value={form.province_id || ""}
                        options={provinces}
                        disabled={!form.region_id}
                        onChange={handleProvinceChange}
                    />

                    <FormSelect
                        label="City / Municipality *"
                        value={form.city_id || ""}
                        options={cities}
                        disabled={!form.province_id}
                        onChange={handleCityChange}
                    />

                    <FormSelect
                        label="Barangay *"
                        value={form.barangay_id || ""}
                        options={barangays}
                        disabled={!form.city_id}
                        onChange={(value) =>
                            handleBarangayChange(Number(value))
                        }
                    />

                    {sitioPuroks.length > 0 ? (
                        <FormSelect
                            label="Sitio / Purok"
                            value={form.sitio_purok_id ?? ""}
                            options={sitioPuroks}
                            onChange={(value) => {
                                setField("sitio_purok_id", Number(value));
                                setField("sitio_purok", "");
                            }}
                        />
                    ) : (
                        <InputField
                            label="Sitio / Purok"
                            value={form.sitio_purok ?? ""}
                            onChangeText={(value) => {
                                setField("sitio_purok", value);
                                setField("sitio_purok_id", null);
                            }}
                            placeholder="Enter your Sitio / Purok"
                        />
                    )}

                    <InputField
                        label="House Number"
                        value={form.house_no ?? ""}
                        onChangeText={(value) =>
                            setField("house_no", value)
                        }
                    />

                    <InputField
                        label="Street Name"
                        value={form.street_name ?? ""}
                        onChangeText={(value) =>
                            setField("street_name", value)
                        }
                    />

                    <InputField
                        label="Subdivision"
                        value={form.subdivision ?? ""}
                        onChangeText={(value) =>
                            setField("subdivision", value)
                        }
                    />
                </Section>

                {/* Other Personal Information */}

                <Section title="Other Personal Information">
                    <FormSelect
                        label="Blood Type *"
                        value={form.blood_type}
                        options={options.blood_types}
                        onChange={(value) =>
                            setField("blood_type", String(value))
                        }
                    />

                    <InputField
                        label="Height (cm)"
                        value={form.height?.toString() ?? ""}
                        onChangeText={(value) =>
                            setField("height", value ? Number(value) : null)
                        }
                        keyboardType="numeric"
                    />

                    <InputField
                        label="Weight (kg)"
                        value={form.weight?.toString() ?? ""}
                        onChangeText={(value) =>
                            setField("weight", value ? Number(value) : null)
                        }
                        keyboardType="numeric"
                    />

                    <FormSelect
                        label="Complexion"
                        value={form.complexion}
                        options={options.complexions}
                        onChange={(value) =>
                            setField("complexion", String(value))
                        }
                    />

                    <FormSelect
                        label="Nationality *"
                        value={form.nationality}
                        options={options.nationalities}
                        onChange={(value) =>
                            setField("nationality", String(value))
                        }
                    />

                    <FormSelect
                        label="Registered Voter *"
                        value={form.registered_voter}
                        options={yesNoOptions}
                        onChange={(value) =>
                            setField("registered_voter", Boolean(value))
                        }
                    />

                    <FormSelect
                        label="Resident Voter *"
                        value={form.resident_voter}
                        options={yesNoOptions}
                        onChange={(value) =>
                            setField("resident_voter", Boolean(value))
                        }
                    />

                    {form.resident_voter && (
                        <InputField
                            label="Last Voted Year"
                            value={form.last_voted_yr?.toString() ?? ""}
                            onChangeText={(value) =>
                                setField(
                                    "last_voted_yr",
                                    value ? Number(value) : null
                                )
                            }
                            keyboardType="numeric"
                        />
                    )}

                    <FormSelect
                        label="Ethnicity"
                        value={form.ethnicity_id}
                        options={ethnicities}
                        onChange={(value) =>
                            setField("ethnicity_id", Number(value))
                        }
                    />

                    <FormSelect
                        label="Religion *"
                        value={form.religion}
                        options={options.religions}
                        onChange={(value) =>
                            setField("religion", String(value))
                        }
                    />

                    {form.religion === "others" && (
                        <InputField
                            label="Specify Religion *"
                            value={form.religion_other ?? ""}
                            onChangeText={(value) =>
                                setField("religion_other", value)
                            }
                        />
                    )}
                </Section>

                {/* Mother's Maiden Name */}

                <Section title="Mother's Maiden Name">
                    <InputField
                        label="First Name"
                        value={form.mother_fname ?? ""}
                        onChangeText={(value) =>
                            setField("mother_fname", value)
                        }
                    />

                    <InputField
                        label="Middle Name"
                        value={form.mother_midname ?? ""}
                        onChangeText={(value) =>
                            setField("mother_midname", value)
                        }
                    />

                    <InputField
                        label="Last Name"
                        value={form.mother_lname ?? ""}
                        onChangeText={(value) =>
                            setField("mother_lname", value)
                        }
                    />
                </Section>

                {/* Government Assistance */}

                <Section title="Government Assistance">
                    <FormSelect
                        label="Government Assistance Program *"
                        value={form.govt_asst_progam}
                        options={options.govt_asst_programs}
                        onChange={(value) =>
                            setField("govt_asst_progam", String(value))
                        }
                    />

                    {form.govt_asst_progam === "others" && (
                        <InputField
                            label="Specify Program *"
                            value={form.govt_asst_progam_other ?? ""}
                            onChangeText={(value) =>
                                setField("govt_asst_progam_other", value)
                            }
                        />
                    )}
                </Section>

                {/* Sectors */}

                <Section title="Sectors">
                    {sectors?.length ? (
                        <View className="overflow-hidden rounded-lg border border-gray-300">
                            <View className="flex-row border-b border-gray-300 bg-gray-100 py-3">
                                <View className="flex-1 px-3">
                                    <Text className="font-semibold text-gray-700">
                                        Sector
                                    </Text>
                                </View>

                                <View className="w-32 items-center justify-center">
                                    <Text className="text-center font-semibold text-gray-700">
                                        Registered?
                                    </Text>
                                </View>
                            </View>

                            {sectors.map((option) => {
                                const selected = form.sectors.find(
                                    (sector) =>
                                        sector.sector_id === option.value
                                );

                                const checked = !!selected;

                                return (
                                    <View
                                        key={option.value}
                                        className="flex-row items-center border-b border-gray-200 py-3"
                                    >
                                        <Pressable
                                            onPress={() =>
                                                toggleSector(option)
                                            }
                                            className="flex-1 flex-row items-center gap-3 px-3"
                                        >
                                            <View
                                                className={`h-5 w-5 items-center justify-center rounded border ${
                                                    checked
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-gray-400 bg-white"
                                                }`}
                                            >
                                                {checked && (
                                                    <Text className="text-xs font-bold text-white">
                                                        ✓
                                                    </Text>
                                                )}
                                            </View>

                                            <Text className="flex-1 text-gray-800">
                                                {option.name}
                                            </Text>
                                        </Pressable>

                                        <View className="w-32 items-center">
                                            {option.is_registrable &&
                                            checked ? (
                                                <View className="flex-row items-center gap-3">
                                                    <Pressable
                                                        onPress={() =>
                                                            setSectorRegistered(
                                                                option.value,
                                                                true
                                                            )
                                                        }
                                                        className="flex-row items-center gap-1"
                                                    >
                                                        <View
                                                            className={`h-4 w-4 items-center justify-center rounded-full border ${
                                                                selected?.registered ===
                                                                true
                                                                    ? "border-blue-600"
                                                                    : "border-gray-400"
                                                            }`}
                                                        >
                                                            {selected?.registered ===
                                                                true && (
                                                                <View className="h-2 w-2 rounded-full bg-blue-600" />
                                                            )}
                                                        </View>

                                                        <Text className="text-sm text-gray-700">
                                                            Yes
                                                        </Text>
                                                    </Pressable>

                                                    <Pressable
                                                        onPress={() =>
                                                            setSectorRegistered(
                                                                option.value,
                                                                false
                                                            )
                                                        }
                                                        className="flex-row items-center gap-1"
                                                    >
                                                        <View
                                                            className={`h-4 w-4 items-center justify-center rounded-full border ${
                                                                selected?.registered ===
                                                                false
                                                                    ? "border-blue-600"
                                                                    : "border-gray-400"
                                                            }`}
                                                        >
                                                            {selected?.registered ===
                                                                false && (
                                                                <View className="h-2 w-2 rounded-full bg-blue-600" />
                                                            )}
                                                        </View>

                                                        <Text className="text-sm text-gray-700">
                                                            No
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            ) : (
                                                <Text className="text-gray-400">
                                                    —
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text className="text-sm text-gray-500">
                            No sectors available.
                        </Text>
                    )}
                </Section>

                {/* Household Information */}

                <Section title="Household Information">
                    <Text className="mb-4 text-sm text-gray-500">
                        This information is self-reported. Your household
                        assignment will be completed by the Barangay Secretary
                        after verification.
                    </Text>

                    <FormSelect
                        label="Relationship to Household Head *"
                        value={form.relationship_to_hh_head}
                        options={options.household_relationships}
                        onChange={(value) => {
                            const relationship = String(value);

                            setForm((previous) => ({
                                ...previous,
                                relationship_to_hh_head: relationship,
                                requested_household_no:
                                    relationship === "household_head"
                                        ? ""
                                        : previous.requested_household_no,
                            }));
                        }}
                    />

                    {form.relationship_to_hh_head === "household_head" && (
                        <>
                            <Text className="mb-4 text-sm font-semibold text-green-800">
                                Proposed Household Details
                            </Text>

                            <InputField
                                label="Household Name"
                                value={
                                    form.household_details?.household_name ??
                                    ""
                                }
                                onChangeText={(value) =>
                                    setHouseholdField("household_name", value)
                                }
                                placeholder="Enter household name (optional)"
                            />

                            <InputField
                                label="Number of Families *"
                                value={String(
                                    form.household_details?.no_of_family ?? ""
                                )}
                                onChangeText={(value) =>
                                    setHouseholdField(
                                        "no_of_family",
                                        value === "" ? 0 : Number(value)
                                    )
                                }
                                keyboardType="numeric"
                            />

                            <InputField
                                label="Number of Household Members *"
                                value={String(
                                    form.household_details?.no_of_hh_member ??
                                        ""
                                )}
                                onChangeText={(value) =>
                                    setHouseholdField(
                                        "no_of_hh_member",
                                        value === "" ? 0 : Number(value)
                                    )
                                }
                                keyboardType="numeric"
                            />

                            <InputField
                                label="Number of Migrants *"
                                value={String(
                                    form.household_details?.no_of_migrant ?? ""
                                )}
                                onChangeText={(value) =>
                                    setHouseholdField(
                                        "no_of_migrant",
                                        value === "" ? 0 : Number(value)
                                    )
                                }
                                keyboardType="numeric"
                            />

                            <FormSelect
                                label="Household Type *"
                                value={
                                    form.household_details?.household_type ??
                                    ""
                                }
                                options={options.household_types}
                                onChange={(value) =>
                                    setHouseholdField(
                                        "household_type",
                                        String(value)
                                    )
                                }
                            />

                            {form.household_details?.household_type ===
                                "others" && (
                                <InputField
                                    label="Specify Household Type *"
                                    value={
                                        form.household_details
                                            ?.household_type_other ?? ""
                                    }
                                    onChangeText={(value) =>
                                        setHouseholdField(
                                            "household_type_other",
                                            value
                                        )
                                    }
                                />
                            )}

                            <FormSelect
                                label="Tenure Status *"
                                value={
                                    form.household_details?.tenure_status ?? ""
                                }
                                options={options.tenure_statuses}
                                onChange={(value) =>
                                    setHouseholdField(
                                        "tenure_status",
                                        String(value)
                                    )
                                }
                            />

                            {form.household_details?.tenure_status ===
                                "others" && (
                                <InputField
                                    label="Specify Tenure Status *"
                                    value={
                                        form.household_details
                                            ?.tenure_status_other ?? ""
                                    }
                                    onChangeText={(value) =>
                                        setHouseholdField(
                                            "tenure_status_other",
                                            value
                                        )
                                    }
                                />
                            )}

                            <FormSelect
                                label="Household Unit *"
                                value={
                                    form.household_details?.household_unit ??
                                    ""
                                }
                                options={options.household_units}
                                onChange={(value) =>
                                    setHouseholdField(
                                        "household_unit",
                                        String(value)
                                    )
                                }
                            />

                            {form.household_details?.household_unit ===
                                "others" && (
                                <InputField
                                    label="Specify Household Unit *"
                                    value={
                                        form.household_details
                                            ?.household_unit_other ?? ""
                                    }
                                    onChangeText={(value) =>
                                        setHouseholdField(
                                            "household_unit_other",
                                            value
                                        )
                                    }
                                />
                            )}

                            <InputField
                                label="Total Household Monthly Income"
                                value={
                                    form.household_details?.monthly_income?.toString() ??
                                    ""
                                }
                                onChangeText={(value) =>
                                    setHouseholdField(
                                        "monthly_income",
                                        value === "" ? null : Number(value)
                                    )
                                }
                                keyboardType="numeric"
                                placeholder="Enter total household income"
                            />
                        </>
                    )}

                    {form.relationship_to_hh_head !== "" &&
                        form.relationship_to_hh_head !== "household_head" && (
                            <InputField
                                label="Existing Household Number *"
                                value={form.requested_household_no ?? ""}
                                onChangeText={(value) =>
                                    setField("requested_household_no", value)
                                }
                                placeholder="Enter your household number"
                            />
                        )}

                    <Text className="mb-3 mt-2 text-sm font-semibold text-green-800">
                        Personal Income Information
                    </Text>

                    <FormSelect
                        label="Source of Income"
                        value={form.source_of_income}
                        options={options.source_of_income}
                        onChange={(value) =>
                            setField("source_of_income", String(value))
                        }
                    />

                    {form.source_of_income === "others" && (
                        <InputField
                            label="Specify Source of Income *"
                            value={form.source_of_income_other ?? ""}
                            onChangeText={(value) =>
                                setField("source_of_income_other", value)
                            }
                        />
                    )}

                    <InputField
                        label="Personal Monthly Income"
                        value={form.monthly_income?.toString() ?? ""}
                        onChangeText={(value) =>
                            setField(
                                "monthly_income",
                                value === "" ? null : Number(value)
                            )
                        }
                        keyboardType="numeric"
                    />
                </Section>

                {/* Optional additional fields */}
                {footer}

                {/* Submit Button */}

                <Pressable
                    onPress={handleSubmit}
                    disabled={loading || loadingOptions}
                    className={`mb-8 min-h-14 items-center justify-center rounded-xl ${
                        loading || loadingOptions
                            ? "bg-green-400"
                            : "bg-green-800"
                    }`}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text className="font-bold text-white">
                            {submitLabel}
                        </Text>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
