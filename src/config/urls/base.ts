import { Environment } from "../environment";

const PORT =
    Environment.port
        ? `:${Environment.port}`
        : "";

export const BASE_URL =
    `${Environment.protocol}://${Environment.host}${PORT}`;

export const API_URL =
    `${BASE_URL}/${Environment.prefix}`;

export const STORAGE_URL =
    `${BASE_URL}/storage`;