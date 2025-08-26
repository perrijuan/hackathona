import {
  Car,
  CirclePlus,
  History,
  HomeIcon,
  List,
  LogOut,
  Search,
  Share2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authService } from "@/service/loginFirebase";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { toast } from "sonner";

// Estrutura de navegação baseada nas suas novas páginas
const navLinks = [
  {
    label: "Início",
    href: "/home",
    icon: HomeIcon,
  },
  {
    group: "Caronas",
    items: [
      {
        label: "Publicar Carona",
        href: "/publicar-carona",
        icon: CirclePlus,
      },
      {
        label: "Buscar Carona",
        href: "/buscar-carona",
        icon: Search,
      },
      {
        label: "Minhas Caronas",
        href: "/minhas-caronas",
        icon: List,
      },
      {
        label: "Histórico",
        href: "/historico-caronas",
        icon: History,
      },
    ],
  },
  {
    group: "Meu Perfil",
    items: [
      {
        label: "Ver Perfil",
        href: "/perfil",
        icon: User,
      },
      {
        label: "Meus Veículos",
        href: "/meus-veiculos",
        icon: Car,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const handleShare = async () => {
    const shareData = {
      title: "Vector – caronas entre estudantes",
      text: "Combine caronas com colegas e reduza custos e emissões no seu trajeto diário.",
      url: "https://hackatona.vercel.app/",
    };

    try {
      // Verificar se a API Web Share está disponível (principalmente mobile)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        // Não mostrar toast aqui pois o usuário já vê a ação de compartilhar
      } else if (navigator.share) {
        // Tentar compartilhar mesmo sem canShare (compatibilidade)
        await navigator.share(shareData);
      } else {
        // Fallback: copiar link para área de transferência
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copiado! Cole onde quiser compartilhar 📋");
      }
    } catch (error) {
      // Se usuário cancelou o compartilhamento, não mostrar erro
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      // Em caso de erro, tentar fallback
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copiado! Cole onde quiser compartilhar 📋");
      } catch {
        // Último recurso: mostrar o link para copiar manualmente
        toast.error("Copie o link: " + shareData.url);
      }
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <img src="/icone.svg" alt="logo" className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Vector</h2>
            <span className="text-xs text-muted-foreground -mt-1">
              Mobilidade Estudantil
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-12">
        {navLinks.map((link, index) =>
          link.group ? (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{link.group}</SidebarGroupLabel>
              <SidebarMenu>
                {link.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      onClick={() => setOpenMobile(false)}
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ) : (
            <SidebarMenu key={index}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href}
                  onClick={() => setOpenMobile(false)}
                >
                  <Link to={link.href!} className="pl-4">
                    <HomeIcon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )
        )}
      </SidebarContent>

      <SidebarFooter>
        {showLogoutConfirm ? (
          <div className="flex flex-col gap-2 w-full text-center">
            <p className="text-sm">Deseja realmente sair?</p>
            <div className="flex gap-2">
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                Sim, sair
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
          <div className="w-full space-y-2">
            <Button
              onClick={handleShare}
              variant="default"
              className="w-full justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar o Vector
            </Button>
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                onClick={() => setShowLogoutConfirm(true)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
              <ModeToggle />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
