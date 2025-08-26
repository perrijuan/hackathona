import { Routes, Route, Navigate, HashRouter } from "react-router";
import { type ReactNode } from "react";

// Provedores e Contextos
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layout
import MainLayout from "./layout/main-layout";

// Importando suas páginas reais
import BuscarCarona from "./pages/buscar-carona";
import CadastrarVeiculo from "./pages/cadastrar-veiculo";
import HistoricoCaronas from "./pages/historico-caronas";
import Home from "./pages/home";
import LandingPage from "./pages/landing-page";
import Login from "./pages/login";
import MeusVeiculos from "./pages/meus-veiculos";
import MinhasCaronas from "./pages/minhas-caronas";
import NotFound from "./pages/not-found";
import Perfil from "./pages/perfil";
import PublicarCarona from "./pages/publicar-carona";
import Registration from "./pages/registration";

// Componente para proteger rotas privadas
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; // Considere um componente de loading melhor
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Componente para rotas públicas
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* --- Rotas Públicas --- */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Registration />
                </PublicRoute>
              }
            />

            {/* --- Rotas Protegidas (dentro do MainLayout) --- */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/perfil" element={<Perfil />} />

              {/* Caronas */}
              <Route path="/publicar-carona" element={<PublicarCarona />} />
              <Route path="/buscar-carona" element={<BuscarCarona />} />
              <Route path="/minhas-caronas" element={<MinhasCaronas />} />
              <Route path="/historico-caronas" element={<HistoricoCaronas />} />

              {/* Veículos */}
              <Route path="/meus-veiculos" element={<MeusVeiculos />} />
              <Route path="/cadastrar-veiculo" element={<CadastrarVeiculo />} />
            </Route>

            {/* Rota para URLs não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
