import React, { useEffect, useState } from "react";
import StatisticsChart from "../../components/dashboardCard/StatisticChart";
import RecentIuran from "../../components/dashboardCard/RecentIuran";
import PageMeta from "../../components/common/PageMeta";
import PaymentMethodsPieChart from "../../components/dashboardCard/PaymentMethodPieChart";
import IuranMetrics from "../../components/dashboardCard/IuranMetrics";
import RangeDatePicker from "../../components/form/RangeDatePicker";
import { useDashboard } from "../../context/DashboardContext";
import Button from "../../components/ui/button/Button";
import IuranStatusPieChart from "../../components/dashboardCard/IuranStatusPieChart";


export default function Home() {
  const {
    setDashboardDates,
    startDate: contextStartDate,
    endDate: contextEndDate,
    refreshData,
  } = useDashboard();

  const formatDateForRangePicker = (date: Date | null): string | null => {
    return date ? date.toISOString().split("T")[0] : null;
  };

  const [localDateRange, setLocalDateRange] = useState<
    [string | null, string | null]
  >([
    formatDateForRangePicker(contextStartDate),
    formatDateForRangePicker(contextEndDate),
  ]);

  useEffect(() => {
    setLocalDateRange([
      formatDateForRangePicker(contextStartDate),
      formatDateForRangePicker(contextEndDate),
    ]);
  }, [contextStartDate, contextEndDate]);

  const handleApplyFilter = () => {
    const startDate = localDateRange[0] ? new Date(localDateRange[0]) : null;
    let endDate = localDateRange[1] ? new Date(localDateRange[1]) : null;

    if (endDate) {
      // Set to end of the day for inclusive range
      endDate.setHours(23, 59, 59, 999);
    }
    if (startDate && endDate && startDate > endDate) {
      alert("Tanggal mulai tidak boleh melebihi tanggal akhir.");
      return;
    }
    setDashboardDates(startDate, endDate);
  };

  const handleClearFilter = () => {
    setLocalDateRange([null, null]);
    setDashboardDates(null, null);
  };

  return (
    <>
      <PageMeta
        title="Dashboard | PasarDigital"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* Main grid container for the dashboard layout */}

      {/* Date Filter Section */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 mb-4">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div>
            <RangeDatePicker
              id="dashboardDateRange"
              defaultDates={localDateRange}
              onChange={(dates) => setLocalDateRange(dates)}
              placeholder="Pilih rentang tanggal"
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            className="w-full sm:w-auto"
          >
            Terapkan
          </Button>
          <Button onClick={handleClearFilter} variant="outline">
            Reset
          </Button>
          <Button
            onClick={refreshData}
            variant="outline"
            className="text-green-600 border-green-500 hover:bg-green-50"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-4">
          <IuranMetrics />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <PaymentMethodsPieChart />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <IuranStatusPieChart />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <RecentIuran />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <StatisticsChart />
        </div>
      </div>
    </>
  );
}
