import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import LapakModal from "./LapakModal";
import Badge from "../../components/ui/badge/Badge";
import { useLapakContext } from "../../context/LapakContext";

export default function LapakTable() {
  const { lapaks, fetchLapaks, addLapak, editLapak, deleteLapak } = useLapakContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLapak, setSelectedLapak] = useState(null);

  useEffect(() => {
    fetchLapaks();
  }, []);

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
    const confirmDelete = window.confirm("Are you sure you want to delete this lapak?");
    if (!confirmDelete) return;
    try {
      await deleteLapak(LAPAK_CODE);
    } catch (error) {
      console.error("Failed to delete lapak:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Lapak
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Code", "Name", "Blok", "Ukuran", "Type", "Tgl Mulai", "Tgl Akhir", "Pasar", "Status", "Penyewa", "Actions"].map(
                (title) => (
                  <TableCell
                    key={title}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {title}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {lapaks.map((lapak) => (
              <TableRow key={lapak.LAPAK_CODE}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_CODE}
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
                  {lapak.LAPAK_TYPE}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_MULAI
                    ? new Date(lapak.LAPAK_MULAI).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                {lapak.LAPAK_AKHIR
                    ? new Date(lapak.LAPAK_AKHIR).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : ""}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_OWNER}
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
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {lapak.LAPAK_PENYEWA || ""}
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

      <LapakModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        lapak={isEditModalOpen ? selectedLapak : null}
        onSave={handleSaveLapak}
      />
    </div>
  );
}