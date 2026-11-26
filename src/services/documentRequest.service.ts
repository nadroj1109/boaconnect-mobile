import { api } from "@/api/client";

export type DocumentPaymentMethod =
    | "gcash"
    | "grabpay"
    | "maya"
    | "card"
    | "online_banking"
    | "over_the_counter";

export type DocumentDeliveryMethod =
    | "pickup"
    | "download";

export interface DocumentRequestFile {
    uri: string;
    name: string;
    type: string;
}

export interface CreateDocumentRequestData {
    requested_for_resident_id: number | null;
    document_type_id: number;
    delivery_method: DocumentDeliveryMethod;
    purpose: string;
    remarks?: string;

    fields?: Record<
        string,
        string | number | (string | number)[]
    >;

    attachments?: Record<
        number,
        DocumentRequestFile
    >;
}

export interface CreatePaymentData {
    payment_method: DocumentPaymentMethod;
}

const documentRequestService = {

    /**
     * Get authenticated resident's document requests.
     */
    getDocumentRequests(params = {}) {
        return api.get(
            "/document-requests",
            {
                params,
            }
        );
    },

    /**
     * Get a specific document request.
     */
    getDocumentRequest(id: number) {
        return api.get(
            `/document-requests/${id}`
        );
    },

    /**
     * Retrieve a supporting attachment for viewing.
     */
    viewAttachment(
        documentRequestId: number,
        attachmentUuid: string
    ) {
        const url =
            `/document-requests/${documentRequestId}` +
            `/attachments/${attachmentUuid}/view`;

        console.log("Document Attachment URL:", url);

        return api.get(
            url,
            {
                responseType: "arraybuffer",
            }
        );
    },

    /**
     * Create a document request.
     */
    createDocumentRequest(
        data: CreateDocumentRequestData
    ) {

        const formData = new FormData();

        formData.append(
            "requested_for_resident_id",
            String(
                data.requested_for_resident_id
            )
        );

        formData.append(
            "document_type_id",
            String(
                data.document_type_id
            )
        );

        formData.append(
            "delivery_method",
            data.delivery_method
        );

        formData.append(
            "purpose",
            data.purpose
        );

        if (data.remarks) {

            formData.append(
                "remarks",
                data.remarks
            );

        }

        Object.entries(
            data.fields ?? {}
        ).forEach(
            ([fieldKey, value]) => {

                formData.append(
                    `fields[${fieldKey}]`,
                    Array.isArray(value)
                        ? JSON.stringify(value)
                        : String(value)
                );

            }
        );


        /*
        |--------------------------------------------------------------------------
        | Attachments
        |--------------------------------------------------------------------------
        */

        Object.entries(
            data.attachments ?? {}
        ).forEach(
            ([requirementId, file]) => {

                formData.append(
                    `attachments[${requirementId}]`,
                    {
                        uri: file.uri,
                        name: file.name,
                        type: file.type,
                    } as any
                );

            }
        );

        console.log(
            "Document Request Fields:",
            data.fields
        );

        return api.post(
            "/document-requests",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );
    },

    /**
     * Create or retrieve payment for a document request.
     */
    createPayment(
        requestId: number,
        data: CreatePaymentData
    ) {

        return api.post(
            `/document-requests/${requestId}/payment`,
            data
        );

    },

    /**
     * Get the current pending payment.
     */
    getPayment(
        requestId: number
    ) {

        return api.get(
            `/document-requests/${requestId}/payment`
        );

    },

    /**
     * Verify the PayMongo payment and update
     * the local payment status.
     */
    confirmPayment(
        requestId: number
    ) {

        return api.post(
            `/document-requests/${requestId}/payment/confirm`
        );

    },

    /**
     * Cancel the current pending payment.
     */
    cancelPayment(
        requestId: number
    ) {

        return api.delete(
            `/document-requests/${requestId}/payment`
        );

    },

    releaseAfterDownload(requestId: number) {
        return api.post(
            `/document-requests/${requestId}/download/release`
        );
    },

};

export default documentRequestService;