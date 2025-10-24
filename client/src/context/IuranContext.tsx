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
  IURAN_BUKTI_FOTO?: string | null;
  DB_PEDAGANG?: {
    CUST_CODE: string;
    CUST_NAMA: string;
    lapaks?: { LAPAK_NAMA: string; LAPAK_CODE: string; LAPAK_BLOK: string }[];
  };
}

interface IuranContextProps {
  iurans: Iuran[];
  fetchIurans: (
    page: number,
    limit: number,
    search: string,
    statusFilter: string,
    metodeBayarFilter: string,
    startDate: string,
    endDate: string
  ) => Promise<{ totalPages: number; total?: number }>;
  addIuran: (formData: FormData) => Promise<void>;
  editIuran: (IURAN_CODE: string, formData: FormData) => Promise<void>;
  deleteIuran: (IURAN_CODE: string) => Promise<void>;
}

const IuranContext = createContext<IuranContextProps | undefined>(undefined);

export const IuranProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [iurans, setIurans] = useState<Iuran[]>([]);
  const fetchIurans = async (
    page = 1,
    limit = 10,
    search = "",
    statusFilter = "",
    metodeBayarFilter = "",
    startDate = "",
    endDate = ""
  ) => {
    try {
      const res = await api.get(
        `/iuran?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}&metode=${metodeBayarFilter}&startDate=${startDate}&endDate=${endDate}`
      );
      setIurans(res.data.data);
      return { totalPages: res.data.totalPages, total: res.data.total };
    } catch (error) {
      console.error("Failed to fetch iurans:", error);
      return { totalPages: 1 };
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
    console.log(formData);
    try {
      await api.put(`/iuran/${IURAN_CODE}`, formData);
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
    <IuranContext.Provider
      value={{ iurans, fetchIurans, addIuran, editIuran, deleteIuran }}
    >
      {children}
    </IuranContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useIuranContext = () => {
  const context = useContext(IuranContext);
  if (!context) {
    throw new Error("useIuranContext must be used within an IuranProvider");
  }
  return context;
};
