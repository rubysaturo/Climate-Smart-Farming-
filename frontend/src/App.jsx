import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import Loader from "@/components/Loader";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const WeatherPage = lazy(() => import("@/pages/WeatherPage"));
const SoilHealthPage = lazy(() => import("@/pages/SoilHealthPage"));
const PestAlertsPage = lazy(() => import("@/pages/PestAlertsPage"));
const MarketPricesPage = lazy(() => import("@/pages/MarketPricesPage"));
const CropRecommendationsPage = lazy(() => import("@/pages/CropRecommendationsPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loader text="Loading..." />}>{children}</Suspense>
);

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <SuspenseWrapper>
                  <LoginPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/register"
              element={
                <SuspenseWrapper>
                  <RegisterPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<SuspenseWrapper><DashboardPage /></SuspenseWrapper>} />
              <Route path="weather" element={<SuspenseWrapper><WeatherPage /></SuspenseWrapper>} />
              <Route path="soil" element={<SuspenseWrapper><SoilHealthPage /></SuspenseWrapper>} />
              <Route path="pests" element={<SuspenseWrapper><PestAlertsPage /></SuspenseWrapper>} />
              <Route path="market" element={<SuspenseWrapper><MarketPricesPage /></SuspenseWrapper>} />
              <Route path="crop-recommendations" element={<SuspenseWrapper><CropRecommendationsPage /></SuspenseWrapper>} />
              <Route path="chat" element={<SuspenseWrapper><ChatPage /></SuspenseWrapper>} />
              <Route path="search" element={<SuspenseWrapper><SearchPage /></SuspenseWrapper>} />
              <Route path="profile" element={<SuspenseWrapper><ProfilePage /></SuspenseWrapper>} />
              <Route path="settings" element={<SuspenseWrapper><SettingsPage /></SuspenseWrapper>} />
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <SuspenseWrapper><AdminPage /></SuspenseWrapper>
                </ProtectedRoute>
              } />
            </Route>
            <Route
              path="*"
              element={
                <SuspenseWrapper>
                  <NotFoundPage />
                </SuspenseWrapper>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
