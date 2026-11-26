import { createContext } from "react";

import type { LoginResponse } from "@/types/auth";
import type { User } from "@/types/user";
import type { Resident } from "@/types/resident";

export interface AuthContextType {
    loading: boolean;

    authenticated: boolean;

    token: string | null;

    user: User | null;

    resident: Resident | null;

    restore(): Promise<void>;

    login(
        username: string,
        password: string,
    ): Promise<LoginResponse>;

    initializeSession(
        token: string,
        user: User,
        resident: Resident | null
    ): Promise<void>;

    logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(
    null
);