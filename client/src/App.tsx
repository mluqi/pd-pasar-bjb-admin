import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
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
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="*"
            element={
              <AuthProvider>
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
                                      <Route
                                        path="/"
                                        element={<Navigate to="/dashboard" />}
                                      />
                                      {/* Dashboard Layout */}
                                      <Route element={<AppLayout />}>
                                        <Route element={<ProtectedRoute />}>
                                          <Route
                                            index
                                            path="/dashboard"
                                            element={<Home />}
                                          />
                                          <Route
                                            path="/user-management"
                                            element={<UserManagement />}
                                          />
                                          <Route
                                            path="/user-management/reset-password/:userCode"
                                            element={<ResetPasswordPage />}
                                          />
                                          <Route
                                            path="/pasar-management"
                                            element={<PasarManagement />}
                                          />
                                          <Route
                                            path="/lapak-management"
                                            element={<Lapak />}
                                          />
                                          <Route
                                            path="/iuran-management"
                                            element={<Iuran />}
                                          />
                                          <Route
                                            path="/pedagang-management"
                                            element={<Pedagang />}
                                          />
                                        </Route>
                                        <Route
                                          path="/log-akses"
                                          element={<LogAkses />}
                                        />
                                        <Route
                                          path="/log-activity"
                                          element={<LogActivity />}
                                        />
                                        <Route
                                          path="/tipe-lapak"
                                          element={<TypeLapak />}
                                        />
                                        {/* Others Page */}
                                        <Route
                                          path="/profile"
                                          element={<UserProfiles />}
                                        />
                                        <Route
                                          path="/calendar"
                                          element={<Calendar />}
                                        />
                                        <Route
                                          path="/blank"
                                          element={<Blank />}
                                        />

                                        {/* Forms */}
                                        <Route
                                          path="/form-elements"
                                          element={<FormElements />}
                                        />

                                        {/* Tables */}
                                        <Route
                                          path="/basic-tables"
                                          element={<BasicTables />}
                                        />

                                        {/* Ui Elements */}
                                        <Route
                                          path="/alerts"
                                          element={<Alerts />}
                                        />
                                        <Route
                                          path="/avatars"
                                          element={<Avatars />}
                                        />
                                        <Route
                                          path="/badge"
                                          element={<Badges />}
                                        />
                                        <Route
                                          path="/buttons"
                                          element={<Buttons />}
                                        />
                                        <Route
                                          path="/images"
                                          element={<Images />}
                                        />
                                        <Route
                                          path="/videos"
                                          element={<Videos />}
                                        />

                                        {/* Charts */}
                                        <Route
                                          path="/line-chart"
                                          element={<LineChart />}
                                        />
                                        <Route
                                          path="/bar-chart"
                                          element={<BarChart />}
                                        />
                                      </Route>

                                      {/* Fallback Route */}
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
              </AuthProvider>
            }
          />
        </Routes>
      </Router>
    </>
  );
}
