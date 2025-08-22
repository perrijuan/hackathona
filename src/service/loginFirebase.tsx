// service/loginFirebase.ts
import { app } from "@/config/firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

class AuthService {
  private auth: Auth;
  private db: Firestore;

  constructor() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
  }

  /**
   * Cria um documento para o usuário no Firestore se ele ainda não existir.
   * Essencial para armazenar dados adicionais do usuário.
   * @param user - O objeto User do Firebase Authentication.
   */
  private async criarUsuarioNoFirestoreSeNaoExistir(user: User): Promise<void> {
    const userDocRef = doc(this.db, "users", user.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao verificar/criar usuário no Firestore:", error);
      // Não lançamos o erro aqui para não interromper o fluxo de login
    }
  }

  /**
   * Realiza o login de um usuário com e-mail e senha.
   * @returns O objeto do usuário autenticado.
   */
  async loginComEmailESenha(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // Garante que o usuário existe no Firestore
      await this.criarUsuarioNoFirestoreSeNaoExistir(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        throw new Error(
          "E-mail ou senha inválidos. Verifique suas credenciais."
        );
      }
      throw new Error("Ocorreu um problema ao tentar fazer o login.");
    }
  }

  /**
   * Realiza o login de um usuário utilizando o provedor do Google.
   * @returns O objeto do usuário autenticado.
   */
  async loginComGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      // Garante que o usuário existe no Firestore
      await this.criarUsuarioNoFirestoreSeNaoExistir(result.user);
      return result.user;
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("A janela de login com Google foi fechada.");
      }
      throw new Error("Ocorreu um problema com o login do Google.");
    }
  }

  /**
   * Cria uma nova conta com e-mail e senha.
   * @returns O objeto do usuário criado.
   */
  async criarContaComEmailESenha(
    email: string,
    password: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      // Cria o usuário no Firestore imediatamente após o registro
      await this.criarUsuarioNoFirestoreSeNaoExistir(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Este e-mail já está em uso por outra conta.");
      }
      if (error.code === "auth/weak-password") {
        throw new Error("A senha é muito fraca. Use pelo menos 6 caracteres.");
      }
      throw new Error("Ocorreu um problema ao criar a conta.");
    }
  }

  /**
   * Envia um e-mail para redefinição de senha.
   */
  async redefinirSenha(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new Error("Não foi encontrada nenhuma conta com este e-mail.");
      }
      throw new Error("Ocorreu um problema ao tentar redefinir a senha.");
    }
  }

  /**
   * Desconecta o usuário atualmente logado.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw new Error("Não foi possível sair. Tente novamente.");
    }
  }
}

// Exporta uma instância única do serviço (Singleton Pattern)
export const authService = new AuthService();
