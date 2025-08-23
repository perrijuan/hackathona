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
import type { Veiculo } from "@/models/veiculo.model";
import { deleteVeiculo, updateVeiculo } from "@/service/veiculo.service";

// Tipos para os dados e erros do formulário
type FormData = Omit<Veiculo, "id" | "idUsuario" | "consumoMedio"> & {
  consumoMedio: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

// Props que o modal receberá
interface EditarVeiculoModalProps {
  veiculo: Veiculo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (veiculoAtualizado: Veiculo) => void;
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
    tipo: "carro",
    consumoMedio: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Efeito para popular o formulário quando o veículo selecionado muda
  useEffect(() => {
    if (veiculo) {
      setFormData({
        nome: veiculo.nome,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        placa: veiculo.placa,
        tipo: veiculo.tipo,
        consumoMedio: String(veiculo.consumoMedio),
      });
    }
  }, [veiculo]);

  // Função de validação manual
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nome || formData.nome.length < 2)
      newErrors.nome = "O nome deve ter pelo menos 2 caracteres.";
    if (!formData.marca) newErrors.marca = "A marca é obrigatória.";
    if (!formData.modelo) newErrors.modelo = "O modelo é obrigatório.";
    if (formData.placa.length !== 7)
      newErrors.placa = "A placa deve ter exatamente 7 caracteres.";
    if (
      !formData.consumoMedio ||
      isNaN(parseFloat(formData.consumoMedio)) ||
      parseFloat(formData.consumoMedio) <= 0
    ) {
      newErrors.consumoMedio = "O consumo deve ser um número positivo.";
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
    setFormData((prev) => ({ ...prev, tipo: value as FormData["tipo"] }));
  };

  // Função para salvar as alterações
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
        consumoMedio: parseFloat(formData.consumoMedio),
        idUsuario: veiculo.idUsuario,
      };
      await updateVeiculo(veiculo.id!, veiculoAtualizado);
      toast.success("Veículo atualizado com sucesso!");
      onSuccess({ ...veiculo, ...veiculoAtualizado });
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
      onSuccess(veiculo); // Avisa o pai que a operação foi um sucesso
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
          {/* Apelido */}
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

          {/* Marca e Modelo */}
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

          {/* Placa, Tipo e Consumo */}
          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="consumoMedio">Consumo (km/l)</Label>
              <Input
                id="consumoMedio"
                name="consumoMedio"
                type="number"
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
                    Deseja realmente excluir o veículo "{veiculo.nome}"?
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
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
