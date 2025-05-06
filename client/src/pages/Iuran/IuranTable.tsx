import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import IuranModal from "./IuranModal";
import Badge from "../../components/ui/badge/Badge";
import { useIuranContext } from "../../context/IuranContext";

export default function IuranTable() {
  const { iurans, fetchIurans, addIuran, editIuran, deleteIuran } = useIuranContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIuran, setSelectedIuran] = useState(null);

  useEffect(() => {
    fetchIurans();
  }, []);

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
      await fetchIurans();
      closeModal();
    } catch (error) {
      console.error("Failed to save iuran:", error);
    }
  };

  const handleDeleteIuran = async (IURAN_CODE) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this iuran?");
    if (!confirmDelete) return;
    try {
      await deleteIuran(IURAN_CODE);
      await fetchIurans();
      console.log("Iuran deleted successfully");
    } catch (error) {
      console.error("Failed to delete iuran:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Iuran
        </button>
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
                  {iuran.DB_PEDAGANG?.CUST_NAMA || "Unknown"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {new Date(iuran.IURAN_TANGGAL).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {iuran.IURAN_JUMLAH}
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
                  ? new Date(iuran.IURAN_WAKTU_BAYAR).toLocaleDateString("id-ID", {
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
                  {iuran.IURAN_USER}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(iuran)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIuran(iuran.IURAN_CODE)}
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

      <IuranModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        iuran={isEditModalOpen ? selectedIuran : null}
        onSave={handleSaveIuran}
      />
    </div>
  );
}