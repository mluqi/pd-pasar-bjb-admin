import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { usePasarContext } from "../../context/PasarContext";

import Badge from "../../components/ui/badge/Badge";
import { use, useEffect, useState } from "react";

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
  pasar_logo: string | null;
  pasar_status: string;
}

import PasarModal from "./PasarModal";

export default function PasarTable() {
  const { pasars, fetchPasars, addPasar, editPasar, deletePasar } = usePasarContext();
  // const [pasars, setPasars] = useState<Pasar[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPasar, setSelectedPasar] = useState<Pasar | null>(null);
  const [pasarList, setPasarList] = useState<Pasar[]>([]);

  useEffect(() => {
    if (!pasars.length) {
    fetchPasars();
    }
  }, [pasars, fetchPasars]);
  
  useEffect(() => {
    setPasarList(pasars);
  }, [pasars]);

  const openEditModal = (pasar: Pasar) => {
    setSelectedPasar(pasar);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedPasar(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedPasar(null);
  };

  const handleSavePasar = async (formData: FormData) => {
    if (selectedPasar) {
      await editPasar(selectedPasar.pasar_code, formData);
    } else {
      await addPasar(formData);
    }
    closeModal();
  };

  const handleDeletePasar = async (pasar_code: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this pasar?");
    if (!confirmDelete) return;
    await deletePasar(pasar_code);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Pasar
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Code", "Name", "Logo", "Status", "Actions"].map((title) => (
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
            {pasars.map((pasar) => (
              <TableRow key={pasar.pasar_code}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pasar.pasar_code}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pasar.pasar_nama}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-white dark:border-gray-800">
                    <img
                      src={pasar.pasar_logo || "/images/placeholder-logo.png"}
                      alt={pasar.pasar_nama}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <Badge
                    size="sm"
                    color={
                      pasar.pasar_status === "A"
                        ? "success"
                        : pasar.pasar_status === "P"
                        ? "warning"
                        : "error"
                    }
                  >
                    {pasar.pasar_status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(pasar)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePasar(pasar.pasar_code)}
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

      <PasarModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        pasar={isEditModalOpen ? selectedPasar : null}
        onSave={handleSavePasar}
      />
    </div>
  );
}
