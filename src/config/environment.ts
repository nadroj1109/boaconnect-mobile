export const Environment = {

    appName:
        process.env.EXPO_PUBLIC_APP_NAME
        ?? "BOAConnect",

    protocol:
        process.env.EXPO_PUBLIC_API_PROTOCOL
        ?? "http",

    host:
        process.env.EXPO_PUBLIC_API_HOST
        ?? "127.0.0.1",

    port:
        process.env.EXPO_PUBLIC_API_PORT,

    prefix:
        process.env.EXPO_PUBLIC_API_PREFIX
        ?? "api/v1",

} as const;