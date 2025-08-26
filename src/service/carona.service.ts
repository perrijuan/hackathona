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
  runTransaction,
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
  caronaData: Omit<Carona, "id" | "statusCorrida" | "participantes">
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
  caronaData: Partial<Omit<Carona, "id" | "idResponsavel">>
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
    orderBy("dataHoraSaida", "asc") // Ordena as mais próximas primeiro
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Carona)
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
  idUsuario: string
): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);

  // Usamos transação para garantir a checagem e a escrita de forma atômica
  await runTransaction(db, async (transaction) => {
    const caronaSnap = await transaction.get(caronaRef);
    if (!caronaSnap.exists()) {
      throw new Error("Esta carona não existe mais.");
    }

    const carona = caronaSnap.data() as Carona;
    const jaParticipa = carona.participantes.some(
      (p) => p.idUsuario === idUsuario
    );
    if (jaParticipa) {
      throw new Error("Você já solicitou participação nesta carona.");
    }
    if (carona.vagasDisponiveis <= 0) {
      throw new Error("Desculpe, não há mais vagas nesta carona.");
    }

    const novoParticipante: Participante = {
      idUsuario: idUsuario,
      status: StatusParticipacao.PENDENTE,
    };

    transaction.update(caronaRef, {
      participantes: arrayUnion(novoParticipante),
    });
  });
};

// 6. RESPONSÁVEL ACEITA OU RECUSA UMA SOLICITAÇÃO
export const gerenciarSolicitacao = async (
  idCarona: string,
  idParticipante: string,
  novoStatus: StatusParticipacao
): Promise<void> => {
  const caronaRef = doc(db, "caronas", idCarona);

  await runTransaction(db, async (transaction) => {
    const caronaSnap = await transaction.get(caronaRef);
    if (!caronaSnap.exists()) {
      throw new Error("Carona não encontrada!");
    }

    const carona = caronaSnap.data() as Carona;
    let vagasDisponiveis = carona.vagasDisponiveis;
    const participanteAtual = carona.participantes.find(
      (p) => p.idUsuario === idParticipante
    );

    // Só faz sentido gerenciar quem está pendente
    if (participanteAtual?.status !== StatusParticipacao.PENDENTE) {
      throw new Error("Esta solicitação já foi gerenciada.");
    }

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

// 10. BUSCAR CARONAS CRIADAS POR UM USUÁRIO (Minhas Caronas)
export const getCaronasByResponsavel = async (
  idResponsavel: string
): Promise<Carona[]> => {
  const q = query(
    caronasCollection,
    where("idResponsavel", "==", idResponsavel),
    orderBy("dataHoraSaida", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Carona)
  );
};

// 11. BUSCAR CARONAS QUE O USUÁRIO PARTICIPA (Histórico/Próximas Viagens)
export const getCaronasComoPassageiro = async (
  idUsuario: string
): Promise<Carona[]> => {
  // Firestore não permite queries 'array-contains' com múltiplos 'where' complexos.
  // A solução é buscar por ID de participante e filtrar no cliente.
  const q = query(
    caronasCollection,
    where("participantesIds", "array-contains", idUsuario), // Assumindo que você tenha um campo 'participantesIds' para otimizar a busca
    orderBy("dataHoraSaida", "desc")
  );

  const querySnapshot = await getDocs(q);

  // Filtra para retornar apenas as caronas onde o usuário está confirmado
  return querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Carona))
    .filter((carona) =>
      carona.participantes.some(
        (p) =>
          p.idUsuario === idUsuario &&
          p.status === StatusParticipacao.CONFIRMADO
      )
    );
};
