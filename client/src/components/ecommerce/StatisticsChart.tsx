import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
// import ChartTab from "../common/ChartTab"; // Commented out as its role needs clarification for this chart
import { useEffect, useState } from "react";
import api from "../../services/api"; // Ensure this path is correct

interface MonthlyStatsData {
  months: string[];
  tunaiData: number[];
  nonTunaiData: number[];
}

export default function StatisticsChart() {
  const [chartData, setChartData] = useState<MonthlyStatsData>({
    months: [],
    tunaiData: [],
    nonTunaiData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/iuran/monthly-transaction-stats");
        setChartData(response.data);
      } catch (err) {
        console.error("Failed to fetch monthly stats:", err);
        setError("Gagal memuat data statistik.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: true, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"], // Define line colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area", // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: "smooth", // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      x: {
        // Tooltip for x-axis (month name)
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
      type: "category", // Category-based x-axis
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
      labels: {
        style: {
          colors: "#6B7280", // text-gray-500
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
        formatter: function (value: number) {
          if (value >= 1000000000) {
            // Miliar
            return (
              "Rp " + (value / 1000000000).toFixed(1).replace(/\.0$/, "") + "M"
            );
          }
          if (value >= 1000000) {
            // Juta
            return (
              "Rp " + (value / 1000000).toFixed(1).replace(/\.0$/, "") + "jt"
            );
          }
          if (value >= 1000) {
            // Ribu
            return "Rp " + (value / 1000).toFixed(0) + "rb";
          }
          return "Rp " + value.toLocaleString("id-ID");
        },
      },
      title: {
        text: "Total Pemasukan (Rp)",
        style: {
          fontSize: "12px",
          color: "#6B7280",
        },
      },
    },
  };
  // Update xaxis categories if data is loaded
  if (chartData.months.length > 0) {
    options.xaxis!.categories = chartData.months;
  }
  const series = [
    {
      name: "Non Tunai",
      data: chartData.nonTunaiData,
    },
    {
      name: "Tunai",
      data: chartData.tunaiData,
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex justify-center items-center h-[420px]">
        <p>Memuat data chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex justify-center items-center h-[420px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik Pemasukan Iuran Bulanan
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Total pemasukan iuran tunai dan non-tunai (12 bulan terakhir)
          </p>
        </div>
        {/* <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div> */}
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
