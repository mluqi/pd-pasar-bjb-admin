import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";

const MultiLapakQrPage: React.FC = () => {
  const location = useLocation();
  const { lapakData } = location.state || { lapakData: [] };
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  if (lapakData.length === 0) {
    return (
      <>
        <PageMeta
          title="Error | QR Lapak"
          description="Data lapak tidak ditemukan."
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
              Data Lapak Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Silakan pilih lapak terlebih dahulu dari halaman daftar lapak.
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

  const generateQRCanvas = async (text) => {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, text, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000",
        light: "#fff",
      },
    });
    return canvas;
  };

  const exportAllToPdf = async (allData) => {
    const element = document.createElement("div");
    element.style.width = "210mm";
    element.style.padding = "0";

    const itemsPerPage = 4;
    const totalPages = Math.ceil(allData.length / itemsPerPage);

    for (let page = 0; page < totalPages; page++) {
      const pageDiv = document.createElement("div");
      pageDiv.style.width = "210mm";
      pageDiv.style.height = "297mm";
      pageDiv.style.padding = "10mm";
      pageDiv.style.boxSizing = "border-box";
      if (page < totalPages - 1) {
        pageDiv.style.pageBreakAfter = "always";
      }

      const gridDiv = document.createElement("div");
      gridDiv.style.display = "grid";
      gridDiv.style.gridTemplateColumns = "1fr 1fr";
      gridDiv.style.gridTemplateRows = "1fr 1fr";
      gridDiv.style.gap = "15px";
      gridDiv.style.width = "100%";
      gridDiv.style.height = "calc(100% - 20mm)";

      const currentPageData = allData.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
      );

      await Promise.all(
        currentPageData.map(async (lapak) => {
          const qrItem = document.createElement("div");
          qrItem.style.display = "flex";
          qrItem.style.flexDirection = "column";
          qrItem.style.alignItems = "center";
          qrItem.style.justifyContent = "center";
          qrItem.style.height = "120mm";
          qrItem.style.pageBreakInside = "avoid";
          qrItem.style.border = "2px solid #000";
          qrItem.style.borderRadius = "8px";
          qrItem.style.padding = "5mm";
          qrItem.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

          // Nama Pasar
          const pasarName = document.createElement("h2");
          pasarName.textContent = lapak.pasar;
          pasarName.style.fontSize = "18pt";
          pasarName.style.fontWeight = "bold";
          pasarName.style.marginBottom = "10px";
          pasarName.style.textAlign = "center";

          // QR Code
          const qrCanvas = await generateQRCanvas(lapak.code);
          qrCanvas.style.width = "70mm";
          qrCanvas.style.height = "70mm";
          qrCanvas.style.margin = "10px 0";

          // Kode Lapak
          const lapakCode = document.createElement("p");
          lapakCode.textContent = lapak.code;
          lapakCode.style.fontSize = "14pt";
          lapakCode.style.fontWeight = "bold";
          lapakCode.style.margin = "5px 0";
          lapakCode.style.textAlign = "center";

          // Nama Lapak
          const lapakName = document.createElement("p");
          lapakName.textContent = lapak.nama;
          lapakName.style.fontSize = "12pt";
          lapakName.style.margin = "5px 0";
          lapakName.style.textAlign = "center";

          qrItem.appendChild(pasarName);
          qrItem.appendChild(qrCanvas);
          qrItem.appendChild(lapakCode);
          qrItem.appendChild(lapakName);

          gridDiv.appendChild(qrItem);
        })
      );

      pageDiv.appendChild(gridDiv);
      element.appendChild(pageDiv);
    }

    const opt = {
      margin: [0, 0],
      filename: `qr-lapak-all.pdf`,
      html2canvas: {
        scale: 2,
        logging: true,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        before: ".pdf-page",
        after: "avoid",
        avoid: ["tr", "td", "img"],
      },
    };

    await html2pdf().set(opt).from(element).save();
  };

  const handleExportPdf = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Batasi batch untuk progress bar, tapi hasilkan 1 PDF
      const CHUNK_SIZE = 20;
      for (let i = 0; i < lapakData.length; i += CHUNK_SIZE) {
        setExportProgress(
          Math.floor(
            (Math.min(i + CHUNK_SIZE, lapakData.length) / lapakData.length) *
              100
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await exportAllToPdf(lapakData);

      alert(`Successfully exported ${lapakData.length} QR codes in 1 PDF file`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi error saat export. Coba ekspor dalam jumlah lebih kecil.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <>
      <PageMeta
        title={`Multiple QR Codes (${lapakData.length}) | Lapak Management`}
        description={`QR Codes untuk ${lapakData.length} lapak`}
      />
      <PageBreadcrumb
        pageTitle={`Multiple QR Codes (${lapakData.length})`}
        crumbs={[
          { label: "Home", path: "/" },
          { label: "Lapak Management", path: "/lapak-management" },
          { label: "Multiple QR Codes" },
        ]}
      />

      {/* Screen View */}
      <div className="space-y-6 print:hidden">
        <ComponentCard title="Multiple QR Codes">
          <div className="p-6">
            <div className="flex justify-end mb-4 gap-2">
              <Button
                onClick={handleExportPdf}
                variant="primary"
                disabled={isExporting}
              >
                {isExporting ? `Exporting... ${exportProgress}%` : "Export PDF"}
              </Button>
            </div>

            {isExporting && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Processing {exportProgress}% complete...
                </p>
              </div>
            )}

            <div id="qr-print-area">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lapakData.map((lapak) => (
                  <div
                    key={lapak.code}
                    className="p-4 border rounded-lg text-center"
                  >
                    <p className="font-semibold mb-2">{lapak.pasar}</p>
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(
                        lapak.code
                      )}`}
                      alt={`QR Code for ${lapak.code}`}
                      className="w-full h-auto mx-auto"
                    />
                    <div className="mt-2">
                      <p className="text-sm font-bold">{lapak.code}</p>
                      <p className="text-sm">{lapak.nama}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Link to="/lapak-management">
                <Button variant="outline">Kembali ke Daftar Lapak</Button>
              </Link>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Print View - Optimized for 4 QR codes per page */}
      <div className="hidden print:block">
        {Array.from({ length: Math.ceil(lapakData.length / 4) }).map(
          (_, pageIndex) => (
            <div
              key={pageIndex}
              className="page"
              style={{
                width: "210mm",
                height: "297mm",
                padding: "15mm",
                boxSizing: "border-box",
                pageBreakAfter:
                  pageIndex < Math.ceil(lapakData.length / 4) - 1
                    ? "always"
                    : "auto",
              }}
            >
              <div
                className="grid grid-cols-2 grid-rows-2 gap-8"
                style={{
                  width: "180mm",
                  height: "267mm",
                }}
              >
                {lapakData
                  .slice(pageIndex * 4, (pageIndex + 1) * 4)
                  .map((lapak) => (
                    <div
                      key={lapak.code}
                      className="flex flex-col items-center justify-center p-2 border border-gray-300 rounded-lg"
                      style={{
                        height: "120mm",
                        pageBreakInside: "avoid",
                      }}
                    >
                      <div className="text-center mb-2">
                        <h2 className="text-xl font-bold">{lapak.pasar}</h2>
                      </div>

                      <div className="flex-grow flex items-center justify-center">
                        <img
                          src={`https://quickchart.io/qr?text=${encodeURIComponent(
                            lapak.code
                          )}&size=150&margin=0`}
                          alt={`QR Code for ${lapak.code}`}
                          className="w-64 h-64"
                        />
                      </div>

                      <div className="text-center mt-2">
                        <p className="text-lg font-bold">{lapak.code}</p>
                        <p className="text-md">{lapak.nama}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Print Styles */}
      <style>{`
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
          .page {
            break-after: page;
          }
        }
      `}</style>
    </>
  );
};

export default MultiLapakQrPage;
