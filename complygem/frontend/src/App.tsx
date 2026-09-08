import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Tenders from "@/pages/Tenders";
import TenderCreate from "@/pages/TenderCreate";
import TenderDetail from "@/pages/TenderDetail";
import Bidders from "@/pages/Bidders";
import BidderDetail from "@/pages/BidderDetail";
import Bids from "@/pages/Bids";
import BidDetail from "@/pages/BidDetail";
import Documents from "@/pages/Documents";
import DocumentViewer from "@/pages/DocumentViewer";
import Review from "@/pages/Review";
import Reverification from "@/pages/Reverification";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import Notifications from "@/pages/Notifications";
import AuditLogs from "@/pages/AuditLogs";
import Settings from "@/pages/Settings";
import AdminUsers from "@/pages/AdminUsers";
import AdminRules from "@/pages/AdminRules";
import AdminIntegrations from "@/pages/AdminIntegrations";

function ComplianceRedirect() {
  const { bidId } = useParams();
  return <Navigate to={`/bids/${bidId}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/tenders" element={<Tenders />} />
              <Route path="/tenders/create" element={<TenderCreate />} />
              <Route path="/tenders/:id" element={<TenderDetail />} />

              <Route path="/bidders" element={<Bidders />} />
              <Route path="/bidders/:id" element={<BidderDetail />} />

              <Route path="/bids" element={<Bids />} />
              <Route path="/bids/:id" element={<BidDetail />} />

              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentViewer />} />

              <Route path="/compliance/:bidId" element={<ComplianceRedirect />} />

              <Route path="/review" element={<Review />} />
              <Route path="/review/:id" element={<DocumentViewer />} />

              <Route path="/reverification" element={<Reverification />} />

              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetail />} />

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/rules" element={<AdminRules />} />
              <Route path="/admin/integrations" element={<AdminIntegrations />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
