import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useDashboard } from "../../context/DashboardContext";

const StatisticChart: React.FC = () => {
  const {
    dailyStats,
    loadingDailyStats,
    error: contextError,
    startDate, // To potentially show date range in title
    endDate, // To potentially show date range in title
  } = useDashboard();
  const [series, setSeries] = useState<ApexAxisChartSeries>([]);
  const [options, setOptions] = useState<ApexOptions>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const root = document.documentElement;
    const checkDarkMode = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          checkDarkMode();
        }
      }
    });
    observer.observe(root, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dailyStats) {
      setSeries([
        {
          name: "Non Tunai",
          data: dailyStats.nonTunaiData,
        },
        {
          name: "Tunai",
          data: dailyStats.tunaiData,
        },
      ]);

      const newOptions: ApexOptions = {
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
          labels: {
            colors: isDarkMode ? "#D1D5DB" : "#374151",
          },
        },
        colors: ["#80CAEE", "#3C50E0"], // NonTunai (Light Blue), Tunai (Dark Blue)
        chart: {
          fontFamily: "Outfit, sans-serif",
          height: 310,
          type: "area",
          toolbar: {
            show: false,
          },
          foreColor: isDarkMode ? "#D1D5DB" : "#374151",
        },
        stroke: {
          curve: "smooth",
          width: [2, 2],
        },
        fill: {
          type: "gradient",
          gradient: {
            opacityFrom: 0.55,
            opacityTo: 0,
          },
        },
        markers: {
          size: 0,
          strokeColors: "#fff",
          strokeWidth: 2,
          hover: {
            size: 6,
          },
        },
        grid: {
          show: true,
          borderColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        tooltip: {
          enabled: true,
          theme: isDarkMode ? "dark" : "light",
          x: {
            show: true,
          },
          y: {
            formatter: function (val) {
              return (
                "Rp " +
                val.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              );
            },
          },
        },
        xaxis: {
          type: "category",
          categories: dailyStats.dates,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: isDarkMode ? "#9CA3AF" : "#6B7280",
              fontSize: "12px",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "12px",
              colors: [isDarkMode ? "#9CA3AF" : "#6B7280"],
            },
            formatter: function (value: number) {
              if (value >= 1000000000) {
                return (
                  "Rp " +
                  (value / 1000000000).toFixed(1).replace(/\.0$/, "") +
                  "M"
                );
              }
              if (value >= 1000000) {
                return (
                  "Rp " +
                  (value / 1000000).toFixed(1).replace(/\.0$/, "") +
                  "jt"
                );
              }
              if (value >= 1000) {
                return "Rp " + (value / 1000).toFixed(0) + "rb";
              }
              return "Rp " + value.toLocaleString("id-ID");
            },
          },
        },
      };
      setOptions(newOptions);
      setChartKey((prevKey) => prevKey + 1); // Force re-render for ApexCharts
    } else {
      setSeries([]);
      setOptions({});
    }
  }, [dailyStats, isDarkMode]);

  if (loadingDailyStats) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-[420px] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Memuat statistik harian...
        </p>
      </div>
    );
  }

  if (contextError && !dailyStats) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-[420px] flex items-center justify-center">
        <p className="text-red-500">Error: {contextError}</p>
      </div>
    );
  }

  if (!dailyStats || dailyStats.dates.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-[420px] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Belum ada data statistik harian.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik Pemasukan Iuran Harian
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Total pemasukan iuran tunai dan non-tunai per hari.
            {startDate && endDate && (
              <span className="block text-xs">
                Periode: {startDate.toLocaleDateString("id-ID")} -{" "}
                {endDate.toLocaleDateString("id-ID")}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="relative h-[310px]">
        {series.length > 0 && Object.keys(options).length > 0 && (
          <Chart
            key={chartKey}
            options={options}
            series={series}
            type="area"
            height={310}
          />
        )}
      </div>
    </div>
  );
};

export default StatisticChart;
