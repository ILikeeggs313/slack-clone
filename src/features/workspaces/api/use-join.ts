import { useMutation } from "convex/react";
import { useCallback, useState, useMemo } from "react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { workspaceId:Id<"workspaces">, joinCode: string};
type ResponseType = Id<"workspaces"> | null;

type Options = {
    //regardless of error or success, after we finish the request, do -> (something)
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useJoin = () => {

    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null >(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);
    
    // const [isPending, setIsPending] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);
    // const [isError, setIsError] = useState(false);
    // const [isSettled, setIsSettled] = useState(false);
    const isPending = useMemo(() => status === "pending",[status]);
    const isSuccess = useMemo(() => status === "success",[status]);
    const isError = useMemo(() => status === "error",[status]);
    const isSettled = useMemo(() => status === "settled",[status]);

    const mutation = useMutation(api.workspaces.join);

    //wrap this in useCallback in case we use it outside somewhere, and we can safely put it in dependency array
    const mutate = useCallback(async(values: RequestType, options?: Options) => {
        try{
            setData(null);
            setError(null);
            setStatus("pending");

            //initial errors since the id in requestType was not explicit, put in workspaceId instead of Id to be explicit
            const response = await mutation(values);
            options?.onSuccess?.(response);
            return response;
        } catch(error) {
            setStatus("error");
            options?.onError?.(error as Error);
        
            if(options?.throwError){
                throw error;
            }    
        } finally {
            setStatus("settled");
            options?.onSettled?.();
        }
    }, [mutation]);

    return {
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isError,
        isSettled,
    };
};