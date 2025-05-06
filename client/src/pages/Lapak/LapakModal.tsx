import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import { usePedagangContext } from "../../context/PedagangContext";
import { usePasarContext } from "../../context/PasarContext";

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

interface Pedagang {
    CUST_CODE: string;
    CUST_NAMA: string;
}

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
}

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
        LAPAK_STATUS: lapak.LAPAK_STATUS || "kosong",
        LAPAK_OWNER: lapak.LAPAK_OWNER || "",
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

  const { fetchPasars, pasars, } = usePasarContext();
  const [ pasarList, setPasarList] = useState<Pasar[]>([]);

  useEffect(() => {
    fetchPasars();
  }, []);
  
  useEffect(() => {
    console.log("Pasars:", pasars); 
    setPasarList(pasars);
  }, [pasars]);
  
  const handleSelectChangeOwner = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_OWNER: value }));
    console.log("Selected value:", value);
  }

  const handleSelectChangeStatus = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_STATUS: value }));
    console.log("Selected value:", value);
  };
  const handleSelectChangePenyewa = (value: string) => {
    setForm((prev) => ({ ...prev, LAPAK_PENYEWA: value }));
    console.log("Selected value:", value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    const { pedagangs, fetchPedagangs } = usePedagangContext();
    const [pedagangList, setPedagangList] = useState<Pedagang[]>([]);
    useEffect(() => {
        if (!pedagangs.length) {
          fetchPedagangs(); 
        }
      }, [pedagangs, fetchPedagangs]);
    useEffect(() => {
        setPedagangList(pedagangs);
      }, [pedagangs]);

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
            <Input
              type="text"
              name="LAPAK_TYPE"
              value={form.LAPAK_TYPE}
              onChange={handleChange}
              placeholder="Enter type"
            />
          </div>
            <div>
                <Label>Penyewa</Label>
                <Select
                options={(pedagangList || []).map((pedagang) => ({
                    value: pedagang.CUST_CODE,
                    label: pedagang.CUST_NAMA,
                }))}
                placeholder="Select Penyewa"
                onChange={handleSelectChangePenyewa}
                className="dark:bg-dark-900"
                />
            </div>
        <div>
          <DatePicker
            id="start-date"
            label="Mulai"
            placeholder="Select a date"
            onChange={(dates, currentDateString) => {
              const startDate = new Date(dates[0]);
              const formattedDate = startDate.toISOString().split("T")[0];
              setForm((prev) => ({ ...prev, LAPAK_MULAI: formattedDate }));
              console.log({ dates, currentDateString });
            }}
          />
        </div>
        <div>
          <DatePicker
            id="end-date"
            label="Akhir"
            placeholder="Select a date"
            onChange={(dates, currentDateString) => {
                const startDate = new Date(dates[0]);
                const formattedDate = startDate.toISOString().split("T")[0];
                setForm((prev) => ({ ...prev, LAPAK_AKHIR: formattedDate }));
              console.log({ dates, currentDateString });
            }}
          />
        </div>
        <div>
          <Label>Pasar</Label>
          <Select
            options={(pasarList || []).map((pasar) => ({
              value: pasar.pasar_code,
              label: pasar.pasar_nama,
            }))}
            placeholder="Select Pasar"
            onChange={handleSelectChangeOwner}
            className="dark:bg-dark-900"
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            options={[
              { value: "aktif", label: "Aktif" },
              { value: "kosong", label: "Kosong" },
              { value: "rusak", label: "Rusak" },
            ]}
            placeholder="Select Option"
            onChange={handleSelectChangeStatus}
            className="dark:bg-dark-900"
          />
        </div>
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