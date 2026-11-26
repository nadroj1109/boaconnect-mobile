import type { Resident } from "./resident";
import type { User } from "./user";

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export interface LoginResponse {
    success: boolean;
    message: string;

    data: {
        token: string;
        user: User;
        resident: Resident | null;
        barangay?: unknown;
    };
}

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export interface MeResponse {
    success: boolean;
    message: string;

    data: {
        user: User;
        resident: Resident | null;
        barangay?: unknown;
    };
}

/*
|--------------------------------------------------------------------------
| Verification
|--------------------------------------------------------------------------
*/

export interface VerificationResponse {
    success?: boolean;
    verified?: boolean;
    message: string;
    verification_token?: string;
    expires_at?: string;
    expires_in?: number;
    resend_after?: number;
}

/*
|--------------------------------------------------------------------------
| Resident Matching
|--------------------------------------------------------------------------
*/

export interface ResidentMatch {
    id: number;
    full_name: string;
    household_no: string | null;
    barangay: string | null;
}

export interface ResidentMatchResponse {
    success: boolean;
    message: string;
    resident: ResidentMatch | null;
}

/*
|--------------------------------------------------------------------------
| Registration
|--------------------------------------------------------------------------
*/

export interface RegisterResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: User;
        resident: Resident;
    };
}

/*
|--------------------------------------------------------------------------
| Generic API Message
|--------------------------------------------------------------------------
*/

export interface ApiMessageResponse {
    success: boolean;
    message: string;
}