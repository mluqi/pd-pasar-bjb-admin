import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

interface LapakInfo {
  LAPAK_CODE: string;
  LAPAK_NAMA: string;
  LAPAK_MULAI: string | null;
  LAPAK_AKHIR: string | null;
}

interface PasarInfo {
  pasar_nama: string;
  pasar_code: string;
}

interface Iuran {
  IURAN_CODE: string;
  IURAN_TANGGAL: string;
  IURAN_JUMLAH: number;
  IURAN_STATUS: string;
  IURAN_METODE_BAYAR: string | null;
  IURAN_WAKTU_BAYAR: string | null;
}

interface PedagangDetailData {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  CUST_PHONE: string;
  CUST_OWNER: string;
  CUST_IURAN: string;
  CUST_STATUS: string;
  pasar?: PasarInfo;
  lapaks?: LapakInfo[];
  iurans?: Iuran[];
}

interface PaginatedIurans {
  data: Iuran[];
  total: number;
  iurans: Iuran[];
}

const PedagangDetail: React.FC = () => {
  const { custCode } = useParams<{ custCode: string }>();
  const [pedagang, setPedagang] = useState<PedagangDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [iuranLoading, setIuranLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [iuranPage, setIuranPage] = useState<number>(1);
  const [iuranLimit] = useState(10);
  const [paginatedIuranData, setPaginatedIuranData] = useState<{
    data: Iuran[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);

  useEffect(() => {
    if (!custCode) {
      setLoading(false);
      setPedagang(null);
      setPaginatedIuranData(null);
      setError("No customer code provided.");
      return;
    }

    const fetchData = async () => {
      if (!pedagang || pedagang.CUST_CODE !== custCode) {
        setLoading(true); 
        setPedagang(null); 
        setPaginatedIuranData(null);
      }
      setIuranLoading(true);

      try {
        const response = await api.get(
          `/pedagang/${custCode}?iuranPage=${iuranPage}&iuranLimit=${iuranLimit}`
        );
        setPedagang(response.data.pedagang);
        setPaginatedIuranData(response.data.iurans);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch details.");
        setPedagang(null); 
        setPaginatedIuranData(null);
        console.error(err);
        setLoading(false);
      } finally {
        setIuranLoading(false);
      }
    };

    fetchData();
  }, [custCode, iuranPage, iuranLimit]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!pedagang) {
    return <div className="p-4">Pedagang not found.</div>;
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <PageMeta
        title={`Detail Pedagang: ${pedagang.CUST_NAMA} | Pedagang Management`}
        description="Detail informasi pedagang beserta riwayat iuran."
      />
      <PageBreadcrumb
        pageTitle="Detail Pedagang"
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Pedagang Management", path: "/pedagang-management" },
          { label: "Detail" },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard
          title="Informasi Pedagang"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                {pedagang.CUST_NAMA}
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Kode
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {pedagang.CUST_CODE}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    NIK
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {pedagang.CUST_NIK}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {pedagang.CUST_PHONE}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Pasar
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {pedagang.pasar?.pasar_nama || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    <Badge
                      color={
                        pedagang.CUST_STATUS === "aktif" ? "success" : "error"
                      }
                    >
                      {pedagang.CUST_STATUS}
                    </Badge>
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Lapak
                  </p>
                  {pedagang.lapaks && pedagang.lapaks.length > 0 ? (
                    <ul className="text-sm font-medium text-gray-800 dark:text-white/90 list-disc list-inside pl-5 mt-2">
                      {pedagang.lapaks.map((lapak) => (
                        <li key={lapak.LAPAK_CODE}>
                          {lapak.LAPAK_NAMA} (Mulai:{" "}
                          {formatDate(lapak.LAPAK_MULAI)}, Akhir:{" "}
                          {formatDate(lapak.LAPAK_AKHIR)})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 mt-2">
                      Tidak ada lapak terdaftar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard
          title="Riwayat Iuran"
          className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
        >
          <div className="p-6">
            {iuranLoading ? (
              <div className="text-center">Loading iuran history...</div>
            ) : paginatedIuranData && paginatedIuranData.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        {[
                          "Tanggal Iuran",
                          "Jumlah",
                          "Status",
                          "Metode Bayar",
                          "Tanggal Bayar",
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
                      {paginatedIuranData.data.map((iuran) => (
                        <TableRow key={iuran.IURAN_CODE}>
                          <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                            {formatDate(iuran.IURAN_TANGGAL)}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                            {formatCurrency(iuran.IURAN_JUMLAH)}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm">
                            <Badge
                              color={
                                iuran.IURAN_STATUS.toLowerCase() === "paid"
                                  ? "success"
                                  : iuran.IURAN_STATUS.toLowerCase() ===
                                    "pending"
                                  ? "warning"
                                  : "error"
                              }
                            >
                              {iuran.IURAN_STATUS}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                            {iuran.IURAN_METODE_BAYAR || "-"}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                            {formatDate(iuran.IURAN_WAKTU_BAYAR)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center p-4">
                  <Button
                    disabled={iuranPage === 1}
                    onClick={() => setIuranPage(iuranPage - 1)}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-700 dark:text-gray-400 text-sm">
                    Page {paginatedIuranData.page} of{" "}
                    {paginatedIuranData.totalPages}
                  </span>
                  <Button
                    disabled={iuranPage === paginatedIuranData.totalPages}
                    onClick={() => setIuranPage(iuranPage + 1)}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Tidak ada riwayat iuran.
              </p>
            )}
          </div>
        </ComponentCard>

        <div className="mt-6 flex justify-start">
          <Link to="/pedagang-management">
            <Button variant="outline">Kembali ke Daftar Pedagang</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default PedagangDetail;
