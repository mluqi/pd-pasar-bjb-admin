import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

import { usePasarContext } from "../../context/PasarContext";
import { useEffect, useState } from "react";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "A", label: "Active" },
  { value: "N", label: "Nonactive" },
];

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
  pasar_logo: string | null;
  pasar_status: string;
}

import PasarModal from "./PasarModal";

export default function PasarTable() {
  const { pasars, fetchPasars, addPasar, editPasar, deletePasar } =
    usePasarContext();
  // const [pasars, setPasars] = useState<Pasar[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPasar, setSelectedPasar] = useState<Pasar | null>(null);
  const [search, setSearch] = useState(""); // State for search input
  const [statusFilter, setStatusFilter] = useState(""); // State for status filter
  const [page, setPage] = useState(1); // State for pagination
  const [limit, setLimit] = useState(10); // State for limit
  const [totalPages, setTotalPages] = useState(1); // Total pages from API

  const fetchPasarsData = async () => {
    try {
      const response = await fetchPasars(page, limit, search, statusFilter);
      setTotalPages(response.totalPages); // Update total pages
    } catch (error) {
      console.error("Failed to fetch pasars:", error);
    }
  };

  // Panggil fetchPasarsData setiap kali page, limit, search, atau statusFilter berubah
  useEffect(() => {
    fetchPasarsData();
  }, [page, limit, search, statusFilter]);

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pasar?"
    );
    if (!confirmDelete) return;
    await deletePasar(pasar_code);
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
            defaultValue={limit.toString()}
            className="w-full sm:w-auto"
          />
          <Input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded w-full sm:w-auto"
          />
          <Select
            options={statusOptions}
            onChange={(value) => setStatusFilter(value)}
            defaultValue=""
            placeholder="All Status"
            className="w-full sm:w-auto"
          />
        </div>
        <Button onClick={openAddModal} className="w-full sm:w-auto">
          Add Pasar
        </Button>
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
                      src={pasar.pasar_logo || "/images/logo/no-logo.png"}
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
                        : "error"
                    }
                  >
                    {pasar.pasar_status === "A" ? "Active" : "Nonactive"}
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

      <PasarModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        pasar={isEditModalOpen ? selectedPasar : null}
        onSave={handleSavePasar}
      />
    </div>
  );
}
