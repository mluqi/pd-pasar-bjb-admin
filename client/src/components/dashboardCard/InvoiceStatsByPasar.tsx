import React from "react";
import { useDashboard } from "../../context/DashboardContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import ComponentCard from "../common/ComponentCard";

const InvoiceStatsByPasar: React.FC = () => {
  const { invoiceStatsByPasar, loadingInvoiceStatsByPasar } = useDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ComponentCard title="Realisasi Tagihan per Pasar">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                No
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Nama Pasar
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Total Tagihan
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Tagihan Terealisasi
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
              >
                Sisa Tagihan
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loadingInvoiceStatsByPasar ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !invoiceStatsByPasar || invoiceStatsByPasar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              invoiceStatsByPasar.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-3 text-gray-800 dark:text-white/90 text-theme-sm">
                    {stat.pasar_nama}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm text-right">
                    {formatCurrency(stat.nominal_total_tagihan)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm text-right">
                    {formatCurrency(stat.nominal_tagihan_terealisasi)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm text-right">
                    {formatCurrency(
                      stat.nominal_total_tagihan -
                        stat.nominal_tagihan_terealisasi
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ComponentCard>
  );
};

export default InvoiceStatsByPasar;
