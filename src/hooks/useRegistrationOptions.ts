import { useQuery } from "@tanstack/react-query";
import { RegistrationOptionsService } from "@/services/registration-options.service";

export function useRegistrationOptions(
    regionId?: number,
    provinceId?: number,
    cityId?: number,
    barangayId?: number
) {
    const options = useQuery({
        queryKey: ["registration", "options"],
        queryFn: RegistrationOptionsService.getOptions,
        staleTime: Infinity,
    });

    const ethnicities = useQuery({
        queryKey: ["registration", "ethnicities"],
        queryFn: RegistrationOptionsService.getEthnicities,
        staleTime: Infinity,
    });

    const sectors = useQuery({
        queryKey: ["registration", "sectors"],
        queryFn: RegistrationOptionsService.getSectors,
        staleTime: Infinity,
    });

    const regions = useQuery({
        queryKey: ["registration", "regions"],
        queryFn: RegistrationOptionsService.getRegions,
        staleTime: Infinity,
    });

    const provinces = useQuery({
        queryKey: ["registration", "provinces", regionId],
        queryFn: () => RegistrationOptionsService.getProvinces(regionId!),
        enabled: !!regionId,
        staleTime: Infinity,
    });

    const cities = useQuery({
        queryKey: ["registration", "cities", provinceId],
        queryFn: () => RegistrationOptionsService.getCities(provinceId!),
        enabled: !!provinceId,
        staleTime: Infinity,
    });

    const barangays = useQuery({
        queryKey: ["registration", "barangays", cityId],
        queryFn: () => RegistrationOptionsService.getBarangays(cityId!),
        enabled: !!cityId,
        staleTime: Infinity,
    });

    const sitioPuroks = useQuery({
        queryKey: ["registration", "sitio-puroks", barangayId],
        queryFn: () =>
            RegistrationOptionsService.getRegistrationSitioPuroks(
                barangayId!
            ),
        enabled: !!barangayId,
        staleTime: Infinity,
    });

    return {
        options: options.data,
        ethnicities: ethnicities.data ?? [],
        sectors: sectors.data ?? [],
        regions: regions.data ?? [],
        provinces: provinces.data ?? [],
        cities: cities.data ?? [],
        barangays: barangays.data ?? [],
        
        sitioPuroks: sitioPuroks.data ?? [],
        sitioPuroksLoading: sitioPuroks.isLoading,
        sitioPuroksError: sitioPuroks.isError,

        loading:
            options.isLoading ||
            ethnicities.isLoading ||
            sectors.isLoading ||
            regions.isLoading,
        error:
            options.isError ||
            ethnicities.isError ||
            sectors.isError ||
            regions.isError,
    };
}
