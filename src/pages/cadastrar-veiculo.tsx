import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";
import { type Veiculo } from "@/models/veiculo.model";
import { createVeiculo } from "@/service/veiculo.service";

// Tipo para o estado do formulário e dos erros
type FormData = Omit<Veiculo, "id" | "idUsuario" | "consumoMedio"> & {
  consumoMedio: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CadastrarVeiculo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    marca: "",
    modelo: "",
    placa: "",
    tipo: "carro", // Valor inicial
    consumoMedio: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função de validação
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome || formData.nome.length < 2) {
      newErrors.nome = "O nome deve ter pelo menos 2 caracteres.";
    }
    if (!formData.marca) newErrors.marca = "A marca é obrigatória.";
    if (!formData.modelo) newErrors.modelo = "O modelo é obrigatório.";
    if (formData.placa.length !== 7) {
      newErrors.placa = "A placa deve ter exatamente 7 caracteres.";
    }
    if (!formData.tipo) newErrors.tipo = "Selecione o tipo de veículo.";
    if (
      !formData.consumoMedio ||
      isNaN(parseFloat(formData.consumoMedio)) ||
      parseFloat(formData.consumoMedio) <= 0
    ) {
      newErrors.consumoMedio = "O consumo médio deve ser um número positivo.";
    }

    setErrors(newErrors);
    // Retorna true se o objeto de erros estiver vazio
    return Object.keys(newErrors).length === 0;
  };

  // Handler genérico para a maioria dos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler específico para a placa com máscara
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maskedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") // Permite apenas letras e números
      .substring(0, 7); // Limita a 7 caracteres

    setFormData((prev) => ({ ...prev, placa: maskedValue }));
  };

  // Handler para o componente Select do Shadcn
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value as FormData["tipo"] }));
  };

  // Função de submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previne o recarregamento da página

    if (!validateForm()) {
      toast.warning("Por favor, corrija os erros no formulário.");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para cadastrar um veículo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const veiculoParaSalvar = {
        ...formData,
        consumoMedio: parseFloat(formData.consumoMedio), // Converte para número
        idUsuario: user.uid,
      };

      await createVeiculo(veiculoParaSalvar);

      toast.success("Veículo cadastrado com sucesso!");
      navigate("/home/meus-veiculos"); // Redireciona
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error);
      toast.error("Ocorreu um erro ao cadastrar o veículo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Novo Veículo</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para adicionar um veículo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Veículo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Apelido do Veículo</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Meu carro do dia a dia"
                value={formData.nome}
                onChange={handleChange}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  name="marca"
                  placeholder="Ex: Volkswagen"
                  value={formData.marca}
                  onChange={handleChange}
                />
                {errors.marca && (
                  <p className="text-sm text-destructive">{errors.marca}</p>
                )}
              </div>
              {/* Modelo */}
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  placeholder="Ex: Nivus"
                  value={formData.modelo}
                  onChange={handleChange}
                />
                {errors.modelo && (
                  <p className="text-sm text-destructive">{errors.modelo}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Placa com Máscara */}
              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  name="placa"
                  placeholder="ABC1D23"
                  value={formData.placa}
                  onChange={handlePlacaChange}
                />
                {errors.placa && (
                  <p className="text-sm text-destructive">{errors.placa}</p>
                )}
              </div>
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  name="tipo"
                  onValueChange={handleSelectChange}
                  value={formData.tipo}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-destructive">{errors.tipo}</p>
                )}
              </div>
              {/* Consumo Médio */}
              <div className="space-y-2">
                <Label htmlFor="consumoMedio">Consumo (km/l)</Label>
                <Input
                  id="consumoMedio"
                  name="consumoMedio"
                  type="number"
                  placeholder="Ex: 12.5"
                  value={formData.consumoMedio}
                  onChange={handleChange}
                />
                {errors.consumoMedio && (
                  <p className="text-sm text-destructive">
                    {errors.consumoMedio}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Cadastrar Veículo"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
