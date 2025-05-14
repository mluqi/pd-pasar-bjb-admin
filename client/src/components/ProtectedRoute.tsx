import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  subItems: SubMenuItem[];
}

interface MenuResponse {
  [key: string]: MenuItem[];
}

const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isAuthenticated: boolean = !!localStorage.getItem("token");
  const permissionsLoaded = useRef(false);

  const whitelistedPaths = [
    '/profile',
    '/user-management/reset-password',
    '/pedagang-management/detail/:custCode'
  ];

  useEffect(() => {
    if (!isAuthenticated || !user || permissionsLoaded.current) {
      if (!isAuthenticated) {
        setLoading(false);
      }
      return;
    }

    const fetchMenuPermissions = async () => {
      try {
        // console.log("Fetching menu permissions...");
        const response = await api.get(`/menus/${user.user_level}`);
        const menuData: MenuResponse = response.data;
        
        const paths: string[] = [];
        
        Object.values(menuData).forEach(menuItems => {
          menuItems.forEach(item => {
            if (item.path) {
              paths.push(item.path);
            }
            
            item.subItems.forEach(subItem => {
              if (subItem.path) {
                paths.push(subItem.path);
              }
            });
          });
        });
        
        // console.log("Allowed paths from menu:", paths);
        setAllowedPaths(paths);
        
        const currentPath = location.pathname;
        const authorized = isPathAuthorized(currentPath, paths);
        // console.log(`Path ${currentPath} authorized: ${authorized}`);
        
        setIsAuthorized(authorized);
        permissionsLoaded.current = true;
      } catch (error) {
        // console.error("Failed to fetch menu permissions:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuPermissions();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (allowedPaths.length > 0 || isAuthenticated) {
      const authorized = isPathAuthorized(location.pathname, allowedPaths);
      setIsAuthorized(authorized);
    }
  }, [location.pathname, allowedPaths, isAuthenticated]);

  const isPathAuthorized = (path: string, allowedPaths: string[]): boolean => {
    if (path === '/signin' || path === '/unauthorized') {
      return true;
    }

    if (path === '/' && allowedPaths.includes('/dashboard')) {
      return true;
    }

    for (const whitelistedPath of whitelistedPaths) {
      if (path === whitelistedPath || path.startsWith(whitelistedPath + '/')) {
        return true;
      }
    }

    if (allowedPaths.includes(path)) {
      return true;
    }
    
    return allowedPaths.some(allowedPath => {
      if (!allowedPath) return false;
      
      return path.startsWith(allowedPath);
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading permissions...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!isAuthorized) {
    // console.log(`Not authorized to access ${location.pathname}. Allowed paths:`, allowedPaths);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;