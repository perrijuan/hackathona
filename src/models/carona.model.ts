import { Timestamp } from "firebase/firestore";

// Status da solicitação de participação (substituindo enum)
export const StatusParticipacao = {
  PENDENTE: "pendente",
  CONFIRMADO: "confirmado",
  RECUSADO: "recusado",
} as const;

export type StatusParticipacao =
  (typeof StatusParticipacao)[keyof typeof StatusParticipacao];

// Status geral da carona (substituindo enum)
export const StatusCorrida = {
  AGENDADA: "agendada",
  EM_ANDAMENTO: "em_andamento",
  FINALIZADA: "finalizada",
  CANCELADA: "cancelada",
} as const;

export type StatusCorrida = (typeof StatusCorrida)[keyof typeof StatusCorrida];

// Interface para representar um ponto geográfico
export interface Localizacao {
  endereco: string;
  latitude: number;
  longitude: number;
}

// Interface para um participante na carona
export interface Participante {
  idUsuario: string;
  status: StatusParticipacao;
}

// Interface principal da Carona
export interface Carona {
  id?: string; // ID do documento no Firestore
  idResponsavel: string; // ID do usuário que criou a carona
  idVeiculo: string;

  origem: Localizacao;
  destino: Localizacao;

  dataHoraSaida: Timestamp; // Usar o Timestamp do Firebase
  vagasDisponiveis: number;
  precoPorPessoa?: number;

  participantes: Participante[];

  statusCorrida: StatusCorrida;
  observacoes?: string;
}
