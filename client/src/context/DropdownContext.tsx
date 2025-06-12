import React, { createContext, useCallback, useContext, useState } from "react";
import api from "../services/api";

interface pasarOptions {
  pasar_code: string;
  pasar_nama: string;
  pasar_status: string;
}

interface pedagangOptions {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_PHONE: string;
  CUST_NIK: string;
  CUST_OWNER: string;
}

interface lapakOptions {
  LAPAK_CODE: string;
  LAPAK_NAMA: string;
  LAPAK_STATUS: string;
  LAPAK_OWNER: string;
  LAPAK_MULAI: string;
  LAPAK_AKHIR: string;
  LAPAK_OWNER_NAME: string;
}

interface DropdownContextProps {
  pasars: pasarOptions[];
  pedagangs: pedagangOptions[];
  lapaks: lapakOptions[];
  fetchAllPasars: () => Promise<void>;
  fetchAllPedagangs: (status?: string) => Promise<void>;
  fetchAllLapaks: (pedagangCode: string) => Promise<void>;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined
);

export const DropdownProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pasars, setPasars] = useState<pasarOptions[]>([]);
  const [pedagangs, setPedagangs] = useState<pedagangOptions[]>([]);
  const [lapaks, setLapaks] = useState<lapakOptions[]>([]);

  const fetchAllPasars = async () => {
    try {
      const response = await api.get("/pasar/all");
      setPasars(response.data || []);
    } catch (error) {
      console.error("Failed to fetch all pasars:", error);
    }
  };

  const fetchAllPedagangs = useCallback(async (status?: string) => {
    try {
      let url = "/pedagang/all";
      if (status) {
        url += `?status=${status}`;
      }
      const response = await api.get(url);
      setPedagangs(response.data || []);
    } catch (error) {
      console.error("Failed to fetch all pedagangs:", error);
      setPedagangs([]);
    }
  }, []);

  const fetchAllLapaks = useCallback(async (pedagangCode?: string) => {
    try {
      let url = "/lapak/all";
      if (pedagangCode) {
        url += `?pedagangCode=${pedagangCode}`;
      }
      const response = await api.get(url);
      const rawLapaks: lapakOptions[] = response.data || [];

      const processedLapaks = rawLapaks.map((lapak) => {
        const ownerPasar = pasars.find(
          (p) => p.pasar_code === lapak.LAPAK_OWNER
        );
        return {
          ...lapak,
          LAPAK_OWNER_NAME: ownerPasar
            ? ownerPasar.pasar_nama
            : lapak.LAPAK_OWNER,
        };
      });

      setLapaks(processedLapaks);
    } catch (error) {
      console.error("Failed to fetch all lapaks for dropdown:", error);
      setLapaks([]);
    }
  }, []);

  return (
    <DropdownContext.Provider
      value={{
        pasars,
        pedagangs,
        lapaks,
        fetchAllPasars,
        fetchAllPedagangs,
        fetchAllLapaks,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "useDropdownContext must be used within a DropdownProvider"
    );
  }
  return context;
};
