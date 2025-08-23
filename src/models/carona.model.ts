import { Timestamp } from "firebase/firestore";

// Enum para o status da solicitação de um participante
export enum StatusParticipacao {
  PENDENTE = "pendente",
  CONFIRMADO = "confirmado",
  RECUSADO = "recusado",
}

// Enum para o status geral da carona
export enum StatusCorrida {
  AGENDADA = "agendada",
  EM_ANDAMENTO = "em_andamento",
  FINALIZADA = "finalizada",
  CANCELADA = "cancelada",
}

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

  dataHoraSaida: Timestamp; // Usar o Timestamp do Firebase para facilitar queries
  vagasDisponiveis: number;
  precoPorPessoa?: number;

  // Array para armazenar quem pediu para entrar e o status
  participantes: Participante[];

  statusCorrida: StatusCorrida;
  observacoes?: string;
}
