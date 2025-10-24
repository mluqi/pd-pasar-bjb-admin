import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";

interface Pasar {
  pasar_code?: string;
  pasar_nama: string;
  pasar_status: string;
  pasar_logo?: string | File;
  pasar_qrcode?: string | File;
  pasar_tanggal_jatuh_tempo?: string;
}

const statusOptions = [
  { value: "A", label: "Aktif" },
  { value: "N", label: "Nonaktif" },
];

interface PasarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pasar: Pasar | null;
  onSave: (data: FormData) => void;
}

const PasarModal: React.FC<PasarModalProps> = ({
  isOpen,
  onClose,
  pasar,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<Pasar>>({
    pasar_nama: "",
    pasar_status: "",
    pasar_logo: undefined,
    pasar_qrcode: "",
    pasar_tanggal_jatuh_tempo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (pasar) {
      console.log(pasar);
      setForm({
        pasar_nama: pasar.pasar_nama || "",
        pasar_status: pasar.pasar_status || "",
        pasar_logo: pasar.pasar_logo || undefined,
        pasar_qrcode: (pasar.pasar_qrcode as string) || "",
        // Backend mengirim format YYYY-MM-DD, jadi ini sudah benar
        // Jika backend mengirim MM-DD, kita perlu construct tanggalnya
        pasar_tanggal_jatuh_tempo: pasar.pasar_tanggal_jatuh_tempo // Asumsi backend mengirim YYYY-MM-DD
          ? `${new Date().getFullYear()}-${pasar.pasar_tanggal_jatuh_tempo}`
          : "",
      });
    } else {
      setForm({
        pasar_nama: "",
        pasar_status: "",
        pasar_logo: undefined,
        pasar_qrcode: "",
        pasar_tanggal_jatuh_tempo: "",
      });
    }
  }, [pasar]);

  useEffect(() => {
    if (form.pasar_qrcode && typeof form.pasar_qrcode === "string") {
      QRCode.toDataURL(form.pasar_qrcode)
        .then((url) => setQrPreviewUrl(url))
        .catch((err) => {
          console.error("Failed to generate QR preview:", err);
          setQrPreviewUrl("");
        });
    } else {
      setQrPreviewUrl("");
    }
  }, [form.pasar_qrcode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, pasar_status: value }));
    console.log("Selected status:", value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSave = async () => {
    if (!form.pasar_nama || !form.pasar_status) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("pasar_nama", form.pasar_nama || "");
    formData.append("pasar_status", form.pasar_status || "");
    if (form.pasar_logo instanceof File) {
      formData.append("pasar_logo", form.pasar_logo);
    }
    if (form.pasar_qrcode) {
      formData.append("pasar_qrcode", form.pasar_qrcode as string);
    }
    if (form.pasar_tanggal_jatuh_tempo) {
      formData.append(
        "pasar_tanggal_jatuh_tempo",
        form.pasar_tanggal_jatuh_tempo
      );
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving pasar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {pasar ? "Edit Pasar" : "Add Pasar"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {pasar
              ? "Update pasar details."
              : "Fill in the details to add a new pasar."}
          </p>
        </div>
        <form className="flex flex-col">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Pasar Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Name</Label>
                <Input
                  type="text"
                  name="pasar_nama"
                  value={form.pasar_nama}
                  onChange={handleChange}
                  placeholder="Enter pasar name"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Status</Label>
                <Select
                  options={statusOptions.map((status) => ({
                    value: status.value,
                    label: status.label,
                  }))}
                  placeholder="Select pasar status"
                  value={form.pasar_status}
                  onChange={handleSelectChange}
                  className="dark:bg-dark-900"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Logo</Label>
                <Input
                  type="file"
                  name="pasar_logo"
                  onChange={handleFileChange}
                  placeholder="Upload pasar logo"
                />
                {form.pasar_logo && (
                  <img
                    src={
                      form.pasar_logo instanceof File
                        ? URL.createObjectURL(form.pasar_logo)
                        : form.pasar_logo
                    }
                    alt="Preview"
                    className="mt-2 w-20 h-20 rounded-full object-cover"
                  />
                )}
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>QR Code</Label>
                <Input
                  type="text"
                  name="pasar_qrcode"
                  value={form.pasar_qrcode || ""}
                  onChange={handleChange}
                  placeholder="Enter QR code content"
                />
                {qrPreviewUrl && (
                  <img
                    src={qrPreviewUrl}
                    alt="QR Code Preview"
                    className="mt-2 w-20 h-20 rounded-md object-cover"
                  />
                )}
              </div>

              <div className="col-span-2 lg:col-span-1 relative z-10">
                <Label>Tanggal Jatuh Tempo</Label>
                <DatePicker
                  id="tanggal-jatuh-tempo"
                  label=""
                  placeholder="Pilih tanggal jatuh tempo"
                  defaultDate={
                    form.pasar_tanggal_jatuh_tempo
                      ? new Date(form.pasar_tanggal_jatuh_tempo)
                      : undefined
                  }
                  onChange={(dates) => {
                    if (dates[0]) {
                      const date = new Date(dates[0]);
                      const formattedDate = `${date.getFullYear()}-${(
                        date.getMonth() + 1
                      )
                        .toString()
                        .padStart(2, "0")}-${date
                        .getDate()
                        .toString()
                        .padStart(2, "0")}`;
                      setForm((prev) => ({
                        ...prev,
                        pasar_tanggal_jatuh_tempo: formattedDate,
                      }));
                    } else {
                      // Handle clear date
                      setForm((prev) => ({
                        ...prev,
                        pasar_tanggal_jatuh_tempo: "",
                      }));
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PasarModal;
