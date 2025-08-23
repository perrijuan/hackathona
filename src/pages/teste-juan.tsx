import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TesteJuan() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const openMapsRoute = () => {
    if (!origin || !destination) return alert("Preencha origem e destino!");
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(
      origin
    )}/${encodeURIComponent(destination)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Rota no Maps</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Origem</label>
        <Input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Digite a origem"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Destino</label>
        <Input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Digite o destino"
        />
      </div>

      <Button onClick={openMapsRoute}>Abrir no Google Maps</Button>

      {/* Embed sem API Key */}
      {origin && destination && (
        <iframe
          title="Rota Google Maps"
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            origin
          )}+to+${encodeURIComponent(destination)}&output=embed`}
        ></iframe>
      )}
    </div>
  );
}
