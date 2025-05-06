import React, { useState, useEffect, use } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
// import api from "../../services/api";
import { usePasarContext } from "../../context/PasarContext";
import { useLevelContext } from "../../context/LevelContext";

interface User {
  user_code?: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  user_level: string;
  user_foto?: string | File;
  user_owner?: string;
  user_status?: string;
  pasar_code?: string;
  user_pass?: string;
}

interface Pasar {
  pasar_code: string;
  pasar_nama: string;
}

interface Level {
  level_code: string;
  level_name: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (data: Partial<User>) => void;
}
const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<User>>({
    user_name: "",
    user_phone: "",
    user_email: "",
    user_level: "",
    user_status: "",
    pasar_code: "",
    user_foto: undefined,
    user_pass: "",
  });
  const { pasars, fetchPasars } = usePasarContext();
  const { levels, fetchLevels } = useLevelContext();
  const [isLoading, setIsLoading] = useState(false);

  const [pasarList, setPasarList] = useState<Pasar[]>([]);
  const [ levelList, setLevelList ] = useState<Level[]>([]);

    useEffect(() => {
        if (!pasars.length) {
          fetchPasars(); 
        }
      }, [pasars, fetchPasars]);
      
    useEffect(() => {
        setPasarList(pasars);
      }, [pasars]);

    useEffect(() => {
        if (!levels.length) {
          fetchLevels(); 
        }
      }
      , [levels, fetchLevels]);
      
    useEffect(() => {
        setLevelList(levels);
      }, [levels]);

  useEffect(() => {
    if (user) {
      setForm({
        user_name: user.user_name || "",
        user_phone: user.user_phone || "",
        user_email: user.user_email || "",
        user_level: user.user_level || "",
        user_status: user.user_status || "",
        pasar_code: user.pasar_code || "",
        user_foto: undefined,
        user_pass: "",
      });
    } else {
      setForm({
        user_name: "",
        user_phone: "",
        user_email: "",
        user_level: "",
        user_status: "",
        pasar_code: "",
        user_foto: undefined,
        user_pass: "",
      });
    }
  }, [user]);

  const handleSelectChangePasar = (value: string) => {
    setForm((prev) => ({ ...prev, pasar_code: value }));
    console.log("Selected value:", value);
  }

  const handleSelectChangeLevel = (value: string) => {
    setForm((prev) => ({ ...prev, user_level: value }));
    console.log("Selected value:", value);
  };

  const handleSelectChangeStatus = (value: string) => {
    setForm((prev) => ({ ...prev, user_status: value }));
    console.log("Selected value:", value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, user_foto: e.target.files[0] }));
    }
  };

  const handleSave = async () => {
    if (
      !form.user_name ||
      !form.user_email ||
      !form.user_phone ||
      !form.user_level ||
      !form.user_status
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!user && !form.user_pass) {
      alert("Password is required for new users.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("user_name", form.user_name);
    formData.append("user_pass", form.user_pass || "");
    formData.append("user_email", form.user_email);
    formData.append("user_phone", form.user_phone);
    formData.append("user_status", form.user_status);

    const selectedLevel = levelList.find(
      (level) => level.level_code === form.user_level
    );

    if (selectedLevel) {
      formData.append("user_level_name", selectedLevel.level_name);
    }

    if (form.pasar_code) {
      formData.append("pasar_code", form.pasar_code);
    }

    if (form.user_foto instanceof File) {
      formData.append("user_foto", form.user_foto);
    }

    try {
      console.log("Form data:", formData);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {user ? "Edit User" : "Add User"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {user
              ? "Update user details."
              : "Fill in the details to add a new user."}
          </p>
        </div>
        <form className="flex flex-col">
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="mt-7">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                User Information
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="user_name"
                    value={form.user_name}
                    onChange={handleChange}
                    placeholder="Enter user name"
                  />
                </div>
                {!user && (
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      name="user_pass"
                      value={form.user_pass || ""}
                      onChange={handleChange}
                      placeholder="Enter user password"
                    />
                  </div>
                )}
                <div className="col-span-2 lg:col-span-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="user_email"
                    value={form.user_email}
                    onChange={handleChange}
                    placeholder="Enter user email"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    name="user_phone"
                    value={form.user_phone}
                    onChange={handleChange}
                    placeholder="Enter user phone"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Role Type</Label>
                  <Select
                    options={(levels || []).map((level) => ({
                      value: level.level_code,
                      label: level.level_name,
                    }))}
                    placeholder="Select Role Type"
                    onChange={handleSelectChangeLevel}
                    className="dark:bg-dark-900"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
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

                <div className="col-span-2 lg:col-span-1">
                  <Label>Status</Label>
                  <Select
                    options={[
                      { value: "A", label: "Aktif" },
                      { value: "N", label: "Nonaktif" },
                    ]}
                    placeholder="Select Status"
                    onChange={handleSelectChangeStatus}
                    className="dark:bg-dark-900"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Photo</Label>
                  <Input
                    type="file"
                    name="user_foto"
                    onChange={handleFileChange}
                    placeholder="Upload user photo"
                  />
                  {form.user_foto instanceof File && (
                    <img
                      src={URL.createObjectURL(form.user_foto)}
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

export default UserModal;
