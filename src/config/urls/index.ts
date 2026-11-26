import { API_URL } from "./base";

import { auth } from "./auth";
import { resident } from "./resident";
import { storage } from "./storage";
import { complaint } from "./complaint";
import { notification } from "./notification";
import { documentRequest } from "./document-request";

export const URLS = {

    api: API_URL,

    auth,

    resident,

    storage,

    complaint,

    notification,

    documentRequest,

} as const;