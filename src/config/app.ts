import { Environment } from "./environment";
import { URLS } from "./urls";

export const AppConfig = {

    appName: Environment.appName,

    apiUrl: URLS.api,

} as const;