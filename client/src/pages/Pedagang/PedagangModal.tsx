/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import LapakSelector from "./LapakSelector";
import api from "../../services/api";
import { useDropdownContext } from "../../context/DropdownContext";
import { useAuth } from "../../context/AuthContext";

interface Pedagang {
  CUST_CODE: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  CUST_PHONE: string;
  CUST_OWNER: string;
  CUST_IURAN: string;
  CUST_STATUS: string;
  lapaks?: Array<{ LAPAK_CODE: string; LAPAK_NAMA: string }>;
}

interface LapakOption {
  LAPAK_CODE: string;
  LAPAK_NAMA: string;
}

interface PedagangModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedagang: Pedagang | null;
  onSave: (formData: any) => void;
}

export default function PedagangModal({
  isOpen,
  onClose,
  pedagang,
  onSave,
}: PedagangModalProps) {
  const [formData, setFormData] = useState<Partial<Pedagang>>({});
  const [availableLapaks, setAvailableLapaks] = useState<LapakOption[]>([]);
  const [selectedLapaks, setSelectedLapaks] = useState<LapakOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { pasars } = useDropdownContext();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setFormData(pedagang || {});
      setIsLoading(true);

      const loadLapaks = async () => {
        try {
          const pedagangCode = pedagang ? pedagang.CUST_CODE : undefined;
          const url = pedagangCode
            ? `/lapak/all?pedagangCode=${pedagangCode}`
            : "/lapak/all";
          const res = await api.get<LapakOption[]>(url);
          const allPossibleLapaks = res.data;

          const initiallySelected = pedagang?.lapaks || [];
          const initiallySelectedCodes = new Set(
            initiallySelected.map((l) => l.LAPAK_CODE)
          );

          const initiallyAvailable = allPossibleLapaks.filter(
            (l) => !initiallySelectedCodes.has(l.LAPAK_CODE)
          );

          setAvailableLapaks(initiallyAvailable);
          setSelectedLapaks(initiallySelected);
        } catch (error) {
          console.error("Failed to load lapak data for modal", error);
          setAvailableLapaks([]);
          setSelectedLapaks([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadLapaks();
    } else {
      // Clear state on close
      setAvailableLapaks([]);
      setSelectedLapaks([]);
    }
  }, [isOpen, pedagang, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    const finalData = {
      ...formData,
      selectedLapaks: selectedLapaks.map((l) => l.LAPAK_CODE),
    };
    onSave(finalData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">
          {pedagang ? "Edit Pedagang" : "Tambah Pedagang"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input name="CUST_NAMA" value={formData.CUST_NAMA || ""} onChange={handleChange} placeholder="Nama Pedagang" required />
          <Input name="CUST_NIK" value={formData.CUST_NIK || ""} onChange={handleChange} placeholder="NIK" />
          <Input name="CUST_PHONE" value={formData.CUST_PHONE || ""} onChange={handleChange} placeholder="Nomor Telepon" />
          <Input name="CUST_IURAN" value={formData.CUST_IURAN || ""} onChange={handleChange} placeholder="Jumlah Iuran" type="number" required />
          {user?.user_level === "SUA" && (
            <Select
              name="CUST_OWNER"
              value={formData.CUST_OWNER || ""}
              onChange={(value) => handleSelectChange("CUST_OWNER", value)}
              options={(pasars || []).map((p) => ({
                value: p.pasar_code,
                label: p.pasar_nama,
              }))}
              placeholder="Pilih Pasar"
              disabled={user?.user_level !== "SUA"}
            />
          )}
          <Select
            name="CUST_STATUS"
            value={formData.CUST_STATUS || "aktif"}
            onChange={(value) => handleSelectChange("CUST_STATUS", value)}
            options={[
              { value: "aktif", label: "Aktif" },
              { value: "nonaktif", label: "Nonaktif" },
            ]}
            placeholder="Pilih Status"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Pilih Lapak
          </h3>
          {isLoading ? (
            <p className="dark:text-gray-400">Memuat data lapak...</p>
          ) : (
            <LapakSelector
              available={availableLapaks}
              selected={selectedLapaks}
              onAvailableChange={setAvailableLapaks}
              onSelectionChange={setSelectedLapaks}
            />
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            Simpan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

