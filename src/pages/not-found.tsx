import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Car className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Move</h1>
      </div>
      <h2 className="text-5xl font-extrabold text-muted-foreground">404</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Ops! Página não encontrada 🚧
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Parece que você tentou estacionar em um endereço que não existe.
      </p>
      <Button asChild>
        <Link to="/home">Voltar para o Menu</Link>
      </Button>
    </div>
  );
}
