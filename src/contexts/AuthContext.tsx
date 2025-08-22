import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/config/firebase"; // Verifique se o caminho está correto

// Define a interface para o valor do contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Cria o contexto com um valor inicial
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Cria o provedor do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é um listener do Firebase que observa mudanças no estado de login
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
  };

  // Se ainda estiver carregando, não renderiza o app para evitar piscar a tela de login
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
