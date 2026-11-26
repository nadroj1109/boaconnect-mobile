export interface ResidentSector {
    id: number;
    sector_name: string;
}

export interface ResidentHousehold {
    id: number;
    barangay_id?: number;
    sitio_purok?: string | null;
    complete_address?: string | null;
    no_of_family?: number | null;
    no_of_hh_member?: number | null;
    no_of_migrant?: number | null;
    household_no?: string | null;
    household_type?: string | number | null;
    household_type_other?: string | null;
    tenure_status?: string | number | null;
    tenure_status_other?: string | null;
    household_unit?: string | number | null;
    household_unit_other?: string | null;
    household_name?: string | null;
    monthly_income?: number | null;
}

export interface ResidentHouseholdDetails {
    no_of_family?: number | null;
    no_of_hh_member?: number | null;
    no_of_migrant?: number | null;
    household_type?: string | number | null;
    household_type_other?: string | null;
    tenure_status?: string | number | null;
    tenure_status_other?: string | null;
    household_unit?: string | number | null;
    household_unit_other?: string | null;
    household_name?: string | null;
    monthly_income?: number | null;
}

export interface ResidentHouseholdRegistration {
    id: number;
    status: "pending" | "approved" | "rejected";
    rejection_reason?: string | null;
    requested_household_id?: number | null;
    household_details?: ResidentHouseholdDetails | null;
    requested_household?: {
        id: number;
        household_no: string | null;
        household_name?: string | null;
        complete_address?: string | null;
    } | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
}

export interface Resident {
    id: number;
    household_id: number | null;
    household?: ResidentHousehold | null;
    is_household_head: boolean;

    // Personal Information
    type_of_resident_name?: string | null;
    philsys_card_no?: string | null;
    last_name: string;
    first_name: string;
    middle_name?: string | null;
    ext_name?: string | null;
    full_name: string;
    date_of_birth: string;
    age: number | null;
    place_of_birth?: string | null;
    res_mother_upon_birth?: boolean | null;
    sex: string;
    gender_name?: string | null;
    gender_other?: string | null;
    civil_status_name: string;
    pregnant_woman?: boolean | null;
    highest_educ_attainment_name?: string | null;
    profession_occupation?: string | null;

    // Contact Information
    email_address?: string | null;
    mobile_no?: string | null;
    tel_no?: string | null;
    nationality_name: string;

    // Address
    region_name?: string | null;
    province_name?: string | null;
    city_name?: string | null;
    barangay_name: string;
    sitio_purok?: string | null;
    house_no?: string | null;
    street_name?: string | null;
    subdivision?: string | null;
    zip_code?: string | null;

    // Other Personal Information
    blood_type?: string | null;
    height?: number | null;
    weight?: number | null;
    complexion_name?: string | null;

    // Voter Information
    registered_voter?: boolean | null;
    resident_voter?: boolean | null;
    last_voted_yr?: number | null;

    // Family and Other Information
    ethnicity_name?: string | null;
    religion_name?: string | null;
    religion_other?: string | null;
    mother_fname?: string | null;
    mother_midname?: string | null;
    mother_lname?: string | null;

    // Government Assistance
    govt_asst_progam_name?: string | null;
    govt_asst_progam_other?: string | null;

    // Household Relationship and Income
    relationship_to_hh_head_name: string;
    source_of_income_name?: string | null;
    source_of_income_other?: string | null;
    monthly_income?: number | null;

    // Resident Sectors
    sectors: ResidentSector[];

    // Raw registration values
    type_of_resident?: string | null;
    date_of_birth_value?: string | null;
    gender?: string | null;
    civil_status?: string | null;
    highest_educ_attainment?: string | null;

    region_id?: number | null;
    province_id?: number | null;
    city_id?: number | null;
    barangay_id?: number | null;
    sitio_purok_id?: number | null;

    complexion?: string | null;
    nationality?: string | null;
    ethnicity_id?: number | null;
    religion?: string | null;
    govt_asst_progam?: string | null;
    relationship_to_hh_head?: string | null;
    source_of_income?: string | null;

    household_registration?: ResidentHouseholdRegistration | null;
}