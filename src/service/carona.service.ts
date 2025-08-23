import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  arrayUnion,
  DocumentReference,
  orderBy,
  runTransaction, // <-- CORREÇÃO: Import que estava faltando
} from "firebase/firestore";
import {
  StatusCorrida,
  StatusParticipacao,
  type Carona,
  type Participante,
} from "../models/carona.model";
import { db } from "@/config/firebase";

const caronasCollection = collection(db, "caronas");

// 1. PUBLICAR UMA NOVA CARONA
export const criarCarona = async (
  caronaData: Omit<Carona, "id" | "statusCorrida" | "participantes">,
): Promise<DocumentReference> => {
  const novaCarona: Omit<Carona, "id"> = {
    ...caronaData,
    statusCorrida: StatusCorrida.AGENDADA,
    participantes: [],
  };
  return await addDoc(caronasCollection, novaCarona);
};

// 2. EDITAR UMA CARONA EXISTENTE
export const editarCarona = async (
  idCarona: string,
  caronaData: Partial<Omit<Carona, "id" | "idResponsavel">>,
): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);
  await updateDoc(caronaRef, caronaData);
};

// 3. BUSCAR CARONAS DISPONÍVEIS (AGENDADAS E NO FUTURO)
export const getCaronasPublicadas = async (): Promise<Carona[]> => {
  const agora = Timestamp.now();
  const q = query(
    caronasCollection,
    where("statusCorrida", "==", StatusCorrida.AGENDADA),
    where("dataHoraSaida", ">", agora),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Carona,
  );
};

// 4. BUSCAR UMA CARONA ESPECÍFICA
export const getCaronaById = async (id: string): Promise<Carona | null> => {
  const docRef = doc(db, "caronas", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Carona;
  }
  return null;
};

// 5. USUÁRIO PEDE PARA ENTRAR NA CARONA
export const solicitarEntrada = async (
  idCarona: string,
  idUsuario: string,
): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);
  const caronaSnap = await getDoc(caronaRef);

  if (caronaSnap.exists()) {
    const carona = caronaSnap.data() as Carona;
    const jaParticipa = carona.participantes.some(
      (p) => p.idUsuario === idUsuario,
    );
    if (jaParticipa) {
      throw new Error("Você já solicitou participação nesta carona.");
    }
  }

  const novoParticipante: Participante = {
    idUsuario: idUsuario,
    status: StatusParticipacao.PENDENTE,
  };
  await updateDoc(caronaRef, {
    participantes: arrayUnion(novoParticipante),
  });
};

// 6. RESPONSÁVEL ACEITA OU RECUSA UMA SOLICITAÇÃO (VERSÃO CORRETA E SEGURA COM TRANSAÇÃO)
// CORREÇÃO: Removida a versão antiga e duplicada desta função.
export const gerenciarSolicitacao = async (
  idCarona: string,
  idParticipante: string,
  novoStatus: StatusParticipacao.CONFIRMADO | StatusParticipacao.RECUSADO,
): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);

  await runTransaction(db, async (transaction) => {
    // 1. Lê os dados DENTRO da transação para garantir que estão atualizados
    const caronaSnap = await transaction.get(caronaRef);
    if (!caronaSnap.exists()) {
      throw new Error("Carona não encontrada!");
    }

    const carona = caronaSnap.data() as Carona;
    let vagasDisponiveis = carona.vagasDisponiveis;

    // 2. Prepara as alterações
    if (novoStatus === StatusParticipacao.CONFIRMADO) {
      if (vagasDisponiveis <= 0) {
        throw new Error("Não há vagas disponíveis.");
      }
      vagasDisponiveis--; // Decrementa as vagas de forma segura
    }

    const participantesAtualizados = carona.participantes.map((p) => {
      if (p.idUsuario === idParticipante) {
        return { ...p, status: novoStatus };
      }
      return p;
    });

    // 3. Escreve as alterações DENTRO da transação
    transaction.update(caronaRef, {
      participantes: participantesAtualizados,
      vagasDisponiveis: vagasDisponiveis,
    });
  });
};

// 7. INICIAR A CORRIDA
export const iniciarCorrida = async (idCarona: string): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);
  await updateDoc(caronaRef, { statusCorrida: StatusCorrida.EM_ANDAMENTO });
};

// 8. FINALIZAR A CORRIDA
export const finalizarCorrida = async (idCarona: string): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);
  await updateDoc(caronaRef, { statusCorrida: StatusCorrida.FINALIZADA });
};

// 9. CANCELAR UMA CARONA
export const cancelarCarona = async (idCarona: string): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);
  await updateDoc(caronaRef, { statusCorrida: StatusCorrida.CANCELADA });
};

// 10. BUSCAR CARONAS CRIADAS POR UM USUÁRIO
export const getCaronasByResponsavel = async (
  idResponsavel: string,
): Promise<Carona[]> => {
  const q = query(
    caronasCollection,
    where("idResponsavel", "==", idResponsavel),
    orderBy("dataHoraSaida", "desc"),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Carona,
  );
};
