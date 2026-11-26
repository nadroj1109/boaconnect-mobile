import { api } from "@/api/client";
import { URLS } from "@/config/urls";

import type {
    ApiMessageResponse,
    LoginResponse,
    MeResponse,
    RegisterResponse,
    ResidentMatchResponse,
    VerificationResponse,
} from "@/types/auth";

import type { RegisterResidentPayload, ResidentRegistrationResubmissionPayload, } from "@/types/registration";

import type { Resident } from "@/types/resident";

export const AuthService = {

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    async login(data: {
        username: string;
        password: string;
    }): Promise<LoginResponse> {

        const response =
            await api.post<LoginResponse>(
                URLS.auth.login,
                data
            );

        return response.data;

    },

    /*
    |--------------------------------------------------------------------------
    | Send Verification Code
    |--------------------------------------------------------------------------
    */

    async sendVerification(data: {
        recipient: string;
        channel: "email" | "sms";
        purpose: string;
    }): Promise<VerificationResponse> {

        const response =
            await api.post<VerificationResponse>(
                URLS.auth.sendVerification,
                data
            );

        return response.data;

    },

    /*
    |--------------------------------------------------------------------------
    | Verify OTP
    |--------------------------------------------------------------------------
    */

    async verifyOtp(data: {
        recipient: string;
        purpose: string;
        code: string;
    }): Promise<VerificationResponse> {

        const response =
            await api.post<VerificationResponse>(
                URLS.auth.verifyVerification,
                data
            );

        return response.data;

    },

    /*
    |--------------------------------------------------------------------------
    | Match Resident
    |--------------------------------------------------------------------------
    */

    async matchResident(data: {
        verification_token: string;
    }): Promise<ResidentMatchResponse> {

        const response =
            await api.post<ResidentMatchResponse>(
                URLS.auth.residentMatch,
                data
            );

        return response.data;

    },

    /*
    |--------------------------------------------------------------------------
    | Register Resident
    |--------------------------------------------------------------------------
    */

    async register(data: RegisterResidentPayload): Promise<RegisterResponse> {
        const response = await api.post<RegisterResponse>(
            URLS.auth.register,
            data
        );

        return response.data;
    },

    /*
    |--------------------------------------------------------------------------
    | Resubmit Resident Registration
    |--------------------------------------------------------------------------
    */

    async resubmit(
        data: ResidentRegistrationResubmissionPayload
    ): Promise<{
        success: boolean;
        message: string;
        data: Resident;
    }> {
        const response = await api.post(
            URLS.auth.resubmit,
            data
        );

        return response.data;
    },
    
    /*
    |--------------------------------------------------------------------------
    | Current User
    |--------------------------------------------------------------------------
    */

    async me(): Promise<MeResponse> {

        const response =
            await api.get<MeResponse>(
                URLS.auth.me
            );

        return response.data;

    },

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    async logout(): Promise<ApiMessageResponse> {

        const response =
            await api.post<ApiMessageResponse>(
                URLS.auth.logout
            );

        return response.data;

    },

};