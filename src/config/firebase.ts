// Importe as funções que você precisa dos SDKs que você precisa
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// A configuração do Firebase é preenchida com variáveis de ambiente do Vite.
// Apenas variáveis com o prefixo VITE_ são expostas no lado do cliente.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
// A inicialização do Analytics é opcional e pode ser removida se não for usada.
const analytics = getAnalytics(app);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
