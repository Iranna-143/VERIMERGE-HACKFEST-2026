import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthUI } from "./components/ui/auth-fuse";
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { DocumentsPage } from './pages/dashboard/DocumentsPage';
import { UploadPage } from './pages/dashboard/UploadPage';
import { AnalysisPage } from './pages/dashboard/AnalysisPage';
import { ConflictsPage } from './pages/dashboard/ConflictsPage';
import { FinalDocumentPage } from './pages/dashboard/FinalDocumentPage';
import { ChatPage } from './pages/dashboard/ChatPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { WorkspacesPage } from './pages/dashboard/WorkspacesPage';
import { AdminStatusPage } from './pages/dashboard/AdminStatusPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-indigo-400 font-mono text-sm">
        Initializing Verimerge Engine...
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthUI />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="conflicts" element={<ConflictsPage />} />
        <Route path="final" element={<FinalDocumentPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin" element={<AdminStatusPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6]">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
