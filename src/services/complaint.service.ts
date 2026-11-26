import { api } from "@/api/client";

import type {
    Complaint,
    ComplaintRespondent,
    ComplaintType,
    CreateComplaintData,
} from "@/types/complaint";

const complaintService = {

    getComplaints(params = {}) {

        return api.get<{
            data: Complaint[];
        }>(
            "/resident/complaints",
            {
                params,
            }
        );

    },

    getComplaint(id: number) {

        return api.get<{
            data: Complaint;
        }>(
            `/resident/complaints/${id}`
        );

    },

    viewAttachment(
        complaintId: number,
        attachmentUuid: string
    ) {
        return api.get(
            `/complaints/${complaintId}/attachments/${attachmentUuid}/view`,
            {
                responseType: "arraybuffer",
            }
        );
    },

    getComplaintTypes() {

        return api.get<{
            data: ComplaintType[];
        }>(
            "/resident/complaints/types"
        );

    },

    getRespondents() {

        return api.get<{
            data: ComplaintRespondent[];
        }>(
            "/resident/complaints/respondents"
        );

    },

    createComplaint(
        data: CreateComplaintData
    ) {

        return api.post<{
            data: Complaint;
            message: string;
        }>(
            "/resident/complaints",
            data
        );

    },

    uploadAttachment(
        complaintId: number,
        file: {
            uri: string;
            name: string;
            type?: string;
        }
    ) {

        const formData =
            new FormData();

        formData.append(
            "file",
            {
                uri: file.uri,
                name: file.name,
                type:
                    file.type ??
                    "application/octet-stream",
            } as any
        );

        return api.post(
            `/resident/complaints/${complaintId}/attachments`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

    },

    myComplaintHistory() {
        return api.get(
            "/resident/complaints/my-complaint-history"
        );
    },

};

export default complaintService;