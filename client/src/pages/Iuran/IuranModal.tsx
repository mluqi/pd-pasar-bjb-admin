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
}

const metodeBayarOptions = [
  { value: "cash", label: "Cash" },
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
      });
    }
  }, [iuran]);

  useEffect(() => {
    fetchAllPedagangs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
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
                const formattedDate = new Date(dates[0])
                  .toISOString()
                  .split("T")[0];
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
