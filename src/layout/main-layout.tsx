import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router";

export default function MainLayout() {
  const location = useLocation();

  // Função atualizada para reconhecer mais rotas
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/home":
        return "Painel Principal"; // Adicionado um título para a Home
      case "/menu/offer-ride":
        return "Oferecer Carona";
      case "/menu/find-ride":
        return "Procurar Carona";
      case "/home/cadastr-veiculo":
        return "Cadastrar Veículo";
      default:
        // Lógica para pegar o último segmento da URL como fallback
        const pathSegments = location.pathname.split("/").filter(Boolean);
        return pathSegments.length > 0
          ? pathSegments[pathSegments.length - 1].replace(/-/g, " ")
          : "Página";
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
            <span>/</span>
            <span className="font-medium text-foreground">
              {getPageTitle()}
            </span>
          </div>
        </header>
        {/* Ajustado para permitir scroll apenas no conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
