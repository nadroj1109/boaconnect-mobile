export const documentRequest = {

    index: "/document-requests",

    create: "/document-requests",

    show(id: number) {

        return `/document-requests/${id}`;

    },

    cancel(id: number) {

        return `/document-requests/${id}/cancel`;

    },

    download(id: number) {

        return `/document-requests/${id}/download`;

    },

} as const;