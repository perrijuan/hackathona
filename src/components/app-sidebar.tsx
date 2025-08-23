import {
  Car,
  LogOut,
  Search,
  PlusCircle,
  UserCircle,
  Route,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { authService } from "@/service/loginFirebase";

// Estrutura de menu corrigida para corresponder às suas rotas
const menuItems = [
  {
    title: "Buscar Caronas",
    url: "/home/buscar-carona",
    icon: <Search className="w-4 h-4" />,
  },
  {
    title: "Minhas Caronas",
    url: "/home/minhas-caronas",
    icon: <Route className="w-4 h-4" />,
  },
  {
    title: "Publicar Carona",
    url: "/home/publicar-carona",
    icon: <PlusCircle className="w-4 h-4" />,
  },
  {
    title: "Meus Veículos",
    url: "/home/meus-veiculos",
    icon: <Car className="w-4 h-4" />,
  },
  {
    title: "Meu Perfil",
    url: "/home/perfil",
    icon: <UserCircle className="w-4 h-4" />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Você foi desconectado.");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao tentar sair.");
      console.error(error);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <Sidebar variant="floating" {...props} className="flex flex-col">
      {/* Cabeçalho */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/home" onClick={() => setOpenMobile(false)}>
                <div className="bg-primary text-sidebar-primary-foreground flex aspect-square w-8 items-center justify-center rounded-lg">
                  <img src="/icone.svg" alt="logo" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none ml-2">
                  <span className="font-semibold">Move</span>
                  <span className="text-xs text-muted-foreground">
                    Mobilidade Estudantil
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Conteúdo principal do menu */}
      <SidebarContent className="flex-grow">
        <SidebarMenu className="gap-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  to={item.url}
                  className="font-medium flex items-center gap-2"
                  onClick={() => setOpenMobile(false)}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Rodapé com ações */}
      <div className="p-4 border-t">
        {showLogoutConfirm ? (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-xs text-center text-muted-foreground">
              Deseja realmente sair?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                Sim
              </Button>
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tema</span>
              <ModeToggle />
            </div>
            <div className="pt-2 border-t">
              <Button
                onClick={() => setShowLogoutConfirm(true)}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
