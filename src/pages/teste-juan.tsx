
import { useState, useMemo } from "react";
import { MapPin, Navigation, Search, Loader2, ChevronLeft, ChevronRight, Route, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Gera a URL de embed "sem API" para mostrar algo no iframe.
 * Estratégias:
 * 1. Se tiver origem e destino -> tenta busca "origem to destino"
 * 2. Se tiver só destino -> mostra destino
 * 3. Se tiver só origem -> mostra origem
 */
function buildEmbedUrl(origin: string, destination: string) {
    const base = "https://www.google.com/maps";
    const hasO = origin.trim().length > 0;
    const hasD = destination.trim().length > 0;

    if (hasO && hasD) {
        // Tentativa de mostrar rota via busca
        return `${base}?q=${encodeURIComponent(origin)}+to+${encodeURIComponent(destination)}&output=embed`;
    }
    if (hasD) {
        return `${base}?q=${encodeURIComponent(destination)}&output=embed`;
    }
    if (hasO) {
        return `${base}?q=${encodeURIComponent(origin)}&output=embed`;
    }
    // Fallback: centro genérico (ex: Brasil)
    return `${base}/embed?pb=!1m18!1m12!1m3!1d25190572.61376077!2d-60.29878635!3d-13.66553355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93aa35a21b11f7bf%3A0x24f645fba09294dd!2sBrasil!5e0!3m2!1spt-BR!2sbr!4v0000000000000`;
}

export default function MapsPage() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isLoadingOpen, setIsLoadingOpen] = useState(false);
    const [showEmbeddedMap, setShowEmbeddedMap] = useState(true);
    const [panelCollapsed, setPanelCollapsed] = useState(false);

    const validateInputs = () => {
        if (!origin.trim()) {
            toast.error("Por favor, preencha o campo de origem");
            return false;
        }
        if (!destination.trim()) {
            toast.error("Por favor, preencha o campo de destino");
            return false;
        }
        return true;
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocalização não suportada");
            return;
        }
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(r => r.json())
                    .then(data => {
                        const address = data.display_name || `${latitude}, ${longitude}`;
                        setOrigin(address);
                        toast.success("Localização atual detectada!");
                    })
                    .catch(() => {
                        setOrigin(`${latitude}, ${longitude}`);
                        toast.warning("Endereço não resolvido, usando coordenadas.");
                    })
                    .finally(() => setIsGettingLocation(false));
            },
            (error) => {
                setIsGettingLocation(false);
                toast.error("Erro ao obter localização: " + error.message);
            }
        );
    };

    const openMapsRoute = () => {
        if (!validateInputs()) return;
        setIsLoadingOpen(true);
        try {
            const url = `https://www.google.com/maps/dir/${encodeURIComponent(origin.trim())}/${encodeURIComponent(destination.trim())}`;
            window.open(url, "_blank");
            toast.success("Rota aberta em nova aba");
        } catch {
            toast.error("Erro ao abrir rota");
        } finally {
            setIsLoadingOpen(false);
        }
    };

    const clearAll = () => {
        setOrigin("");
        setDestination("");
        toast.info("Campos limpos");
    };

    const embedUrl = useMemo(
        () => buildEmbedUrl(origin, destination),
        [origin, destination]
    );

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
            {/* Painel Lateral */}
            <aside
                className={`h-full flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 ${
                    panelCollapsed ? "w-12" : "w-80"
                }`}
            >
                {/* Topo / Botão collapse */}
                <div className="flex items-center justify-between px-2 py-2 border-b border-gray-800">
                    <button
                        onClick={() => setPanelCollapsed(c => !c)}
                        className="p-2 rounded hover:bg-gray-800 text-gray-300"
                        title={panelCollapsed ? "Expandir" : "Recolher"}
                    >
                        {panelCollapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    {!panelCollapsed && (
                        <h1 className="text-sm font-semibold tracking-wide uppercase text-gray-300 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-amber-900" /> Rotas
                        </h1>
                    )}
                </div>

                {!panelCollapsed && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Pesquisa “genérica” (placeholder para futuro) */}
                        <div>
                            <label className="text-xs font-medium text-gray-400">Pesquisa Geral</label>
                            <div className="relative mt-1">
                                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Buscar locais (sem API real)"
                                    className="pl-8 bg-gray-800 border-gray-700 focus:border-amber-900 focus:ring-amber-900 text-sm"

                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-400">Origem</label>
                                <Input
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    placeholder="Digite ou use localização atual"
                                    className="mt-1 bg-gray-800 border-gray-700 focus:border-amber-900 focus:ring-amber-900 text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isGettingLocation}
                                    onClick={getCurrentLocation}
                                    className="mt-1 w-full border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                                >
                                    {isGettingLocation
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Navigation className="w-4 h-4 mr-1" />
                                    }
                                    {isGettingLocation ? "Localizando..." : "Usar localização atual"}
                                </Button>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-400">Destino</label>
                                <Input
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Digite o destino"
                                    className="mt-1 bg-gray-800 border-gray-700 focus:border-amber-900 focus:ring-amber-900 text-sm"
                                />
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                onClick={openMapsRoute}
                                disabled={isLoadingOpen || !origin.trim() || !destination.trim()}
                                className="bg-amber-950 hover:bg-amber-950 text-white text-sm flex items-center gap-2 justify-center"
                            >
                                <Route className="w-4 h-4" />
                                {isLoadingOpen ? "Abrindo..." : "Abrir Rota em Nova Aba"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setShowEmbeddedMap(s => !s)}
                                className="border-amber-900 text-amber-800 hover:bg-orange-600/10 text-sm"
                                disabled={!origin && !destination}
                            >
                                {showEmbeddedMap ? "Esconder Mapa Integrado" : "Mostrar Mapa Integrado"}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={clearAll}
                                className="text-gray-300 hover:text-white hover:bg-gray-800 text-sm flex items-center gap-1 justify-center"
                            >
                                <Trash2 className="w-4 h-4" /> Limpar
                            </Button>
                        </div>

                        {/* “Resultados” / lista dummy */}
                        <div>
                            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Resultados</h2>
                            <div className="space-y-2 text-sm">
                                <div className="p-2 rounded bg-gray-800/60 text-gray-300">Exemplo de Item</div>
                                <div className="p-2 rounded bg-gray-800/60 text-gray-300">Favorito / Histórico</div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500 pt-2 border-t border-gray-800">
                            Modo sem API: o iframe busca por “origem to destino”. A renderização da linha pode variar.
                        </p>
                    </div>
                )}
            </aside>

            {/* Área do Mapa */}
            <div className="flex-1 relative bg-gray-800">
                {showEmbeddedMap ? (
                    <iframe
                        key={embedUrl} /* força refresh quando muda */
                        title="Mapa Embutido"
                        src={embedUrl}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Mapa oculto
                    </div>
                )}

                {/* Overlay de status */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-3 py-2 rounded text-xs text-gray-200">
                    {origin && destination
                        ? `Rota (iframe): ${origin.split(",")[0]} → ${destination.split(",")[0]}`
                        : origin
                            ? `Origem: ${origin.split(",")[0]}`
                            : destination
                                ? `Destino: ${destination.split(",")[0]}`
                                : "Defina origem e destino"}
                </div>

                {panelCollapsed && (
                    <button
                        onClick={() => setPanelCollapsed(false)}
                        className="absolute top-3 left-3 bg-gray-900/80 hover:bg-gray-900 text-white rounded px-2 py-1 text-xs"
                    >
                        Expandir Painel
                    </button>
                )}
            </div>
        </div>
    );
}