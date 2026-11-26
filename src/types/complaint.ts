export interface ComplaintType {
    id: number;
    name: string;
    description: string | null;
}

export interface ComplaintRespondent {
    value: number;
    label: string;
}

export interface CreateComplaintData {
    respondent_id: number;
    complaint_type_id: number;
    subject: string;
    description: string;
    incident_date: string;
    incident_time?: string | null;
    incident_location?: string | null;
}

export interface ComplaintAttachment {
    uuid: string;
    filename: string;
    mime_type: string;
    size: number;
    uploaded_by?: string | null;
    created_at?: string | null;
    created_at_label?: string | null;
}

export interface ResidentComplaintHistory {
    id: number;
    complaint_no: string;

    complaint_type: {
        id: number;
        name: string;
    } | null;

    subject: string;

    incident_date: string | null;
    incident_date_label: string | null;

    status: string;
    status_label: string;

    resolution: string | null;

    resolved_at: string | null;
    resolved_at_label: string | null;

    closed_at: string | null;
    closed_at_label: string | null;

    is_historical: boolean;
}

export interface Complaint {
    id: number;
    complaint_no: string;

    resident_id: number;
    respondent_id: number;
    complaint_type_id: number;

    complaint_type?: ComplaintType;

    subject: string;
    description: string;

    incident_date: string;
    incident_date_label?: string;

    incident_time: string | null;

    incident_location: string | null;

    attachments?: ComplaintAttachment[];

    status: string;
    status_label: string;

    source?: string;
    source_label?: string;

    respondent?: {
        id: number;
        name: string;
    };

    resident?: {
        id: number;
        name: string;
    };

    resolution?: string | null;

    resolved_at?: string | null;
    resolved_at_label?: string | null;

    closed_at?: string | null;
    closed_at_label?: string | null;

    created_at?: string;
    created_at_label?: string;

    updated_at?: string;
    updated_at_label?: string;
}