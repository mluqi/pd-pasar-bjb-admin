import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import api from "../services/api";

interface Invoice {
  invoice_code: string;
  invoice_nominal: number;
  invoice_date: string;
  invoice_tempo: string;
  invoice_type: "siptu" | "heregistrasi";
  invoice_status: "pending" | "paid" | "waiting";
  invoice_file: string;
  pedagang: {
    CUST_NAMA: string;
  };
  pasar: {
    pasar_nama: string;
    pasar_logo?: string | null;
  };
  invoice_lapak: string[]; // Array of lapak codes
  lapakDetails?: {
    LAPAK_CODE: string;
    LAPAK_NAMA: string;
    LAPAK_BLOK: string;
  }[];
}

interface InvoiceContextProps {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: (
    page: number,
    limit: number,
    search: string,
    status: string,
    startDate: string,
    endDate: string
  ) => Promise<{ totalPages: number; total?: number }>;
  updateInvoiceStatus: (invoice_code: string, status: string) => Promise<void>;
  rejectInvoice: (invoice_code: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextProps | undefined>(
  undefined
);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(
    async (
      page = 1,
      limit = 10,
      search = "",
      status = "",
      startDate = "",
      endDate = ""
    ) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search,
          status,
          startDate,
          endDate,
        });
        const res = await api.get(`/invoices?${params.toString()}`);
        setInvoices(res.data.data);
        return { totalPages: res.data.totalPages, total: res.data.total };
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return { totalPages: 1, total: 0 };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateInvoiceStatus = async (invoice_code: string, status: string) => {
    try {
      await api.put(`/invoices/${invoice_code}`, { status });
    } catch (error) {
      console.error(
        `Failed to update status for invoice ${invoice_code}`,
        error
      );
      throw error; // re-throw to be handled by the component
    }
  };

  const rejectInvoice = async (invoice_code: string) => {
    try {
      await api.put(`/invoices/${invoice_code}/reject`);
    } catch (error) {
      console.error(`Failed to reject invoice ${invoice_code}`, error);
      throw error;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        loading,
        fetchInvoices,
        updateInvoiceStatus,
        rejectInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoiceContext must be used within an InvoiceProvider");
  }
  return context;
};
