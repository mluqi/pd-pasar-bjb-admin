import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PedagangModal from "./PedagangModal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import { usePedagangContext } from "../../context/PedagangContext";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useDropdownContext } from "../../context/DropdownContext";
import Badge from "../../components/ui/badge/Badge";

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

interface Pedagang {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  CUST_PHONE: string;
  CUST_OWNER: string;
  CUST_IURAN: string;
  CUST_STATUS: string;
  pasar?: { pasar_nama: string };
  lapaks?: Array<{
    LAPAK_NAMA: string;
    LAPAK_CODE: string;
    LAPAK_MULAI?: string | null;
    LAPAK_AKHIR?: string | null;
  }>;
}

export default function PedagangTable() {
  const {
    pedagangs,
    fetchPedagangs,
    addPedagang,
    editPedagang,
    deletePedagang,
  } = usePedagangContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPedagang, setSelectedPedagang] = useState(null);
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("CUST_CODE");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pedagangToDelete, setPedagangToDelete] = useState<Pedagang | null>(
    null
  );

  const { pasars, fetchAllPasars } = useDropdownContext();

  useEffect(() => {
    fetchAllPasars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPedagangsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, owner, status, sortOrder, sortBy]);

  const fetchPedagangsData = async () => {
    try {
      const response = await fetchPedagangs(
        page,
        limit,
        search,
        owner,
        status,
        sortOrder,
        sortBy
      );
      setTotalPages(response.totalPages);
      setTotalData(response.total);
    } catch (error) {
      console.error("Failed to fetch pedagangs:", error);
    }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSavePedagang = async (formData: any) => {
    try {
      if (selectedPedagang && selectedPedagang.CUST_CODE) {
        await editPedagang(selectedPedagang.CUST_CODE, formData);
      } else {
        const newPedagang = await addPedagang(formData);
        if (!newPedagang || !newPedagang.CUST_CODE) {
          console.error(
            "Gagal menambahkan pedagang atau mendapatkan CUST_CODE."
          );
          return;
        }
      }

      closeModal();
      fetchPedagangsData();
    } catch (error) {
      console.error("Failed to save pedagang:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat menyimpan data pedagang.";
      alert(errorMessage);
    }
  };

  const handleDeletePedagang = (pedagang: Pedagang) => {
    setPedagangToDelete(pedagang);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePedagang = async () => {
    if (pedagangToDelete) {
      setIsDeleting(true);
      try {
        await deletePedagang(pedagangToDelete.CUST_CODE);
        fetchPedagangsData();
      } catch (error) {
        console.error("Failed to delete pedagang:", error);
        alert("Failed to delete pedagang.");
      } finally {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setPedagangToDelete(null);
      }
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Filter and Search Section */}
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
            placeholder="Search by name or NIK"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            options={statusOptions}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            value={status}
            placeholder="All Status"
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
                setOwner(value);
                setPage(1);
              }}
              value={owner}
              className="w-full sm:w-auto"
            />
          )}
        </div>
        <Button onClick={openAddModal} className="w-full sm:w-auto">
          Add Pedagang
        </Button>
      </div>

      {/* Table Section */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "Code",
                "Nama",
                "Pasar",
                "Jumlah Iuran",
                "Status",
                "Lapak",
                "Actions",
              ].map((title) => (
                <TableCell
                  key={title}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {title === "Code" ? (
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("CUST_CODE")}
                    >
                      {title}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  ) : title === "Nama" ? (
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("CUST_NAMA")}
                    >
                      {title}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  ) : title === "Jumlah Iuran" ? (
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("CUST_IURAN")}
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
            {pedagangs.map((pedagang) => (
              <TableRow key={pedagang.CUST_CODE}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  <Link
                    to={`/pedagang-management/detail/${pedagang.CUST_CODE}`}
                    className="text-blue-500 hover:underline"
                  >
                    {pedagang.CUST_CODE}
                  </Link>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  <div>
                    <span className="font-medium">{pedagang.CUST_NAMA}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      NIK: {pedagang.CUST_NIK || "-"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      HP: {pedagang.CUST_PHONE || "-"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.pasar?.pasar_nama || "Unknown"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {formatCurrency(pedagang.CUST_IURAN)}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  <Badge
                    size="sm"
                    color={
                      pedagang.CUST_STATUS === "aktif" ? "success" : "error"
                    }
                  >
                    {pedagang.CUST_STATUS === "aktif" ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.lapaks?.length > 0 ? (
                    pedagang.lapaks.length > 1 ? (
                      <ul className="list-disc list-inside">
                        {pedagang.lapaks.map((lapak) => (
                          <li key={lapak.LAPAK_CODE}>{lapak.LAPAK_NAMA}</li>
                        ))}
                      </ul>
                    ) : (
                      // Tampilkan nama lapak langsung jika hanya ada satu
                      pedagang.lapaks[0].LAPAK_NAMA
                    )
                  ) : (
                    "No Lapaks"
                  )}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(pedagang)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePedagang(pedagang)}
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

      {/* Pagination Section */}
      <div className="flex justify-between items-center p-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="dark:text-gray-400">
          Page {page} of {totalPages} ({totalData} total entries)
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      <PedagangModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        pedagang={isEditModalOpen ? selectedPedagang : null}
        onSave={handleSavePedagang}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeletePedagang}
        title="Delete Pedagang"
        message={`Are you sure you want to delete pedagang "${pedagangToDelete?.CUST_NAMA}"? This action cannot be undone.`}
        isConfirming={isDeleting}
      />
    </div>
  );
}
