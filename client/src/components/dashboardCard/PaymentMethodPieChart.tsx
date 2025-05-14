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

const PaymentMethodPieChart: React.FC = () => {
  const {
    paymentMethodStats,
    loadingPaymentMethodStats,
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

    return () => {
      observer.disconnect();
    };
  }, []);

  const processedChartData = useMemo(() => {
    if (!paymentMethodStats) return null;
    const labels = paymentMethodStats.map(
      (item) => item.IURAN_METODE_BAYAR || "Unknown"
    );
    const data = paymentMethodStats.map((item) => item.count);
    return { labels, data };
  }, [paymentMethodStats]);

  useEffect(() => {
    if (processedChartData) {
      const { labels, data } = processedChartData;
      setChartData({
        labels,
        datasets: [
          {
            label: "Metode Pembayaran",
            data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)", // Pink
              "rgba(54, 162, 235, 0.6)", // Blue
              "rgba(255, 206, 86, 0.6)", // Yellow
              "rgba(75, 192, 192, 0.6)", // Teal
              "rgba(153, 102, 255, 0.6)", // Purple
              "rgba(255, 159, 64, 0.6)", // Orange
              "rgba(199, 199, 199, 0.6)", // Grey
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
              "rgba(199, 199, 199, 1)",
            ],
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
          font: {
            size: 14,
          },
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

  if (loadingPaymentMethodStats) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Favorite Methode Pembayaran
        </h2>
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Memuat data chart...
          </p>
        </div>
      </div>
    );
  }

  if (contextError && !paymentMethodStats) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Favorite Methode Pembayaran
        </h2>
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-red-500">Error: {contextError}</p>
        </div>
      </div>
    );
  }
  if (
    !loadingPaymentMethodStats &&
    (!processedChartData || processedChartData.labels.length === 0)
  ) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Favorite Methode Pembayaran
        </h2>
        <div className="relative h-72 md:h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada data metode pembayaran.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Favorite Methode Pembayaran
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

export default PaymentMethodPieChart;
