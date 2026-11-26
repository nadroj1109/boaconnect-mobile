export const notification = {

    index: "/notifications",

    markRead(id: number) {

        return `/notifications/${id}/read`;

    },

} as const;