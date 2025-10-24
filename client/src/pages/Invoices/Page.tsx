import { useEffect, useState, useCallback } from "react";
import { useInvoiceContext } from "../../context/InvoiceContext";
import InvoicesTable from "./InvoicesTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import RangeDatePicker from "../../components/form/RangeDatePicker";

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "waiting", label: "Waiting" },
];

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const InvoicesPage = () => {
  const { fetchInvoices } = useInvoiceContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const fetchInvoicesData = useCallback(async () => {
    const [startDate, endDate] = dateRange;
    const { totalPages: pages, total } = await fetchInvoices(
      currentPage,
      limit,
      searchTerm,
      status,
      startDate || "",
      endDate || ""
    );
    setTotalPages(pages);
    setTotalData(total || 0);
  }, [currentPage, limit, searchTerm, status, dateRange, fetchInvoices]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoicesData();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [currentPage, limit, searchTerm, status, dateRange, fetchInvoicesData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setCurrentPage(1);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Manajemen Invoices" />
      <div className="space-y-6">
        <ComponentCard title="List Invoice">
          <div className="flex flex-wrap gap-4 p-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-grow">
              <Select
                options={limitOptions}
                onChange={handleLimitChange}
                value={String(limit)}
                className="w-full sm:w-auto"
              />
              <Input
                type="text"
                placeholder="Cari No. Invoice atau Pedagang..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Select
                options={statusOptions}
                placeholder="Semua Status"
                onChange={handleStatusChange}
                value={status}
                className="w-full sm:w-auto"
              />
              <RangeDatePicker
                id="date-range-invoice"
                placeholder="Pilih rentang tanggal"
                defaultDates={dateRange}
                onChange={(dates) => {
                  setDateRange(dates);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <InvoicesTable onActionComplete={fetchInvoicesData} />

          <div className="flex justify-between items-center p-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-gray-700 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({totalData} total entries)
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default InvoicesPage;
