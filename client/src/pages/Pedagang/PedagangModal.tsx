import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import { useDropdownContext } from "../../context/DropdownContext";
// import { useLapakContext } from "../../context/LapakContext";
import MultiSelect from "../../components/form/MultiSelect";

interface Pedagang {
  CUST_CODE?: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  CUST_PHONE: string;
  CUST_OWNER: string;
  CUST_IURAN: string;
  CUST_STATUS: string;
  lapaks?: Array<{
    LAPAK_CODE: string;
    LAPAK_NAMA: string;
    LAPAK_MULAI?: string | null;
    LAPAK_AKHIR?: string | null;
    LAPAK_OWNER: string;
    pasar?: {
      pasar_code: string;
      pasar_nama: string;
    };
  }>;
}

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

interface PedagangModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedagang: Pedagang | null;
  onSave: (data: any) => void;
}

const PedagangModal: React.FC<PedagangModalProps> = ({
  isOpen,
  onClose,
  pedagang,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<Pedagang>>({
    CUST_NAMA: "",
    CUST_NIK: "",
    CUST_PHONE: "",
    CUST_OWNER: "",
    CUST_IURAN: "",
    CUST_STATUS: "aktif", // Default for new pedagang
  });

  useEffect(() => {
    if (pedagang) {
      setForm({
        CUST_NAMA: pedagang.CUST_NAMA || "",
        CUST_NIK: pedagang.CUST_NIK || "",
        CUST_PHONE: pedagang.CUST_PHONE || "",
        CUST_OWNER: pedagang.CUST_OWNER || "",
        CUST_IURAN: pedagang.CUST_IURAN || "",
        CUST_STATUS: pedagang.CUST_STATUS || "",
      });
      setSelectedLapaks(
        pedagang.lapaks?.map((lapak) => lapak.LAPAK_CODE) || []
      );
      setLapakMulai(
        pedagang.lapaks && pedagang.lapaks.length > 0
          ? pedagang.lapaks[0].LAPAK_MULAI || null
          : null
      );
      setLapakAkhir(
        pedagang.lapaks && pedagang.lapaks.length > 0
          ? pedagang.lapaks[0].LAPAK_AKHIR || null
          : null
      );
    } else {
      setForm({
        CUST_NAMA: "",
        CUST_NIK: "",
        CUST_PHONE: "",
        CUST_OWNER: "",
        CUST_IURAN: "",
        CUST_STATUS: "aktif",
      });
      setSelectedLapaks([]);
      setLapakMulai(null);
      setLapakAkhir(null);
    }
  }, [pedagang]);

  const [selectedLapaks, setSelectedLapaks] = useState<string[]>([]);
  const [lapakMulai, setLapakMulai] = useState<string | null>(null);
  const [lapakAkhir, setLapakAkhir] = useState<string | null>(null);

  const { lapaks, pasars, fetchAllLapaks, fetchAllPasars } =
    useDropdownContext();
  // const { lapaks, fetchLapaks } = useLapakContext();

  // useEffect(() => {
  //   fetchAllPasars();
  //   fetchAllLapaks();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // Initial fetch, will be overridden by below useEffect when modal opens

  useEffect(() => {
    if (isOpen) {
      fetchAllPasars(); // Anda mungkin ingin memanggil ini lebih jarang jika daftar pasar tidak sering berubah
      const currentPedagangCode = pedagang ? pedagang.CUST_CODE : undefined;
      fetchAllLapaks(currentPedagangCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pedagang]); 

  // const handleSelectChangeLapak = (value: string) => {
  //   setSelectedLapak(value);
  // };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, CUST_STATUS: value }));
  };

  const handleSelectChangePasar = (value: string) => {
    console.log("Selected pasar:", value);
    setForm((prev) => ({ ...prev, CUST_OWNER: value }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.CUST_NAMA ||
      !form.CUST_NIK ||
      !form.CUST_PHONE ||
      !form.CUST_IURAN ||
      selectedLapaks.length === 0 ||
      !lapakMulai ||
      !lapakAkhir
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave({
      ...form,
      selectedLapaks,
      lapakMulai,
      lapakAkhir,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
          {pedagang ? "Edit Pedagang" : "Add Pedagang"}
        </h4>
        <form className="flex flex-col space-y-4" onSubmit={handleSave}>
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              name="CUST_NAMA"
              value={form.CUST_NAMA}
              onChange={handleChange}
              placeholder="Enter pedagang name"
            />
          </div>
          <div>
            <Label>NIK</Label>
            <Input
              type="text"
              name="CUST_NIK"
              value={form.CUST_NIK}
              onChange={handleChange}
              placeholder="Enter pedagang email"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              name="CUST_PHONE"
              value={form.CUST_PHONE}
              onChange={handleChange}
              placeholder="Enter pedagang phone"
            />
          </div>
          <div>
            <Label>Jumlah Iuran</Label>
            <Input
              type="text"
              name="CUST_IURAN"
              value={form.CUST_IURAN}
              onChange={handleChange}
              placeholder="Enter Iuran"
            />
          </div>
          {pedagang && (
            <div>
              <Label>Status</Label>
              <Select
                options={statusOptions.map((status) => ({
                  value: status.value,
                  label: status.label,
                }))}
                placeholder="Select pasar status"
                value={form.CUST_STATUS || "aktif"} // Default to "aktif" if not set
                onChange={handleSelectChange}
                className="dark:bg-dark-900"
              />
            </div>
          )}
          <div>
            <MultiSelect
              label="Select Lapaks"
              options={(lapaks || []).map((lapak) => ({
                value: lapak.LAPAK_CODE,
                text: `${lapak.LAPAK_NAMA} - ${lapak.LAPAK_OWNER_NAME}`,
              }))}
              defaultSelected={selectedLapaks}
              onChange={(selected) => setSelectedLapaks(selected)}
            />
          </div>
          <div>
            <Label>Lapak Mulai</Label>
            <DatePicker
              id="lapak-mulai"
              placeholder="Select start date"
              defaultDate={lapakMulai ? new Date(lapakMulai) : undefined} // Set default date
              onChange={(selectedDates) =>
                setLapakMulai(
                  selectedDates[0]?.toISOString().split("T")[0] || null
                )
              }
            />
          </div>
          <div>
            <Label>Lapak Akhir</Label>
            <DatePicker
              id="lapak-akhir"
              placeholder="Select end date"
              defaultDate={lapakAkhir ? new Date(lapakAkhir) : undefined} // Set default date
              onChange={(selectedDates) =>
                setLapakAkhir(
                  selectedDates[0]?.toISOString().split("T")[0] || null
                )
              }
            />
          </div>
          {pasars.length > 0 && (
            <div>
              <Label>Pasar</Label>
              <Select
                options={[
                  { value: "", label: "All Pasars" },
                  ...pasars.map((pasar) => ({
                    value: pasar.pasar_code,
                    label: pasar.pasar_nama,
                  })),
                ]}
                placeholder="Select Pasar"
                value={form.CUST_OWNER}
                onChange={handleSelectChangePasar}
                className="dark:bg-dark-900"
              />
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PedagangModal;
