import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Car, Fingerprint, PlusCircle } from "lucide-react";

import { type Veiculo } from "@/models/veiculo.model";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getVeiculosByUsuario } from "@/service/veiculo.service";
import { EditarVeiculoModal } from "@/components/editar-veiculo";

export default function MeusVeiculos() {
  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para controlar qual veículo está selecionado para edição
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const buscarVeiculos = async () => {
      try {
        setIsLoading(true);
        const listaVeiculos = await getVeiculosByUsuario(user.uid);
        setVeiculos(listaVeiculos);
      } catch (error) {
        toast.error("Falha ao carregar seus veículos.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    buscarVeiculos();
  }, [user]);

  // Função para ser chamada pelo modal após salvar ou excluir
  const handleModalSuccess = (veiculoAlterado: Veiculo) => {
    // Se o ID do veículo alterado ainda existe na lista, foi uma edição
    if (veiculos.some((v) => v.id === veiculoAlterado.id)) {
      setVeiculos((prev) =>
        prev.map((v) => (v.id === veiculoAlterado.id ? veiculoAlterado : v)),
      );
    } else {
      // Senão, foi uma exclusão
      setVeiculos((prev) => prev.filter((v) => v.id !== veiculoAlterado.id));
    }
    setVeiculoSelecionado(null); // Fecha o modal
  };

  // Componente de Skeleton para o estado de carregamento
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie os veículos cadastrados em sua conta.
          </p>
        </div>
        <Button asChild>
          <Link to="/home/cadastrar-veiculo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Veículo
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : veiculos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {veiculos.map((veiculo) => (
            <Card key={veiculo.id}>
              <CardHeader>
                <CardTitle>{veiculo.nome}</CardTitle>
                <CardDescription>
                  {veiculo.marca} {veiculo.modelo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm font-mono tracking-widest">
                  <Fingerprint className="mr-2 h-4 w-4 text-muted-foreground" />
                  {veiculo.placa}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Car className="mr-2 h-4 w-4" />
                  Tipo:{" "}
                  <span className="capitalize font-medium text-primary ml-1">
                    {veiculo.tipo}
                  </span>
                </div>
                <Button
                  className="w-full mt-2"
                  variant="outline"
                  onClick={() => setVeiculoSelecionado(veiculo)}
                >
                  Gerenciar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum veículo encontrado</h2>
          <Button asChild className="mt-4">
            <Link to="/home/cadastrar-veiculo">
              Cadastrar meu primeiro veículo
            </Link>
          </Button>
        </div>
      )}

      {/* Renderiza o modal SE houver um veículo selecionado */}
      {veiculoSelecionado && (
        <EditarVeiculoModal
          isOpen={!!veiculoSelecionado}
          veiculo={veiculoSelecionado}
          onClose={() => setVeiculoSelecionado(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
