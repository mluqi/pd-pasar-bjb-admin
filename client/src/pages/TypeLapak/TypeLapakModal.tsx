import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

interface TypeLapak {
  TYPE_CODE?: string;
  TYPE_NAMA: string;
}

interface TypeLapakModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeLapak: TypeLapak | null;
  onSave: (data: FormData) => void;
}

const TypeLapakModal: React.FC<TypeLapakModalProps> = ({
  isOpen,
  onClose,
  typeLapak,
  onSave,
}) => {
  const [form, setForm] = useState<TypeLapak>({
    TYPE_NAMA: "",
  });

  useEffect(() => {
    if (typeLapak) {
      setForm({
        TYPE_NAMA: typeLapak.TYPE_NAMA || "",
      });
    } else {
      setForm({
        TYPE_NAMA: "",
      });
    }
  }, [typeLapak]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.TYPE_NAMA) {
      alert("Please fill in the name.");
      return;
    }
    console.log(form)
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {typeLapak ? "Edit Type Lapak" : "Add Type Lapak"}
        </h4>
        <form className="flex flex-col gap-4">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              name="TYPE_NAMA"
              value={form.TYPE_NAMA}
              onChange={handleChange}
              placeholder="Enter type lapak name"
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

export default TypeLapakModal;