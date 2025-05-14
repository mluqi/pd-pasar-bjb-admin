import React from "react";
import { useDashboard } from "../../context/DashboardContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

const RecentIuran: React.FC = () => {
  const {
    recentTransactions,
    loadingRecentTransactions,
    error: contextError,
  } = useDashboard();

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "tidak bayar":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Transaksi Iuran Terkini
          </h3>
        </div>
        {/* <Link to="/iuran" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
          Lihat Semua
        </Link> */}
      </div>
      {loadingRecentTransactions && (
        <p className="text-center py-4 text-gray-500 dark:text-gray-400">
          Memuat data...
        </p>
      )}
      {contextError &&
        !loadingRecentTransactions &&
        recentTransactions.length === 0 && (
          <p className="text-center py-4 text-red-500">Error: {contextError}</p>
        )}
      {!loadingRecentTransactions &&
        !contextError &&
        recentTransactions.length === 0 && (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            Belum ada transaksi iuran.
          </p>
        )}
      {!loadingRecentTransactions &&
        !contextError &&
        recentTransactions.length > 0 && (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Kode
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Pedagang
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Jumlah
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Metode
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Waktu Bayar
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentTransactions.map((trx) => (
                  <TableRow key={trx.IURAN_CODE}>
                    <TableCell className="py-3 text-gray-800 dark:text-white/90 text-theme-sm">
                      {trx.IURAN_CODE}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm">
                      {trx.DB_PEDAGANG?.CUST_NAMA || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm">
                      {formatCurrency(trx.IURAN_JUMLAH)}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm">
                      {trx.IURAN_METODE_BAYAR || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm">
                      {formatDate(trx.IURAN_WAKTU_BAYAR)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        size="sm"
                        color={getStatusBadgeColor(trx.IURAN_STATUS)}
                      >
                        {trx.IURAN_STATUS || "Unknown"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
};

export default RecentIuran;
