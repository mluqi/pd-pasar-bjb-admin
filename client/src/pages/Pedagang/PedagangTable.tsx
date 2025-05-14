import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PedagangModal from "./PedagangModal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import { usePedagangContext } from "../../context/PedagangContext";
import { useDropdownContext } from "../../context/DropdownContext";
import Badge from "../../components/ui/badge/Badge";
import { useLapakContext } from "../../context/LapakContext";

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
  const [search, setSearch] = useState(""); // State for search input
  const [owner, setOwner] = useState(""); // State for owner filter
  const [status, setStatus] = useState(""); // State for status filter
  const [page, setPage] = useState(1); // State for pagination
  const [limit, setLimit] = useState(10); // State for limit
  const [totalPages, setTotalPages] = useState(1); // Total pages from API

  const { pasars, fetchAllPasars } = useDropdownContext();
  const { editStatusLapak } = useLapakContext();

  useEffect(() => {
    fetchAllPasars();
  }, []);

  useEffect(() => {
    fetchPedagangsData();
  }, [page, limit, search, owner, status]);

  const fetchPedagangsData = async () => {
    try {
      const response = await fetchPedagangs(page, limit, search, owner, status);
      setTotalPages(response.totalPages);
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

  const handleSavePedagang = async (formData: any) => {
    const { selectedLapaks, lapakMulai, lapakAkhir, ...pedagangData } =
      formData;

    try {
      if (selectedPedagang) {
        // Update pedagang
        await editPedagang(selectedPedagang.CUST_CODE, pedagangData);

        // Update status lapak secara looping
        if (selectedLapaks && selectedLapaks.length > 0) {
          for (const lapakCode of selectedLapaks) {
            await editStatusLapak(lapakCode, {
              LAPAK_STATUS: "aktif",
              LAPAK_PENYEWA: pedagangData.CUST_NAMA,
              LAPAK_MULAI: lapakMulai,
              LAPAK_AKHIR: lapakAkhir,
            });
          }
        }
      } else {
        // Add pedagang
        const newPedagang = await addPedagang(pedagangData);

        // Update status lapak secara looping
        if (selectedLapaks && selectedLapaks.length > 0) {
          for (const lapakCode of selectedLapaks) {
            await editStatusLapak(lapakCode, {
              LAPAK_STATUS: "aktif",
              LAPAK_PENYEWA: newPedagang.CUST_NAMA,
              LAPAK_MULAI: lapakMulai,
              LAPAK_AKHIR: lapakAkhir,
            });
          }
        }
      }

      closeModal();
      fetchPedagangsData();
    } catch (error) {
      console.error("Failed to save pedagang:", error);
    }
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
      {/* Filter and Search Section */}
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
            placeholder="Search by name or NIK"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={statusOptions}
            onChange={(value) => setStatus(value)}
            defaultValue=""
            placeholder="All Status"
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
            onChange={(value) => setOwner(value)}
            defaultValue={owner}
            className="w-full sm:w-auto"
          />
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
                "Name",
                "NIK",
                "Phone",
                "Owner",
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
                  {title}
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
                  {pedagang.CUST_NAMA}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_NIK}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_PHONE}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.pasar?.pasar_nama || "Unknown"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {pedagang.CUST_IURAN}
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
                    pedagang.lapaks.length > 3 ? (
                      <div>
                        {pedagang.lapaks
                          .slice(0, 3)
                          .map((lapak) => lapak.LAPAK_NAMA)
                          .join(", ")}{" "}
                        <span
                          className="text-blue-500 cursor-pointer hover:underline"
                          onClick={() =>
                            alert(
                              `Lapaks: ${pedagang.lapaks
                                .map((lapak) => lapak.LAPAK_NAMA)
                                .join(", ")}`
                            )
                          }
                        >
                          +{pedagang.lapaks.length - 3} more
                        </span>
                      </div>
                    ) : (
                      pedagang.lapaks
                        .map((lapak) => lapak.LAPAK_NAMA)
                        .join(", ")
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

      {/* Pagination Section */}
      <div className="flex justify-between items-center p-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="dark:text-gray-400">
          Page {page} of {totalPages}
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
    </div>
  );
}
