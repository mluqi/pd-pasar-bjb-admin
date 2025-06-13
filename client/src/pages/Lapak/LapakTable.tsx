/* eslint-disable react-hooks/exhaustive-deps */
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal"; // Import Modal component
import LapakModal from "./LapakModal";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";

import { useLapakContext } from "../../context/LapakContext";
import { useDropdownContext } from "../../context/DropdownContext";
import { Link } from "react-router-dom";

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "aktif", label: "Paid" },
  { value: "kosong", label: "Pending" },
  { value: "rusak", label: "Rusak" },
  { value: "tutup", label: "Tutup" },
];

export default function LapakTable() {
  const { lapaks, fetchLapaks, addLapak, editLapak, deleteLapak } =
    useLapakContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLapak, setSelectedLapak] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pasar, setPasar] = useState("");
  const [owner, setOwner] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // State for photo proof modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalUrl, setPhotoModalUrl] = useState<string | null>(null);

  const fetchLapaksData = async () => {
    try {
      const response = await fetchLapaks(
        page,
        limit,
        search,
        statusFilter,
        pasar,
        owner
      );
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch lapaks:", error);
    }
  };

  const { pasars, pedagangs, fetchAllPasars, fetchAllPedagangs } =
    useDropdownContext();

  useEffect(() => {
    fetchAllPasars();
    fetchAllPedagangs();
  }, []);

  useEffect(() => {
    fetchLapaksData();
  }, [page, limit, search, statusFilter, pasar, owner]);

  const openEditModal = (lapak) => {
    setSelectedLapak(lapak);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedLapak(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedLapak(null);
  };

  const openPhotoProofModal = (buktiFotoPath: string) => {
    const serverBaseUrl =
      import.meta.env.VITE_SERVER_BASE_URL || "https://dev1-p3.palindo.id";
    setPhotoModalUrl(`${serverBaseUrl}/${buktiFotoPath}`);
    setIsPhotoModalOpen(true);
  };

  const closePhotoProofModal = () => {
    setIsPhotoModalOpen(false);
    setPhotoModalUrl(null);
  };

  const handleSaveLapak = async (formData) => {
    try {
      if (selectedLapak) {
        await editLapak(selectedLapak.LAPAK_CODE, formData);
      } else {
        await addLapak(formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save lapak:", error);
    }
  };

  const handleDeleteLapak = async (LAPAK_CODE) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lapak?"
    );
    if (!confirmDelete) return;
    try {
      await deleteLapak(LAPAK_CODE);
    } catch (error) {
      console.error("Failed to delete lapak:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
            placeholder="Search by name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={statusOptions}
            onChange={(value) => setStatusFilter(value)}
            placeholder="All Status"
            value={statusFilter}
            className="w-full sm:w-auto"
          />
          <Select
            options={[
              { value: "", label: "All Pedagang" },
              ...(pedagangs || []).map((pedagang) => ({
                value: pedagang.CUST_CODE,
                label: pedagang.CUST_NAMA,
              })),
            ]}
            placeholder="All Pedagang"
            onChange={(value) => setOwner(value)}
            value={owner}
            className="w-full sm:w-auto"
          />
          <Select
            options={[
              { value: "", label: "All Pasars" },
              ...(pasars || []).map((pasar) => ({
                value: pasar.pasar_code,
                label: pasar.pasar_nama,
              })),
            ]}
            placeholder="All Pasars"
            onChange={(value) => setPasar(value)}
            value={owner}
            className="w-full sm:w-auto"
          />
        </div>
        <Button onClick={openAddModal} className="w-full sm:w-auto">
          Add Lapak
        </Button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "Code",
                "Name",
                "Blok",
                "Ukuran",
                "Type",
                "Penyewa",
                "Tgl Mulai",
                "Tgl Akhir",
                "Pasar",
                "Status",
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
            {lapaks.map((lapak) => (
              <TableRow key={lapak.LAPAK_CODE}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  <Link
                    to={`/lapak-management/qrcode/${lapak.LAPAK_CODE}`}
                    className="text-blue-500 hover:underline"
                  >
                    {lapak.LAPAK_CODE}
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_NAMA}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_BLOK}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_UKURAN}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.DB_TYPE_LAPAK?.TYPE_NAMA}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.DB_PEDAGANG?.CUST_NAMA || ""}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_MULAI
                    ? new Date(lapak.LAPAK_MULAI).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        // hour: "2-digit",
                        // minute: "2-digit",
                        // second: "2-digit",
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_AKHIR
                    ? new Date(lapak.LAPAK_AKHIR).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        // hour: "2-digit",
                        // minute: "2-digit",
                        // second: "2-digit",
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.pasar?.pasar_nama || "Unknown"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <Badge
                    size="sm"
                    color={
                      lapak.LAPAK_STATUS === "aktif"
                        ? "success"
                        : lapak.LAPAK_STATUS === "kosong"
                        ? "warning"
                        : "error"
                    }
                  >
                    {lapak.LAPAK_STATUS}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-3 text-theme-sm">
                  {lapak.LAPAK_STATUS === "tutup" && lapak.LAPAK_BUKTI_FOTO && (
                    <button
                      onClick={() =>
                        openPhotoProofModal(lapak.LAPAK_BUKTI_FOTO)
                      }
                      className="ml-2 text-blue-500 hover:underline cursor-pointer"
                      title="Lihat Bukti Foto"
                    >
                      📷 Bukti Foto
                    </button>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(lapak)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLapak(lapak.LAPAK_CODE)}
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
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      <LapakModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        lapak={isEditModalOpen ? selectedLapak : null}
        onSave={handleSaveLapak}
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
              Bukti Foto Lapak Tutup
            </h4>
            <div className="mt-2">
              <img
                src={photoModalUrl}
                alt="Bukti Foto"
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
