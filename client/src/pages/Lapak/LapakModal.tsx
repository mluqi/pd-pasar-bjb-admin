import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
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
  LAPAK_STATUS: string | "aktif" | "kosong" | "rusak";
  LAPAK_OWNER?: string;
}

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "kosong", label: "Kosong" },
  { value: "rusak", label: "Rusak" },
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
  });

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
      });
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

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Form data:", form);
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

    onSave(form);
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
              <div>
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
              </div>
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
                className="dark:bg-dark-900"
              />
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
