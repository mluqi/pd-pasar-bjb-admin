import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

interface Pedagang {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_PHONE: string;
  CUST_NIK: string;
  CUST_OWNER: string;
  CUST_IURAN: string;
  CUST_STATUS: string;
  pasar?: { pasar_nama: string };
  lapaks?: { LAPAK_NAMA: string; LAPAK_CODE: string; LAPAK_OWNER: string }[];
}

interface PedagangContextProps {
  pedagangs: Pedagang[];
  fetchPedagangs: (
    page?: number,
    limit?: number,
    search?: string,
    owner?: string,
    status?: string,
    sortOrder?: string,
    sortBy?: string
  ) => Promise<{ totalPages: number; total?: number }>;
  addPedagang: (pedagangData: Partial<Pedagang>) => Promise<Pedagang | null>;
  editPedagang: (code: string, data: Partial<Pedagang>) => Promise<void>;
  deletePedagang: (code: string) => Promise<void>;
}

const PedagangContext = createContext<PedagangContextProps | undefined>(
  undefined
);

export const PedagangProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pedagangs, setPedagangs] = useState<Pedagang[]>([]);

  const fetchPedagangs = async (
    page = 1,
    limit = 10,
    search = "",
    owner = "",
    status = "",
    sortOrder = "desc",
    sortBy = "CUST_CODE"
  ) => {
    try {
      const response = await api.get(
        `/pedagang?page=${page}&limit=${limit}&search=${search}&owner=${owner}&status=${status}&sortOrder=${sortOrder}&sortBy=${sortBy}`
      );
      setPedagangs(response.data.data || []);
      return {
        totalPages: response.data.totalPages,
        total: response.data.total,
      };
    } catch (error) {
      console.error("Failed to fetch pedagangs:", error);
      return { totalPages: 1 };
    }
  };

  const addPedagang = async (
    pedagangData: Partial<Pedagang>
  ): Promise<Pedagang | null> => {
    try {
      const response = await api.post("/pedagang", pedagangData);
      await fetchPedagangs();
      return response.data;
    } catch (error) {
      console.error("Failed to add pedagang:", error);
      throw error;
    }
  };

  const editPedagang = async (code: string, data: Partial<Pedagang>) => {
    try {
      await api.put(`/pedagang/${code}`, data);
      fetchPedagangs();
    } catch (error) {
      console.error("Failed to edit pedagang:", error);
    }
  };

  const deletePedagang = async (code: string) => {
    try {
      await api.delete(`/pedagang/${code}`);
      fetchPedagangs();
    } catch (error) {
      console.error("Failed to delete pedagang:", error);
    }
  };

  return (
    <PedagangContext.Provider
      value={{
        pedagangs,
        fetchPedagangs,
        addPedagang,
        editPedagang,
        deletePedagang,
      }}
    >
      {children}
    </PedagangContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePedagangContext = () => {
  const context = useContext(PedagangContext);
  if (!context) {
    throw new Error(
      "usePedagangContext must be used within a PedagangProvider"
    );
  }
  return context;
};
