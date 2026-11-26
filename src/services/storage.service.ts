import * as SecureStore from "expo-secure-store";
import { STORAGE } from "@/constants/storage";

export const StorageService = {
    async getToken() {
        return SecureStore.getItemAsync(STORAGE.TOKEN);
    },

    async setToken(token: string) {
        await SecureStore.setItemAsync(STORAGE.TOKEN, token);
    },

    async removeToken() {
        await SecureStore.deleteItemAsync(STORAGE.TOKEN);
    },

    async getUser<T = unknown>(): Promise<T | null> {
        const value = await SecureStore.getItemAsync(STORAGE.USER);

        return value ? JSON.parse(value) : null;
    },

    async setUser(value: unknown) {
        await SecureStore.setItemAsync(
            STORAGE.USER,
            JSON.stringify(value)
        );
    },

    async removeUser() {
        await SecureStore.deleteItemAsync(STORAGE.USER);
    },

    async getResident<T = unknown>(): Promise<T | null> {
        const value = await SecureStore.getItemAsync(STORAGE.RESIDENT);

        return value ? JSON.parse(value) : null;
    },

    async setResident(value: unknown) {
        await SecureStore.setItemAsync(
            STORAGE.RESIDENT,
            JSON.stringify(value)
        );
    },

    async removeResident() {
        await SecureStore.deleteItemAsync(STORAGE.RESIDENT);
    },

    async clear() {
        await Promise.all([
            this.removeToken(),
            this.removeUser(),
            this.removeResident(),
        ]);
    },
};