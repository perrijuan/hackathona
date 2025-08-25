import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router";

export default function MainLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/home":
        return "";
      case "/home/cadastr-veiculo":
        return "Cadastrar Veículo";
      default:
        return "";
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>/</span>
            <span className="font-medium text-foreground">
              {getPageTitle()}
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
