import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/service/loginFirebase";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import logo from "@/assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Função para lidar com o login via e-mail e senha
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verificando credenciais...");

    try {
      const user = await authService.loginComEmailESenha(email, password);
      toast.success("Login realizado com sucesso!", {
        id: toastId,
        description: `Bem-vindo(a) de volta, ${user.email}!`,
      });
      if (!user.phoneNumber) {
        navigate("/register");
      }
      navigate("/home");
      // Redirecionar para o dashboard aqui
    } catch (err: any) {
      toast.error("Falha no Login", {
        id: toastId,
        description: err.message || "Ocorreu um erro desconhecido.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o login via Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const toastId = toast.loading("Conectando com o Google...");

    try {
      const user = await authService.loginComGoogle();
      toast.success("Login com Google bem-sucedido!", {
        id: toastId,
        description: `Bem-vindo(a), ${user.displayName || "usuário"}!`,
      });
      navigate("/register");
      // Redirecionar para o dashboard aqui
    } catch (err: any) {
      toast.error("Falha no Login com Google", {
        id: toastId,
        description: err.message || "Ocorreu um erro desconhecido.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      {/* Imagem de Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-20"
        style={{
          backgroundImage: "url('./carona.jpg')",
        }}
      ></div>
      {/* Efeito de Vinheta Escura */}
      <div className="absolute inset-0 bg-black/60 -z-10"></div>

      <Card className="max-w-md w-full bg-black/40 text-white border-white/20 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <img src={logo} alt="logo" className="mx-auto w-32" />
          <CardTitle className="text-3xl font-bold">Acesse sua Conta</CardTitle>
          <CardDescription className="text-white/70 pt-2">
            Use suas credenciais para entrar no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 focus:ring-white/50"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 focus:ring-white/50"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <span className="text-lg font-bold font-serif">G</span>
                  {loading ? "Aguarde..." : "Entrar com Google"}
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              Não tem uma conta?{" "}
              <Link to="/register" className="font-semibold hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
