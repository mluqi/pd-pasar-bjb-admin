import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface LogContextProps {
  logActivity: any[];
  logAkses: any[];
  fetchLogActivity: () => Promise<void>;
  fetchLogAkses: () => Promise<void>;
}

const LogContext = createContext<LogContextProps | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logActivity, setLogActivity] = useState<any[]>([]);
  const [logAkses, setLogAkses] = useState<any[]>([]);

  const fetchLogActivity = async () => {
    try {
      const response = await api.get("/log-activity");
      setLogActivity(response.data);
    } catch (error) {
      console.error("Error fetching log activity:", error);
    }
  };

  const fetchLogAkses = async () => {
    try {
      const response = await api.get("/log-akses");
      setLogAkses(response.data);
    } catch (error) {
      console.error("Error fetching log akses:", error);
    }
  };

  useEffect(() => {
    fetchLogActivity();
    fetchLogAkses();
  }, []);

  return (
    <LogContext.Provider value={{ logActivity, logAkses, fetchLogActivity, fetchLogAkses }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLog must be used within a LogProvider");
  }
  return context;
};