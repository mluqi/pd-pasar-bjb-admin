import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
// import DatePicker from "../../components/form/date-picker";
import { useDropdownContext } from "../../context/DropdownContext";
import { useLapakTypeContext } from "../../context/LapakTypeContext";

interface Lapak {
  LAPAK_CODE?: string;
  LAPAK_NAMA: string;
  LAPAK_BLOK: string;
  LAPAK_UKURAN: string;
  LAPAK_TYPE: string;
  LAPAK_PENYEWA?: string | null;
  LAPAK_MULAI?: string | null;
  LAPAK_AKHIR?: string | null;
  LAPAK_STATUS: string | "aktif" | "kosong" | "rusak" | "tutup";
  LAPAK_OWNER?: string;
  LAPAK_HEREGISTRASI?: number | null;
  LAPAK_SIPTU?: number | null;
  LAPAK_BUKTI_FOTO?: string | null;
}

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "kosong", label: "Kosong" },
  { value: "rusak", label: "Rusak" },
  { value: "tutup", label: "Tutup" },
];

interface LapakModalProps {
  isOpen: boolean;
  onClose: () => void;
  lapak: Lapak | null;
  onSave: (data: FormData) => void;
}

const LapakModal: React.FC<LapakModalProps> = ({
  isOpen,
  onClose,
  lapak,
  onSave,
}) => {
  const [form, setForm] = useState<Lapak>({
    LAPAK_NAMA: "",
    LAPAK_BLOK: "",
    LAPAK_UKURAN: "",
    LAPAK_TYPE: "",
    LAPAK_PENYEWA: "",
    LAPAK_MULAI: null,
    LAPAK_AKHIR: null,
    LAPAK_STATUS: "kosong",
    LAPAK_OWNER: "",
    LAPAK_HEREGISTRASI: null,
    LAPAK_SIPTU: null,
  });

  const [buktiFoto, setBuktiFoto] = useState<File | null>(null);
  const [buktiFotoError, setBuktiFotoError] = useState<string | null>(null);
  const [buktiFotoPreview, setBuktiFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (lapak) {
      setForm({
        LAPAK_NAMA: lapak.LAPAK_NAMA || "",
        LAPAK_BLOK: lapak.LAPAK_BLOK || "",
        LAPAK_UKURAN: lapak.LAPAK_UKURAN || "",
        LAPAK_TYPE: lapak.LAPAK_TYPE || "",
        LAPAK_PENYEWA: lapak.LAPAK_PENYEWA || "",
        LAPAK_MULAI: lapak.LAPAK_MULAI || null,
        LAPAK_AKHIR: lapak.LAPAK_AKHIR || null,
        LAPAK_STATUS: lapak.LAPAK_STATUS || "",
        LAPAK_OWNER: lapak.LAPAK_OWNER || "",
        LAPAK_HEREGISTRASI: lapak.LAPAK_HEREGISTRASI || null,
        LAPAK_SIPTU: lapak.LAPAK_SIPTU || null,
      });
    } else {
      setForm({
        LAPAK_NAMA: "",
        LAPAK_BLOK: "",
        LAPAK_UKURAN: "",
        LAPAK_TYPE: "",
        LAPAK_PENYEWA: "",
        LAPAK_MULAI: null,
        LAPAK_AKHIR: null,
        LAPAK_STATUS: "kosong",
        LAPAK_OWNER: "",
        LAPAK_HEREGISTRASI: null,
        LAPAK_SIPTU: null,
      });
      setBuktiFotoPreview(null); // Reset preview when adding new lapak
    }
  }, [lapak]);

  const { pasars, pedagangs, fetchAllPasars, fetchAllPedagangs } =
    useDropdownContext();

  useEffect(() => {
    fetchAllPasars();
    fetchAllPedagangs();
  }, []);

  const { typeLapaks, fetchTypeLapaks } = useLapakTypeContext();

  useEffect(() => {
    fetchTypeLapaks();
  }, []);

  const handleSelectChangeOwner = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_OWNER: value }));
    console.log("Selected value:", value);
  };

  const handleSelectChangeStatus = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_STATUS: value }));
    console.log("Selected value:", value);
  };

  const handleSelectChangePenyewa = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_PENYEWA: value }));
    console.log("Selected value:", value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reset file saat modal dibuka/ditutup
  useEffect(() => {
    setBuktiFoto(null);
    setBuktiFotoError(null);
    setBuktiFotoPreview(null);
  }, [isOpen, lapak]);

  const handleStatusChange = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_STATUS: value }));
    if (value !== "tutup") {
      setBuktiFoto(null);
      setBuktiFotoError(null);
      setBuktiFotoPreview(null);
    }
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
    if (
      !form.LAPAK_NAMA ||
      !form.LAPAK_BLOK ||
      !form.LAPAK_UKURAN ||
      !form.LAPAK_TYPE ||
      !form.LAPAK_STATUS
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (form.LAPAK_STATUS === "tutup" && !buktiFoto && !lapak?.LAPAK_BUKTI_FOTO) { 
      setBuktiFotoError("Bukti foto wajib diunggah jika status tutup.");
      return;
    }


    const formData = new FormData();
    Object.keys(form).forEach(key => {
      const formKey = key as keyof Lapak;
      const value = form[formKey];
      if (value === null) {
        formData.append(formKey, "");
      } else if (value !== undefined) {
        formData.append(formKey, String(value));
      }
    });

    if (buktiFoto) { 
      formData.append("bukti_foto", buktiFoto); 
    } else if (form.LAPAK_STATUS !== "tutup" && lapak?.LAPAK_BUKTI_FOTO) {
      formData.append("LAPAK_BUKTI_FOTO", "");
    }
    onSave(formData);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {lapak ? "Edit Lapak" : "Add Lapak"}
        </h4>
        <form className="flex flex-col gap-4">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              name="LAPAK_NAMA"
              value={form.LAPAK_NAMA}
              onChange={handleChange}
              placeholder="Enter lapak name"
            />
          </div>
          <div>
            <Label>Blok</Label>
            <Input
              type="text"
              name="LAPAK_BLOK"
              value={form.LAPAK_BLOK}
              onChange={handleChange}
              placeholder="Enter blok"
            />
          </div>
          <div>
            <Label>Ukuran</Label>
            <Input
              type="text"
              name="LAPAK_UKURAN"
              value={form.LAPAK_UKURAN}
              onChange={handleChange}
              placeholder="Enter ukuran"
            />
          </div>
          <div>
            <Label>Heregistrasi</Label>
            <Input
              type="number"
              name="LAPAK_HEREGISTRASI"
              value={form.LAPAK_HEREGISTRASI || ""}
              onChange={handleChange}
              placeholder="Enter nominal heregistrasi"
            />
          </div>
          <div>
            <Label>SIPTU</Label>
            <Input
              type="number"
              name="LAPAK_SIPTU"
              value={form.LAPAK_SIPTU || ""}
              onChange={handleChange}
              placeholder="Enter nominal SIPTU"
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              options={[
                { value: "", label: "All Type" },
                ...(typeLapaks || []).map((TypeLapak) => ({
                  name: "LAPAK_TYPE",
                  value: TypeLapak.TYPE_CODE,
                  label: TypeLapak.TYPE_NAMA,
                })),
              ]}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, LAPAK_TYPE: value }));
              }}
              defaultValue=""
              value={form.LAPAK_TYPE}
              placeholder="Select Type"
            />
          </div>
          {lapak && (
            <>
              <div>
                <Label>Penyewa</Label>
                <Select
                  options={(pedagangs || []).map((pedagang) => ({
                    value: pedagang.CUST_CODE,
                    label: pedagang.CUST_NAMA,
                  }))}
                  placeholder="Select penyewa"
                  value={form.LAPAK_PENYEWA || ""}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, LAPAK_PENYEWA: value }))
                  }
                  className="dark:bg-dark-900"
                />
              </div>
              {/* <div>
                <Label>Lapak Mulai</Label>
                <DatePicker
                  id="lapak-mulai"
                  placeholder="Select start date"
                  defaultDate={
                    form.LAPAK_MULAI ? new Date(form.LAPAK_MULAI) : undefined
                  }
                  onChange={(selectedDates) =>
                    setForm((prev) => ({
                      ...prev,
                      LAPAK_MULAI:
                        selectedDates[0]?.toISOString().split("T")[0] || null,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Lapak Akhir</Label>
                <DatePicker
                  id="lapak-akhir"
                  placeholder="Select end date"
                  defaultDate={
                    form.LAPAK_AKHIR ? new Date(form.LAPAK_AKHIR) : undefined
                  }
                  onChange={(selectedDates) =>
                    setForm((prev) => ({
                      ...prev,
                      LAPAK_AKHIR:
                        selectedDates[0]?.toISOString().split("T")[0] || null,
                    }))
                  }
                />
              </div> */}
            </>
          )}
          {pasars.length > 0 && (
            <div>
              <Label>Pasar</Label>
              <Select
                options={[
                  { value: "", label: "All Pasars" },
                  ...(pasars || []).map((pasar) => ({
                    value: pasar.pasar_code,
                    label: pasar.pasar_nama,
                  })),
                ]}
                placeholder="Select Pasar"
                value={form.LAPAK_OWNER}
                onChange={handleSelectChangeOwner}
                className="dark:bg-dark-900"
              />
            </div>
          )}
          {lapak && (
            <div>
              <Label>Status</Label>
              <Select
                options={statusOptions.map((status) => ({
                  value: status.value,
                  label: status.label,
                }))}
                placeholder="Select pasar status"
                value={form.LAPAK_STATUS || "kosong"}
                onChange={handleSelectChangeStatus}
                // Use the modified handleStatusChange for Select component
                // onChange={handleStatusChange}
                className="dark:bg-dark-900"
              />
            </div>
          )}
          {form.LAPAK_STATUS === "tutup" && (
            <div>
              <Label htmlFor="bukti-foto-input">Bukti Foto</Label>
              <div className="mt-1 flex items-center gap-3">
                <label
                  htmlFor="bukti-foto-input"
                  className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {buktiFoto ? buktiFoto.name : "Pilih Foto"}
                </label>
                <input
                  id="bukti-foto-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only" // Hide the default input
                />
                 {(buktiFotoPreview || (lapak?.LAPAK_BUKTI_FOTO && !buktiFoto)) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setBuktiFoto(null); setBuktiFotoPreview(null); if(lapak) lapak.LAPAK_BUKTI_FOTO = null; }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </Button>
                )}
              </div>
              
              {buktiFotoError && (
                <p className="mt-2 text-sm text-red-600">{buktiFotoError}</p>
              )}
              {(buktiFotoPreview || (lapak?.LAPAK_BUKTI_FOTO && !buktiFotoPreview && !buktiFoto)) && (
                <div className="mt-4">
                  <img
                    src={buktiFotoPreview || (lapak?.LAPAK_BUKTI_FOTO ? `${import.meta.env.VITE_SERVER_BASE_URL}/${lapak.LAPAK_BUKTI_FOTO}` : '')}
                    alt="Preview Bukti Foto"
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

export default LapakModal;
