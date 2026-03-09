"use client";

import { useEffect } from "react";
import { useDataSaver } from "@/context/DataSaverContext";

export function DisablePrefetch() {
    const { isHemat } = useDataSaver();

    useEffect(() => {
        if (isHemat) {
            // Remove all prefetch link tags to save bandwidth
            document
                .querySelectorAll("link[rel='prefetch'], link[rel='dns-prefetch']")
                .forEach((el) => {
                    el.remove();
                });
        }
    }, [isHemat]);

    return null;
}
