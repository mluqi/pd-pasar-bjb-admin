import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import html2pdf from "html2pdf.js";
import { useInvoiceContext } from "../../context/InvoiceContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import Kwitansi from "./Kwitansi";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";

interface InvoicesTableProps {
  onActionComplete: () => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ onActionComplete }) => {
  const { invoices, loading, updateInvoiceStatus, rejectInvoice } =
    useInvoiceContext();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionDetails, setActionDetails] = useState<{
    invoiceCode: string;
    newStatus: string;
    actionType: "update" | "reject";
  } | null>(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);
  const kwitansiContainerRef = useRef<HTMLDivElement | null>(null);

  const openPhotoProofModal = (buktiFotoPath: string) => {
    const serverBaseUrl =
      import.meta.env.VITE_SERVER_BASE_URL || "http://127.0.0.1:3001";
    setPhotoModalUrl(`${serverBaseUrl}/${buktiFotoPath}`);
    setIsPhotoModalOpen(true);
  };

  const closePhotoProofModal = () => {
    setIsPhotoModalOpen(false);
    setPhotoModalUrl(null);
  };

  const handleStatusChange = (
    invoiceCode: string,
    newStatus: string,
    actionType: "update" | "reject" = "update"
  ) => {
    setActionDetails({ invoiceCode, newStatus, actionType });
    setIsConfirmModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (actionDetails) {
      setIsSubmitting(true);
      try {
        if (actionDetails.actionType === "reject") {
          await rejectInvoice(actionDetails.invoiceCode);
        } else {
          await updateInvoiceStatus(
            actionDetails.invoiceCode,
            actionDetails.newStatus
          );
        }
        onActionComplete(); // Refetch data
      } catch (error) {
        console.error("Failed to update status:", error);
        alert("Gagal mengubah status.");
      } finally {
        setIsSubmitting(false);
        setIsConfirmModalOpen(false);
        setActionDetails(null);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCetakKwitansi = async (invoice: any) => {
    // Create a temporary div to render the Kwitansi component
    if (!kwitansiContainerRef.current) {
      kwitansiContainerRef.current = document.createElement("div");
      document.body.appendChild(kwitansiContainerRef.current);
    }

    const root = ReactDOM.createRoot(kwitansiContainerRef.current);
    root.render(React.createElement(Kwitansi, { invoice }));

    // Wait for the component to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = kwitansiContainerRef.current?.firstChild;
    if (element) {
      const opt = {
        margin: [0, 0, 0, 0], // No margin
        filename: `kwitansi-${invoice.invoice_code}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().from(element).set(opt).save();
    }

    // Cleanup
    if (kwitansiContainerRef.current) {
      root.unmount();
      // Optional: remove the container if you want it fresh every time
      // if (kwitansiContainerRef.current.parentNode) {
      //   kwitansiContainerRef.current.parentNode.removeChild(kwitansiContainerRef.current);
      //   kwitansiContainerRef.current = null;
      // }
    }
  };

  return (
    <>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "No. Invoice",
                "Nama Pedagang",
                "Pasar & Lapak",
                "Nominal",
                "Tgl Invoice",
                "Jatuh Tempo",
                "Type",
                "Status",
                "Bukti Bayar",
                "Kwitansi",
                "Aksi",
              ].map((title) => (
                <TableCell
                  key={title}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {title}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell className="py-4 text-center">Loading...</TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell className="py-4 text-center">
                  <span style={{ display: "inline-block", width: "100%" }}>
                    Tidak ada data invoice.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.invoice_code}>
                  <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                    {invoice.invoice_code}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                    {invoice.pedagang?.CUST_NAMA || "N/A"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                    <div>{invoice.pasar?.pasar_nama || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {invoice.lapakDetails &&
                      invoice.lapakDetails.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {invoice.lapakDetails.map((lapak) => (
                            <li key={lapak.LAPAK_CODE}>
                              {lapak.LAPAK_BLOK}/{lapak.LAPAK_NAMA}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        // Fallback jika lapakDetails tidak ada
                        invoice.invoice_lapak?.join(", ") || "N/A"
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                    {formatCurrency(invoice.invoice_nominal)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                    {new Date(invoice.invoice_date).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                    {new Date(invoice.invoice_tempo).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm">
                    <Badge
                      size="sm"
                      color={
                        invoice.invoice_type === "siptu"
                          ? "success"
                          : invoice.invoice_type === "heregistrasi"
                          ? "warning"
                          : "error"
                      }
                    >
                      {invoice.invoice_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm">
                    <Badge
                      size="sm"
                      color={
                        invoice.invoice_status === "paid"
                          ? "success"
                          : invoice.invoice_status === "pending"
                          ? "warning"
                          : invoice.invoice_status === "waiting"
                          ? "warning"
                          : "error"
                      }
                    >
                      {invoice.invoice_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-center">
                    {invoice.invoice_file ? (
                      <button
                        onClick={() =>
                          openPhotoProofModal(invoice.invoice_file)
                        }
                        className="text-blue-500 hover:underline"
                        title="Lihat Bukti Pembayaran"
                      >
                        📷 Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        N/A
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm text-center">
                    {invoice.invoice_status === "paid" ? (
                      <button
                        onClick={() => handleCetakKwitansi(invoice)}
                        className="text-blue-500 hover:underline"
                        title="Cetak Kwitansi"
                      >
                        📄 Cetak
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-theme-sm">
                    <button
                      onClick={(e) => {
                        if (invoice.invoice_status !== "waiting") return;
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === invoice.invoice_code
                            ? null
                            : invoice.invoice_code
                        );
                      }}
                      className={`dropdown-toggle hover:underline ${
                        invoice.invoice_status === "waiting"
                          ? "text-blue-500"
                          : "cursor-not-allowed text-gray-400"
                      }`}
                      disabled={invoice.invoice_status !== "waiting"}
                      title="Aksi"
                    >
                      Aksi
                    </button>
                    {invoice.invoice_status === "waiting" && (
                      <Dropdown
                        isOpen={openDropdown === invoice.invoice_code}
                        onClose={() => setOpenDropdown(null)}
                        className="w-48 p-2"
                      >
                        <DropdownItem
                          onItemClick={() =>
                            handleStatusChange(invoice.invoice_code, "paid")
                          }
                          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          Terima Pembayaran
                        </DropdownItem>
                        <DropdownItem
                          onItemClick={() =>
                            handleStatusChange(
                              invoice.invoice_code,
                              "pending",
                              "reject"
                            )
                          }
                          className="flex w-full font-normal text-left text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                          Tolak Pembayaran
                        </DropdownItem>
                      </Dropdown>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmStatusChange}
        title="Ubah Status Invoice"
        confirmText="Ubah"
        cancelText="Batal"
        message={
          actionDetails?.actionType === "reject"
            ? `Anda yakin ingin menolak pembayaran untuk invoice ${actionDetails?.invoiceCode}? Status akan kembali ke 'pending' dan bukti bayar akan dihapus.`
            : `Anda yakin ingin mengubah status invoice ${actionDetails?.invoiceCode} menjadi ${actionDetails?.newStatus}?`
        }
        isConfirming={isSubmitting}
      />

      {isPhotoModalOpen && photoModalUrl && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={closePhotoProofModal}
          className="max-w-lg m-4"
        >
          <div className="relative w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
            <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
              Bukti Pembayaran
            </h4>
            <div className="mt-2">
              <img
                src={photoModalUrl}
                alt="Bukti Pembayaran"
                className="max-w-full h-auto rounded-md"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closePhotoProofModal}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Hidden container for rendering Kwitansi for PDF generation */}
      <div
        ref={kwitansiContainerRef}
        style={{ position: "absolute", left: "-9999px" }}
      />
    </>
  );
};

export default InvoicesTable;
