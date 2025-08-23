// pages/perfil.tsx
import { useEffect, useState } from "react";
import { authService } from "@/service/loginFirebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

type UserProfile = {
  displayName: string;
  email: string;
  dre: string;
  curso: string;
};

export default function Perfil() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: "",
    email: "",
    dre: "",
    curso: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();
  const db = getFirestore();

  // Carrega dados do Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          displayName: data.displayName || "",
          email: data.email || "",
          dre: data.dre || "",
          curso: data.curso || "",
        });
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [auth.currentUser, db]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    setError("");

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, userProfile, { merge: true });
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao salvar os dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex justify-center p-6">
      <div className=" p-8 rounded shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

        {error && <div className=" text-red-700 p-2 mb-4 rounded">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nome</label>
            <input
              type="text"
              value={userProfile.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">E-mail</label>
            <input
              type="email"
              value={userProfile.email}
              disabled
              className="w-full border px-3 py-2 rounded "
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">DRE</label>
            <input
              type="text"
              value={userProfile.dre}
              onChange={(e) => handleChange("dre", e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Curso</label>
            <input
              type="text"
              value={userProfile.curso}
              onChange={(e) => handleChange("curso", e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full  text-white py-2 rounded  transition"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-2  text-white py-2 rounded transition"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
