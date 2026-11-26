import { api } from "@/api/client";

export interface HouseholdMember {
    id: number;
    full_name: string;
    relationship_to_hh_head_name: string;
}

const householdService = {

    getMembers() {
        return api.get(
            "/my-household/members"
        );
    },

};

export default householdService;