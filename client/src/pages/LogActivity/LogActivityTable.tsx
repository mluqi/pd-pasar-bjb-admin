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
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import RangeDatePicker from "../../components/form/RangeDatePicker";
import Button from "../../components/ui/button/Button";

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

const actionOptions = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
];

export default function LogActivityTable() {
  const { logActivities, fetchLogActivity } = useLog();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0); // Total data count from API

  const fetchLogActivityData = async () => {
    try {
      const [startDate, endDate] = dateRange;
      const response = await fetchLogActivity(
        page,
        limit,
        search,
        status,
        actionFilter,
        startDate,
        endDate
      );
      setTotalPages(response.totalPages);
      setTotalData(response.total || 0); // Update total data count
    } catch (error) {
      console.error("Failed to fetch log activities:", error);
    }
  };

  useEffect(() => {
    fetchLogActivityData();
  }, [page, limit, search, status, actionFilter, dateRange]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Filter Section */}
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
          <Input
            type="text"
            placeholder="Search by keyword"
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
            options={actionOptions}
            onChange={(value) => {
              setActionFilter(value);
              setPage(1);
            }}
            placeholder="All Actions"
            className="w-full sm:w-auto"
            value={actionFilter}
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
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Target
              </TableCell>
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
                Action
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Detail
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Source
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Record
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Owner
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {logActivities && logActivities.length > 0 ? (
              logActivities.map((logActivity) => (
                <TableRow key={logActivity.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {logActivity.LOG_TARGET}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {logActivity.LOG_USER}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {logActivity.LOG_ACTION}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        logActivity.LOG_DETAIL === "success"
                          ? "success"
                          : logActivity.LOG_DETAIL === "failed"
                          ? "error"
                          : "warning"
                      }
                    >
                      {logActivity.LOG_DETAIL}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <button
                      className="text-blue-400 dark:text-blue-400 hover:text-gray-500 dark:hover:text-gray-400"
                      onClick={() =>
                        navigator.clipboard.writeText(logActivity.LOG_SOURCE)
                      }
                    >
                      <span>copy</span>
                    </button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(logActivity.LOG_RECORD).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {logActivity.LOG_OWNER}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            )}
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
    </div>
  );
}
