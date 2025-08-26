import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentReference,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Veiculo } from "@/models/veiculo.model";

const veiculosCollection = collection(db, "veiculos");

/**
 * Cria um novo veículo para um usuário.
 * @param veiculo - Dados do veículo, sem o ID.
 * @returns A referência do documento recém-criado.
 */
export const createVeiculo = async (
  veiculo: Omit<Veiculo, "id">
): Promise<DocumentReference> => {
  return await addDoc(veiculosCollection, veiculo);
};

/**
 * Busca um veículo específico pelo seu ID de documento.
 * @param id - O ID do veículo.
 * @returns O objeto do veículo ou null se não encontrado.
 */
export async function getVeiculoById(id: string): Promise<Veiculo | null> {
  try {
    const veiculoDocRef = doc(veiculosCollection, id);
    const docSnap = await getDoc(veiculoDocRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Veiculo;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar veículo por ID:", error);
    throw error;
  }
}

/**
 * Busca todos os veículos de um usuário específico.
 * @param idUsuario - O UID do usuário.
 * @returns Uma lista com os veículos do usuário.
 */
export const getVeiculosByUsuario = async (
  idUsuario: string
): Promise<Veiculo[]> => {
  const q = query(veiculosCollection, where("idUsuario", "==", idUsuario));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Veiculo)
  );
};

/**
 * Atualiza os dados de um veículo existente.
 * @param id - O ID do veículo a ser atualizado.
 * @param veiculoData - Os campos do veículo a serem modificados.
 */
export const updateVeiculo = async (
  id: string,
  veiculoData: Partial<Veiculo>
): Promise<void> => {
  const docRef = doc(db, "veiculos", id);
  await updateDoc(docRef, veiculoData);
};

/**
 * Apaga um veículo do banco de dados.
 * @param id - O ID do veículo a ser apagado.
 */
export const deleteVeiculo = async (id: string): Promise<void> => {
  const docRef = doc(db, "veiculos", id);
  await deleteDoc(docRef);
};
