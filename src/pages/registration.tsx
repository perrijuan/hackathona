import { useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react"; // Ícone padrão do shadcn/ui

// --- Componentes importados do shadcn/ui ---
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock do AuthService para Demonstração ---
// Em seu projeto real, você deve importar seu `authService` real.
const authService = {
  criarContaComEmailESenha: async (email: string, password: string) => {
    console.log("Mock: Criando conta para", email);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula delay da rede
    if (email.includes("error")) {
      throw new Error("Este e-mail já está em uso (simulado).");
    }
    return { uid: "mock-uid-12345", email: email };
  },
};
// --- Fim do Mock ---

export default function RegistrationScreen() {
  const [fullName, setFullName] = useState("");
  const [dre, setDre] = useState("");
  const [vinculo, setVinculo] = useState("aluno");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (!fullName || !dre || !phone || !dob || !email) {
      toast.warning("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Criando sua conta...");

    try {
      const user = await authService.criarContaComEmailESenha(email, password);
      // AQUI você chamaria uma função para salvar os dados adicionais no Firestore
      // Ex: await userService.updateProfile(user.uid, { fullName, dre, vinculo, phone, dob, photoURL: 'url_da_foto_apos_upload' });
      console.log("Dados do perfil a serem salvos:", {
        fullName,
        dre,
        vinculo,
        phone,
        dob,
        photo,
        user,
      });

      toast.success("Conta criada com sucesso!", {
        id: toastId,
        description: `Bem-vindo(a), ${fullName}!`,
      });
      // Redirecionar para o dashboard ou próxima etapa
    } catch (err: any) {
      toast.error("Falha no Cadastro", {
        id: toastId,
        description: err.message || "Ocorreu um erro desconhecido.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center -z-20"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/fotos-gratis/amigos-em-um-carro-viajando-juntos_23-2149073958.jpg?semt=ais_hybrid&w=740&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-black/70 -z-10" />

      <Card className="max-w-lg w-full bg-black/50 text-white border-white/20 backdrop-blur-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Crie sua Conta</CardTitle>
          <CardDescription className="text-white/70 pt-2">
            Complete seus dados para participar da nossa comunidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex justify-center">
              <Label htmlFor="photo-upload" className="cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center text-white/50 group-hover:bg-white/20 group-hover:border-white/50 transition-colors relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8" />
                  )}
                </div>
              </Label>
              <Input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dre">DRE / Matrícula SIAPE</Label>
                <Input
                  id="dre"
                  value={dre}
                  onChange={(e) => setDre(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vinculo">Vínculo com a UFRJ</Label>
                <Select
                  value={vinculo}
                  onValueChange={setVinculo}
                  required
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno(a)</SelectItem>
                    <SelectItem value="servidor">Servidor(a)</SelectItem>
                    <SelectItem value="professor">Professor(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Data de Nascimento</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full font-bold"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Criar Conta"}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <a
                href="#"
                className="font-semibold text-blue-400 hover:underline"
              >
                Faça o login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
