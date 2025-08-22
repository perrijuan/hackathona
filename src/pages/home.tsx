import { useAuth } from "@/contexts/AuthContext"; // Importa o hook do contexto
import { authService } from "@/service/loginFirebase"; // Importa o serviço de auth
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Você foi desconectado com sucesso.");
      navigate("/home"); // Redireciona para a página de login
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar sair.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 ">Bem-vindo(a) à Home!</h1>
        {user ? (
          <p>
            Você está logado como: <strong>{user.email}</strong>
          </p>
        ) : (
          <p>Carregando informações do usuário...</p>
        )}
        <Button onClick={handleLogout} className="mt-6">
          Sair
        </Button>
      </div>
    </div>
  );
}
