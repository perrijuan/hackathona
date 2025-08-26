import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Carona,
  StatusCorrida,
  StatusParticipacao,
} from "@/models/carona.model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BellRing,
  UserCheck,
  UserX,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user } = useAuth();
  const [minhasCaronas, setMinhasCaronas] = useState<Carona[]>([]);
  const [caronasParticipando, setCaronasParticipando] = useState<Carona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const caronasAnteriores = useRef<Map<string, Carona>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Listener para o MOTORISTA
    const qMotorista = query(
      collection(db, "caronas"),
      where("idResponsavel", "==", user.uid)
    );
    const unsubMotorista = onSnapshot(qMotorista, (snapshot) => {
      const caronasData: Carona[] = [];
      snapshot.forEach((doc) =>
        caronasData.push({ id: doc.id, ...doc.data() } as Carona)
      );
      setMinhasCaronas(caronasData);

      snapshot.docChanges().forEach((change) => {
        const caronaNova = {
          id: change.doc.id,
          ...change.doc.data(),
        } as Carona;
        const caronaAntiga = caronasAnteriores.current.get(change.doc.id);

        if (change.type === "modified" && caronaAntiga) {
          const novoParticipante = caronaNova.participantes.find(
            (pNew) =>
              !caronaAntiga.participantes.some(
                (pOld) => pOld.idUsuario === pNew.idUsuario
              )
          );
          if (novoParticipante?.status === StatusParticipacao.PENDENTE) {
            toast("Nova solicitação de carona!", {
              description: `${novoParticipante.idUsuario} quer entrar na sua carona para ${caronaNova.destino.endereco}.`,
              icon: <BellRing className="h-5 w-5" />,
            });
          }
        }
        caronasAnteriores.current.set(change.doc.id, caronaNova);
      });
      setIsLoading(false);
    });

    // Listener para o PASSAGEIRO
    const qPassageiro = query(
      collection(db, "caronas"),
      where("participanteIds", "array-contains", user.uid)
    );
    const unsubPassageiro = onSnapshot(qPassageiro, (snapshot) => {
      const caronasData: Carona[] = [];
      snapshot.forEach((doc) =>
        caronasData.push({ id: doc.id, ...doc.data() } as Carona)
      );
      setCaronasParticipando(caronasData);

      snapshot.docChanges().forEach((change) => {
        const caronaNova = {
          id: change.doc.id,
          ...change.doc.data(),
        } as Carona;
        const caronaAntiga = caronasAnteriores.current.get(change.doc.id);

        if (change.type === "modified" && caronaAntiga) {
          const meuStatusNovo = caronaNova.participantes.find(
            (p) => p.idUsuario === user.uid
          )?.status;
          const meuStatusAntigo = caronaAntiga.participantes.find(
            (p) => p.idUsuario === user.uid
          )?.status;

          if (meuStatusAntigo === StatusParticipacao.PENDENTE) {
            if (meuStatusNovo === StatusParticipacao.CONFIRMADO) {
              toast.success("Você foi aceito na carona!", {
                description: `Sua participação na carona para ${caronaNova.destino.endereco} foi confirmada.`,
                icon: <UserCheck className="h-5 w-5" />,
              });
            } else if (meuStatusNovo === StatusParticipacao.RECUSADO) {
              toast.error("Solicitação recusada", {
                description: `Sua participação na carona para ${caronaNova.destino.endereco} foi recusada.`,
                icon: <UserX className="h-5 w-5" />,
              });
            }
          }

          if (caronaNova.statusCorrida !== caronaAntiga.statusCorrida) {
            switch (caronaNova.statusCorrida) {
              case StatusCorrida.EM_ANDAMENTO:
                toast.info("A viagem começou!", {
                  description: `A carona para ${caronaNova.destino.endereco} foi iniciada.`,
                  icon: <PlayCircle className="h-5 w-5" />,
                });
                break;
              case StatusCorrida.FINALIZADA:
                toast.success("Viagem finalizada!", {
                  description: `A carona para ${caronaNova.destino.endereco} foi concluída.`,
                  icon: <CheckCircle2 className="h-5 w-5" />,
                });
                break;
              case StatusCorrida.CANCELADA:
                toast.error("Viagem cancelada", {
                  description: `A carona para ${caronaNova.destino.endereco} foi cancelada pelo motorista.`,
                  icon: <XCircle className="h-5 w-5" />,
                });
                break;
            }
          }
        }
        caronasAnteriores.current.set(change.doc.id, caronaNova);
      });
    });

    return () => {
      unsubMotorista();
      unsubPassageiro();
    };
  }, [user]);

  const caronasAtivasMotorista = minhasCaronas.filter(
    (c) =>
      c.statusCorrida === StatusCorrida.AGENDADA ||
      c.statusCorrida === StatusCorrida.EM_ANDAMENTO
  );
  const caronasAtivasPassageiro = caronasParticipando.filter(
    (c) =>
      c.statusCorrida === StatusCorrida.AGENDADA ||
      c.statusCorrida === StatusCorrida.EM_ANDAMENTO
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Olá, {user?.displayName || user?.email}!
        </h1>
        <p className="text-muted-foreground">
          Aqui estão suas próximas viagens.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          {caronasAtivasMotorista.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Suas Próximas Caronas (Motorista)
              </h2>
              {caronasAtivasMotorista.map((carona) => (
                <Card key={carona.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        {carona.origem.endereco}{" "}
                        <ArrowRight className="inline mx-2 h-5 w-5" />{" "}
                        {carona.destino.endereco}
                      </span>
                      <Badge>{carona.statusCorrida}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {new Date(
                      carona.dataHoraSaida.seconds * 1000
                    ).toLocaleString("pt-BR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {caronasAtivasPassageiro.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Suas Próximas Caronas (Passageiro)
              </h2>
              {caronasAtivasPassageiro.map((carona) => (
                <Card key={carona.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        {carona.origem.endereco}{" "}
                        <ArrowRight className="inline mx-2 h-5 w-5" />{" "}
                        {carona.destino.endereco}
                      </span>
                      <Badge>
                        {
                          carona.participantes.find(
                            (p) => p.idUsuario === user?.uid
                          )?.status
                        }
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {new Date(
                      carona.dataHoraSaida.seconds * 1000
                    ).toLocaleString("pt-BR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {caronasAtivasMotorista.length === 0 &&
            caronasAtivasPassageiro.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">
                  Nenhuma viagem à vista!
                </h2>
                <p className="text-muted-foreground mt-2 mb-4">
                  Que tal planejar sua próxima carona?
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    {/* ATENÇÃO: Verifique se estas rotas existem no seu App.tsx */}
                    <Link to="/menu/find-ride">Procurar Carona</Link>
                  </Button>
                  <Button asChild variant="outline">
                    {/* ATENÇÃO: Verifique se estas rotas existem no seu App.tsx */}
                    <Link to="/menu/offer-ride">Oferecer Carona</Link>
                  </Button>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
