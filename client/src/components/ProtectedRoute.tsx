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
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const location = useLocation();
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const permissionsLoaded = useRef(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const whitelistedPaths = [
    '/profile',
    '/user-management/reset-password',
    '/pedagang-management/detail/:custCode',
    '/lapak-management/qrcode/:lapakCode'
  ];

  // Reset states when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      setAllowedPaths([]);
      setIsAuthorized(false);
      setFetchAttempted(false);
      permissionsLoaded.current = false;
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // If still loading authentication, wait
    if (authLoading) {
      setLoading(true);
      return;
    }

    // If not authenticated, don't try to fetch permissions
    if (!isAuthenticated || !user) {
      setLoading(false);
      setIsAuthorized(false);
      return;
    }

    // If permissions already loaded, don't fetch again
    if (permissionsLoaded.current) {
      const authorized = isPathAuthorized(location.pathname, allowedPaths);
      setIsAuthorized(authorized);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetch attempts
    if (fetchAttempted) {
      return;
    }

    const fetchMenuPermissions = async () => {
      setFetchAttempted(true);
      setLoading(true);
      
      try {
        // console.log("Fetching menu permissions for user level:", user.user_level);
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
        console.error("Failed to fetch menu permissions:", error);
        
        // Handle 401/403 errors - user might be logged out or unauthorized
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Authorization error, logging out user");
          logout();
          return;
        }
        
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuPermissions();
  }, [isAuthenticated, user, authLoading, location.pathname, allowedPaths, fetchAttempted, logout]);

  // Check authorization when path changes
  useEffect(() => {
    if (!authLoading && isAuthenticated && allowedPaths.length > 0) {
      const authorized = isPathAuthorized(location.pathname, allowedPaths);
      setIsAuthorized(authorized);
    }
  }, [location.pathname, allowedPaths, isAuthenticated, authLoading]);

  const isPathAuthorized = (path: string, allowedPaths: string[]): boolean => {
    // Always allow signin and unauthorized pages
    if (path === '/signin' || path === '/unauthorized') {
      return true;
    }

    // Root path redirect to dashboard if dashboard is allowed
    if (path === '/' && allowedPaths.includes('/dashboard')) {
      return true;
    }

    // Check whitelisted paths
    for (const whitelistedPath of whitelistedPaths) {
      if (path === whitelistedPath || path.startsWith(whitelistedPath + '/')) {
        return true;
      }
    }

    // Exact match
    if (allowedPaths.includes(path)) {
      return true;
    }
    
    // Prefix match for dynamic routes
    return allowedPaths.some(allowedPath => {
      if (!allowedPath) return false;
      return path.startsWith(allowedPath);
    });
  };

  // Show loading while auth is being determined or permissions are being fetched
  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-gray-300 border-t-blue-600"></div>
          <div className="mt-2">Loading permissions...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    // console.log("User not authenticated, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  // If authenticated but not authorized for current path
  if (!isAuthorized) {
    // console.log(`Not authorized to access ${location.pathname}. Allowed paths:`, allowedPaths);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;