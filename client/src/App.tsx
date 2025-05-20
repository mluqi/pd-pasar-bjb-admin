import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UnauthorizedPage from "./pages/OtherPage/UnauthorizedPage";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UserManagement from "./pages/UserManagement/Page";
import PasarManagement from "./pages/PasarManagement/Page";
import Lapak from "./pages/Lapak/Page";
import Iuran from "./pages/Iuran/Page";
import Pedagang from "./pages/Pedagang/Page";
import LogAkses from "./pages/LogAkses/Page";
import LogActivity from "./pages/LogActivity/Page";
import ProtectedRoute from "./components/ProtectedRoute";
import TypeLapak from "./pages/TypeLapak/Page";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";
import PedagangDetail from "./pages/Pedagang/PedagangDetail";
import LapakQrPage from "./pages/Lapak/LapakQrPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PasarProvider } from "./context/PasarContext";
import { UserProvider } from "./context/UserContext";
import { PedagangProvider } from "./context/PedagangContext";
import { LapakProvider } from "./context/LapakContext";
import { IuranProvider } from "./context/IuranContext";
import { LevelProvider } from "./context/LevelContext";
import { LogProvider } from "./context/LogContext";
import { LapakTypeProvider } from "./context/LapakTypeContext";
import { DropdownProvider } from "./context/DropdownContext";
import { DashboardProvider } from "./context/DashboardContext";

// Component to handle root redirect logic
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-gray-300 border-t-blue-600"></div>
          <div className="mt-2">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/signin" replace />;
};

// Component to handle 404 for non-authenticated users
const PublicNotFound = () => {
  return <NotFound />;
};

// Protected Routes Wrapper
const ProtectedRoutesWrapper = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-gray-300 border-t-blue-600"></div>
          <div className="mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, only allow specific routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/unauthorized" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<PublicNotFound />} />
      </Routes>
    );
  }

  // If authenticated, show full protected routes
  return (
    <DropdownProvider>
      <UserProvider>
        <LogProvider>
          <LevelProvider>
            <PasarProvider>
              <PedagangProvider>
                <LapakProvider>
                  <LapakTypeProvider>
                    <IuranProvider>
                      <DashboardProvider>
                        <Routes>
                          {/* Root redirect with auth logic */}
                          <Route path="/" element={<RootRedirect />} />

                          {/* Unauthorized Page - accessible when authenticated */}
                          <Route path="/unauthorized" element={<UnauthorizedPage />} />

                          {/* Dashboard Layout with Authorization Check */}
                          <Route element={<AppLayout />}>
                            <Route element={<ProtectedRoute />}>
                              <Route path="/dashboard" element={<Home />} />
                              <Route path="/user-management" element={<UserManagement />} />
                              <Route path="/pasar-management" element={<PasarManagement />} />
                              <Route path="/lapak-management" element={<Lapak />} />
                              <Route path="/iuran-management" element={<Iuran />} />
                              <Route path="/pedagang-management" element={<Pedagang />} />
                              <Route path="/log-akses" element={<LogAkses />} />
                              <Route path="/log-activity" element={<LogActivity />} />
                              <Route path="/tipe-lapak" element={<TypeLapak />} />

                              {/* Others Page */}
                              <Route path="/profile" element={<UserProfiles />} />
                              <Route 
                                path="/user-management/reset-password/:userCode" 
                                element={<ResetPasswordPage />} 
                              />
                              <Route 
                                path="/pedagang-management/detail/:custCode" 
                                element={<PedagangDetail />} 
                              />
                              <Route 
                                path="/lapak-management/qrcode/:lapakCode" 
                                element={<LapakQrPage />} 
                              />
                            </Route>
                          </Route>

                          {/* Fallback Route for authenticated users */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </DashboardProvider>
                    </IuranProvider>
                  </LapakTypeProvider>
                </LapakProvider>
              </PedagangProvider>
            </PasarProvider>
          </LevelProvider>
        </LogProvider>
      </UserProvider>
    </DropdownProvider>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        {/* <Route path="/signup" element={<SignUp />} /> */}

        {/* All other routes with AuthProvider */}
        <Route
          path="*"
          element={
            <AuthProvider>
              <ProtectedRoutesWrapper />
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}