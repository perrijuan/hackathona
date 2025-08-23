import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  StatusCorrida,
  StatusParticipacao,
  type Carona,
} from "@/models/carona.model";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  ArrowRight,
  UserCheck,
  UserX,
  Play,
  Flag,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  cancelarCarona,
  finalizarCorrida,
  gerenciarSolicitacao,
  getCaronasByResponsavel,
  iniciarCorrida,
} from "@/service/carona.service";

export default function MinhasCaronas() {
  const { user } = useAuth();
  const [caronas, setCaronas] = useState<Carona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [caronaSelecionada, setCaronaSelecionada] = useState<Carona | null>(
    null,
  );

  // Busca as caronas do usuário logado
  useEffect(() => {
    if (!user) return;
    const buscarDados = async () => {
      try {
        setIsLoading(true);
        const data = await getCaronasByResponsavel(user.uid);
        setCaronas(data);
      } catch (error) {
        toast.error("Erro ao buscar suas caronas.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    buscarDados();
  }, [user]);

  // Filtra as caronas para cada aba usando useMemo para otimização
  const caronasAgendadas = useMemo(
    () => caronas.filter((c) => c.statusCorrida === StatusCorrida.AGENDADA),
    [caronas],
  );
  const caronasEmAndamento = useMemo(
    () => caronas.filter((c) => c.statusCorrida === StatusCorrida.EM_ANDAMENTO),
    [caronas],
  );
  const historicoCaronas = useMemo(
    () =>
      caronas.filter(
        (c) =>
          c.statusCorrida === StatusCorrida.FINALIZADA ||
          c.statusCorrida === StatusCorrida.CANCELADA,
      ),
    [caronas],
  );

  // Função para atualizar o estado localmente após uma ação no modal
  const atualizarCaronaLocal = (caronaAtualizada: Carona) => {
    setCaronas((prev) =>
      prev.map((c) => (c.id === caronaAtualizada.id ? caronaAtualizada : c)),
    );
    setCaronaSelecionada(caronaAtualizada);
  };

  // Handlers para as ações do modal
  const handleGerenciar = async (
    idParticipante: string,
    status: StatusParticipacao.CONFIRMADO | StatusParticipacao.RECUSADO,
  ) => {
    if (!caronaSelecionada) return;
    setIsModalLoading(true);
    try {
      await gerenciarSolicitacao(caronaSelecionada.id!, idParticipante, status);
      const caronaAtualizada = await getCaronasByResponsavel(user!.uid).then(
        (cs) => cs.find((c) => c.id === caronaSelecionada.id)!,
      );
      atualizarCaronaLocal(caronaAtualizada);
      toast.success(
        `Participante ${status === "confirmado" ? "aceito" : "recusado"}.`,
      );
    } catch (error) {
      toast.error("Erro ao gerenciar solicitação.");
      console.error(error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleAction = async (action: "iniciar" | "finalizar" | "cancelar") => {
    if (!caronaSelecionada) return;
    setIsModalLoading(true);
    try {
      let updatedCarona: Carona;
      if (action === "iniciar") {
        await iniciarCorrida(caronaSelecionada.id!);
        updatedCarona = {
          ...caronaSelecionada,
          statusCorrida: StatusCorrida.EM_ANDAMENTO,
        };
      } else if (action === "finalizar") {
        await finalizarCorrida(caronaSelecionada.id!);
        updatedCarona = {
          ...caronaSelecionada,
          statusCorrida: StatusCorrida.FINALIZADA,
        };
      } else {
        await cancelarCarona(caronaSelecionada.id!);
        updatedCarona = {
          ...caronaSelecionada,
          statusCorrida: StatusCorrida.CANCELADA,
        };
      }
      atualizarCaronaLocal(updatedCarona);
      toast.success(
        `Carona ${action === "cancelar" ? "cancelada" : action + "a"} com sucesso!`,
      );
      if (action !== "iniciar") setCaronaSelecionada(null); // Fecha o modal se a carona acabou
    } catch (error) {
      toast.error(`Erro ao ${action} carona.`);
      console.error(error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const renderCaronaCard = (carona: Carona) => (
    <Card
      key={carona.id}
      className="cursor-pointer hover:border-primary"
      onClick={() => setCaronaSelecionada(carona)}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="truncate">{carona.origem.endereco}</CardTitle>
          <Badge
            variant={
              carona.statusCorrida === "cancelada" ? "destructive" : "secondary"
            }
          >
            {carona.statusCorrida}
          </Badge>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="truncate">{carona.destino.endereco}</CardTitle>
      </CardHeader>
      <CardContent>
        {carona.dataHoraSaida
          .toDate()
          .toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Minhas Caronas</h1>
          <p className="text-muted-foreground">
            Gerencie suas caronas agendadas e seu histórico.
          </p>
        </div>
        <Button asChild>
          <Link to="/publicar-carona">
            <PlusCircle className="mr-2 h-4 w-4" />
            Publicar Carona
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="agendadas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="agendadas" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : caronasAgendadas.length > 0 ? (
              caronasAgendadas.map(renderCaronaCard)
            ) : (
              <p>Nenhuma carona agendada.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="em_andamento" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : caronasEmAndamento.length > 0 ? (
              caronasEmAndamento.map(renderCaronaCard)
            ) : (
              <p>Nenhuma carona em andamento.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : historicoCaronas.length > 0 ? (
              historicoCaronas.map(renderCaronaCard)
            ) : (
              <p>Nenhum histórico de caronas.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Gerenciamento */}
      <Dialog
        open={!!caronaSelecionada}
        onOpenChange={(isOpen) => !isOpen && setCaronaSelecionada(null)}
      >
        <DialogContent className="max-w-2xl">
          {caronaSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle>Gerenciar Carona</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Detalhes da carona */}
                <div>
                  <h3 className="font-semibold mb-2">
                    Participantes (
                    {
                      caronaSelecionada.participantes.filter(
                        (p) => p.status === "confirmado",
                      ).length
                    }
                    /
                    {caronaSelecionada.vagasDisponiveis +
                      caronaSelecionada.participantes.filter(
                        (p) => p.status === "confirmado",
                      ).length}
                    )
                  </h3>
                  <div className="space-y-2 rounded-md border p-2">
                    {caronaSelecionada.participantes.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma solicitação ainda.
                      </p>
                    )}
                    {caronaSelecionada.participantes.map((p) => (
                      <div
                        key={p.idUsuario}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="truncate">ID: {p.idUsuario}</span>
                        {p.status === StatusParticipacao.PENDENTE &&
                        caronaSelecionada.statusCorrida ===
                          StatusCorrida.AGENDADA ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() =>
                                handleGerenciar(
                                  p.idUsuario,
                                  StatusParticipacao.CONFIRMADO,
                                )
                              }
                              disabled={isModalLoading}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() =>
                                handleGerenciar(
                                  p.idUsuario,
                                  StatusParticipacao.RECUSADO,
                                )
                              }
                              disabled={isModalLoading}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            variant={
                              p.status === "confirmado"
                                ? "default"
                                : p.status === "recusado"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {p.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Ações da Carona */}
                <div>
                  <h3 className="font-semibold mb-2">Ações</h3>
                  <div className="flex gap-2">
                    {caronaSelecionada.statusCorrida ===
                      StatusCorrida.AGENDADA && (
                      <>
                        <Button
                          onClick={() => handleAction("iniciar")}
                          disabled={isModalLoading}
                          className="bg-green-600 hover:bg-green-700 w-full"
                        >
                          <Play className="mr-2 h-4 w-4" /> Iniciar Corrida
                        </Button>
                        <Button
                          onClick={() => handleAction("cancelar")}
                          disabled={isModalLoading}
                          variant="destructive"
                          className="w-full"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                      </>
                    )}
                    {caronaSelecionada.statusCorrida ===
                      StatusCorrida.EM_ANDAMENTO && (
                      <Button
                        onClick={() => handleAction("finalizar")}
                        disabled={isModalLoading}
                        className="w-full"
                      >
                        <Flag className="mr-2 h-4 w-4" /> Finalizar Corrida
                      </Button>
                    )}
                    {(caronaSelecionada.statusCorrida ===
                      StatusCorrida.FINALIZADA ||
                      caronaSelecionada.statusCorrida ===
                        StatusCorrida.CANCELADA) && (
                      <p className="text-sm text-muted-foreground">
                        Esta carona já foi concluída.
                      </p>
                    )}
                    {isModalLoading && (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
