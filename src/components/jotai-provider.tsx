"use client";

import { Provider } from "jotai";

interface JotaiProviderProps{
    children: React.ReactNode;
};

export const JotaiProvider = ({ children } : JotaiProviderProps) => {
    //fixing Jotai-provider in layout.tsx to avoid jotai warning
    return(
        <Provider>
            {children}
        </Provider>
    )
};