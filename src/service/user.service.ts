import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase"; // Importando apenas o 'db'

/**
 * Define a estrutura do endereço do usuário.
 */
interface Endereco {
  cep: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
}

/**
 * Define a estrutura completa do perfil do usuário no Firestore.
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  dre: string;
  curso: string;
  campus: string;
  photoURL?: string;
  telefone: string;
  identidade: string;
  endereco: Endereco;
  genero: string;
  pcd: boolean;
  pcdDescricao?: string;
  precisaAuxilio?: string;
  onlyWomenVehicle: boolean;
  createdAt: Timestamp;
}

// CORREÇÃO: Referência para a coleção 'users', conforme sua base de dados.
const usersCollection = collection(db, "users");

/**
 * Serviço encapsulado com as operações de banco de dados (Firestore).
 */
export const userService = {
  /**
   * Busca um perfil de usuário específico pelo seu ID (uid).
   * @param uid - O ID do usuário (vindo do Firebase Auth).
   * @returns O perfil do usuário ou null se não for encontrado.
   */
  async getUserById(uid: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(usersCollection, uid); // Usa a referência correta
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
      } else {
        console.warn("Nenhum usuário encontrado com o ID:", uid);
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      throw error;
    }
  },

  /**
   * Cria um novo documento de perfil para um usuário recém-registrado.
   * @param uid - O ID do usuário do Firebase Auth.
   * @param data - Dados iniciais do perfil.
   */
  async createUserProfile(
    uid: string,
    data: Omit<UserProfile, "uid" | "createdAt" | "photoURL">
  ): Promise<void> {
    try {
      const userDocRef = doc(usersCollection, uid); // Usa a referência correta
      await setDoc(userDocRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao criar perfil de usuário:", error);
      throw error;
    }
  },

  /**
   * Atualiza os dados do perfil de um usuário existente.
   * @param uid - O ID do usuário a ser atualizado.
   * @param data - Um objeto com os campos a serem atualizados.
   */
  async updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, "uid" | "createdAt">>
  ): Promise<void> {
    try {
      const userDocRef = doc(usersCollection, uid); // Usa a referência correta
      await updateDoc(userDocRef, data);
    } catch (error) {
      console.error("Erro ao atualizar perfil de usuário:", error);
      throw error;
    }
  },
};
