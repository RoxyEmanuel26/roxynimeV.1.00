"use client";
import {
    createContext, useContext, useState,
    useEffect, useCallback, type ReactNode
} from "react";
import { SAVER_CONFIG, isModeHemat } from "@/config/dataSaver";

interface DataSaverContextType {
    isHemat: boolean;
    toggleHemat: () => void;
    savedBytes: number;
    addSavedBytes: (n: number) => void;
    isServerHemat: boolean;
    connectionType: string;
}

const DataSaverContext = createContext<DataSaverContextType>({
    isHemat: false,
    toggleHemat: () => { },
    savedBytes: 0,
    addSavedBytes: () => { },
    isServerHemat: SAVER_CONFIG.MODE_HEMAT,
    connectionType: "unknown"
});

export function DataSaverProvider({ children }: { children: ReactNode }) {
    const serverDefault = isModeHemat();
    const [isHemat, setIsHemat] = useState(serverDefault);
    const [savedBytes, setSavedBytes] = useState(0);
    const [connectionType, setConnectionType] = useState("unknown");

    useEffect(() => {
        // Baca preferensi user dari localStorage
        const saved = localStorage.getItem("roxynime_mode_hemat");
        if (saved !== null) {
            setIsHemat(saved === "true");
        } else {
            setIsHemat(serverDefault);
        }

        // ── Network Information API ──────────────────
        // Deteksi koneksi otomatis:
        const nav = navigator as any;
        if (nav.connection) {
            const conn = nav.connection;
            setConnectionType(conn.effectiveType || "unknown");

            // Auto-aktifkan mode hemat kalau koneksi 2G/slow-2g
            if (
                conn.effectiveType === "2g" ||
                conn.effectiveType === "slow-2g" ||
                conn.saveData === true // ← user aktifkan Data Saver di Android!
            ) {
                setIsHemat(true);
                localStorage.setItem("roxynime_mode_hemat", "true");
            }

            // Listen perubahan koneksi real-time
            const handleChange = () => {
                setConnectionType(conn.effectiveType);
                if (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g") {
                    setIsHemat(true);
                    localStorage.setItem("roxynime_mode_hemat", "true");
                }
            };
            conn.addEventListener("change", handleChange);
            return () => conn.removeEventListener("change", handleChange);
        }
    }, [serverDefault]);

    const toggleHemat = useCallback(() => {
        setIsHemat((prev) => {
            const next = !prev;
            localStorage.setItem("roxynime_mode_hemat", String(next));
            if (next) setSavedBytes(0); // reset counter saat aktifkan
            return next;
        });
    }, []);

    const addSavedBytes = useCallback((n: number) => {
        setSavedBytes((prev) => prev + n);
    }, []);

    return (
        <DataSaverContext.Provider
            value={{
                isHemat, toggleHemat, savedBytes, addSavedBytes,
                isServerHemat: serverDefault, connectionType
            }}
        >
            {children}
        </DataSaverContext.Provider>
    );
}

export function useDataSaver() {
    return useContext(DataSaverContext);
}
