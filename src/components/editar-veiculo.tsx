import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteVeiculo, updateVeiculo } from "@/service/veiculo.service";
import type { Veiculo } from "@/models/veiculo.model";

// Tipos para os dados e erros do formulário (ATUALIZADO)
type FormData = Omit<Veiculo, "id" | "idUsuario" | "ano"> & {
  ano: string; // 'ano' é string no formulário para facilitar a digitação
};
type FormErrors = Partial<Record<keyof FormData, string>>;

// Props que o modal receberá
interface EditarVeiculoModalProps {
  veiculo: Veiculo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    veiculoAtualizado: Veiculo,
    operacao: "update" | "delete"
  ) => void;
}

export function EditarVeiculoModal({
  veiculo,
  isOpen,
  onClose,
  onSuccess,
}: EditarVeiculoModalProps) {
  // Estados para os dados do formulário, erros e status de submissão/exclusão
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    marca: "",
    modelo: "",
    placa: "",
    cor: "", // <-- ADICIONADO
    ano: "", // <-- ADICIONADO
    tipo: "carro",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Efeito para popular o formulário quando o veículo selecionado muda (ATUALIZADO)
  useEffect(() => {
    if (veiculo) {
      setFormData({
        nome: veiculo.nome,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        placa: veiculo.placa,
        cor: veiculo.cor, // <-- ADICIONADO
        ano: String(veiculo.ano), // <-- ADICIONADO
        tipo: veiculo.tipo,
      });
    }
  }, [veiculo]);

  // Função de validação manual (ATUALIZADO)
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nome || formData.nome.length < 2)
      newErrors.nome = "O nome deve ter pelo menos 2 caracteres.";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers para mudança nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 7);
    setFormData((prev) => ({ ...prev, placa: maskedValue }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value }));
  };

  // Função para salvar as alterações (ATUALIZADO)
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Por favor, corrija os erros no formulário.");
      return;
    }

    setIsSubmitting(true);
    try {
      const veiculoAtualizado = {
        ...formData,
        ano: parseInt(formData.ano, 10), // Converte 'ano' de volta para número
      };
      await updateVeiculo(veiculo.id!, veiculoAtualizado);
      toast.success("Veículo atualizado com sucesso!");
      onSuccess({ ...veiculo, ...veiculoAtualizado }, "update");
    } catch (e) {
      toast.error("Falha ao atualizar o veículo.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para deletar o veículo
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVeiculo(veiculo.id!);
      toast.success("Veículo excluído com sucesso!");
      onSuccess(veiculo, "delete"); // Avisa o pai que a operação de exclusão foi um sucesso
    } catch (error) {
      toast.error("Falha ao excluir o veículo.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Editar Veículo</DialogTitle>
          <DialogDescription>
            Altere as informações do seu veículo "{veiculo.nome}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          {/* Apelido, Marca, Modelo */}
          <div className="space-y-2">
            <Label htmlFor="nome">Apelido do Veículo</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                name="marca"
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
                value={formData.modelo}
                onChange={handleChange}
              />
              {errors.modelo && (
                <p className="text-sm text-destructive">{errors.modelo}</p>
              )}
            </div>
          </div>

          {/* Placa, Cor, Ano e Tipo (ATUALIZADO) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                name="placa"
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
              <Label>Tipo</Label>
              <Select onValueChange={handleSelectChange} value={formData.tipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deseja realmente excluir o veículo "{veiculo.nome}"? Esta
                    ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
