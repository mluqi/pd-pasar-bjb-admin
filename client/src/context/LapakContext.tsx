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
  LAPAK_STATUS: "aktif" | "kosong" | "rusak" | "tutup";
  LAPAK_OWNER: string;
  LAPAK_BUKTI_FOTO?: string | null;
  // Optional: Add types for included models if you access them directly
  pasar?: { pasar_nama: string };
  DB_PEDAGANG?: { CUST_CODE: string; CUST_NAMA: string };
  DB_TYPE_LAPAK?: { TYPE_CODE: string; TYPE_NAMA: string };
}

interface LapakContextProps {
  lapaks: Lapak[];
  fetchLapaks: (
    page: number,
    limit: number,
    search: string,
    statusFilter: string,
    pasar: string,
    owner: string
  ) => Promise<void>;
  addLapak: (formData: FormData) => Promise<void>;
  editLapak: (LAPAK_CODE: string, formData: FormData) => Promise<void>;
  editStatusLapak: (LAPAK_CODE: string, data: Partial<Lapak>) => Promise<void>;
  deleteLapak: (LAPAK_CODE: string) => Promise<void>;
}

const LapakContext = createContext<LapakContextProps | undefined>(undefined);

export const LapakProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lapaks, setLapaks] = useState<Lapak[]>([]);

  const fetchLapaks = async (
    page = 1,
    limit = 10,
    search = "",
    statusFilter = "",
    pasar = "",
    owner = ""
  ) => {
    try {
      const res = await api.get(
        `/lapak?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&pasar=${pasar}&owner=${owner}`
      );
      setLapaks(res.data.data);
      return { totalPages: res.data.totalPages };
    } catch (error) {
      console.error("Failed to fetch lapaks:", error);
      return { totalPages: 1 };
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

  const editStatusLapak = async (LAPAK_CODE: string, data: Partial<Lapak>) => {
    try {
      const res = await api.put(`/lapak/${LAPAK_CODE}/status`, data);
      await fetchLapaks();
      console.log(res);
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
    <LapakContext.Provider
      value={{
        lapaks,
        fetchLapaks,
        addLapak,
        editLapak,
        editStatusLapak,
        deleteLapak,
      }}
    >
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
