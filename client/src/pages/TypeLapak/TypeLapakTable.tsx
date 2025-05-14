import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import TypeLapakModal from "./TypeLapakModal";
import { useLapakTypeContext } from "../../context/LapakTypeContext";
import Button from "../../components/ui/button/Button";

export default function TypeLapakTable() {
  const {
    typeLapaks,
    fetchTypeLapaks,
    addTypeLapak,
    editTypeLapak,
    deleteTypeLapak,
  } = useLapakTypeContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTypeLapak, setSelectedTypeLapak] = useState(null);

  useEffect(() => {
    fetchTypeLapaks();
  }, []);

  const openEditModal = (typeLapak) => {
    setSelectedTypeLapak(typeLapak);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedTypeLapak(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedTypeLapak(null);
  };

  const handleSaveTypeLapak = async (formData) => {
    try {
      if (selectedTypeLapak) {
        await editTypeLapak(selectedTypeLapak.TYPE_CODE, formData);
      } else {
        await addTypeLapak(formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save type lapak:", error);
    }
  };

  const handleDeleteTypeLapak = async (TYPE_CODE) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this type lapak?"
    );
    if (!confirmDelete) return;
    try {
      await deleteTypeLapak(TYPE_CODE);
    } catch (error) {
      console.error("Failed to delete type lapak:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <Button
          onClick={openAddModal}
        >
          Add Type Lapak
        </Button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Code", "Name", "Actions"].map((title) => (
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
            {typeLapaks.map((typeLapak) => (
              <TableRow key={typeLapak.TYPE_CODE}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {typeLapak.TYPE_CODE}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {typeLapak.TYPE_NAMA}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(typeLapak)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTypeLapak(typeLapak.TYPE_CODE)}
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

      <TypeLapakModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        typeLapak={isEditModalOpen ? selectedTypeLapak : null}
        onSave={handleSaveTypeLapak}
      />
    </div>
  );
}
