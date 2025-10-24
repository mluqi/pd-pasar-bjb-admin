import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";

interface LapakData {
  code: string;
  nama: string;
  blok: string;
  pasar: string;
  ukuran: string;
  pemilik?: string;
}

const LapakQrPage: React.FC = () => {
  const { lapakCode } = useParams<{ lapakCode: string }>();
  const location = useLocation();
  const lapakData = location.state as LapakData | undefined;

  if (!lapakCode) {
    return (
      <>
        <PageMeta
          title="Error | QR Lapak"
          description="Lapak code tidak ditemukan."
        />
        <PageBreadcrumb
          pageTitle="Error"
          crumbs={[
            { label: "Home", path: "/" },
            { label: "Lapak Management", path: "/lapak-management" },
            { label: "QR Code Error" },
          ]}
        />
        <ComponentCard title="Error">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Lapak code not provided in the URL.
            </p>
            <div className="mt-6">
              <Link to="/lapak-management">
                <Button variant="outline">Kembali ke Daftar Lapak</Button>
              </Link>
            </div>
          </div>
        </ComponentCard>
      </>
    );
  }

  const encodedLapakCode = encodeURIComponent(lapakCode);
  const qrImageUrl = `https://quickchart.io/qr?text=${encodedLapakCode}`;

  const handlePrint = () => {
    window.print();
  };

  // Format tanggal untuk footer
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <PageMeta
        title={`QR Code Lapak: ${lapakCode} | Lapak Management`}
        description={`QR Code untuk Lapak ${lapakCode}`}
      />
      <PageBreadcrumb
        pageTitle={`QR Code: ${lapakCode}`}
        rightContent={
          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            className="hidden md:inline-flex print:hidden"
          >
            Print QR Code
          </Button>
        }
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Lapak Management", path: "/lapak-management" },
          { label: "QR Code" },
        ]}
      />
      <div className="space-y-6">
        {/* ComponentCard for screen view */}
        <ComponentCard
          title="QR Code Lapak"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] print:hidden"
        >
          <div className="p-6 flex flex-col items-center text-center">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Kode Lapak: <span className="font-bold">{lapakCode}</span>
            </h4>
            {lapakData && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Nama: {lapakData.nama}</p>
                <p>Pasar: {lapakData.pasar}</p>
                <p>
                  Blok: {lapakData.blok} | Ukuran: {lapakData.ukuran}
                </p>
                {lapakData.pemilik && <p>Pemilik: {lapakData.pemilik}</p>}
              </div>
            )}
            <div className="my-4 p-2 border border-gray-200 dark:border-gray-700 rounded-lg inline-block bg-white">
              <img
                src={qrImageUrl}
                alt={`QR Code for Lapak ${lapakCode}`}
                className="w-64 h-64 md:w-80 md:h-80"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Scan QR code ini untuk mendapatkan informasi mengenai Lapak.
            </p>
            <div className="mt-6 md:hidden">
              <Button onClick={handlePrint} variant="primary" size="sm">
                Print QR Code
              </Button>
            </div>
          </div>
        </ComponentCard>

        {/* Content specifically for printing */}
        <div className="hidden print:block">
          <div
            className="page"
            style={{
              width: "210mm",
              height: "297mm",
              padding: "15mm",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1 className="text-2xl font-bold mb-4">QR Code Lapak</h1>
            <div className="text-center mb-6">
              <p className="text-xl font-semibold">{lapakCode}</p>
              {lapakData && (
                <div className="mt-2 text-sm">
                  <p>Nama: {lapakData.nama}</p>
                  <p>Pasar: {lapakData.pasar}</p>
                  <p>
                    Blok: {lapakData.blok} | Ukuran: {lapakData.ukuran}
                  </p>
                </div>
              )}
            </div>
            <div className="border border-gray-300 p-2 bg-white mb-6">
              <img
                src={qrImageUrl}
                alt={`QR Code for Lapak ${lapakCode}`}
                className="w-60 h-60"
              />
            </div>
            <div className="text-xs text-gray-500">
              <p>Scan QR code untuk informasi lapak</p>
              <p className="mt-4">Dicetak pada: {printDate}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-start print:hidden">
          <Link to="/lapak-management">
            <Button variant="outline">Kembali ke Daftar Lapak</Button>
          </Link>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .page, .page * {
              visibility: visible;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
          }
        `}
      </style>
    </>
  );
};

export default LapakQrPage;
