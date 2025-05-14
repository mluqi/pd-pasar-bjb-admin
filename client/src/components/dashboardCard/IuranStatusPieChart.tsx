import React, { useEffect, useState, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { useDashboard } from "../../context/DashboardContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const IuranStatusPieChart: React.FC = () => {
  const {
    iuranStatusStats,
    loadingIuranStatusStats,
    error: contextError,
  } = useDashboard();
  const [chartData, setChartData] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const processedChartData = useMemo(() => {
    if (!iuranStatusStats) return null;
    // Capitalize first letter for better display
    const labels = iuranStatusStats.map(
      (item) =>
        item.IURAN_STATUS.charAt(0).toUpperCase() +
          item.IURAN_STATUS.slice(1) || "Unknown"
    );
    const data = iuranStatusStats.map((item) => item.count);
    return { labels, data };
  }, [iuranStatusStats]);

  useEffect(() => {
    if (processedChartData) {
      const { labels, data } = processedChartData;
      // Define colors based on typical statuses
      const backgroundColors = labels.map((label) => {
        switch (label.toLowerCase()) {
          case "paid":
            return "rgba(75, 192, 192, 0.6)"; // Teal/Green
          case "unpaid":
            return "rgba(255, 99, 132, 0.6)"; // Pink/Red
          case "pending":
            return "rgba(255, 206, 86, 0.6)"; // Yellow
          case "tidak bayar":
            return "rgba(201, 203, 207, 0.6)"; // Grey
          default:
            return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, 0.6)`;
        }
      });
      const borderColors = backgroundColors.map((color) =>
        color.replace("0.6", "1")
      );

      setChartData({
        labels,
        datasets: [
          {
            label: "Status Iuran",
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            hoverOffset: 8,
            hoverBorderWidth: 2,
            hoverBorderColor: isDarkMode ? "#4B5563" : "#E5E7EB",
          },
        ],
      });
    }
  }, [processedChartData, isDarkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDarkMode ? "#D1D5DB" : "#374151",
          padding: 20,
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode
          ? "rgba(55, 65, 81, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        titleColor: isDarkMode ? "#F3F4F6" : "#1F2937",
        bodyColor: isDarkMode ? "#D1D5DB" : "#374151",
        borderColor: isDarkMode ? "#4B5563" : "#E5E7EB",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            const value = context.raw as number;
            const dataPoints = context.chart.data.datasets[context.datasetIndex]
              .data as number[];
            if (
              !Array.isArray(dataPoints) ||
              dataPoints.some((val) => typeof val !== "number" || isNaN(val))
            ) {
              return label + "Data tidak valid";
            }
            const total = dataPoints.reduce(
              (acc: number, val: number) => acc + val,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
            return `${label}${percentage}% (Jumlah: ${value})`;
          },
        },
      },
    },
  };

  if (loadingIuranStatusStats) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Distribusi Status Iuran
        </h2>
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Memuat data chart...
          </p>
        </div>
      </div>
    );
  }

  if (contextError && !iuranStatusStats) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Distribusi Status Iuran
        </h2>
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-red-500">Error: {contextError}</p>
        </div>
      </div>
    );
  }

  if (
    !loadingIuranStatusStats &&
    (!processedChartData || processedChartData.labels.length === 0)
  ) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Distribusi Status Iuran
        </h2>
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada data status iuran.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Distribusi Status Iuran
      </h2>
      {chartData ? (
        <div className="relative h-72 md:h-80">
          <Pie data={chartData} options={options} />
        </div>
      ) : (
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Menyiapkan chart...
          </p>
        </div>
      )}
    </div>
  );
};

export default IuranStatusPieChart;
