import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import api from "../services/api";

const BASE_URL = "http://127.0.0.1:3001/uploads/";

interface UserProfile {
  user_id: string;
  user_name: string;
  user_email: string;
  user_level: string;
  user_phone: string;
  user_foto: string | null;
  user_owner: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  logout: () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = () => {
    console.log("Logging out user...");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    // Show logout notification if needed
    // You can add a toast notification here
    console.log("User logged out");
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/auth/profile");
      const data: UserProfile = response.data;
      data.user_foto = data.user_foto ? `${BASE_URL}${data.user_foto}` : null;
      setUser(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error fetching profile in AuthProvider:", err);

      // Handle specific error cases
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token expired or invalid, or user logged in elsewhere
        logout();
        setError(
          "Sesi Anda telah berakhir atau Anda telah login di perangkat lain. Silakan login kembali."
        );
      } else {
        setError(err.message || "Gagal mengambil data profil.");
        // Don't logout for other errors, might be network issue
        setIsAuthenticated(checkAuthStatus());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk memuat ulang data pengguna
  const refreshUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/auth/profile");
      const data: UserProfile = response.data;
      data.user_foto = data.user_foto ? `${BASE_URL}${data.user_foto}` : null;
      setUser(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error refreshing user in AuthProvider:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        setError(
          "Sesi Anda telah berakhir atau Anda telah login di perangkat lain. Silakan login kembali."
        );
      }
    }
  };

  useEffect(() => {
    // Check initial auth status
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
