import { api } from "@/api/client";

export interface DocumentTypeRequirement {
    id: number;
    name: string;
    description?: string | null;
    is_required: boolean;
    allowed_file_types: string[];
    allowed_file_types_mobile: string[];
    max_file_size: number;
    sort_order: number;
    is_active: boolean;
}

export interface DocumentTypeFieldOption {
    value: string | number;
    label: string;
}

export interface DocumentTypeField {
    id: number;
    document_type_id: number;
    name: string;
    description?: string | null;
    field_key: string;
    field_type:
        | "text"
        | "textarea"
        | "number"
        | "date"
        | "select"
        | "radio"
        | "checkbox";
    is_required: boolean;
    required: boolean;
    option_source?: string | null;
    options: DocumentTypeFieldOption[];
    // options: string[];
    sort_order: number;
    is_active: boolean;
    status: string;
    variable: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentType {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    fee: number | string;
    requires_payment: boolean;
    payment_required: string;
    allow_online_payment: boolean;
    online_payment_allowed: string;
    requires_chairperson_signature: boolean;
    chairperson_signature_required: string;
    processing_days: number | null;
    is_active: boolean;
    status: string;
    fields?: DocumentTypeField[];
    requirements?: DocumentTypeRequirement[];
}

const documentTypeService = {

    /**
     * Get active document types available
     * to the authenticated resident.
     */
    getAvailableDocumentTypes(
        residentId?: number | null
    ) {

        return api.get(
            "/document-types/available",
            {
                params: {
                    per_page: 50,
                    sort: "name",
                    direction: "asc",
                    ...(residentId
                        ? {
                            resident_id: residentId,
                        }
                        : {}),
                },
            }
        );

    },

};

export default documentTypeService;