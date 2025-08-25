"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { type Carona } from "../models/carona.model";
import { db } from "@/config/firebase";
import { Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoricoCaronas() {
  const [caronas, setCaronas] = useState<Carona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaronas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "caronas"));
        const lista: Carona[] = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() } as Carona);
        });
        setCaronas(lista);
      } catch (error) {
        console.error("Erro ao buscar caronas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaronas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Timer />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1>Histórico de Caronas</h1>
      {caronas.length === 0 ? (
        <span>Nenhuma carona encontrada.</span>
      ) : (
        caronas.map((carona) => (
          <Card key={carona.id}>
            <CardContent>
              <p>
                {carona.origem.endereco} → {carona.destino.endereco}
              </p>
              <p>
                Data:{" "}
                {carona.dataHoraSaida &&
                  new Date(carona.dataHoraSaida.seconds * 1000).toLocaleString(
                    "pt-BR"
                  )}
              </p>
              <p>Responsável: {carona.idResponsavel}</p>
              <p>Vagas disponíveis: {carona.vagasDisponiveis}</p>
              <p>Status: {carona.statusCorrida}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
