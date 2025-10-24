import { useLog } from "../../context/LogContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
// import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import RangeDatePicker from "../../components/form/RangeDatePicker";

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const browserOptions = [
  { value: "", label: "All Browsers" },
  { value: "chrome", label: "Chrome" },
  { value: "firefox", label: "Firefox" },
  { value: "safari", label: "Safari" },
  { value: "edge", label: "Edge" },
  { value: "other", label: "Other" },
];

export default function LogAksesTable() {
  const { logAkses, fetchLogAkses } = useLog();

  const [search, setSearch] = useState("");
  const [browserFilter, setBrowserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0); // Total data count from API
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogAksesData = async () => {
    setIsLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const response = await fetchLogAkses(
        page,
        limit,
        search,
        statusFilter,
        browserFilter,
        startDate,
        endDate
      );
      setTotalPages(response.totalPages);
      setTotalData(response.total || 0); 
    } catch (error) {
      console.error("Failed to fetch log access:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogAksesData();
  }, [page, limit, search, statusFilter, browserFilter, dateRange]);

  return (
    <div className=" rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Filter Section */}
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
          <Input
            type="text"
            placeholder="Search by user"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded w-full sm:w-auto flex-grow"
          />
          <Select
            options={limitOptions}
            onChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
            value={limit.toString()}
            className="w-full sm:w-auto"
          />

          <Select
            options={statusOptions}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            placeholder="All Status"
            className="w-full sm:w-auto"
            value={statusFilter}
          />
          <Select
            options={browserOptions}
            onChange={(value) => {
              setBrowserFilter(value);
              setPage(1);
            }}
            placeholder="All Browsers"
            className="w-full sm:w-auto"
            value={browserFilter}
          />
          <RangeDatePicker
            id="date-range"
            placeholder="Select date range"
            defaultDates={dateRange}
            onChange={(dates) => {
              setDateRange(dates);
              setPage(1);
            }}
          />
        </div>
      </div>
      {/* Table Section */}
      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  IP
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Browser
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Record
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {logAkses && logAkses.length > 0 ? (
                logAkses.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {log.AKSES_USER}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {log.AKSES_IP}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {log.AKSES_BROWSER}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={
                          log.AKSES_STATUS === "Success"
                            ? "success"
                            : log.AKSES_STATUS === "Failed"
                            ? "warning"
                            : "error"
                        }
                      >
                        {log.AKSES_STATUS}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(log.AKSES_RECORD).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
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
    </div>
  );
}
