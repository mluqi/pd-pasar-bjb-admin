/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import IuranModal from "./IuranModal";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";

import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useIuranContext } from "../../context/IuranContext";
import RangeDatePicker from "../../components/form/RangeDatePicker";

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "tidak berjualan", label: "Tidak Berjualan" },
  { value: "tidak bayar", label: "Tidak Bayar" },
];

const metodeBayarOptions = [
  { value: "", label: "All Metode Bayar" },
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "Qris" },
];

export default function IuranTable() {
  const { iurans, fetchIurans, addIuran, editIuran, deleteIuran } =
    useIuranContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIuran, setSelectedIuran] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [metodeBayarFilter, setMetodeBayarFilter] = useState("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [iuranToDelete, setIuranToDelete] = useState<any | null>(null);

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

  const fetchIuransData = async () => {
    try {
      const [startDate, endDate] = dateRange;
      const response = await fetchIurans(
        page,
        limit,
        search,
        statusFilter,
        metodeBayarFilter,
        startDate || "",
        endDate || ""
      );
      setTotalPages(response.totalPages);
      setTotalData(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch iurans:", error);
    }
  };

  useEffect(() => {
    fetchIuransData();
  }, [page, limit, search, statusFilter, metodeBayarFilter, dateRange]);

  const openEditModal = (iuran) => {
    setSelectedIuran(iuran);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedIuran(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedIuran(null);
  };

  const handleSaveIuran = async (formData) => {
    try {
      if (selectedIuran) {
        await editIuran(selectedIuran.IURAN_CODE, formData);
      } else {
        await addIuran(formData);
      }
      await fetchIuransData();
      closeModal();
    } catch (error) {
      console.error("Failed to save iuran:", error);
    }
  };

  const handleDeleteIuran = (iuran: any) => {
    setIuranToDelete(iuran);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteIuran = async () => {
    if (iuranToDelete) {
      setIsDeleting(true);
      try {
        await deleteIuran(iuranToDelete.IURAN_CODE);
        await fetchIuransData();
        console.log("Iuran deleted successfully");
      } catch (error) {
        console.error("Failed to delete iuran:", error);
        alert("Failed to delete iuran.");
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setIuranToDelete(null);
      }
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
          <Select
            options={limitOptions}
            onChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
            value={limit.toString()}
            className="w-full sm:w-auto"
          />
          <Input
            type="text"
            placeholder="Search by code or pedagang"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            options={statusOptions}
            placeholder="All Status"
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            value={statusFilter}
            className="w-full sm:w-auto"
          />
          <Select
            options={metodeBayarOptions}
            placeholder="All Metode Bayar"
            onChange={(value) => {
              setMetodeBayarFilter(value);
              setPage(1);
            }}
            value={metodeBayarFilter}
            className="w-full sm:w-auto"
          />
          <RangeDatePicker
            id="date-range"
            placeholder="Select date range"
            defaultDates={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={openAddModal} className="w-full sm:w-auto">
          Add Iuran
        </Button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "Code",
                "Pedagang",
                "Tanggal",
                "Jumlah",
                "Status",
                "Metode Bayar",
                "Waktu Bayar",
                "User",
                "Attachment",
                "Actions",
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
            {iurans.map((iuran) => (
              <TableRow key={iuran.IURAN_CODE}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {iuran.IURAN_CODE}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  <div className="relative group">
                    <span className="cursor-pointer">
                      {iuran.DB_PEDAGANG?.CUST_NAMA || "Unknown"}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute left-0 z-10 hidden w-52 whitespace-pre-line rounded bg-gray-800 px-3 py-2 text-sm text-white shadow-md group-hover:block">
                      {iuran.DB_PEDAGANG?.lapaks?.[0]
                        ? `Lapak: ${
                            iuran.DB_PEDAGANG.lapaks[0].LAPAK_NAMA || "N/A"
                          }\nBlok: ${
                            iuran.DB_PEDAGANG.lapaks[0].LAPAK_BLOK || "N/A"
                          }`
                        : "Info lapak tidak tersedia"}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {new Date(iuran.IURAN_TANGGAL).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {formatCurrency(iuran.IURAN_JUMLAH)}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <Badge
                    size="sm"
                    color={
                      iuran.IURAN_STATUS === "paid"
                        ? "success"
                        : iuran.IURAN_STATUS === "pending"
                        ? "warning"
                        : iuran.IURAN_STATUS === "tidak berjualan"
                        ? "warning"
                        : "error"
                    }
                  >
                    {iuran.IURAN_STATUS}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {iuran.IURAN_METODE_BAYAR}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {iuran.IURAN_WAKTU_BAYAR
                    ? new Date(iuran.IURAN_WAKTU_BAYAR).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }
                      )
                    : ""}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {iuran.IURAN_USER}
                </TableCell>
                <TableCell className="px-2 py-3 text-theme-sm">
                  {iuran.IURAN_STATUS === "tidak berjualan" &&
                    iuran.IURAN_BUKTI_FOTO && (
                      <button
                        onClick={() =>
                          openPhotoProofModal(iuran.IURAN_BUKTI_FOTO)
                        }
                        className="ml-2 text-blue-500 hover:underline"
                        title="Lihat Bukti Foto"
                      >
                        📷 Bukti Foto
                      </button>
                    )}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(iuran)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIuran(iuran)}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center p-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="text-gray-700 dark:text-gray-400">
          Page {page} of {totalPages} ({totalData} total entries)
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      <IuranModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        iuran={isEditModalOpen ? selectedIuran : null}
        onSave={handleSaveIuran}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteIuran}
        title="Delete Iuran"
        message={`Are you sure you want to delete iuran with code "${iuranToDelete?.IURAN_CODE}"? This action cannot be undone.`}
        isConfirming={isDeleting}
      />

      {/* Photo Proof Modal */}
      {isPhotoModalOpen && photoModalUrl && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={closePhotoProofModal}
          className="max-w-lg m-4"
        >
          <div className="relative w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
            <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
              Bukti Foto Iuran Tidak Berjualan
            </h4>
            <div className="mt-2">
              <img
                src={photoModalUrl}
                alt="Bukti Foto Iuran"
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
    </div>
  );
}
