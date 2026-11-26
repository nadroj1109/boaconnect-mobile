export interface User {
    id: number;
    resident_id: number | null;

    display_name: string | null;
    name: string;

    email: string | null;
    mobile_number: string | null;

    is_active: boolean;

    role_id: number | null;
    role: string | null;

    role_ids: number[];
    roles: string[];

    barangay_id: number | null;
    barangay_name: string;

    created_at: string;
    updated_at: string;
}