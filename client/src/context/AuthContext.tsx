import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import api from "../services/api";

const BASE_URL = "http://localhost:3000/uploads/";

interface UserProfile {
  user_id: string;
  user_name: string;
  user_email: string;
  user_level: string;
  user_phone: string;
  user_foto: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/auth/profile');
      const data: UserProfile = response.data;
      data.user_foto = data.user_foto ? `${BASE_URL}${data.user_foto}` : null;
      setUser(data);
    } catch (err) {
      console.error("Error fetching profile in AuthProvider:", err);
      setError(err.message || 'Gagal mengambil data profil.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk memuat ulang data pengguna
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      const data: UserProfile = response.data;
      data.user_foto = data.user_foto ? `${BASE_URL}${data.user_foto}` : null;
      setUser(data);
    } catch (err) {
      console.error("Error refreshing user in AuthProvider:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refreshUser }}>
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
