import { api } from "@/api/client";
import type {
    PSGCOption,
    RegistrationOptions,
    SectorOption,
    SelectOption,
} from "@/types/registration";

export const RegistrationOptionsService = {
    async getOptions(): Promise<RegistrationOptions> {
        const response = await api.get("/options");
        return response.data;
    },

    async getEthnicities(): Promise<SelectOption<number>[]> {
        const response = await api.get("/options/ethnicities");
        return response.data;
    },

    async getSectors(): Promise<SectorOption[]> {
        const response = await api.get("/options/sectors");
        return response.data;
    },

    async getRegions(): Promise<PSGCOption[]> {
        const response = await api.get("/psgc/regions");
        return response.data.data;
    },

    async getProvinces(regionId: number): Promise<PSGCOption[]> {
        const response = await api.get(
            `/psgc/regions/${regionId}/provinces`
        );
        return response.data.data;
    },

    async getCities(provinceId: number): Promise<PSGCOption[]> {
        const response = await api.get(
            `/psgc/provinces/${provinceId}/cities`
        );
        return response.data.data;
    },

    async getBarangays(cityId: number): Promise<PSGCOption[]> {
        const response = await api.get(
            `/psgc/cities/${cityId}/barangays`
        );
        return response.data.data;
    },

    async getRegistrationSitioPuroks(
        barangayId: number
    ): Promise<SelectOption<number>[]> {
        const response = await api.get(
            "/options/registration/sitio-puroks",
            {
                params: { barangay_id: barangayId },
            }
        );

        return response.data;
    },

};
