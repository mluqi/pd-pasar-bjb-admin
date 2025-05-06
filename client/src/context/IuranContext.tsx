import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

interface Iuran {
    IURAN_CODE: string;
    IURAN_PEDAGANG: string;
    IURAN_TANGGAL: string;
    IURAN_JUMLAH: number;
    IURAN_STATUS: string;
    IURAN_METODE_BAYAR: string;
    IURAN_WAKTU_BAYAR: string;
    IURAN_USER: string;
}

interface IuranContextProps {
    iurans: Iuran[];
    fetchIurans: () => Promise<void>;
    addIuran: (formData: FormData) => Promise<void>;
    editIuran: (IURAN_CODE: string, formData: FormData) => Promise<void>;
    deleteIuran: (IURAN_CODE: string) => Promise<void>;
}

const IuranContext = createContext<IuranContextProps | undefined>(undefined);

export const IuranProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [iurans, setIurans] = useState<Iuran[]>([]);
    const fetchIurans = async () => {
        try {
            const res = await api.get("/iuran");
            setIurans(res.data);
        } catch (error) {
            console.error("Failed to fetch iurans:", error);
        }
    };

    const addIuran = async (formData: FormData) => {
        console.log("Adding iuran with formData:", formData);
        try {
            await api.post("/iuran", formData);
            await fetchIurans();
        } catch (error) {
            console.error("Failed to add iuran:", error);
        }
    };
    
    const editIuran = async (IURAN_CODE: string, formData: FormData) => {
        try {
            await api.put(`/iuran/${IURAN_CODE}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchIurans();
        } catch (error) {
            console.error("Failed to edit iuran:", error);
        }
    };
    const deleteIuran = async (IURAN_CODE: string) => {
        try {
            await api.delete(`/iuran/${IURAN_CODE}`);
            await fetchIurans();
        } catch (error) {
            console.error("Failed to delete iuran:", error);
        }
    };
    return (
        <IuranContext.Provider value={{ iurans, fetchIurans, addIuran, editIuran, deleteIuran }}>
            {children}
        </IuranContext.Provider>
    );
}

export const useIuranContext = () => {
    const context = useContext(IuranContext);
    if (!context) {
        throw new Error("useIuranContext must be used within an IuranProvider");
    }
    return context;
};