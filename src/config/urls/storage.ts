import {
    BASE_URL,
    STORAGE_URL,
} from "./base";

export const storage = {

    base: STORAGE_URL,

    avatar(filename?: string) {

        return filename
            ? `${STORAGE_URL}/avatars/${filename}`
            : `${BASE_URL}/images/default-avatar.png`;

    },

    resident(filename?: string) {

        return filename
            ? `${STORAGE_URL}/residents/${filename}`
            : undefined;

    },

    document(filename: string) {

        return `${STORAGE_URL}/documents/${filename}`;

    },

} as const;