import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoIcon, Github, MessageCircle, ExternalLink } from "lucide-react";

export function InfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
        <InfoIcon className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              Informações Gerais
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">O que é o Move?</h4>
              <p className="text-sm text-muted-foreground">
                O Move é um aplicativo web que foi desenvolvido para ajudar
                pessoas que buscam um transporte público de forma eficiente e
                segura.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-amber-700">
                Feito para o Hackatona da Mob 4.0
              </h4>
              <p className="text-sm text-muted-foreground">
                Este projeto foi idealizado para participar do Hackathon...
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Entre em contato</h4>
              <div className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <a
                    href="https://github.com/claudio-asj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    GitHub: @claudio-asj
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <a
                    href="https://wa.me/5521979317341"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp: (21) 97931-7341
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                Desenvolvido com ❤️ por{" "}
                <span className="font-mono font-semibold text-purple-800 text-lg">
                  import pandas
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
