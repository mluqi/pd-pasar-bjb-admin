import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import api from "../../services/api";

const ResetPasswordPage: React.FC = () => {
  const { userCode } = useParams<{ userCode: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword) {
      setErrorMessage("New password is required.");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        user_code: userCode,
        new_password: newPassword,
      });

      setSuccessMessage("Password reset successfully.");
      setTimeout(() => navigate("/user-management"), 2000); // Redirect to user list after success
    } catch (error: any) {
      console.error("Reset Password Error:", error);
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Reset Password
      </h2>
      <form onSubmit={handleResetPassword} className="flex flex-col space-y-4">
        <div>
          <Label>New Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
              )}
            </span>
          </div>
        </div>
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        {successMessage && (
          <p className="text-sm text-green-500">{successMessage}</p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/user-management")}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
