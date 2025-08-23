import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { StatusParticipacao, type Carona } from "@/models/carona.model";
import { useAuth } from "@/contexts/AuthContext"; // <-- ATENÇÃO A ESTA LINHA

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Calendar,
  Users,
  DollarSign,
  Info,
  UserCheck,
  Clock,
  Ban,
  HelpCircle,
  Loader2,
} from "lucide-react";
import {
  getCaronasPublicadas,
  solicitarEntrada,
} from "@/service/carona.service";

export default function BuscarCaronas() {
  const { user } = useAuth();

  // Estados da UI
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Estados de dados
  const [todasCaronas, setTodasCaronas] = useState<Carona[]>([]);
  const [caronasFiltradas, setCaronasFiltradas] = useState<Carona[]>([]);
  const [caronaSelecionada, setCaronaSelecionada] = useState<Carona | null>(
    null,
  );

  // Estados dos filtros
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [filtroDestino, setFiltroDestino] = useState("");

  // Busca inicial das caronas
  useEffect(() => {
    const buscarDados = async () => {
      try {
        setIsLoading(true);
        const caronas = await getCaronasPublicadas();
        setTodasCaronas(caronas);
        setCaronasFiltradas(caronas);
      } catch (error) {
        toast.error("Não foi possível carregar as caronas.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    buscarDados();
  }, []);

  // Lógica de filtragem
  const handleFiltrar = () => {
    let caronasResultantes = [...todasCaronas];
    if (filtroOrigem) {
      caronasResultantes = caronasResultantes.filter((c) =>
        c.origem.endereco.toLowerCase().includes(filtroOrigem.toLowerCase()),
      );
    }
    if (filtroDestino) {
      caronasResultantes = caronasResultantes.filter((c) =>
        c.destino.endereco.toLowerCase().includes(filtroDestino.toLowerCase()),
      );
    }
    setCaronasFiltradas(caronasResultantes);
  };

  // Lógica para solicitar participação
  const handleSolicitarEntrada = async () => {
    if (!user || !caronaSelecionada) return;

    setIsModalLoading(true);
    try {
      await solicitarEntrada(caronaSelecionada.id!, user.uid);
      toast.success("Solicitação enviada com sucesso!");

      // Atualiza o estado local para feedback instantâneo
      const caronaAtualizada = {
        ...caronaSelecionada,
        participantes: [
          ...caronaSelecionada.participantes,
          { idUsuario: user.uid, status: StatusParticipacao.PENDENTE },
        ],
      };
      setCaronaSelecionada(caronaAtualizada);
      setTodasCaronas((prev) =>
        prev.map((c) => (c.id === caronaAtualizada.id ? caronaAtualizada : c)),
      );
      // Também atualiza a lista filtrada para refletir a mudança se visível
      setCaronasFiltradas((prev) =>
        prev.map((c) => (c.id === caronaAtualizada.id ? caronaAtualizada : c)),
      );
    } catch (error) {
      toast.error("Erro ao enviar solicitação.");
      console.error(error);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Hook para determinar o estado do botão no modal
  const botaoStatus = useMemo(() => {
    if (!caronaSelecionada) return null;
    if (!user)
      return { text: "Faça login para participar", disabled: true, icon: Ban };
    if (caronaSelecionada.idResponsavel === user.uid)
      return { text: "Você é o responsável", disabled: true, icon: UserCheck };

    const participacao = caronaSelecionada.participantes.find(
      (p) => p.idUsuario === user.uid,
    );
    if (participacao) {
      switch (participacao.status) {
        case StatusParticipacao.PENDENTE:
          return { text: "Solicitação Pendente", disabled: true, icon: Clock };
        case StatusParticipacao.CONFIRMADO:
          return {
            text: "Participação Confirmada",
            disabled: true,
            icon: UserCheck,
          };
        case StatusParticipacao.RECUSADO:
          return { text: "Solicitação Recusada", disabled: true, icon: Ban };
      }
    }
    if (caronaSelecionada.vagasDisponiveis <= 0)
      return { text: "Carona sem vagas", disabled: true, icon: Ban };

    return {
      text: "Solicitar Participação",
      disabled: false,
      icon: HelpCircle,
      action: handleSolicitarEntrada,
    };
  }, [caronaSelecionada, user]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Seção de Filtros */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Encontre sua Carona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                placeholder="Saindo de..."
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                placeholder="Indo para..."
                value={filtroDestino}
                onChange={(e) => setFiltroDestino(e.target.value)}
              />
            </div>
            <Button onClick={handleFiltrar}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Resultados */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Caronas Disponíveis</h2>
        {isLoading ? (
          <LoadingSkeleton />
        ) : caronasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caronasFiltradas.map((carona) => (
              <Card
                key={carona.id}
                className="cursor-pointer hover:border-primary transition-all"
                onClick={() => setCaronaSelecionada(carona)}
              >
                <CardHeader>
                  <CardTitle className="truncate">
                    {carona.origem.endereco}
                  </CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="truncate">
                    {carona.destino.endereco}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {carona.dataHoraSaida
                        .toDate()
                        .toLocaleDateString("pt-BR")}{" "}
                      às{" "}
                      {carona.dataHoraSaida
                        .toDate()
                        .toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{carona.vagasDisponiveis} vagas</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma carona disponível encontrada.
          </p>
        )}
      </div>

      {/* Modal de Detalhes da Carona */}
      <Dialog
        open={!!caronaSelecionada}
        onOpenChange={(isOpen) => !isOpen && setCaronaSelecionada(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {caronaSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Carona</DialogTitle>
                <DialogDescription>
                  De{" "}
                  <span className="font-semibold text-primary">
                    {caronaSelecionada.origem.endereco}
                  </span>{" "}
                  para{" "}
                  <span className="font-semibold text-primary">
                    {caronaSelecionada.destino.endereco}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">Data:</span>{" "}
                    {caronaSelecionada.dataHoraSaida
                      .toDate()
                      .toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">Horário de saída:</span>{" "}
                    {caronaSelecionada.dataHoraSaida
                      .toDate()
                      .toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">Vagas restantes:</span>{" "}
                    {caronaSelecionada.vagasDisponiveis}
                  </span>
                </div>
                {caronaSelecionada.precoPorPessoa != null && (
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-semibold">Valor:</span> R${" "}
                      {caronaSelecionada.precoPorPessoa
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      por pessoa
                    </span>
                  </div>
                )}
                {caronaSelecionada.observacoes && (
                  <div className="flex items-start">
                    <Info className="mr-3 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Observações:</span>{" "}
                      {caronaSelecionada.observacoes}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {botaoStatus && (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={botaoStatus.disabled || isModalLoading}
                    onClick={botaoStatus.action}
                  >
                    {isModalLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <botaoStatus.icon className="mr-2 h-4 w-4" />
                    )}
                    {botaoStatus.text}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
