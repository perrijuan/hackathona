import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Páginas
import Login from "./pages/login";
import RegistrationScreen from "./pages/registration";
import { type ReactNode } from "react";
import Home from "./pages/home";

// Componente para proteger rotas
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Você pode substituir isso por um componente de Spinner/Loading
    return <div>Carregando...</div>;
  }

  if (!user) {
    // Se não houver usuário, redireciona para a página de login
    return <Navigate to="/" replace />;
  }

  // Se houver usuário, renderiza a página solicitada
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          {" "}
          {/* O Provedor de Autenticação envolve todas as rotas */}
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<RegistrationScreen />} />

            {/* Rota Protegida */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
