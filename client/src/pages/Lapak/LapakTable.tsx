/* eslint-disable react-hooks/exhaustive-deps */
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import LapakModal from "./LapakModal";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";

import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useLapakContext } from "../../context/LapakContext";
import { useDropdownContext } from "../../context/DropdownContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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

  const { user } = useAuth();
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
  const [totalData, setTotalData] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lapakToDelete, setLapakToDelete] = useState<any | null>(null);

  const navigate = useNavigate();
  const [selectedLapakData, setSelectedLapakData] = useState<any[]>([]);

  const toggleLapakSelection = (lapak: any) => {
    setSelectedLapakData((prev) => {
      if (prev.some((l) => l.LAPAK_CODE === lapak.LAPAK_CODE)) {
        return prev.filter((l) => l.LAPAK_CODE !== lapak.LAPAK_CODE);
      } else {
        return [...prev, lapak];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedLapakData.length === lapaks.length) {
      setSelectedLapakData([]);
    } else {
      setSelectedLapakData(lapaks);
    }
  };

  const handleGenerateMultipleQr = () => {
    if (selectedLapakData.length === 0) {
      alert("Pilih minimal 1 lapak untuk generate QR code");
      return;
    }

    // Navigasi ke halaman QR codes dengan state
    navigate("/lapak-management/qrcodes", {
      state: {
        lapakData: selectedLapakData.map((lapak) => ({
          code: lapak.LAPAK_CODE,
          nama: lapak.LAPAK_NAMA,
          blok: lapak.LAPAK_BLOK,
          pasar: lapak.pasar?.pasar_nama || "Unknown",
          ukuran: lapak.LAPAK_UKURAN,
          // pemilik: lapak.DB_PEDAGANG?.CUST_NAMA || "Tidak Ada",
        })),
      },
    });
  };

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
        owner,
        sortOrder
      );
      setTotalPages(response.totalPages);
      setTotalData(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch lapaks:", error);
    }
  };

  const handleGenerateAllQr = () => {
    if (!user) {
      alert("Gagal mendapatkan informasi pengguna. Silakan coba lagi.");
      return;
    }

    if (user.user_level === "SUA") {
      if (!pasar) {
        alert(
          "Silakan pilih pasar terlebih dahulu untuk mencetak semua QR code."
        );
        return;
      }
      window.open(`https://dev7-p3.palindo.id/qr.php?pasar=${pasar}`, "_blank");
    } else {
      window.open(
        `https://dev7-p3.palindo.id/qr.php?pasar=${user.user_owner}`,
        "_blank"
      );
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
  }, [page, limit, search, statusFilter, pasar, owner, sortOrder]);

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1); // Kembali ke halaman pertama saat urutan diubah
  };

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
      import.meta.env.VITE_SERVER_BASE_URL || "http://127.0.0.1:3001";
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

  const handleDeleteLapak = (lapak: any) => {
    setLapakToDelete(lapak);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLapak = async () => {
    if (lapakToDelete) {
      setIsDeleting(true);
      try {
        await deleteLapak(lapakToDelete.LAPAK_CODE);
      } catch (error) {
        console.error("Failed to delete lapak:", error);
        alert("Failed to delete lapak.");
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setLapakToDelete(null);
      }
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            options={statusOptions}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
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
            onChange={(value) => {
              setOwner(value);
              setPage(1);
            }}
            value={owner}
            className="w-full sm:w-auto"
          />
          {pasars.length > 0 && (
            <Select
              options={[
                { value: "", label: "All Pasars" },
                ...(pasars || []).map((pasar) => ({
                  value: pasar.pasar_code,
                  label: pasar.pasar_nama,
                })),
              ]}
              placeholder="All Pasars"
              onChange={(value) => {
                setPasar(value);
                setPage(1);
              }}
              value={pasar}
              className="w-full sm:w-auto"
            />
          )}
        </div>
        <Button
          onClick={handleGenerateMultipleQr}
          disabled={selectedLapakData.length === 0}
          className="w-full sm:w-auto"
        >
          Generate QR Codes ({selectedLapakData.length})
        </Button>
        <Button onClick={handleGenerateAllQr} className="w-full sm:w-auto">
          Cetak QR per Pasar
        </Button>
        <Button onClick={openAddModal} className="w-full sm:w-auto">
          Add Lapak
        </Button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                <input
                  key="select-all"
                  type="checkbox"
                  checked={
                    selectedLapakData.length === lapaks.length &&
                    lapaks.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  title="Select All"
                />,
                "Code",
                "Name",
                "Blok",
                "Ukuran",
                "Type",
                "Penyewa",
                // "Tgl Mulai",
                // "Tgl Akhir",
                "Pasar",
                "SIPTU",
                "Heregistrasi",
                "Status",
                "Attachment",
                "Actions",
              ].map((title) => (
                <TableCell
                  key={typeof title === "string" ? title : "select-all-header"}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {title === "Code" ? (
                    <button
                      className="flex items-center gap-1"
                      onClick={handleSort}
                    >
                      {title}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  ) : (
                    title
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {lapaks.map((lapak) => (
              <TableRow key={lapak.LAPAK_CODE}>
                <TableCell className="px-2 py-3 text-theme-sm">
                  <input
                    type="checkbox"
                    checked={selectedLapakData.some(
                      (l) => l.LAPAK_CODE === lapak.LAPAK_CODE
                    )}
                    onChange={() => toggleLapakSelection(lapak)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  <Link
                    to={`/lapak-management/qrcode/${lapak.LAPAK_CODE}`}
                    state={{
                      code: lapak.LAPAK_CODE,
                      nama: lapak.LAPAK_NAMA,
                      blok: lapak.LAPAK_BLOK,
                      pasar: lapak.pasar?.pasar_nama || "Unknown",
                      ukuran: lapak.LAPAK_UKURAN,
                    }}
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
                {/* <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
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
                </TableCell> */}
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.pasar?.pasar_nama || "Unknown"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_SIPTU
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(lapak.LAPAK_SIPTU)
                    : "-"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_HEREGISTRASI
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(lapak.LAPAK_HEREGISTRASI)
                    : "-"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
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
                    onClick={() => handleDeleteLapak(lapak)}
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

      <LapakModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        lapak={isEditModalOpen ? selectedLapak : null}
        onSave={handleSaveLapak}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteLapak}
        title="Delete Lapak"
        message={`Are you sure you want to delete lapak "${lapakToDelete?.LAPAK_NAMA}"? This action cannot be undone.`}
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
