import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useChannelProps{
    id: Id<"channels">;
};

export const useGetChannel =({ id }: useChannelProps) => {
    const data = useQuery(api.channels.getById, { id });
    const isLoading = data === undefined;

    return { data, isLoading };
};