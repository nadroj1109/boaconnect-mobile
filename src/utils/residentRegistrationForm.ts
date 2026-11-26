import type { RegisterResidentPayload } from "@/types/registration";
import type { Resident } from "@/types/resident";

export type ResidentRegistrationFormData = Omit<
    RegisterResidentPayload,
    "verification_token" | "password" | "password_confirmation"
>;

export const initialResidentRegistrationForm: ResidentRegistrationFormData = {
    type_of_resident: "",
    philsys_card_no: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    ext_name: "",
    date_of_birth: "",
    place_of_birth: "",
    res_mother_upon_birth: "",
    sex: "",
    gender: "",
    gender_other: "",
    civil_status: "",
    pregnant_woman: false,
    highest_educ_attainment: "",
    profession_occupation: "",

    email_address: "",
    mobile_no: "",
    tel_no: "",

    region_id: 0,
    province_id: 0,
    city_id: 0,
    barangay_id: 0,
    sitio_purok_id: null,
    sitio_purok: "",
    house_no: "",
    street_name: "",
    subdivision: "",
    zip_code: "",

    blood_type: "",
    height: null,
    weight: null,
    complexion: "",
    nationality: "",
    registered_voter: false,
    resident_voter: false,
    last_voted_yr: new Date().getFullYear(),
    ethnicity_id: null,
    religion: "",
    religion_other: "",

    mother_fname: "",
    mother_midname: "",
    mother_lname: "",

    govt_asst_progam: "",
    govt_asst_progam_other: "",

    sectors: [],

    relationship_to_hh_head: "",
    requested_household_no: "",

    household_details: {
        no_of_family: 1,
        no_of_hh_member: 1,
        no_of_migrant: 0,
        household_type: "",
        household_type_other: "",
        tenure_status: "",
        tenure_status_other: "",
        household_unit: "",
        household_unit_other: "",
        household_name: "",
        monthly_income: null,
    },

    source_of_income: "",
    source_of_income_other: "",
    monthly_income: null,
};

type ResidentFormSource = Partial<RegisterResidentPayload> & {
    date_of_birth_value?: string | null;
    household_registration?: {
        household_details?: ResidentRegistrationFormData["household_details"] | null;
        requested_household?: {
            household_no?: string | null;
        } | null;
    } | null;
    sectors?: Array<{
        id?: number;
        sector_id?: number;
        registered?: boolean | null;
    }>;
};

export function mapResidentToRegistrationForm(
    resident: Resident
): ResidentRegistrationFormData {
    const source = resident as unknown as ResidentFormSource;

    const householdDetails =
        source.household_registration?.household_details;

    return {
        ...initialResidentRegistrationForm,
        ...source,

        // Prefer the ISO date value returned by ResidentResource.
        // The formatted date (e.g. "November 15, 2000") is not suitable
        // for reliably populating the date picker.
        date_of_birth: source.date_of_birth_value ?? "",

        // Keep the verified email from the existing resident record.
        email_address: source.email_address ?? "",

        mobile_no: source.mobile_no ?? "",

        // The resource's sector records may expose either id or sector_id.
        sectors: (source.sectors ?? []).map((sector) => ({
            sector_id: sector.sector_id,
            registered: sector.registered ?? false,
        })),

        // Preserve the household details submitted during registration.
        household_details: {
            ...initialResidentRegistrationForm.household_details!,
            ...(householdDetails ?? {}),
        },

        // For a non-head resident, recover the requested household number
        // from the related household loaded by the API.
        requested_household_no:
            source.requested_household_no ??
            source.household_registration?.requested_household?.household_no ??
            "",
    };
}