import { api } from "@/api/client";

const documentFileService = {

    download(uuid: string) {
        return api.get(
            `/document-files/${uuid}/download`,
            {
                responseType: "arraybuffer",
            }
        );
    },

};

export default documentFileService;