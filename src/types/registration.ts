export interface SelectOption<T = string> {
    value: T;
    name: string;
}

export interface PSGCOption {
    value: number;
    name: string;
    code: string;
}

export interface RegistrationOptions {
    household_types: SelectOption[];
    household_units: SelectOption[];
    tenure_statuses: SelectOption[];

    blood_types: SelectOption[];
    civil_statuses: SelectOption[];
    complexions: SelectOption[];
    genders: SelectOption[];
    govt_asst_programs: SelectOption[];
    educational_attainments: SelectOption[];
    household_relationships: SelectOption[];
    nationalities: SelectOption[];
    religions: SelectOption[];
    sex: SelectOption[];
    source_of_income: SelectOption[];
    type_residents: SelectOption[];
    yes_no: SelectOption<boolean>[];
}

export interface RegistrationListResponse {
    data: SelectOption<number>[];
}

export interface SectorOption extends SelectOption<number> {
    code: string;
    is_registrable: boolean;
}

export interface RegisterResidentPayload {
    verification_token: string;
    password: string;
    password_confirmation: string;

    type_of_resident: string;
    philsys_card_no?: string;
    last_name: string;
    first_name: string;
    middle_name?: string;
    ext_name?: string;
    date_of_birth: string;
    place_of_birth: string;
    res_mother_upon_birth?: string;
    sex: string;
    gender?: string;
    gender_other?: string;
    civil_status: string;
    pregnant_woman: boolean;
    highest_educ_attainment: string;
    profession_occupation?: string;

    email_address?: string;
    mobile_no?: string;
    tel_no?: string;

    region_id: number;
    province_id: number;
    city_id: number;
    barangay_id: number;
    sitio_purok_id: number | null;
    sitio_purok?: string | null;
    house_no?: string;
    street_name?: string;
    subdivision?: string;
    zip_code?: string;

    blood_type: string;
    height?: number | null;
    weight?: number | null;
    complexion?: string;
    nationality: string;
    registered_voter: boolean;
    resident_voter: boolean;
    last_voted_yr?: number | null;
    ethnicity_id?: number | null;
    religion: string;
    religion_other?: string;

    mother_fname?: string;
    mother_midname?: string;
    mother_lname?: string;

    govt_asst_progam: string;
    govt_asst_progam_other?: string;

    sectors: {
        sector_id: number;
        registered: boolean | null;
    }[];

    relationship_to_hh_head: string;
    requested_household_no?: string | null;

    source_of_income?: string;
    source_of_income_other?: string;
    monthly_income?: number | null;

    household_details?: {
        no_of_family: number;
        no_of_hh_member: number;
        no_of_migrant: number;
        household_type: string;
        household_type_other?: string | null;
        tenure_status: string;
        tenure_status_other?: string | null;
        household_unit: string;
        household_unit_other?: string | null;
        household_name?: string | null;
        monthly_income?: number | null;
    } | null;
}

export type ResidentRegistrationResubmissionPayload = Omit<
    RegisterResidentPayload,
    | "verification_token"
    | "password"
    | "password_confirmation"
    | "email_address"
>;
