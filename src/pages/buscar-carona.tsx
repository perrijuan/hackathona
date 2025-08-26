import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// --- IMPORTS CORRIGIDOS E ADICIONADOS ---
import { type Carona, StatusParticipacao } from "@/models/carona.model";
import { type Veiculo } from "@/models/veiculo.model";
import {
  getCaronasPublicadas,
  solicitarEntrada,
} from "@/service/carona.service";
import { useDebounce } from "@/hooks/useDebounce";

// --- Componentes de UI ---
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRight,
  Calendar,
  Users,
  UserCheck,
  Clock,
  Ban,
  HelpCircle,
  Loader2,
  DollarSign,
  Info,
  Car,
  MessageSquare,
  MapPin,
  Flag,
  X,
} from "lucide-react";
import { userService, type UserProfile } from "@/service/user.service";
import { getVeiculoById } from "@/service/veiculo.service";
import GoogleMapsRoute from "@/components/google-maps-route";

// --- Subcomponente: Card da Carona ---
const CaronaCard = ({
  carona,
  onSelect,
}: {
  carona: Carona;
  onSelect: () => void;
}) => (
  <Card
    className="cursor-pointer hover:border-primary transition-all flex flex-col"
    onClick={onSelect}
  >
    <CardHeader>
      <CardTitle className="truncate text-base font-medium">
        {carona.origem.endereco}
      </CardTitle>
      <ArrowRight className="h-5 w-5 text-muted-foreground my-1" />
      <CardTitle className="truncate text-base font-medium">
        {carona.destino.endereco}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground mt-auto">
      <div className="flex items-center">
        <Calendar className="mr-2 h-4 w-4" />
        <span>
          {new Date(carona.dataHoraSaida.seconds * 1000).toLocaleString(
            "pt-BR",
            { dateStyle: "short", timeStyle: "short" }
          )}
        </span>
      </div>
      <div className="flex items-center">
        <Users className="mr-2 h-4 w-4" />
        <span>{carona.vagasDisponiveis} vagas restantes</span>
      </div>
    </CardContent>
  </Card>
);

