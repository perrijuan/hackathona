import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  StatusCorrida,
  StatusParticipacao,
  type Carona,
} from "@/models/carona.model";
import { useAuth } from "@/contexts/AuthContext";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  MessageSquare,
  MapPin,
} from "lucide-react";
import {
  cancelarCarona,
  finalizarCorrida,
  gerenciarSolicitacao,
  getCaronasByResponsavel,
  iniciarCorrida,
} from "@/service/carona.service";
import { userService, type UserProfile } from "@/service/user.service";

export default function MinhasCaronas() {
  const { user } = useAuth();
  const [caronas, setCaronas] = useState<Carona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [caronaSelecionada, setCaronaSelecionada] = useState<Carona | null>(
    null
  );

  const [perfisParticipantes, setPerfisParticipantes] = useState<
    Map<string, UserProfile>
  >(new Map());
  const [isLoadingPerfis, setIsLoadingPerfis] = useState(false);

  useEffect(() => {
    if (!caronaSelecionada) {
      setPerfisParticipantes(new Map());
      return;
    }

    const buscarPerfis = async () => {
      setIsLoadingPerfis(true);
      const idsParaBuscar = caronaSelecionada.participantes.map(
        (p) => p.idUsuario
      );
      const idsNaoCarregados = idsParaBuscar.filter(
        (id) => !perfisParticipantes.has(id)
      );

      if (idsNaoCarregados.length === 0) {
        setIsLoadingPerfis(false);
        return;
      }

      const promises = idsNaoCarregados.map((id) =>
        userService.getUserById(id)
      );

      try {
        const resultados = await Promise.all(promises);
        setPerfisParticipantes((prevMap) => {
          const newMap = new Map(prevMap);
          resultados.forEach((perfil) => {
            if (perfil) {
              newMap.set(perfil.uid, perfil);
            }
          });
          return newMap;
        });
      } catch (error) {
        toast.error("Erro ao carregar dados dos participantes.");
      } finally {
        setIsLoadingPerfis(false);
      }
    };

    buscarPerfis();
  }, [caronaSelecionada]);

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

  const caronasAgendadas = useMemo(
    () => caronas.filter((c) => c.statusCorrida === StatusCorrida.AGENDADA),
    [caronas]
  );
  const caronasEmAndamento = useMemo(
    () => caronas.filter((c) => c.statusCorrida === StatusCorrida.EM_ANDAMENTO),
    [caronas]
  );
  const historicoCaronas = useMemo(
    () =>
      caronas.filter(
        (c) =>
          c.statusCorrida === StatusCorrida.FINALIZADA ||
          c.statusCorrida === StatusCorrida.CANCELADA
      ),
    [caronas]
  );

  const atualizarCaronaLocal = (caronaAtualizada: Carona) => {
    setCaronas((prev) =>
      prev.map((c) => (c.id === caronaAtualizada.id ? caronaAtualizada : c))
    );
    setCaronaSelecionada(caronaAtualizada);
  };

  const handleGerenciar = async (
    idParticipante: string,
    status: StatusParticipacao
  ) => {
    if (!caronaSelecionada) return;
    setIsModalLoading(true);
    try {
      await gerenciarSolicitacao(caronaSelecionada.id!, idParticipante, status);
      const caronaAtualizada = {
        ...caronaSelecionada,
        participantes: caronaSelecionada.participantes.map((p) =>
          p.idUsuario === idParticipante ? { ...p, status } : p
        ),
      };
      atualizarCaronaLocal(caronaAtualizada);
      toast.success(
        `Participante ${status === "confirmado" ? "aceito" : "recusado"}.`
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
        `Carona ${
          action === "cancelar" ? "cancelada" : action + "a"
        } com sucesso!`
      );
      if (action !== "iniciar") setCaronaSelecionada(null);
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
      className="cursor-pointer hover:border-primary transition-colors"
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
        {new Date(carona.dataHoraSaida.seconds * 1000).toLocaleDateString(
          "pt-BR",
          { day: "2-digit", month: "long" }
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
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

      {/* Tabs */}
      <Tabs defaultValue="agendadas">
        <TabsList className="grid w-full grid-cols-3 gap-2">
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
              <p className="col-span-3 text-center text-muted-foreground py-8">
                Nenhuma carona agendada.
              </p>
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
              <p className="col-span-3 text-center text-muted-foreground py-8">
                Nenhuma carona em andamento.
              </p>
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
              <p className="col-span-3 text-center text-muted-foreground py-8">
                Nenhum histórico de caronas.
              </p>
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
                {/* Participantes */}
                <div>
                  <h3 className="font-semibold mb-2">Participantes</h3>
                  <div className="space-y-2 rounded-md border p-2 min-h-[60px]">
                    {isLoadingPerfis ? (
                      <div className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ) : caronaSelecionada.participantes.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">
                        Nenhuma solicitação ainda.
                      </p>
                    ) : (
                      caronaSelecionada.participantes.map((p) => {
                        const perfil = perfisParticipantes.get(p.idUsuario);
                        return (
                          <div
                            key={p.idUsuario}
                            className="flex justify-between items-center text-sm p-1"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={perfil?.photoURL || undefined}
                                />
                                <AvatarFallback>
                                  {perfil?.displayName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {perfil?.displayName || "Carregando..."}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {p.status === StatusParticipacao.CONFIRMADO &&
                                perfil?.telefone && (
                                  <Button
                                    asChild
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-green-600 hover:text-green-700"
                                  >
                                    <a
                                      href={`https://wa.me/55${perfil.telefone.replace(
                                        /\D/g,
                                        ""
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="Conversar no WhatsApp"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              {p.status === StatusParticipacao.PENDENTE &&
                              caronaSelecionada.statusCorrida ===
                                StatusCorrida.AGENDADA ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                                    onClick={() =>
                                      handleGerenciar(
                                        p.idUsuario,
                                        StatusParticipacao.CONFIRMADO
                                      )
                                    }
                                    disabled={isModalLoading}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() =>
                                      handleGerenciar(
                                        p.idUsuario,
                                        StatusParticipacao.RECUSADO
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
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-4 border-t">
                  <div className="flex flex-col gap-2">
                    {caronaSelecionada.statusCorrida ===
                      StatusCorrida.AGENDADA && (
                      <>
                        <Button
                          onClick={() => handleAction("iniciar")}
                          disabled={isModalLoading}
                          className="bg-green-600 hover:bg-green-700 w-full"
                        >
                          {isModalLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          Iniciar Corrida
                        </Button>
                        <Button
                          onClick={() => handleAction("cancelar")}
                          disabled={isModalLoading}
                          variant="destructive"
                          className="w-full"
                        >
                          {isModalLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Cancelar
                        </Button>
                      </>
                    )}
                    {caronaSelecionada.statusCorrida ===
                      StatusCorrida.EM_ANDAMENTO && (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleAction("finalizar")}
                          disabled={isModalLoading}
                          className="w-full"
                        >
                          {isModalLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Flag className="mr-2 h-4 w-4" />
                          )}
                          Finalizar Corrida
                        </Button>
                        {/* Botão Google Maps */}
                        <Button asChild variant="outline" className="w-full">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                              caronaSelecionada.origem.endereco
                            )}&destination=${encodeURIComponent(
                              caronaSelecionada.destino.endereco
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Abrir no Google Maps
                          </a>
                        </Button>
                        {/* Botão Waze (opcional) */}
                        <Button asChild variant="outline" className="w-full">
                          <a
                            href={`https://waze.com/ul?q=${encodeURIComponent(
                              caronaSelecionada.destino.endereco
                            )}&navigate=yes`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Abrir no Waze
                          </a>
                        </Button>
                      </div>
                    )}
                    {(caronaSelecionada.statusCorrida ===
                      StatusCorrida.FINALIZADA ||
                      caronaSelecionada.statusCorrida ===
                        StatusCorrida.CANCELADA) && (
                      <p className="text-sm text-center text-muted-foreground">
                        Esta carona já foi concluída.
                      </p>
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
