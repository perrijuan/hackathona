import { Routes, Route, Navigate, HashRouter } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Páginas
import Login from "./pages/login";
import Home from "./pages/home";
import { type ReactNode } from "react";
import MainLayout from "./layout/main-layout";
import NotFound from "./pages/not-found";
import Perfil from "./pages/perfil";
import TesteJuan from "./pages/teste-juan";
import BuscarCaronas from "./pages/buscar-carona";
import CadastrarVeiculo from "./pages/cadastrar-veiculo";
import MeusVeiculos from "./pages/meus-veiculos";
import MinhasCaronas from "./pages/minhas-caronas";
import PublicarCarona from "./pages/publicar-carona";
import HistoricoCaronas from "./pages/historico-caronas";

// Componente para proteger rotas privadas
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// 🔥 Novo componente para rotas públicas
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (user) return <Navigate to="/home" replace />; // se já logado -> vai pro menu
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <HashRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route path="/register" element={<Perfil />} />

            <Route path="/teste-juan" element={<TesteJuan />} />

            {/* Rotas Protegidas com Layout */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="buscar-carona" element={<BuscarCaronas />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="cadastrar-veiculo" element={<CadastrarVeiculo />} />
              <Route path="meus-veiculos" element={<MeusVeiculos />} />
              <Route path="minhas-caronas" element={<MinhasCaronas />} />
              <Route path="publicar-carona" element={<PublicarCarona />} />
              <Route path="historico-caronas" element={<HistoricoCaronas />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
