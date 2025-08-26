import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";

import { useAuth } from "@/contexts/AuthContext";

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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import type { Veiculo } from "@/models/veiculo.model";
import { getVeiculosByUsuario } from "@/service/veiculo.service";
import { criarCarona } from "@/service/carona.service";
import GoogleMapsRoute from "@/components/google-maps-route";

// Tipos para o estado do formulário e erros
type FormData = {
  idVeiculo: string;
  origem: string;
  destino: string;
  data: string;
  hora: string;
  vagasDisponiveis: string;
  precoPorPessoa: string;
  observacoes: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function PublicarCarona() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
  const [formData, setFormData] = useState<FormData>({
    idVeiculo: "",
    origem: "",
    destino: "",
    data: "",
    hora: "",
    vagasDisponiveis: "",
    precoPorPessoa: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para os veículos do usuário
  const [meusVeiculos, setMeusVeiculos] = useState<Veiculo[]>([]);
  const [isLoadingVeiculos, setIsLoadingVeiculos] = useState(true);

  // Busca os veículos do usuário ao carregar a página
  useEffect(() => {
    if (!user) return;
    const buscarVeiculos = async () => {
      try {
        const veiculos = await getVeiculosByUsuario(user.uid);
        setMeusVeiculos(veiculos);
      } catch (error) {
        toast.error("Não foi possível carregar seus veículos.");
        console.error(error);
      } finally {
        setIsLoadingVeiculos(false);
      }
    };
    buscarVeiculos();
  }, [user]);

  // Função de validação manual
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const agora = new Date();
    const dataHoraSaida = new Date(`${formData.data}T${formData.hora}`);

    if (!formData.idVeiculo) newErrors.idVeiculo = "Selecione um veículo.";
    if (!formData.origem) newErrors.origem = "O local de origem é obrigatório.";
    if (!formData.destino)
      newErrors.destino = "O local de destino é obrigatório.";
    if (!formData.data) newErrors.data = "A data é obrigatória.";
    if (!formData.hora) newErrors.hora = "A hora é obrigatória.";
    if (dataHoraSaida <= agora)
      newErrors.data = "A data e hora de saída devem ser no futuro.";
    if (
      !formData.vagasDisponiveis ||
      parseInt(formData.vagasDisponiveis) <= 0
    ) {
      newErrors.vagasDisponiveis = "Informe um número de vagas válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers para os campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, idVeiculo: value }));
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    try {
      // Combina data e hora e converte para Timestamp do Firebase
      const dataHoraSaida = new Date(`${formData.data}T${formData.hora}`);
      const dataHoraSaidaTimestamp = Timestamp.fromDate(dataHoraSaida);

      const caronaData = {
        idResponsavel: user.uid,
        idVeiculo: formData.idVeiculo,
        origem: { endereco: formData.origem, latitude: 0, longitude: 0 }, // simplificado
        destino: { endereco: formData.destino, latitude: 0, longitude: 0 },
        dataHoraSaida: dataHoraSaidaTimestamp,
        vagasDisponiveis: parseInt(formData.vagasDisponiveis),
        precoPorPessoa: formData.precoPorPessoa
          ? parseFloat(formData.precoPorPessoa)
          : 0,
        observacoes: formData.observacoes,
      };

      await criarCarona(caronaData);
      toast.success("Carona publicada com sucesso!");
      navigate("/home/minhas-caronas");
    } catch (error) {
      toast.error("Erro ao publicar a carona.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Publicar Nova Carona</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para encontrar passageiros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Veículo */}
            <div className="space-y-2">
              <Label htmlFor="idVeiculo">Seu Veículo</Label>
              <Select
                onValueChange={handleSelectChange}
                value={formData.idVeiculo}
                name="idVeiculo"
                disabled={isLoadingVeiculos || meusVeiculos.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingVeiculos
                        ? "Carregando veículos..."
                        : "Selecione um veículo"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {meusVeiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id!}>
                      {v.nome} ({v.placa})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idVeiculo && (
                <p className="text-sm text-destructive">{errors.idVeiculo}</p>
              )}
            </div>

            {/* Origem e Destino */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Saindo de</Label>
                <Input
                  id="origem"
                  name="origem"
                  placeholder="Endereço de partida"
                  value={formData.origem}
                  onChange={handleChange}
                />
                {errors.origem && (
                  <p className="text-sm text-destructive">{errors.origem}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Indo para</Label>
                <Input
                  id="destino"
                  name="destino"
                  placeholder="Endereço de destino"
                  value={formData.destino}
                  onChange={handleChange}
                />
                {errors.destino && (
                  <p className="text-sm text-destructive">{errors.destino}</p>
                )}
              </div>
            </div>

            {/* Prévia do Mapa */}
            {formData.origem && formData.destino && (
              <div className="mt-4">
                <Label>Prévia da Rota</Label>
                <GoogleMapsRoute
                  origin={formData.origem}
                  destination={formData.destino}
                  className="w-full h-72 mt-2 rounded-md border"
                />
              </div>
            )}

            {/* Data e Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data da Saída</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={formData.data}
                  onChange={handleChange}
                />
                {errors.data && (
                  <p className="text-sm text-destructive">{errors.data}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Horário</Label>
                <Input
                  id="hora"
                  name="hora"
                  type="time"
                  value={formData.hora}
                  onChange={handleChange}
                />
                {errors.hora && (
                  <p className="text-sm text-destructive">{errors.hora}</p>
                )}
              </div>
            </div>

            {/* Vagas e Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vagasDisponiveis">Vagas Disponíveis</Label>
                <Input
                  id="vagasDisponiveis"
                  name="vagasDisponiveis"
                  type="number"
                  min="1"
                  placeholder="Ex: 3"
                  value={formData.vagasDisponiveis}
                  onChange={handleChange}
                />
                {errors.vagasDisponiveis && (
                  <p className="text-sm text-destructive">
                    {errors.vagasDisponiveis}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoPorPessoa">
                  Preço por Passageiro (R$)
                </Label>
                <Input
                  id="precoPorPessoa"
                  name="precoPorPessoa"
                  type="number"
                  min="0"
                  placeholder="Deixe em branco se for grátis"
                  value={formData.precoPorPessoa}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (Opcional)</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Ex: Aceito apenas uma mala pequena, parada para lanche, etc."
                value={formData.observacoes}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Publicar Carona"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
