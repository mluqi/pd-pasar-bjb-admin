import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import api from "../../services/api";

export default function UserMetaCard() {
  const { user, isLoading, error } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const openChangePasswordModal = () => setIsChangePasswordModalOpen(true);
  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setForm({ old_password: "", new_password: "", confirm_password: "" });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (form.new_password !== form.confirm_password) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await api.post("/auth/change-password", {
        old_password: form.old_password,
        new_password: form.new_password,
      });

      setSuccessMessage("Password changed successfully.");
      closeChangePasswordModal();
    } catch (error: any) {
      console.error("Change Password Error:", error);
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-[150px] h-[44px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
    );
  }

  if (error || !user) {
    return <div className="relative text-red-500">Error</div>;
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src={user.user_foto ?? "/images/user/avatar.png"} />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.user_name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.user_level}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.user_email}
                </p>
              </div>
            </div>
          </div>
          <button
          onClick={openChangePasswordModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Change Password
        </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={closeChangePasswordModal}
        className="max-w-[500px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your password to keep your account secure.
            </p>
          </div>
          <form onSubmit={handleChangePassword} className="flex flex-col">
            <div className="custom-scrollbar h-[300px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  <div>
                    <Label>Old Password</Label>
                    <Input
                      type="password"
                      name="old_password"
                      value={form.old_password}
                      onChange={handleChange}
                      placeholder="Enter old password"
                    />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      name="new_password"
                      value={form.new_password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="mt-3 text-sm text-green-500">{successMessage}</p>
            )}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeChangePasswordModal}>
                Close
              </Button>
              <Button size="sm" type="submit">
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}