import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { authService } from "@/service/loginFirebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router";

type Endereco = {
  cep: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
};

type Gender =
  | ""
  | "mulher"
  | "homem"
  | "nao_binaria"
  | "outro"
  | "prefiro_nao_informar";

type UserProfile = {
  displayName: string;
  email: string;
  dre: string;
  curso: string;
  campus: string;
  // novo modelo de gênero
  genero: Gender; // identidade de gênero (opcional)
  isTrans?: boolean | null; // pergunta separada (opcional)
  pronomes?: string; // pronomes (opcional)

  // preferência de segurança
  onlyWomenVehicle: boolean;

  // PcD (dados sensíveis – opcionais)
  pcd: boolean;
  pcdTipos?: string[]; // categorias de deficiência
  pcdOutro?: string; // texto livre se marcar “Outro”
  acessibilidade?: string[]; // necessidades de acessibilidade
  acessOutro?: string; // texto livre se marcar “Outro”
  telefone: string;
  identidade: string;
  endereco: Endereco;
  photoURL?: string;
};

const PCD_TIPOS = [
  "Auditiva",
  "Visual",
  "Física",
  "Intelectual",
  "Psicossocial",
  "Múltipla",
  "TEA (autismo)",
  "Outro",
];

const ACESS_OPTS = [
  "Assento dianteiro",
  "Ajuda para embarque/desembarque",
  "Espaço para cadeira de rodas",
  "Transportar cão-guia",
  "Outro",
];

