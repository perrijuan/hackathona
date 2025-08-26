import React, { useState } from "react";
import { useNavigate } from "react-router"; // Corrigido para react-router-dom
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

// ATUALIZADO: Tipo para o estado do formulário e dos erros
type FormData = Omit<Veiculo, "id" | "idUsuario" | "ano"> & {
  ano: string; // Ano como string para facilitar a entrada no formulário
};
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CadastrarVeiculo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ATUALIZADO: Estado inicial do formulário
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    marca: "",
    modelo: "",
    placa: "",
    cor: "", // Adicionado
    ano: "", // Adicionado
    tipo: "carro",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ATUALIZADO: Função de validação
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome || formData.nome.length < 2)
      newErrors.nome = "O apelido deve ter pelo menos 2 caracteres.";
    if (!formData.marca) newErrors.marca = "A marca é obrigatória.";
    if (!formData.modelo) newErrors.modelo = "O modelo é obrigatório.";
    if (!formData.cor) newErrors.cor = "A cor é obrigatória.";
    if (formData.placa.length !== 7)
      newErrors.placa = "A placa deve ter 7 caracteres.";

    const anoNum = parseInt(formData.ano);
    if (
      !formData.ano ||
      isNaN(anoNum) ||
      anoNum < 1950 ||
      anoNum > new Date().getFullYear() + 1
    ) {
      newErrors.ano = "Insira um ano válido.";
    }

    if (!formData.tipo) newErrors.tipo = "Selecione o tipo de veículo.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler genérico para a maioria dos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler específico para a placa com máscara
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 7);
    setFormData((prev) => ({ ...prev, placa: value }));
  };

  // Handler para o componente Select
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value }));
  };

  // ATUALIZADO: Função de submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        ano: parseInt(formData.ano, 10), // Converte ano de volta para número
        idUsuario: user.uid,
      };

      await createVeiculo(veiculoParaSalvar);

      toast.success("Veículo cadastrado com sucesso!");
      navigate("/meus-veiculos"); // Redireciona para a lista de veículos
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error);
      toast.error("Ocorreu um erro ao cadastrar o veículo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Novo Veículo</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para adicionar um veículo à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Apelido do Veículo */}
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

            {/* Marca e Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Placa, Cor, Ano e Tipo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  name="cor"
                  placeholder="Ex: Branco"
                  value={formData.cor}
                  onChange={handleChange}
                />
                {errors.cor && (
                  <p className="text-sm text-destructive">{errors.cor}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  name="ano"
                  type="number"
                  placeholder="Ex: 2023"
                  value={formData.ano}
                  onChange={handleChange}
                />
                {errors.ano && (
                  <p className="text-sm text-destructive">{errors.ano}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  name="tipo"
                  onValueChange={handleSelectChange}
                  value={formData.tipo}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione" />
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
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Cadastrando...
                </>
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
