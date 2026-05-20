"use client";


import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
// [SECURITY FIX] SessionProvider dihapus — fitur auth sudah di-decommission
import { DataSaverProvider } from "@/context/DataSaverContext";

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {/* [SECURITY FIX] SessionProvider wrapper dihapus */}
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange={false}
            >
                <DataSaverProvider>
                    {children}
                </DataSaverProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
