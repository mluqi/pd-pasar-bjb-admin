import React from "react";
import { useParams, Link } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";

const LapakQrPage: React.FC = () => {
  const { lapakCode } = useParams<{ lapakCode: string }>();

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
              Lapak Code: <span className="font-bold">{lapakCode}</span>
            </h4>
            <div className="my-4 p-2 border border-gray-200 dark:border-gray-700 rounded-lg inline-block bg-white">
              <img
                src={qrImageUrl}
                alt={`QR Code for Lapak ${lapakCode}`}
                className="w-64 h-64 md:w-80 md:h-80"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Scan QR code ini untuk mendapatkan informasi mengenai Lapak{" "}
              <span className="font-semibold">{lapakCode}</span>.
            </p>
            <div className="mt-6 md:hidden">
              {" "}
              {/* Show print button on mobile if not in breadcrumb */}
              <Button onClick={handlePrint} variant="primary" size="sm">
                Print QR Code
              </Button>
            </div>
          </div>
        </ComponentCard>

        {/* Content specifically for printing */}
        <div className="hidden print:block print-container p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">QR Code Lapak</h1>
            <p className="text-xl font-semibold mb-4">{lapakCode}</p>
            <div className="inline-block border border-black p-1 bg-white">
              <img
                src={qrImageUrl}
                alt={`QR Code for Lapak ${lapakCode}`}
                className="w-80 h-80"
              />
            </div>
            <p className="mt-4 text-sm">
              Scan QR code ini untuk mendapatkan informasi mengenai Lapak{" "}
              {lapakCode}.
            </p>
            <p className="mt-8 text-xs">
              Dicetak pada:{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              -{" "}
              {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-start print:hidden">
          <Link to="/lapak-management">
            <Button variant="outline">Kembali ke Daftar Lapak</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

// Add print-specific styles. You might want to put this in a global CSS file or a <style jsx global> tag if using Next.js
// For now, let's add it here for simplicity or assume you'll move it to your main CSS.
const printStyles = `
@media print {
  body * {
    visibility: hidden;
  }
  .print-container, .print-container * {
    visibility: visible;
  }
  .print-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
`;

export default LapakQrPage;
