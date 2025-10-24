import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api"; // Gunakan instance api global
import InputField from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import Select from "../../components/form/Select";
import SuccessAnimation from "./SuccessAnimation";

interface Lapak {
  LAPAK_NAMA: string;
  LAPAK_BLOK: string;
}

interface PedagangInfo {
  CUST_NAMA: string;
  CUST_NIK: string;
  pasar: {
    pasar_nama: string;
  };
  invoice_type: string;
  invoice_nominal: number;
  lapaks: Lapak[];
}

// Interface untuk hasil pencarian dropdown
interface SearchResult {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  lapaks: Lapak[];
}

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
}

const ConfirmationPaymentForm = () => {
  const [custCode, setCustCode] = useState("");
  const [selectedPasar, setSelectedPasar] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pedagangInfo, setPedagangInfo] = useState<PedagangInfo | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pasarList, setPasarList] = useState<Pasar[]>([]);

  useEffect(() => {
    const fetchPasars = async () => {
      try {
        const response = await api.get("/pasar/public/all");
        setPasarList(response.data);
      } catch (error) {
        console.error("Failed to fetch pasars:", error);
      }
    };
    fetchPasars();
  }, []);

  // Debounce search function
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number
  ) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchPedagang = async (query: string) => {
    if (!selectedPasar) {
      setError("Silakan pilih pasar terlebih dahulu.");
      return;
    }
    if (query.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await api.get(
        `/invoices/search?search=${query}&pasar_code=${selectedPasar}`
      );
      setSearchResults(response.data);
      setShowDropdown(true);
    } catch (err) {
      console.error("Failed to search pedagang:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchPedagang, 500), [
    selectedPasar,
    searchPedagang,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setPedagangInfo(null); // Reset info when search term changes
    setMessage(null);
    setError(null);
    debouncedSearch(query);
  };

  const handleSelectPedagang = async (pedagang: SearchResult) => {
    setSearchTerm(pedagang.CUST_NAMA); // Show name in input
    setCustCode(pedagang.CUST_CODE); // Store CUST_CODE for submission
    setShowDropdown(false);
    setSearchResults([]);

    setIsLoading(true);
    setError(null);
    setPedagangInfo(null);
    setMessage(null);

    try {
      const response = await api.get(`/invoices/status/${pedagang.CUST_CODE}`);
      const data = response.data;

      // Check if the response contains a message (e.g., "Tidak ada tagihan", "Invoice sudah terbayar")
      if (data.message) {
        setError(data.message);
      } else if (data.pedagang && data.invoice) {
        // If no message, it means we got the pedagang and invoice data
        setPedagangInfo({
          CUST_NAMA: data.pedagang.CUST_NAMA,
          CUST_NIK: data.pedagang.CUST_NIK,
          invoice_type: data.invoice.invoice_type,
          invoice_nominal: data.invoice.invoice_nominal,
          lapaks: data.lapaks || [],
          pasar: data.pasar,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mencari data pedagang.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPaymentProof(null);
    setPreview(null);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPaymentProof(file);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    // Cleanup function to revoke the object URL when the component unmounts or preview changes
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetForm = () => {
    setCustCode("");
    setSelectedPasar("");
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
    setPedagangInfo(null);
    setPaymentProof(null);
    setPreview(null);
    setError(null);
    setMessage(null);
    setShowSuccess(false);
    // Note: Dropzone component might need an explicit reset function if it holds its own state
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedagangInfo || !paymentProof) {
      alert(
        "Pastikan data pedagang sudah terisi dan bukti pembayaran telah diunggah."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("cust_code", custCode);
    formData.append("bukti_foto", paymentProof);

    try {
      const response = await api.post(
        "/invoices/confirmation-payment",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setMessage(
        response.data.message ||
          "Bukti pembayaran berhasil dikirim! Terima kasih."
      );
      setShowSuccess(true);
    } catch (err) {
      console.error("Gagal mengirim bukti pembayaran:", err);
      // Ambil pesan error dari response backend jika tersedia
      const errorMessage =
        err.response?.data?.message ||
        "Terjadi kesalahan saat mengirim data. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && message) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        <SuccessAnimation message={message} onReset={resetForm} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Form Konfirmasi Pembayaran
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pasar-select">Pilih Pasar</Label>
            <Select
              id="pasar-select"
              options={pasarList.map((p) => ({
                value: p.pasar_code,
                label: p.pasar_nama,
              }))}
              value={selectedPasar}
              onChange={(value) => {
                setSelectedPasar(value);
                setSearchTerm(""); // Reset search when market changes
                setPedagangInfo(null);
              }}
              placeholder="-- Pilih Pasar --"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-pedagang">Cari Pedagang (Nama / Blok)</Label>
            <div className="relative" ref={dropdownRef}>
              <InputField
                id="search-pedagang"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Ketik nama pedagang atau blok lapak..."
                className="w-full flex-grow"
                disabled={!selectedPasar} // Disable until a market is selected
              />
              {isSearching && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
              )}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <ul>
                    {searchResults.map((p) => (
                      <li
                        key={p.CUST_CODE}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSelectPedagang(p)}
                      >
                        <div className="font-semibold">{p.CUST_NAMA}</div>
                        <div className="text-sm text-gray-500">
                          {p.lapaks
                            .map((l) => `${l.LAPAK_BLOK}/${l.LAPAK_NAMA}`)
                            .join(", ")}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <div
                className="p-4 mt-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                role="alert"
              >
                <span className="font-medium">Terjadi Kesalahan!</span> {error}
              </div>
            )}
            {message && !showSuccess && (
              <div
                className="p-4 mt-2 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
                role="alert"
              >
                <span className="font-medium">Info:</span> {message}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center p-4">Memuat detail pedagang...</div>
          ) : (
            pedagangInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="space-y-2">
                  <Label htmlFor="cust_nama">Nama Pedagang</Label>
                  <InputField
                    id="cust_nama"
                    value={pedagangInfo.CUST_NAMA}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_type">Jenis Tagihan</Label>
                  <InputField
                    id="invoice_type"
                    value={pedagangInfo.invoice_type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_nominal">Nominal Tagihan</Label>
                  <InputField
                    id="invoice_nominal"
                    value={new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(pedagangInfo.invoice_nominal)}
                    disabled
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lapak_info">Informasi Lapak</Label>
                  <InputField
                    id="lapak_info"
                    value={pedagangInfo.lapaks
                      .map((l) => `${l.LAPAK_BLOK} / ${l.LAPAK_NAMA}`)
                      .join(", ")}
                    disabled
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pasar_info">Informasi Pasar</Label>
                  <InputField
                    id="pasar_info"
                    value={pedagangInfo.pasar?.pasar_nama || "N/A"}
                    disabled
                  />
                </div>
              </div>
            )
          )}

          <div className="space-y-2">
            <DropzoneComponent onDrop={handleDrop} />
            {preview && (
              <div className="mt-4">
                <Label>Pratinjau Gambar</Label>
                <div className="relative mt-2 w-full max-w-sm">
                  <img
                    src={preview}
                    alt="Pratinjau Bukti Pembayaran"
                    className="h-auto w-full rounded-md border border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 !px-2 !py-1 text-xs bg-red-500 hover:bg-red-600 text-white"
                  >
                    X
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!pedagangInfo || !paymentProof || isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default ConfirmationPaymentForm;
