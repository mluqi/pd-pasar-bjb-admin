import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useUserContext } from "../../context/UserContext";
import UserModal from "./UserModal";
import Badge from "../../components/ui/badge/Badge";
import api from "../../services/api";
import { useEffect, useState } from "react";

interface User {
  user_code: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  user_level: string;
  user_foto: string;
  user_owner: string;
  user_status: string;
}
export default function UserTable() {
  const { users, fetchUsers, addUser, editUser, deleteUser } = useUserContext();
  // const [users, setUsers] = useState<User[]>([]);
  const [pasars, setPasars] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPasars = async () => {
      try {
        const res = await api.get("/pasar");
        setPasars(res.data);
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      }
    };
    fetchPasars();
  }, []);

  const getMarketName = (pasar_code: string) => {
    const pasar = pasars.find((m) => m.pasar_code === pasar_code);
    return pasar ? pasar.pasar_nama : "Unknown";
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (formData: FormData) => {
    try {
      if (selectedUser) {
        await editUser(selectedUser.user_code, formData);
      } else {
        await addUser(formData);
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save user.");
      console.error("Failed to save user:", error);
    }
  };

  const handleDeleteUser = async (user_code: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    await deleteUser(user_code);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add User
        </button>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {[
                "Code",
                "Name",
                "Phone",
                "Email",
                "Level",
                "Photo",
                "Owner",
                "Status",
                "Actions",
              ].map((title) => (
                <TableCell
                  key={title}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {title}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => (
              <TableRow key={user.user_code}>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {user.user_code}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {user.user_name}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {user.user_phone}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {user.user_email}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {user.user_level}
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-white dark:border-gray-800">
                    <img
                      src={user.user_foto || "/images/user/avatar.png"}
                      alt={user.user_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/90">
                  {getMarketName(user.user_owner)}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <Badge
                    size="sm"
                    color={
                      user.user_status === "A"
                        ? "success"
                        : user.user_status === "N"
                        ? "warning"
                        : "error"
                    }
                  >
                    {user.user_status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.user_code)}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserModal
        isOpen={isEditModalOpen || isAddModalOpen}
        onClose={closeModal}
        user={isEditModalOpen ? selectedUser : null}
        onSave={handleSaveUser}
      />
    </div>
  );
}
