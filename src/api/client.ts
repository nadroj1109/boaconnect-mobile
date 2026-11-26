import axios from "axios";

import { AppConfig } from "@/config/app";
import { StorageService } from "@/services/storage.service";

export const api = axios.create({
    baseURL: `${AppConfig.apiUrl}`,
    timeout: 30000,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    async (config) => {

        const token = await StorageService.getToken();

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        if (error.response?.status === 401) {

            await StorageService.clear();

        }

        return Promise.reject(error);

    }

);