// --- Subcomponente: Modal de Detalhes ---
const DetalhesCaronaModal = ({
  carona,
  user,
  isOpen,
  onClose,
}: {
  carona: Carona | null;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!carona) return null;

  const [motorista, setMotorista] = useState<UserProfile | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null); // <-- NOVO ESTADO PARA O VEÍCULO
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participacaoStatus, setParticipacaoStatus] = useState(
    carona.participantes.find((p) => p.idUsuario === user?.uid)?.status
  );

  // <-- LÓGICA CORRIGIDA PARA BUSCAR VEÍCULO E MOTORISTA ---
  useEffect(() => {
    if (carona) {
      const buscarDetalhes = async () => {
        setIsLoadingDetails(true);
        try {
          const [perfilMotorista, dadosVeiculo] = await Promise.all([
            userService.getUserById(carona.idResponsavel),
            getVeiculoById(carona.idVeiculo),
          ]);
          setMotorista(perfilMotorista);
          setVeiculo(dadosVeiculo);
        } catch (error) {
          toast.error("Não foi possível carregar todos os detalhes da carona.");
        } finally {
          setIsLoadingDetails(false);
        }
      };
      buscarDetalhes();
    }
  }, [carona]);

  const handleSolicitar = async () => {
    if (!user || !carona) return;
    setIsSubmitting(true);
    try {
      await solicitarEntrada(carona.id!, user.uid);
      toast.success("Solicitação enviada com sucesso!");
      setParticipacaoStatus(StatusParticipacao.PENDENTE);
    } catch (error: any) {
      toast.error("Erro ao enviar solicitação.", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const botaoStatus = useMemo(() => {
    if (!user)
      return { text: "Faça login para participar", disabled: true, icon: Ban };
    if (carona.idResponsavel === user.uid)
      return { text: "Você é o responsável", disabled: true, icon: UserCheck };
    if (participacaoStatus) {
      const statusMap = {
        [StatusParticipacao.PENDENTE]: {
          text: "Solicitação Pendente",
          disabled: true,
          icon: Clock,
        },
        [StatusParticipacao.CONFIRMADO]: {
          text: "Participação Confirmada",
          disabled: true,
          icon: UserCheck,
        },
        [StatusParticipacao.RECUSADO]: {
          text: "Solicitação Recusada",
          disabled: true,
          icon: Ban,
        },
      };
      return statusMap[participacaoStatus];
    }
    if (carona.vagasDisponiveis <= 0)
      return { text: "Carona sem vagas", disabled: true, icon: Ban };
    return {
      text: "Solicitar Participação",
      disabled: false,
      icon: HelpCircle,
      action: handleSolicitar,
    };
  }, [carona, user, participacaoStatus]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Carona</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {isLoadingDetails ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={motorista?.photoURL} />
                  <AvatarFallback>
                    {motorista?.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground -mb-1">
                    Motorista
                  </p>
                  <p className="font-semibold">{motorista?.displayName}</p>
                </div>
              </div>
              {motorista?.telefone && (
                <Button
                  asChild
                  size="icon"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <a
                    href={`https://wa.me/55${motorista.telefone.replace(
                      /\D/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex items-start">
              <MapPin className="mr-3 mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold">Origem:</span>
              <span className="ml-2 truncate">{carona.origem.endereco}</span>
            </div>
            <div className="flex items-start">
              <Flag className="mr-3 mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold">Destino:</span>
              <span className="ml-2 truncate">{carona.destino.endereco}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Data:</span>
              <span className="ml-2">
                {new Date(
                  carona.dataHoraSaida.seconds * 1000
                ).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Saída:</span>
              <span className="ml-2">
                {new Date(
                  carona.dataHoraSaida.seconds * 1000
                ).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Vagas:</span>
              <span className="ml-2">{carona.vagasDisponiveis} restantes</span>
            </div>
            {carona.precoPorPessoa != null && (
              <div className="flex items-center">
                <DollarSign className="mr-3 h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">Valor:</span>
                <span className="ml-2">
                  R$ {carona.precoPorPessoa.toFixed(2).replace(".", ",")} por
                  pessoa
                </span>
              </div>
            )}

            {/* --- EXIBIÇÃO CORRETA DOS DADOS DO VEÍCULO --- */}
            {isLoadingDetails ? (
              <Skeleton className="h-5 w-full" />
            ) : (
              veiculo && (
                <div className="flex items-center">
                  <Car className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Veículo:</span>
                  <span className="ml-2">
                    {veiculo.marca} {veiculo.modelo} ({veiculo.cor})
                  </span>
                </div>
              )
            )}

            {carona.observacoes && (
              <div className="flex items-start">
                <Info className="mr-3 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-semibold">Observações:</span>{" "}
                  {carona.observacoes}
                </div>
              </div>
            )}
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Ver Rota no Mapa</AccordionTrigger>
              <AccordionContent>
                <GoogleMapsRoute
                  origin={carona.origem.endereco}
                  destination={carona.destino.endereco}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter>
          {botaoStatus && (
            <Button
              type="button"
              className="w-full"
              disabled={botaoStatus.disabled || isSubmitting}
              onClick={botaoStatus.action}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <botaoStatus.icon className="mr-2 h-4 w-4" />
              )}
              {botaoStatus.text}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Componente Principal ---
export default function BuscarCaronas() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [todasCaronas, setTodasCaronas] = useState<Carona[]>([]);
  const [caronaSelecionada, setCaronaSelecionada] = useState<Carona | null>(
    null
  );
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [filtroDestino, setFiltroDestino] = useState("");
  const debouncedOrigem = useDebounce(filtroOrigem, 300);
  const debouncedDestino = useDebounce(filtroDestino, 300);

  useEffect(() => {
    const buscarDados = async () => {
      setIsLoading(true);
      try {
        const caronas = await getCaronasPublicadas();
        setTodasCaronas(caronas);
      } catch (error) {
        toast.error("Não foi possível carregar as caronas.");
      } finally {
        setIsLoading(false);
      }
    };
    buscarDados();
  }, []);

  const caronasFiltradas = useMemo(() => {
    if (!debouncedOrigem && !debouncedDestino) return todasCaronas;
    return todasCaronas.filter((carona) => {
      const matchOrigem = debouncedOrigem
        ? carona.origem.endereco
            .toLowerCase()
            .includes(debouncedOrigem.toLowerCase())
        : true;
      const matchDestino = debouncedDestino
        ? carona.destino.endereco
            .toLowerCase()
            .includes(debouncedDestino.toLowerCase())
        : true;
      return matchOrigem && matchDestino;
    });
  }, [todasCaronas, debouncedOrigem, debouncedDestino]);

  const limparFiltros = () => {
    setFiltroOrigem("");
    setFiltroDestino("");
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
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
            <Button onClick={limparFiltros} variant="ghost">
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Caronas Disponíveis</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : caronasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caronasFiltradas.map((carona) => (
              <CaronaCard
                key={carona.id}
                carona={carona}
                onSelect={() => setCaronaSelecionada(carona)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma carona disponível encontrada com esses filtros.
          </p>
        )}
      </div>
      <DetalhesCaronaModal
        carona={caronaSelecionada}
        user={user}
        isOpen={!!caronaSelecionada}
        onClose={() => setCaronaSelecionada(null)}
      />
    </div>
  );
}
