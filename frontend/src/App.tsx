import { useState } from "react";
import { AuthProvider } from "./lib/auth";
import { StoreProvider } from "./lib/store";
import { useHashRoute } from "./lib/router";
import { AuthModal } from "./components/AuthModal";
import Landing from "./pages/Landing";
import FeedbackPage from "./pages/FeedbackPage";
import AdminLayout from "./pages/admin/AdminLayout";
import SignupPage from "./pages/SignupPage";

export default function App() {
  const [route] = useHashRoute();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const r = route.length > 1 ? route.replace(/\/$/, "") : route;

  return (
    <AuthProvider>
      <StoreProvider>
        {r === "/signup" || r === "/login" ? (
          <SignupPage />
        ) : r.startsWith("/admin") ? (
          <AdminLayout route={r} onOpenAuth={() => setAuthModalOpen(true)} />
        ) : r.startsWith("/feedback") ? (
          <FeedbackPage onOpenAuth={() => setAuthModalOpen(true)} />
        ) : (
          <Landing onOpenAuth={() => setAuthModalOpen(true)} />
        )}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </StoreProvider>
    </AuthProvider>
  );
}
