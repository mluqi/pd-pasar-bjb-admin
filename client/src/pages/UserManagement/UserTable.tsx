import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import UserModal from "./UserModal";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";

import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import { useDropdownContext } from "../../context/DropdownContext";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "A", label: "Active" },
  { value: "N", label: "Nonactive" },
];

const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState(""); // State for search input
  const [statusFilter, setStatusFilter] = useState(""); // State for status filter
  const [pasar, setPasar] = useState(""); // State for owner filter
  const [page, setPage] = useState(1); // State for pagination
  const [limit, setLimit] = useState(10); // State for limit
  const [totalPages, setTotalPages] = useState(1); // Total pages from API

  const fetchUsersData = async () => {
    try {
      const response = await fetchUsers(page, limit, search, statusFilter, pasar);
      setTotalPages(response.totalPages); // Update total pages
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const { pasars, fetchAllPasars } = useDropdownContext();

  useEffect(() => {
    fetchAllPasars();
}, []);

  useEffect(() => {
    fetchUsersData();
  }, [page, limit, search, statusFilter, pasar]);

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
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
          <Select
            options={limitOptions}
            onChange={(value) => {
              setLimit(Number(value));
              setPage(1); // Reset to first page
            }}
            defaultValue={limit.toString()}
            className="w-full sm:w-auto"
          />
          <Input
            type="text"
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded w-full sm:w-auto"
          />
          <Select
            options={statusOptions}
            onChange={(value) => setStatusFilter(value)}
            defaultValue=""
            placeholder="All Status"
            className="w-full sm:w-auto"
          />
          <Select
            options={[
              { value: "", label: "All Pasars" },
              ...(pasars || []).map((pasar) => ({
                value: pasar.pasar_code,
                label: pasar.pasar_nama,
              })),
            ]}
            placeholder="All Pasars"
            onChange={(value) => setPasar(value)}
            defaultValue=""
            className="w-full sm:w-auto"
          />
        </div>
        <Button
          onClick={openAddModal}
          className="w-full sm:w-auto"
        >
          Add User
        </Button>
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
                  {user.pasar?.pasar_nama || "Unknown"}
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
                    {user.user_status === "A"
                      ? "Active"
                      : user.user_status === "N"
                      ? "Nonactive"
                      : "Unknown"}
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

      <div className="flex justify-between items-center p-4">
        <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </Button>
        <span className="text-gray-700 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </Button>
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
