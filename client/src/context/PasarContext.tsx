import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
  pasar_logo: string | null;
  pasar_status: string;
}

interface PasarContextProps {
  pasars: Pasar[];
  fetchPasars: () => Promise<void>;
  addPasar: (formData: FormData) => Promise<void>;
  editPasar: (pasar_code: string, formData: FormData) => Promise<void>;
  deletePasar: (pasar_code: string) => Promise<void>;
}

const PasarContext = createContext<PasarContextProps | undefined>(undefined);

export const PasarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [pasars, setPasars] = useState<Pasar[]>([]);

const fetchPasars = async (
  page = 1,
  limit = 10,
  search = "",
  statusFilter = ""
) => {
  try {
    const BASE_URL = "http://dev2.palindo.id:4000/uploads/";
    const res = await api.get(
      `/pasar?page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`
    );
    const dataWithLogo = res.data.data.map((pasar: Pasar) => ({
      ...pasar,
      pasar_logo: pasar.pasar_logo ? `${BASE_URL}${pasar.pasar_logo}` : null,
    }));
    setPasars(dataWithLogo);
    return { totalPages: res.data.totalPages };
  } catch (error) {
    console.error("Failed to fetch pasars:", error);
    return { totalPages: 1 };
  }
};

  const addPasar = async (formData: FormData) => {
    try {
      await api.post("/pasar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchPasars();
    } catch (error) {
      console.error("Failed to add pasar:", error);
    }
  };

  const editPasar = async (pasar_code: string, formData: FormData) => {
    try {
      await api.put(`/pasar/${pasar_code}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchPasars();
    } catch (error) {
      console.error("Failed to edit pasar:", error);
    }
  };

  const deletePasar = async (pasar_code: string) => {
    try {
      await api.delete(`/pasar/${pasar_code}`);
      await fetchPasars();
    } catch (error) {
      console.error("Failed to delete pasar:", error);
    }
  };

  return (
    <PasarContext.Provider value={{ pasars, fetchPasars, addPasar, editPasar, deletePasar }}>
      {children}
    </PasarContext.Provider>
  );
};

export const usePasarContext = () => {
  const context = useContext(PasarContext);
  if (!context) {
    throw new Error("usePasarContext must be used within a PasarProvider");
  }
  return context;
};