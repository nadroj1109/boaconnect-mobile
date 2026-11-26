export const complaint = {

    index: "/complaints",

    create: "/complaints",

    show(id: number) {

        return `/complaints/${id}`;

    },

} as const;