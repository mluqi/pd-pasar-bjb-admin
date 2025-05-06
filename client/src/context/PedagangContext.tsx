import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface Pedagang {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_PHONE: string;
  CUST_NIK: string;
  CUST_OWNER: string;
}

interface PedagangContextProps {
  pedagangs: Pedagang[];
  fetchPedagangs: () => Promise<void>;
  addPedagang: (data: Partial<Pedagang>) => Promise<void>;
  editPedagang: (code: string, data: Partial<Pedagang>) => Promise<void>;
  deletePedagang: (code: string) => Promise<void>;
}

const PedagangContext = createContext<PedagangContextProps | undefined>(undefined);

export const PedagangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pedagangs, setPedagangs] = useState<Pedagang[]>([]);

  const fetchPedagangs = async () => {
    try {
      const response = await api.get("/pedagang");
      setPedagangs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch pedagangs:", error);
    }
  };

  const addPedagang = async (data: Partial<Pedagang>) => {
    try {
      await api.post("/pedagang", data);
      fetchPedagangs();
    } catch (error) {
      console.error("Failed to add pedagang:", error);
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

  useEffect(() => {
    fetchPedagangs();
  }, []);

  return (
    <PedagangContext.Provider
      value={{ pedagangs, fetchPedagangs, addPedagang, editPedagang, deletePedagang }}
    >
      {children}
    </PedagangContext.Provider>
  );
};

export const usePedagangContext = () => {
  const context = useContext(PedagangContext);
  if (!context) {
    throw new Error("usePedagangContext must be used within a PedagangProvider");
  }
  return context;
};