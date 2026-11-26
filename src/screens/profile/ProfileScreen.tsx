import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/common/AppHeader";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileInfoRow } from "@/components/profile/ProfileInfoRow";
import { SectorBadge } from "@/components/profile/SectorBadge";

import { useAuth } from "@/hooks/useAuth";

const displayValue = (
    value: string | number | null | undefined
): string => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return String(value);
};

const displayBoolean = (
    value: boolean | null | undefined
): string => {
    if (value === null || value === undefined) {
        return "—";
    }

    return value ? "Yes" : "No";
};

const displayIncome = (
    value: number | null | undefined
): string => {
    if (value === null || value === undefined) {
        return "—";
    }

    return `₱${Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export function ProfileScreen() {
    const { resident } = useAuth();

    if (!resident) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100">
                <AppHeader
                    title="My Profile"
                    subtitle="View your resident information"
                    showBack={false}
                />

                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-center text-gray-500">
                        No resident information is available for this account.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const household = resident.household;

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <AppHeader
                title="My Profile"
                subtitle="View your resident information"
                showBack={false}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Personal Information */}
                <ProfileSection title="Personal Information">
                    <ProfileInfoRow
                        label="Full Name"
                        value={displayValue(resident.full_name)}
                    />

                    <ProfileInfoRow
                        label="Last Name"
                        value={displayValue(resident.last_name)}
                    />

                    <ProfileInfoRow
                        label="First Name"
                        value={displayValue(resident.first_name)}
                    />

                    <ProfileInfoRow
                        label="Middle Name"
                        value={displayValue(resident.middle_name)}
                    />

                    <ProfileInfoRow
                        label="Extension Name"
                        value={displayValue(resident.ext_name)}
                    />

                    <ProfileInfoRow
                        label="Date of Birth"
                        value={displayValue(resident.date_of_birth)}
                    />

                    <ProfileInfoRow
                        label="Age"
                        value={displayValue(resident.age)}
                    />

                    <ProfileInfoRow
                        label="Place of Birth"
                        value={displayValue(resident.place_of_birth)}
                    />

                    <ProfileInfoRow
                        label="Sex"
                        value={displayValue(resident.sex)}
                    />

                    <ProfileInfoRow
                        label="Gender"
                        value={displayValue(resident.gender_name)}
                    />

                    {resident.gender_other ? (
                        <ProfileInfoRow
                            label="Other Gender"
                            value={displayValue(resident.gender_other)}
                        />
                    ) : null}

                    <ProfileInfoRow
                        label="Civil Status"
                        value={displayValue(resident.civil_status_name)}
                    />

                    <ProfileInfoRow
                        label="Nationality"
                        value={displayValue(resident.nationality_name)}
                    />

                    <ProfileInfoRow
                        label="PhilSys Card Number"
                        value={displayValue(resident.philsys_card_no)}
                    />

                    <ProfileInfoRow
                        label="Mother's Name Upon Birth"
                        value={displayBoolean(resident.res_mother_upon_birth)}
                    />

                    <ProfileInfoRow
                        label="Pregnant Woman"
                        value={displayBoolean(resident.pregnant_woman)}
                    />
                </ProfileSection>

                {/* Contact Information */}
                <ProfileSection title="Contact Information">
                    <ProfileInfoRow
                        label="Mobile Number"
                        value={displayValue(resident.mobile_no)}
                    />

                    <ProfileInfoRow
                        label="Telephone Number"
                        value={displayValue(resident.tel_no)}
                    />

                    <ProfileInfoRow
                        label="Email Address"
                        value={displayValue(resident.email_address)}
                    />
                </ProfileSection>

                {/* Address */}
                <ProfileSection title="Residential Address">
                    <ProfileInfoRow
                        label="Region"
                        value={displayValue(resident.region_name)}
                    />

                    <ProfileInfoRow
                        label="Province"
                        value={displayValue(resident.province_name)}
                    />

                    <ProfileInfoRow
                        label="City / Municipality"
                        value={displayValue(resident.city_name)}
                    />

                    <ProfileInfoRow
                        label="Barangay"
                        value={displayValue(resident.barangay_name)}
                    />

                    <ProfileInfoRow
                        label="Sitio / Purok"
                        value={displayValue(resident.sitio_purok)}
                    />

                    <ProfileInfoRow
                        label="House Number"
                        value={displayValue(resident.house_no)}
                    />

                    <ProfileInfoRow
                        label="Street"
                        value={displayValue(resident.street_name)}
                    />

                    <ProfileInfoRow
                        label="Subdivision"
                        value={displayValue(resident.subdivision)}
                    />

                    <ProfileInfoRow
                        label="ZIP Code"
                        value={displayValue(resident.zip_code)}
                    />
                </ProfileSection>

                {/* Other Personal Details */}
                <ProfileSection title="Other Personal Details">
                    <ProfileInfoRow
                        label="Blood Type"
                        value={displayValue(resident.blood_type)}
                    />

                    <ProfileInfoRow
                        label="Height"
                        value={
                            resident.height != null
                                ? `${resident.height} cm`
                                : "—"
                        }
                    />

                    <ProfileInfoRow
                        label="Weight"
                        value={
                            resident.weight != null
                                ? `${resident.weight} kg`
                                : "—"
                        }
                    />

                    <ProfileInfoRow
                        label="Complexion"
                        value={displayValue(resident.complexion_name)}
                    />

                    <ProfileInfoRow
                        label="Ethnicity"
                        value={displayValue(resident.ethnicity_name)}
                    />

                    <ProfileInfoRow
                        label="Religion"
                        value={displayValue(resident.religion_name)}
                    />
                </ProfileSection>

                {/* Education and Employment */}
                <ProfileSection title="Education and Employment">
                    <ProfileInfoRow
                        label="Highest Educational Attainment"
                        value={displayValue(resident.highest_educ_attainment_name)}
                    />

                    <ProfileInfoRow
                        label="Profession / Occupation"
                        value={displayValue(resident.profession_occupation)}
                    />

                    <ProfileInfoRow
                        label="Source of Income"
                        value={displayValue(resident.source_of_income_name)}
                    />

                    <ProfileInfoRow
                        label="Other Source of Income"
                        value={displayValue(resident.source_of_income_other)}
                    />

                    <ProfileInfoRow
                        label="Monthly Income"
                        value={displayIncome(resident.monthly_income)}
                    />
                </ProfileSection>

                {/* Voter Information */}
                <ProfileSection title="Voter Information">
                    <ProfileInfoRow
                        label="Registered Voter"
                        value={displayBoolean(resident.registered_voter)}
                    />

                    <ProfileInfoRow
                        label="Resident Voter"
                        value={displayBoolean(resident.resident_voter)}
                    />

                    <ProfileInfoRow
                        label="Last Voted Year"
                        value={displayValue(resident.last_voted_yr)}
                    />
                </ProfileSection>

                {/* Family Information */}
                <ProfileSection title="Family Information">
                    <ProfileInfoRow
                        label="Mother's First Name"
                        value={displayValue(resident.mother_fname)}
                    />

                    <ProfileInfoRow
                        label="Mother's Middle Name"
                        value={displayValue(resident.mother_midname)}
                    />

                    <ProfileInfoRow
                        label="Mother's Last Name"
                        value={displayValue(resident.mother_lname)}
                    />
                </ProfileSection>

                {/* Government Assistance */}
                <ProfileSection title="Government Assistance">
                    <ProfileInfoRow
                        label="Government Assistance Program"
                        value={displayValue(resident.govt_asst_progam_name)}
                    />

                    <ProfileInfoRow
                        label="Other Assistance Program"
                        value={displayValue(resident.govt_asst_progam_other)}
                    />
                </ProfileSection>

                {/* Household */}
                <ProfileSection title="Household Information">
                    {resident.household_id === null || !household ? (
                        <View className="rounded-lg bg-amber-50 p-4">
                            <Text className="font-semibold text-amber-800">
                                Pending Household Verification
                            </Text>

                            <Text className="mt-1 text-sm text-amber-700">
                                Your resident account is awaiting verification
                                and household assignment by the Barangay Secretary.
                                Household information will become available once
                                your account has been verified.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <ProfileInfoRow
                                label="Household Number"
                                value={displayValue(household.household_no)}
                            />

                            <ProfileInfoRow
                                label="Household Name"
                                value={displayValue(household.household_name)}
                            />

                            <ProfileInfoRow
                                label="Household Head"
                                value={displayBoolean(resident.is_household_head)}
                            />

                            <ProfileInfoRow
                                label="Relationship to Household Head"
                                value={displayValue(
                                    resident.relationship_to_hh_head_name
                                )}
                            />

                            <ProfileInfoRow
                                label="Household Type"
                                value={displayValue(household.household_type)}
                            />

                            <ProfileInfoRow
                                label="Other Household Type"
                                value={displayValue(household.household_type_other)}
                            />

                            <ProfileInfoRow
                                label="Tenure Status"
                                value={displayValue(household.tenure_status)}
                            />

                            <ProfileInfoRow
                                label="Other Tenure Status"
                                value={displayValue(household.tenure_status_other)}
                            />

                            <ProfileInfoRow
                                label="Household Unit"
                                value={displayValue(household.household_unit)}
                            />

                            <ProfileInfoRow
                                label="Other Household Unit"
                                value={displayValue(household.household_unit_other)}
                            />

                            <ProfileInfoRow
                                label="Household Address"
                                value={displayValue(household.complete_address)}
                            />

                            <ProfileInfoRow
                                label="Sitio / Purok"
                                value={displayValue(household.sitio_purok)}
                            />

                            <ProfileInfoRow
                                label="Number of Families"
                                value={displayValue(household.no_of_family)}
                            />

                            <ProfileInfoRow
                                label="Number of Household Members"
                                value={displayValue(household.no_of_hh_member)}
                            />

                            <ProfileInfoRow
                                label="Number of Migrants"
                                value={displayValue(household.no_of_migrant)}
                            />

                            <ProfileInfoRow
                                label="Household Monthly Income"
                                value={displayIncome(household.monthly_income)}
                            />
                        </>
                    )}
                </ProfileSection>

                {/* Resident Sectors */}
                <ProfileSection title="Resident Sectors">
                    <View className="flex-row flex-wrap">
                        {resident.sectors?.length ? (
                            resident.sectors.map((sector) => (
                                <SectorBadge
                                    key={sector.id}
                                    name={sector.sector_name}
                                />
                            ))
                        ) : (
                            <Text className="text-gray-500">
                                No sectors available.
                            </Text>
                        )}
                    </View>
                </ProfileSection>
            </ScrollView>
        </SafeAreaView>
    );
}