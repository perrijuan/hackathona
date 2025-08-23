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

// Criar um novo veículo
export const createVeiculo = async (
  veiculo: Omit<Veiculo, "id">,
): Promise<DocumentReference> => {
  return await addDoc(veiculosCollection, veiculo);
};

// Obter um veículo pelo seu ID
export const getVeiculoById = async (id: string): Promise<Veiculo | null> => {
  const docRef = doc(db, "veiculos", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Veiculo;
  }
  return null;
};

// Obter todos os veículos de um usuário específico
export const getVeiculosByUsuario = async (
  idUsuario: string,
): Promise<Veiculo[]> => {
  const q = query(veiculosCollection, where("idUsuario", "==", idUsuario));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Veiculo,
  );
};

// Atualizar dados de um veículo
export const updateVeiculo = async (
  id: string,
  veiculoData: Partial<Veiculo>,
): Promise<void> => {
  const docRef = doc(db, "veiculos", id);
  await updateDoc(docRef, veiculoData);
};

// Apagar um veículo
export const deleteVeiculo = async (id: string): Promise<void> => {
  const docRef = doc(db, "veiculos", id);
  await deleteDoc(docRef);
};
