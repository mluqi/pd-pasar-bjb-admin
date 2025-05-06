import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';

const BASE_URL = "http://localhost:3000/uploads/";
import api from "../../services/api";
import FileInput from "../form/input/FileInput";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        user_name: user.user_name || "",
        user_email: user.user_email || "",
        user_phone: user.user_phone || "",
      });
    }
  }, [user]);
  
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log(
        "Selected file:",
        file.name,
        "Type:",
        file.type,
        "Size:",
        file.size
      );
      setNewPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setUpdateMessage("");

    try {
      if (!form.user_name || !form.user_email || !form.user_phone) {
        alert("All fields are required!");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("user_name", form.user_name);
      formData.append("user_email", form.user_email);
      formData.append("user_phone", form.user_phone);

      if (newPhoto) {
        console.log("Appending file to FormData:", newPhoto.name);
        formData.append("user_foto", newPhoto);
      }

      const response = await api.put(`/auth/profile`, formData);

      console.log("Profile update response:", response.data);

      const profileResponse = await api.get(`/auth/profile`);
      const updatedUser = profileResponse.data;
      updatedUser.user_foto = updatedUser.user_foto
        ? `${BASE_URL}${updatedUser.user_foto}`
        : null;

      setNewPhoto(null);
      setPreviewPhoto(null);
      setUpdateMessage("Profile updated successfully!");
      
      await refreshUser();
      
      closeModal();
    } catch (error) {
      console.error("Error saving changes:", error);

      if (error.response) {
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("Request error - no response received");
      } else {
        console.error("Error message:", error.message);
      }

      setUpdateMessage(`Update failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 animate-pulse">
        <p className="text-center text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.user_name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.user_email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.user_phone}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
            {updateMessage && (
              <p
                className={`text-sm font-medium ${
                  updateMessage.includes("failed")
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {updateMessage}
              </p>
            )}
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Profile Photo</Label>
                    <FileInput
                      onChange={handlePhotoChange}
                      className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                    <div className="mt-2">
                      {previewPhoto ? (
                        <img
                          src={previewPhoto}
                          alt="New Profile Preview"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : user.user_foto ? (
                        <img
                          src={user.user_foto}
                          alt="Current Profile"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">
                          No photo available
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      id="user_name"
                      name="user_name"
                      type="text"
                      onChange={handleChange}
                      value={form.user_name}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      id="user_email"
                      name="user_email"
                      type="text"
                      onChange={handleChange}
                      value={form.user_email}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input
                      id="user_phone"
                      name="user_phone"
                      type="text"
                      onChange={handleChange}
                      value={form.user_phone}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                disabled={isLoading}
              >
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
