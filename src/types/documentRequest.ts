export type DocumentRequestStatus =
    | "pending"
    | "under_review"
    | "approved"
    | "awaiting_payment"
    | "payment_received"
    | "for_signature"
    | "generating"
    | "ready_for_release"
    | "released"
    | "downloaded"
    | "rejected"
    | "cancelled";

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "cancelled";

export type DocumentDeliveryMethod =
    | "pickup"
    | "download";

export interface DocumentType {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    fee?: string | number;
    requires_payment?: boolean;
    processing_days?: number;
    requirements?: DocumentTypeRequirement[];
}

export interface DocumentRequestResident {
    id: number;
    name: string;
}

export interface DocumentPayment {
    id: number;
    amount: string;

    status: PaymentStatus;
    status_label: string;

    provider: string;

    payment_method: string;
    payment_method_label: string;

    reference_no?: string | null;

    checkout_url?: string | null;

    paid_at?: string | null;

    created_at: string;
    updated_at: string;
}

export interface DocumentFile {
    id: number;
    uuid: string;
    filename?: string | null;
    mime_type?: string | null;
    size?: number | null;
    created_at?: string | null;
    created_at_label?: string | null;
}

export interface DocumentRequestLog {
    status: DocumentRequestStatus;
    status_label: string;
    remarks?: string | null;
    performed_by?: string | null;
    created_at: string;
    created_at_label?: string | null;
}

export interface DocumentTypeRequirement {
    id: number;
    name: string;
    description?: string | null;
    is_required: boolean;
    allowed_file_types: string[];
    max_file_size: number;
    sort_order: number;
    is_active: boolean;
}

export interface DocumentRequestAttachmentFile {
    uri: string;
    name: string;
    type: string;
    size?: number;
}

export interface DocumentRequestAttachment {
    uuid: string;
    filename: string;
    mime_type: string;
    size: number;
    requirement?: DocumentRequestAttachmentRequirement | null;
    uploaded_by?: {
        id: number;
        name: string;
    } | null;
    created_at?: string | null;
    created_at_label?: string | null;
}

export interface DocumentRequestField {
    id: number;
    document_type_field_id: number;
    field_key: string | null;
    name: string | null;
    value: string | null;
    display_value?: string | null;
}

export interface DocumentRequestAttachmentRequirement {
    id: number;
    name: string;
    description: string | null;
    is_required: boolean;
}

export interface DocumentRequest {
    id: number;
    request_no: string;
    status: DocumentRequestStatus;
    status_label: string;
    purpose: string;
    remarks?: string | null;
    requested_at: string;
    requested_at_label: string;
    delivery_method: DocumentDeliveryMethod;
    document_type?: DocumentType;
    requester?: DocumentRequestResident;
    requested_for?: DocumentRequestResident;
    payments?: DocumentPayment[];
    files?: DocumentFile[];
    fields: DocumentRequestField[];
    attachments: DocumentRequestAttachment[];
    logs?: DocumentRequestLog[];
    created_at: string;
    created_at_label: string;
    updated_at: string;
    updated_at_label: string;
}