export default function Perfil() {
  const auth = getAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile>({
    displayName: "",
    email: "",
    dre: "",
    curso: "",
    campus: "",
    genero: "",
    isTrans: null,
    pronomes: "",
    onlyWomenVehicle: false,
    pcd: false,
    pcdTipos: [],
    pcdOutro: "",
    acessibilidade: [],
    acessOutro: "",
    telefone: "",
    identidade: "",
    endereco: {
      cep: "",
      cidade: "",
      bairro: "",
      logradouro: "",
      numero: "",
    },
    photoURL: "",
  });

  const navigate = useNavigate();

  // helpers
  const toggleInArray = (arr: string[] | undefined, value: string) => {
    const a = arr ?? [];
    return a.includes(value) ? a.filter((v) => v !== value) : [...a, value];
  };

  const mapOldGenero = (g?: string): Gender => {
    if (!g) return "";
    const s = g.toLowerCase();
    if (s.includes("homem")) return "homem";
    if (s.includes("mulher")) return "mulher";
    if (s === "trans") return "outro"; // “trans” não é gênero; manteremos flag separada se existente
    if (s.includes("outro")) return "outro";
    return "";
  };

  // carregar dados do Firestore (com merge e compatibilidade retroativa)
  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const ref = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Partial<UserProfile> & {
          // possíveis campos antigos
          genero?: string;
          pcdDescricao?: string;
          precisaAuxilio?: string;
        };

        setUser((prev) => ({
          ...prev,
          displayName: data.displayName || "",
          email: data.email || auth.currentUser?.email || "",
          dre: data.dre || "",
          curso: data.curso || "",
          campus: data.campus || "",
          genero: (data.genero as Gender) || mapOldGenero(data.genero) || "",
          isTrans:
            typeof data.isTrans === "boolean"
              ? data.isTrans
              : data.genero?.toLowerCase() === "trans"
              ? true
              : null,
          pronomes: data.pronomes || "",
          onlyWomenVehicle: data.onlyWomenVehicle || false,
          pcd: data.pcd || false,
          pcdTipos:
            (Array.isArray(data.pcdTipos) ? data.pcdTipos : undefined) || [],
          pcdOutro:
            data.pcdOutro ||
            (data as any).pcdDescricao || // compat antigo
            "",
          acessibilidade:
            (Array.isArray(data.acessibilidade)
              ? data.acessibilidade
              : undefined) ||
            ((data as any).precisaAuxilio
              ? [(data as any).precisaAuxilio]
              : []),
          acessOutro: data.acessOutro || "",
          telefone: data.telefone || "",
          identidade: data.identidade || "",
          photoURL: data.photoURL || "",
          endereco: {
            cep: data.endereco?.cep || "",
            cidade: data.endereco?.cidade || "",
            bairro: data.endereco?.bairro || "",
            logradouro: data.endereco?.logradouro || "",
            numero: data.endereco?.numero || "",
          },
        }));
      }
      setLoading(false);
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser]);

  // salvar dados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (!user.email?.includes("ufrj")) {
      alert("O e-mail precisa ser do domínio UFRJ");
      return;
    }

    // limpeza de "Outro" quando não marcado
    const pcdTiposClean = (user.pcdTipos || []).filter((t) =>
      PCD_TIPOS.includes(t)
    );
    const acessClean = (user.acessibilidade || []).filter((t) =>
      ACESS_OPTS.includes(t)
    );

    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        ref,
        {
          displayName: user.displayName,
          email: user.email,
          dre: user.dre,
          curso: user.curso,
          campus: user.campus,

          genero: user.genero,
          isTrans: user.isTrans ?? null,
          pronomes: user.pronomes || "",

          onlyWomenVehicle: user.onlyWomenVehicle,

          pcd: user.pcd,
          pcdTipos: pcdTiposClean,
          pcdOutro: user.pcdTipos?.includes("Outro") ? user.pcdOutro || "" : "",
          acessibilidade: acessClean,
          acessOutro: user.acessibilidade?.includes("Outro")
            ? user.acessOutro || ""
            : "",

          telefone: user.telefone,
          identidade: user.identidade,
          photoURL: user.photoURL || "",

          endereco: {
            cep: user.endereco?.cep || "",
            cidade: user.endereco?.cidade || "",
            bairro: user.endereco?.bairro || "",
            logradouro: user.endereco?.logradouro || "",
            numero: user.endereco?.numero || "",
          },
        },
        { merge: true }
      );
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    }
  };

  // CEP → ViaCEP
  const handleCepBlur = async () => {
    const cep = user.endereco.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setUser((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cidade: data.localidade,
            bairro: data.bairro,
            logradouro: data.logradouro,
            cep,
          },
        }));
      }
    }
  };

  // upload foto (preview local — pode integrar Firebase Storage se quiser)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, photoURL: url }));
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  const canShowWomenOnly =
    user.genero === "mulher" ||
    user.genero === "nao_binaria" ||
    user.genero === "outro";

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>

        {/* Foto */}
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-32 h-32">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback>Foto</AvatarFallback>
          </Avatar>
          <Input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Nome</label>
            <Input
              value={user.displayName}
              onChange={(e) =>
                setUser({ ...user, displayName: e.target.value })
              }
            />
          </div>

          <div>
            <label>E-mail (UFRJ)</label>
            <Input type="email" value={user.email} disabled />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>DRE</label>
              <Input
                value={user.dre}
                onChange={(e) => setUser({ ...user, dre: e.target.value })}
              />
            </div>
            <div>
              <label>Curso</label>
              <Input
                value={user.curso}
                onChange={(e) => setUser({ ...user, curso: e.target.value })}
              />
            </div>
            <div>
              <label>Campus</label>
              <Input
                value={user.campus}
                onChange={(e) => setUser({ ...user, campus: e.target.value })}
              />
            </div>
          </div>

          {/* Identidade de gênero / Trans / Pronomes */}
          <div className="space-y-2">
            <div>
              <label className="block">Identidade de gênero (opcional)</label>
              <p className="text-xs text-gray-500">
                Essa informação ajuda a melhorar a segurança e a experiência.
                Você pode deixar em branco.
              </p>
              <Select
                value={user.genero}
                onValueChange={(v) => setUser({ ...user, genero: v as Gender })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mulher">Mulher</SelectItem>
                  <SelectItem value="homem">Homem</SelectItem>
                  <SelectItem value="nao_binaria">Não-binárie</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro_nao_informar">
                    Prefiro não responder
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!user.isTrans}
                onCheckedChange={(v) =>
                  setUser({ ...user, isTrans: (v as boolean) || false })
                }
              />
              <div>
                <span>Você se considera uma pessoa trans? (opcional)</span>
                <p className="text-xs text-gray-500">
                  Pergunta separada de gênero. Preenchimento opcional.
                </p>
              </div>
            </div>

            <div>
              <label className="block">Pronomes (opcional)</label>
              <Select
                value={user.pronomes || ""}
                onValueChange={(v) => setUser({ ...user, pronomes: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ela/dela">ela/dela</SelectItem>
                  <SelectItem value="ele/dele">ele/dele</SelectItem>
                  <SelectItem value="elu/delu">elu/delu</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {user.pronomes === "outro" && (
                <div className="mt-2">
                  <Input
                    placeholder="Digite seus pronomes"
                    value={user.pronomes === "outro" ? "" : user.pronomes}
                    onChange={(e) =>
                      setUser({ ...user, pronomes: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            {/* Preferência de motorista mulher (segurança) */}
            {canShowWomenOnly && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={user.onlyWomenVehicle}
                  onCheckedChange={(v) =>
                    setUser({ ...user, onlyWomenVehicle: v as boolean })
                  }
                />
                <span>Preferir apenas veículos com motoristas mulheres?</span>
              </div>
            )}
          </div>

          {/* PcD (opcional) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={user.pcd}
                onCheckedChange={(v) => setUser({ ...user, pcd: v as boolean })}
              />
              <div>
                <span>Você é pessoa com deficiência (PcD)?</span>
                <p className="text-xs text-gray-500">
                  Campo opcional. Usamos essas informações apenas para melhorar
                  acessibilidade e logística.
                </p>
              </div>
            </div>

            {user.pcd && (
              <>
                <div>
                  <label className="block">Tipo(s) de deficiência</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {PCD_TIPOS.map((t) => (
                      <label key={t} className="flex items-center gap-2">
                        <Checkbox
                          checked={user.pcdTipos?.includes(t) || false}
                          onCheckedChange={() =>
                            setUser({
                              ...user,
                              pcdTipos: toggleInArray(user.pcdTipos, t),
                            })
                          }
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                  {user.pcdTipos?.includes("Outro") && (
                    <div className="mt-2">
                      <Input
                        placeholder="Descreva"
                        value={user.pcdOutro || ""}
                        onChange={(e) =>
                          setUser({ ...user, pcdOutro: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block">
                    Necessidade(s) de acessibilidade
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {ACESS_OPTS.map((t) => (
                      <label key={t} className="flex items-center gap-2">
                        <Checkbox
                          checked={user.acessibilidade?.includes(t) || false}
                          onCheckedChange={() =>
                            setUser({
                              ...user,
                              acessibilidade: toggleInArray(
                                user.acessibilidade,
                                t
                              ),
                            })
                          }
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                  {user.acessibilidade?.includes("Outro") && (
                    <div className="mt-2">
                      <Input
                        placeholder="Descreva"
                        value={user.acessOutro || ""}
                        onChange={(e) =>
                          setUser({ ...user, acessOutro: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Telefone e Identidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Telefone (WhatsApp)</label>
              <Input
                value={user.telefone}
                onChange={(e) => setUser({ ...user, telefone: e.target.value })}
                placeholder="(21) 99999-9999"
              />
            </div>
            <div>
              <label>Identidade</label>
              <Input
                value={user.identidade}
                onChange={(e) =>
                  setUser({ ...user, identidade: e.target.value })
                }
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label>CEP</label>
              <Input
                value={user.endereco.cep}
                onChange={(e) =>
                  setUser({
                    ...user,
                    endereco: { ...user.endereco, cep: e.target.value },
                  })
                }
                onBlur={handleCepBlur}
              />
            </div>
            <div>
              <label>Cidade</label>
              <Input
                value={user.endereco.cidade}
                onChange={(e) =>
                  setUser({
                    ...user,
                    endereco: { ...user.endereco, cidade: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label>Bairro</label>
              <Input
                value={user.endereco.bairro}
                onChange={(e) =>
                  setUser({
                    ...user,
                    endereco: { ...user.endereco, bairro: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label>Logradouro</label>
              <Input
                value={user.endereco.logradouro}
                onChange={(e) =>
                  setUser({
                    ...user,
                    endereco: { ...user.endereco, logradouro: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label>Número</label>
              <Input
                value={user.endereco.numero}
                onChange={(e) =>
                  setUser({
                    ...user,
                    endereco: { ...user.endereco, numero: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}
