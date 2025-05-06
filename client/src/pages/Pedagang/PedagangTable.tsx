import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import PedagangModal from "./PedagangModal";
import { usePedagangContext } from "../../context/PedagangContext";
import { usePasarContext } from "../../context/PasarContext";

interface Pedagang {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  CUST_PHONE: string;
  CUST_OWNER: string;
}

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
}

export default function PedagangTable() {
  const {
    pedagangs,
    addPedagang,
    fetchPedagangs,
    editPedagang,
    deletePedagang,
  } = usePedagangContext();
  //   const [pedagangs, setPedagangs] = useState<Pedagang[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPedagang, setSelectedPedagang] = useState<Pedagang | null>(
    null
  );
  const { pasars, fetchPasars } = usePasarContext();
  const [pasarList, setPasarList] = useState<Pasar[]>([]);

  useEffect(() => {
    fetchPedagangs();
  }, []);

  useEffect(() => {
    if (!pasars.length) {
    fetchPasars();
    }
  }, [pasars, fetchPasars]);
  
  useEffect(() => {
    setPasarList(pasars);
  }, [pasars]);

  const getPasarName = (pasar_code: string) => {
    const pasar = pasars.find((m) => m.pasar_code === pasar_code);
    return pasar ? pasar.pasar_nama : "Unknown";
  };

  const openEditModal = (pedagang: Pedagang) => {
    setSelectedPedagang(pedagang);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedPedagang(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedPedagang(null);
  };

  const handleSavePedagang = async (formData: FormData) => {
    if (selectedPedagang) {
      await editPedagang(selectedPedagang.CUST_CODE, formData);
    } else {
      await addPedagang(formData);
    }
    closeModal();
  };

  const handleDeletePedagang = async (CUST_CODE: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pedagang?"
    );
    if (!confirmDelete) return;
    try {
      await deletePedagang(CUST_CODE);
      fetchPedagangs();
    } catch (error) {
      console.error("Failed to delete pedagang:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Pedagang
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Code", "Name", "NIK", "Phone", "Owner", "Actions"].map(
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
            {pedagangs.map((pedagang) => (
              <TableRow key={pedagang.CUST_CODE}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_CODE}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_NAMA}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_NIK}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_PHONE}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {getPasarName(pedagang.CUST_OWNER)}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(pedagang)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePedagang(pedagang.CUST_CODE)}
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

      <PedagangModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        pedagang={isEditModalOpen ? selectedPedagang : null}
        onSave={handleSavePedagang}
      />
    </div>
  );
}
