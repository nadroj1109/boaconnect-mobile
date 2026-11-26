import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { AuthContext } from "@/context/AuthContext";

import { StorageService } from "@/services/storage.service";
import { AuthService } from "@/services/auth.service";

import type { User } from "@/types/user";
import type { Resident } from "@/types/resident";

interface Props {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: Props) {

    const [loading, setLoading] = useState(true);

    const [token, setToken] =
        useState<string | null>(null);

    const [user, setUser] =
        useState<User | null>(null);

    const [resident, setResident] =
        useState<Resident | null>(null);

    const initializeSession = useCallback(

        async (

            token: string,

            user: User,

            resident: Resident | null,

        ) => {

            await StorageService.setToken(
                token
            );

            await StorageService.setUser(
                user
            );

            await StorageService.setResident(
                resident
            );

            setToken(
                token
            );

            setUser(
                user
            );

            setResident(
                resident
            );

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Restore Session
    |--------------------------------------------------------------------------
    */

    const restore = useCallback(async () => {

        try {

            const storedToken =
                await StorageService.getToken();

            if (!storedToken) {

                return;

            }

            const response =
                await AuthService.me();

            await StorageService.setUser(
                response.data.user
            );

            await StorageService.setResident(
                response.data.resident
            );

            setToken(storedToken);

            setUser(
                response.data.user
            );

            setResident(
                response.data.resident
            );

        }

        catch {

            await StorageService.clear();

            setToken(null);

            setUser(null);

            setResident(null);

        }

        finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        restore();

    }, [restore]);

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    const login = useCallback(

        async (
            username: string,
            password: string,
        ) => {

            const response =
                await AuthService.login({

                    username,
                    password,

                });

            if (

                response.success &&
                response.data?.token &&
                response.data?.user

            ) {

                await initializeSession(

                    response.data.token,

                    response.data.user,

                    response.data.resident,

                );

            }

            return response;

        },

        [
            initializeSession,
        ]

    );

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const logout = useCallback(async () => {

        try {

            await AuthService.logout();

        }

        catch {

            // Ignore network errors.

        }

        await StorageService.clear();

        setToken(null);

        setUser(null);

        setResident(null);

    }, []);

    /*
    |--------------------------------------------------------------------------
    | Context
    |--------------------------------------------------------------------------
    */

    const value = useMemo(() => ({

        loading,

        authenticated: token !== null,

        token,

        user,

        resident,

        restore,

        login,

        initializeSession,

        logout,

    }), [

        loading,

        token,

        user,

        resident,

        restore,

        login,

        initializeSession,

        logout,

    ]);

    return (

        <AuthContext.Provider value={value}>

            {children}

        </AuthContext.Provider>

    );

}