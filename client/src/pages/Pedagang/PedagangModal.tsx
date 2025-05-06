import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import { usePasarContext } from "../../context/PasarContext";

interface Pedagang {
  CUST_CODE?: string;
  CUST_NAMA: string;
  CUST_NIK: string;
  CUST_PHONE: string;
  CUST_OWNER: string;
}
interface Pasar {
  pasar_code: string;
  pasar_nama: string;
}

interface PedagangModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedagang: Pedagang | null;
  onSave: (data: Partial<Pedagang>) => void;
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
  });

  useEffect(() => {
    if (pedagang) {
      setForm({
        CUST_NAMA: pedagang.CUST_NAMA || "",
        CUST_NIK: pedagang.CUST_NIK || "",
        CUST_PHONE: pedagang.CUST_PHONE || "",
        CUST_OWNER: pedagang.CUST_OWNER || "",
      });
    } else {
      setForm({
        CUST_NAMA: "",
        CUST_NIK: "",
        CUST_PHONE: "",
        CUST_OWNER: "",
      });
    }
  }, [pedagang]);

  const { pasars, fetchPasars } = usePasarContext();
  const [pasarList, setPasarList] = useState<Pasar[]>([]);

  useEffect(() => {
    if (!pasars.length) {
    fetchPasars();
    }
  }, [pasars, fetchPasars]);
  
  useEffect(() => {
    setPasarList(pasars);
  }, [pasars]);

  const handleSelectChangePasar = (value: string) => {
    setForm((prev) => ({ ...prev, CUST_OWNER: value }));
    console.log("Selected value:", value);
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("Saving form data:", form);
  
    if (
      !form.CUST_NAMA ||
      !form.CUST_NIK ||
      !form.CUST_PHONE ||
      !form.CUST_OWNER
    ) {
      alert("Please fill in all required fields.");
      return;
    }
  
    onSave(form);
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
          <div>
          <Label>Pasar</Label>
          <Select
            options={(pasars || []).map((pasar) => ({
              value: pasar.pasar_code,
              label: pasar.pasar_nama,
            }))}
            placeholder="Select Pasar"
            onChange={handleSelectChangePasar}
            className="dark:bg-dark-900"
          />
        </div>
          </div>
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
