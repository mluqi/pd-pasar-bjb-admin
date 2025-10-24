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
  LAPAK_HEREGISTRASI?: number | null;
  LAPAK_SIPTU?: number | null;
  LAPAK_BUKTI_FOTO?: string | null;
  // Optional: Add types for included models if you access them directly
  pasar?: { pasar_nama: string };
  DB_PEDAGANG?: { CUST_CODE: string; CUST_NAMA: string };
  DB_TYPE_LAPAK?: { TYPE_CODE: string; TYPE_NAMA: string };
}

interface LapakContextProps {
  lapaks: Lapak[];
  allLapaks: Lapak[];
  fetchAllLapaks: () => Promise<void>;
  fetchLapaks: (
    page: number,
    limit: number,
    search: string,
    statusFilter: string,
    pasar: string,
    owner: string,
    sortOrder?: string
  ) => Promise<{ totalPages: number; total?: number }>;
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
  const [allLapaks, setAllLapaks] = useState<Lapak[]>([]);

  const fetchAllLapaks = async (): Promise<void> => {
    try {
      const res = await api.get(
        `/lapak?page=1&limit=100000&search=&status=&pasar=&owner=&sortOrder=desc`
      );
      setAllLapaks(res.data.data);
    } catch (error) {
      console.error("Failed to fetch all lapaks:", error);
      throw error; // Re-throw to allow error handling in components
    }
  };

  const fetchLapaks = async (
    page = 1,
    limit = 10,
    search = "",
    statusFilter = "",
    pasar = "",
    owner = "",
    sortOrder = "desc"
  ): Promise<{ totalPages: number; total?: number }> => {
    try {
      const res = await api.get(
        `/lapak?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&pasar=${pasar}&owner=${owner}&sortOrder=${sortOrder}`
      );

      setLapaks(res.data.data);

      // Return the totalPages from the response
      return {
        totalPages:
          res.data.totalPages || Math.ceil((res.data.total || 0) / limit),
        total: res.data.total,
      };
    } catch (error) {
      console.error("Failed to fetch lapaks:", error);
      throw error; // Re-throw to allow error handling in components
    }
  };

  const addLapak = async (formData: FormData): Promise<void> => {
    console.log("Adding lapak with formData:", formData);
    try {
      await api.post("/lapak", formData);
      // Refresh the current lapaks list after adding
      await fetchLapaks();
    } catch (error) {
      console.error("Failed to add lapak:", error);
      throw error;
    }
  };

  const editLapak = async (
    LAPAK_CODE: string,
    formData: FormData
  ): Promise<void> => {
    try {
      await api.put(`/lapak/${LAPAK_CODE}`, formData);
      // Refresh the current lapaks list after editing
      await fetchLapaks();
    } catch (error) {
      console.error("Failed to edit lapak:", error);
      throw error;
    }
  };

  const editStatusLapak = async (
    LAPAK_CODE: string,
    data: Partial<Lapak>
  ): Promise<void> => {
    try {
      const res = await api.put(`/lapak/${LAPAK_CODE}/status`, data);
      // Refresh the current lapaks list after status change
      await fetchLapaks();
      console.log(res);
    } catch (error) {
      console.error("Failed to edit lapak status:", error);
      throw error;
    }
  };

  const deleteLapak = async (LAPAK_CODE: string): Promise<void> => {
    try {
      await api.delete(`/lapak/${LAPAK_CODE}`);
      // Refresh the current lapaks list after deletion
      await fetchLapaks();
    } catch (error) {
      console.error("Failed to delete lapak:", error);
      throw error;
    }
  };

  return (
    <LapakContext.Provider
      value={{
        lapaks,
        allLapaks,
        fetchAllLapaks,
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
