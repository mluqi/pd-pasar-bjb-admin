import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import { useDropdownContext } from "../../context/DropdownContext";

interface Iuran {
  IURAN_CODE?: string;
  IURAN_PEDAGANG: string;
  IURAN_TANGGAL: string;
  IURAN_JUMLAH: string;
  IURAN_STATUS: string;
  IURAN_METODE_BAYAR: string;
  IURAN_WAKTU_BAYAR: string;
  IURAN_BUKTI_FOTO?: string | null;
}

const metodeBayarOptions = [
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "Qris" },
];

const statusOptions = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "tidak berjualan", label: "Tidak Berjualan" },
  { value: "tidak bayar", label: "Tidak Bayar" }
]

interface IuranModalProps {
  isOpen: boolean;
  onClose: () => void;
  iuran: Iuran | null;
  onSave: (data: FormData) => void;
}

const IuranModal: React.FC<IuranModalProps> = ({
  isOpen,
  onClose,
  iuran,
  onSave,
}) => {
  const [form, setForm] = useState<Iuran>({
    IURAN_PEDAGANG: "",
    IURAN_TANGGAL: "",
    IURAN_JUMLAH: "",
    IURAN_STATUS: "Pending",
    IURAN_METODE_BAYAR: "",
    IURAN_WAKTU_BAYAR: null,
  });
  
  const [buktiFoto, setBuktiFoto] = useState<File | null>(null);
  const [buktiFotoError, setBuktiFotoError] = useState<string | null>(null);
  const [buktiFotoPreview, setBuktiFotoPreview] = useState<string | null>(null);

  const { pedagangs, fetchAllPedagangs } = useDropdownContext();

  useEffect(() => {
    if (iuran) {
      setForm({
        IURAN_PEDAGANG: iuran.IURAN_PEDAGANG || "",
        IURAN_TANGGAL: iuran.IURAN_TANGGAL || "",
        IURAN_JUMLAH: iuran.IURAN_JUMLAH || "",
        IURAN_STATUS: iuran.IURAN_STATUS || "Pending",
        IURAN_METODE_BAYAR: iuran.IURAN_METODE_BAYAR || "",
        IURAN_WAKTU_BAYAR: iuran.IURAN_WAKTU_BAYAR || null,
        IURAN_BUKTI_FOTO: iuran.IURAN_BUKTI_FOTO || null,
      });
      setBuktiFoto(null);

      setBuktiFotoPreview(null);
      setBuktiFotoError(null);
    } else {
      setForm({
        IURAN_PEDAGANG: "",
        IURAN_TANGGAL: "",
        IURAN_JUMLAH: "",
        IURAN_STATUS: "pending", 
        IURAN_METODE_BAYAR: "",
        IURAN_WAKTU_BAYAR: null,
        IURAN_BUKTI_FOTO: null,
      });
      setBuktiFoto(null);
      setBuktiFotoPreview(null);
      setBuktiFotoError(null);
    }
  }, [iuran]);

  useEffect(() => {
    fetchAllPedagangs("aktif");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "IURAN_STATUS" && value !== "tidak berjualan") {
        newState.IURAN_BUKTI_FOTO = null; 
        setBuktiFoto(null);
        setBuktiFotoPreview(null);
        setBuktiFotoError(null);
      }
      return newState;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBuktiFoto(file);
      setBuktiFotoError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBuktiFoto(null);
      setBuktiFotoPreview(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.IURAN_STATUS === "tidak berjualan" && !buktiFoto && !form.IURAN_BUKTI_FOTO) {
      setBuktiFotoError("Bukti foto wajib diunggah jika status tidak berjualan.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      const formKey = key as keyof Iuran;
      const value = form[formKey];
      if (value === null) formData.append(formKey, "");
      else if (value !== undefined) formData.append(formKey, String(value));
    });

    if (buktiFoto) {
      formData.append("bukti_foto_iuran", buktiFoto);
    }
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {iuran ? "Edit Iuran" : "Add Iuran"}
        </h4>
        <form className="flex flex-col gap-4">
          <div>
            <Label>Pedagang</Label>
            <Select
              options={[
                { value: "", label: "All Pedagang" },
                ...(pedagangs || []).map((pedagang) => ({
                  value: pedagang.CUST_CODE,
                  label: pedagang.CUST_NAMA,
                })),
              ]}
              value={form.IURAN_PEDAGANG || ""}
              placeholder="Select Pedagang"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, IURAN_PEDAGANG: value }))
              }
            />
          </div>
          <div>
            <DatePicker
              id="tanggal"
              label="Tanggal"
              placeholder="Select a date"
              defaultDate={
                form.IURAN_TANGGAL ? new Date(form.IURAN_TANGGAL) : undefined
              } // Set default date
              onChange={(dates) => {
                const date = new Date(dates[0]);
                // Format to YYYY-MM-DD in local timezone to avoid timezone shift
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                setForm((prev) => ({ ...prev, IURAN_TANGGAL: formattedDate }));
                console.log("Selected date:", formattedDate);
              }}
            />
          </div>
          <div>
            <Label>Jumlah</Label>
            <Input
              type="text"
              name="IURAN_JUMLAH"
              value={form.IURAN_JUMLAH}
              onChange={handleChange}
              placeholder="Enter jumlah"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
              placeholder="Select Status"
              value={form.IURAN_STATUS}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, IURAN_STATUS: value }))
              }
            />
          </div>
          <div>
            <Label>Metode Bayar</Label>
            <Select
              options={metodeBayarOptions.map((metode) => ({
                value: metode.value,
                label: metode.label,
              }))}
              placeholder="Select Metode Bayar"
              value={form.IURAN_METODE_BAYAR}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, IURAN_METODE_BAYAR: value }))
              }
            />
          </div>
          <div>
            <DatePicker
              id="waktu-bayar"
              label="Waktu Bayar"
              placeholder="Select a date"
              defaultDate={
                form.IURAN_WAKTU_BAYAR
                  ? new Date(form.IURAN_WAKTU_BAYAR)
                  : undefined
              }
              onChange={(dates) => {
                const formattedDate = new Date(dates[0]).toISOString();
                setForm((prev) => ({
                  ...prev,
                  IURAN_WAKTU_BAYAR: formattedDate,
                }));
              }}
            />
          </div>
          {form.IURAN_STATUS === "tidak berjualan" && (
            <div>
              <Label htmlFor="bukti-foto-iuran-input">Bukti Foto</Label>
              <div className="mt-1 flex items-center gap-3">
                <label
                  htmlFor="bukti-foto-iuran-input"
                  className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {buktiFoto ? buktiFoto.name : "Pilih Foto"}
                </label>
                <input
                  id="bukti-foto-iuran-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {(buktiFotoPreview || (form.IURAN_BUKTI_FOTO && !buktiFoto)) && (
                  <Button type="button" variant="outline" size="sm" onClick={() => { setBuktiFoto(null); setBuktiFotoPreview(null); setForm(prev => ({...prev, IURAN_BUKTI_FOTO: null})); }} className="text-red-500 hover:text-red-700">
                    Hapus
                  </Button>
                )}
              </div>
              {buktiFotoError && (
                <p className="mt-2 text-sm text-red-600">{buktiFotoError}</p>
              )}
              {(buktiFotoPreview || (form.IURAN_BUKTI_FOTO && !buktiFotoPreview && !buktiFoto)) && (
                <div className="mt-4">
                  <img
                    src={buktiFotoPreview || (form.IURAN_BUKTI_FOTO ? `${import.meta.env.VITE_SERVER_BASE_URL}/${form.IURAN_BUKTI_FOTO}` : '')}
                    alt="Preview Bukti Foto Iuran"
                    className="h-auto max-h-48 w-full rounded-md border object-contain dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default IuranModal;
