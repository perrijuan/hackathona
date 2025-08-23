import {
  Car,
  LogOut,
  Share2,
  GraduationCap,
  Users,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { authService } from "@/service/loginFirebase";
import { InfoButton } from "./info-button";

// 🔥 Novo menu adaptado para app de carona
const data = {
  navMain: [
    {
      title: "Caronas",
      url: "/menu",
      items: [
        {
          title: "Oferecer Carona",
          url: "/menu/offer-ride",
        },
        {
          title: "Procurar Carona",
          url: "/menu/find-ride",
        },
      ],
    },
    {
      title: "Comunidade",
      url: "/menu/community",
      items: [
        {
          title: "Colegas",
          url: "/menu/students",
        },
        {
          title: "Mapa de Pontos",
          url: "/menu/map",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await authService.logout();
    navigate("/");
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Move - Mobilidade Veicular Estudantil",
      text: "Conecte-se com colegas e compartilhe caronas para a faculdade. Prático, econômico e sustentável. 🚗🎓",
      url: "https://move-app.vercel.app/",
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copiado! Cole onde quiser compartilhar 📋");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // usuário cancelou o compartilhamento
      }
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copiado! Cole onde quiser compartilhar 📋");
      } catch {
        alert("Copie o link: " + shareData.url);
      }
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

      {/* Conteúdo principal */}
      <SidebarContent className="flex-grow">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url}
                    className="font-medium flex items-center gap-2"
                    onClick={() => setOpenMobile(false)}
                  >
                    {item.title === "Caronas" && <Car className="w-4 h-4" />}
                    {item.title === "Comunidade" && (
                      <Users className="w-4 h-4" />
                    )}
                    {item.title}
                  </Link>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((sub) => (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to={sub.url}
                            className="flex items-center gap-2"
                            onClick={() => setOpenMobile(false)}
                          >
                            {sub.title.includes("Carona") && (
                              <GraduationCap className="w-4 h-4" />
                            )}
                            {sub.title.includes("Mapa") && (
                              <MapPin className="w-4 h-4" />
                            )}
                            {sub.title.includes("Colegas") && (
                              <Users className="w-4 h-4" />
                            )}
                            {sub.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
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
                onClick={confirmLogout}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                Sim
              </Button>
              <Button
                onClick={cancelLogout}
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
            <div className="flex justify-between items-center">
              <Button
                onClick={handleLogoutClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
              <InfoButton />
            </div>

            <div className="pt-2 border-t">
              <Button
                onClick={handleShare}
                variant="default"
                className="w-full justify-center gap-2 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-sm"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar Move
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">Tema</span>
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
