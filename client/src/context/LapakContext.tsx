import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

interface Lapak {
  LAPAK_CODE: string;
  LAPAK_NAMA: string;
  LAPAK_BLOK: string;
  LAPAK_UKURAN: string;
  LAPAK_TYPE: string;
  LAPAK_PENYEWA: string | null;
  LAPAK_MULAI: string | null;
  LAPAK_AKHIR: string | null;
  LAPAK_STATUS: "aktif" | "kosong" | "rusak";
  LAPAK_OWNER: string;
}

interface LapakContextProps {
  lapaks: Lapak[];
  fetchLapaks: () => Promise<void>;
  addLapak: (formData: FormData) => Promise<void>;
  editLapak: (LAPAK_CODE: string, formData: FormData) => Promise<void>;
  deleteLapak: (LAPAK_CODE: string) => Promise<void>;
}

const LapakContext = createContext<LapakContextProps | undefined>(undefined);

export const LapakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lapaks, setLapaks] = useState<Lapak[]>([]);

  const fetchLapaks = async () => {
    try {
      const res = await api.get("/lapak");
      setLapaks(res.data);
    } catch (error) {
      console.error("Failed to fetch lapaks:", error);
    }
  };

  const addLapak = async (formData: FormData) => {
    console.log("Adding lapak with formData:", formData);
    try {
      await api.post("/lapak", formData);
      await fetchLapaks();
    } catch (error) {
      console.error("Failed to add lapak:", error);
    }
  };

  const editLapak = async (LAPAK_CODE: string, formData: FormData) => {
    try {
      await api.put(`/lapak/${LAPAK_CODE}`, formData);
      await fetchLapaks();
    } catch (error) {
      console.error("Failed to edit lapak:", error);
    }
  };

  const deleteLapak = async (LAPAK_CODE: string) => {
    try {
      await api.delete(`/lapak/${LAPAK_CODE}`);
      await fetchLapaks();
    } catch (error) {
      console.error("Failed to delete lapak:", error);
    }
  };

  return (
    <LapakContext.Provider value={{ lapaks, fetchLapaks, addLapak, editLapak, deleteLapak }}>
      {children}
    </LapakContext.Provider>
  );
};

export const useLapakContext = () => {
  const context = useContext(LapakContext);
  if (!context) {
    throw new Error("useLapakContext must be used within a LapakProvider");
  }
  return context;
};