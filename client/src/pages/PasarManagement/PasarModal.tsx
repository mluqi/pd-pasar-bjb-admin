import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

interface Pasar {
  pasar_code?: string;
  pasar_nama: string;
  pasar_status: string;
  pasar_logo?: string | File;
}

interface PasarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pasar: Pasar | null;
  onSave: (data: FormData) => void;
}

const PasarModal: React.FC<PasarModalProps> = ({ isOpen, onClose, pasar, onSave }) => {
  const [form, setForm] = useState<Partial<Pasar>>({
    pasar_nama: "",
    pasar_status: "",
    pasar_logo: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pasar) {
      setForm({
        pasar_nama: pasar.pasar_nama || "",
        pasar_status: pasar.pasar_status || "",
        pasar_logo: undefined,
      });
    } else {
      setForm({
        pasar_nama: "",
        pasar_status: "",
        pasar_logo: undefined,
      });
    }
  }, [pasar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, pasar_status: value }));
    console.log("Selected status:", value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, pasar_logo: e.target.files[0] }));
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
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
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
                    onChange={handleSelectChange}
                    defaultValue={form.pasar_status}
                    options={[
                      { value: "A", label: "Aktif" },
                      { value: "N", label: "Nonaktif" },
                    ]}
                    placeholder="Select pasar status"
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
                  {form.pasar_logo instanceof File && (
                    <img
                      src={URL.createObjectURL(form.pasar_logo)}
                      alt="Preview"
                      className="mt-2 w-20 h-20 rounded-full object-cover"
                    />
                  )}
                </div>
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