'use client';
// altera o tamanho do celular em h-84
// na linha 328 voce pode trocar a imagem

//consertar a animacao do uso do app

import React, { useEffect, useState, useCallback } from 'react';



type Identity = 'feminino' | 'masculino' | 'nao-binario' | 'plural' | 'prefiro-nao-dizer' | 'outro';

interface Passageiro {
    id: string;
    nome: string;
    identidade: Identity;
    rendaMensal: number;
    bairro: string;
    destino: string;
    horarioJanela: [string, string];
    prioridadeAcessibilidade?: boolean;
}

interface CaronaRecurso {
    id: string;
    motorista: string;
    identidade: Identity;
    rota: string[];
    horarioPartida: string;
    capacidade: number;
    custoBase: number;
    rating: number;
    acessibilidade: {
        cadeiraRodas: boolean;
        apoioVisual: boolean;
        apoioAuditivo: boolean;
    };
    energiaLimpa?: boolean;
    verificado: boolean;
    tags?: string[];
}

interface Match {
    recurso: CaronaRecurso;
    passageiro: Passageiro;
    score: number;
    fatores: string[];
    custoEstimado: number;
    subsidio: number;
    economiaPercent: number;
}

interface PopularRoute {
    id: string;
    origem: string;
    destino: string;
    viagensSemana: number;
    economiaMediaPct: number;
    emissaoEvitadaKg: number;
}

// Helpers (inalterados)
function addHourISO(offset: number) {
    const d = new Date();
    d.setHours(Math.floor(offset), (offset % 1) * 60, 0, 0);
    return d.toISOString();
}
function within(start: string, end: string, target: string) {
    const t = new Date(target).getTime();
    return t >= new Date(start).getTime() && t <= new Date(end).getTime();
}
function money(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Mock Data (inalterados)
const PASSAGEIROS: Passageiro[] = [
    { id: 'p1', nome: 'Alex', identidade: 'nao-binario', rendaMensal: 0, bairro: 'Jardim Horizonte', destino: 'Centro Comunitário', horarioJanela: [addHourISO(7), addHourISO(8)] },
    { id: 'p2', nome: 'Marisa', identidade: 'feminino', rendaMensal: 1100, bairro: 'Vila Azul', destino: 'Campus Leste', horarioJanela: [addHourISO(8), addHourISO(9)], prioridadeAcessibilidade: true },
    { id: 'p3', nome: 'João', identidade: 'masculino', rendaMensal: 900, bairro: 'Parque Norte', destino: 'Ponto Integrado', horarioJanela: [addHourISO(6.5), addHourISO(7.5)] }
];

const RECURSOS: CaronaRecurso[] = [
    {
        id: 'c1',
        motorista: 'Sofia',
        identidade: 'feminino',
        rota: ['Jardim Horizonte', 'Vila Azul', 'Centro Comunitário'],
        horarioPartida: addHourISO(7.25),
        capacidade: 3,
        custoBase: 18,
        rating: 4.92,
        acessibilidade: { cadeiraRodas: false, apoioVisual: true, apoioAuditivo: false },
        energiaLimpa: true,
        verificado: true,
        tags: ['energia-limpa', 'lideranca-feminina']
    },
    {
        id: 'c2',
        motorista: 'Bruno',
        identidade: 'masculino',
        rota: ['Parque Norte', 'Ponto Integrado'],
        horarioPartida: addHourISO(7),
        capacidade: 4,
        custoBase: 20,
        rating: 4.7,
        acessibilidade: { cadeiraRodas: true, apoioVisual: true, apoioAuditivo: true },
        verificado: true,
        tags: ['acessibilidade']
    },
    {
        id: 'c3',
        motorista: 'Rede Solidária',
        identidade: 'plural',
        rota: ['Vila Azul', 'Campus Leste'],
        horarioPartida: addHourISO(8.15),
        capacidade: 5,
        custoBase: 0,
        rating: 4.6,
        acessibilidade: { cadeiraRodas: false, apoioVisual: false, apoioAuditivo: false },
        energiaLimpa: true,
        verificado: false,
        tags: ['coletivo', 'open-source']
    }
];

const ROTAS_POPULARES: PopularRoute[] = [
    { id: 'r1', origem: 'Jardim Horizonte', destino: 'Centro Comunitário', viagensSemana: 180, economiaMediaPct: 63, emissaoEvitadaKg: 140 },
    { id: 'r2', origem: 'Parque Norte', destino: 'Ponto Integrado', viagensSemana: 132, economiaMediaPct: 55, emissaoEvitadaKg: 118 },
    { id: 'r3', origem: 'Vila Azul', destino: 'Campus Leste', viagensSemana: 201, economiaMediaPct: 69, emissaoEvitadaKg: 152 }
];

// Matching heurístico (inalterado)
function gerarMatches(p: Passageiro, recursos: CaronaRecurso[]): Match[] {
    return recursos
        .map(r => {
            let score = 0;
            const fatores: string[] = [];
            const origem = r.rota.includes(p.bairro);
            const destino = r.rota.includes(p.destino);
            if (origem) { score += 3; fatores.push('Origem na rota'); }
            if (destino) { score += 3; fatores.push('Destino na rota'); }
            if (within(p.horarioJanela[0], p.horarioJanela[1], r.horarioPartida)) { score += 2; fatores.push('Janela compatível'); }
            const custoUnit = r.capacidade > 0 ? r.custoBase / r.capacidade : r.custoBase;
            let subsidio = 0;
            if (p.rendaMensal === 0 && custoUnit > 0) { subsidio = custoUnit * 0.85; score += 2.5; fatores.push('Subsídio pleno'); }
            else if (p.rendaMensal < 1000 && custoUnit > 0) { subsidio = custoUnit * 0.5; score += 1.5; fatores.push('Subsídio parcial'); }
            if (p.prioridadeAcessibilidade) {
                if (r.acessibilidade.cadeiraRodas) { score += 3; fatores.push('Cadeira de rodas'); }
                if (r.acessibilidade.apoioVisual || r.acessibilidade.apoioAuditivo) { score += 1.5; fatores.push('Apoio sensorial'); }
            }
            if (r.energiaLimpa) { score += 1.2; fatores.push('Baixa emissão'); }
            if (r.identidade === 'plural') { score += 0.5; fatores.push('Coletivo'); }
            score += Math.min(r.rating / 5, 1); fatores.push('Confiabilidade');
            const custoFinal = Math.max(0, custoUnit - subsidio);
            const baseline = 30;
            const economiaPercent = ((baseline - custoFinal) / baseline) * 100;
            if (economiaPercent > 50) { score += 0.8; fatores.push('Alta economia'); }
            return { recurso: r, passageiro: p, score, fatores, custoEstimado: custoFinal, subsidio, economiaPercent };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

// UI utils (inalterados)
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px] uppercase tracking-wider text-orange-300">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" /> {children}
    </div>
);

const Pill: React.FC<{ children: React.ReactNode; tone?: 'accent' | 'neutral' }> = ({ children, tone = 'neutral' }) => {
    const m: Record<string, string> = {
        neutral: 'bg-white/10 text-slate-200',
        accent: 'bg-orange-500/20 text-orange-200'
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${m[tone]}`}>{children}</span>;
};

const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
    <div className="flex flex-col">
        <span className="text-xs tracking-wide uppercase text-slate-400">{label}</span>
        <span className="text-2xl font-semibold text-white">{value}</span>
        {sub && <span className="text-[11px] text-slate-500">{sub}</span>}
    </div>
);

const SectionHeader: React.FC<{ eyebrow?: string; title: string; subtitle?: string }> = ({ eyebrow, title, subtitle }) => (
    <div className="max-w-3xl mx-auto text-center mb-14">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-orange-300 via-amber-200 to-cyan-200 text-transparent bg-clip-text">
            {title}
        </h2>
        {subtitle && <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-300">{subtitle}</p>}
    </div>
);

// PhoneDemo (inalterado exceto comentários)
type DemoState =
    | 'preparing'
    | 'calculandoRota'
    | 'gerandoOpcoes'
    | 'exibindoOpcoes'
    | 'confirmando'
    | 'emViagem'
    | 'finalizada';



interface MatchLite {
    id: string;
    motorista: string;
    preco: number;
    subsidio: number;
    economia: number;
    tempo: string;
    destaque?: boolean;
    fatores: string[];
}

const DEMO_ORDER: DemoState[] = [
    'preparing',
    'calculandoRota',
    'gerandoOpcoes',
    'exibindoOpcoes',
    'confirmando',
    'emViagem',
    'finalizada'
];

const DURATION: Record<DemoState, number> = {
    preparing: 1000,
    calculandoRota: 1600,
    gerandoOpcoes: 1400,
    exibindoOpcoes: 5000,
    confirmando: 1500,
    emViagem: 5500,
    finalizada: 2500
};

const PhoneDemo: React.FC<{
    autoplay?: boolean;
    loop?: boolean;
    className?: string;
    forceState?: DemoState | null;
}> = ({

          loop = true,
          className = '',
          forceState = null
      }) => {
    const [state, setState] = useState<DemoState>('preparing');


    const advance = useCallback(() => {
        setState(prev => {
            const i = DEMO_ORDER.indexOf(prev);
            if (i === DEMO_ORDER.length - 1) {
                if (loop) {
                    setPassIdx(p => (p + 1) % PASSAGEIROS.length);
                    return 'preparing';
                }
                return prev;
            }
            return DEMO_ORDER[i + 1];
        });
    }, [loop]);

    function label(s: DemoState) {
        switch (s) {
            case 'preparing': return 'Inicializando...';
            case 'calculandoRota': return 'Calculando rota ideal';
            case 'gerandoOpcoes': return 'Gerando opções...';
            case 'exibindoOpcoes': return 'Opções de carona';
            case 'confirmando': return 'Confirmando carona...';
            case 'emViagem': return 'Em viagem';
            case 'finalizada': return 'Viagem concluída';
        }
    }

    return (
        <div
            className={`relative rounded-[54px] border border-white/15 bg-[#102333]/90 backdrop-blur-xl shadow-2xl shadow-black/60 flex flex-col w-full max-w-[420px] p-6 ${className}`}
            style={{ aspectRatio: '9/19.5' }}
        >
            {/* Barra de status */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>09:42</span>
                <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </span>
            </div>

            {/* Área principal */}
            <div className="mt-3 flex flex-col flex-1 min-h-0">
                {/* “Mapa” (64%) agora só a imagem */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d1f2d] flex-[0_0_64%]">
                    <img
                        src="src/components/comunidade/mapa.jpg"  /* coloque a imagem em /public ou importe */
                        alt="Mapa"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute left-2 top-2 bg-[#13283d]/85 border border-white/10 rounded-md px-3 py-1.5 text-[10px] text-slate-200">
                        {label(state)}
                    </div>
                </div>

                {/* Conteúdo restante */}
                <div className="mt-4 flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-auto">
                        {state === 'preparing' && <ListInfo title="Preparando" items={['Carregando perfis anônimos', 'Sincronizando preferências']} />}
                        {state === 'calculandoRota' && <ListInfo title="Rota" items={['Coletando hubs próximos', 'Simulando congestionamento', 'Estimando emissões']} />}
                        {state === 'gerandoOpcoes' && <ListInfo title="Matching" items={['Filtrando rotas compatíveis', 'Aplicando fairness e subsídio']} />}
                        {state === 'exibindoOpcoes' && matches.length > 0 && (
                            <div className="space-y-2">
                                {matches.map(m => (
                                    <div
                                        key={m.id}
                                        className={`rounded-xl border px-3 py-2 text-xs transition ${
                                            m.destaque ? 'border-orange-400 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-orange-400/40'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-white">{m.motorista}</span>
                                            <span className="text-orange-300">{money(m.preco)}</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-400">
                                            <span>{m.tempo}</span>
                                            <span className="text-cyan-300">Economia {m.economia.toFixed(0)}%</span>
                                            {m.subsidio > 0 && <span className="text-orange-200">Subsídio {money(m.subsidio)}</span>}
                                        </div>
                                    </div>
                                ))}
                                <p className="mt-3 text-[9px] text-slate-500 leading-relaxed">
                                    Fatores: origem, destino, janela, custo por assento, acessibilidade e emissões.
                                </p>
                            </div>
                        )}
                        {state === 'confirmando' && <ListInfo title="Confirmando" items={['Verificando reputação', 'Protegendo assento']} />}
                        {state === 'emViagem' && (
                            <div className="text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-300">Progresso</span>
                                    <span className="text-orange-300">{(progress * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${progress * 100}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-400">Rota otimizada priorizando menor custo & baixa emissão.</p>
                            </div>
                        )}
                        {state === 'finalizada' && (
                            <div className="text-xs space-y-2">
                                <p className="font-medium text-white">Chegada concluída ✅</p>
                                <p className="text-[10px] text-slate-400">
                                    Feedback anônimo alimenta métricas de paridade e segurança.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botões */}
                    <div className="mt-4 flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => {
                                const i = DEMO_ORDER.indexOf(state);
                                if (i > 0) setState(DEMO_ORDER[i - 1]);
                            }}
                            disabled={state === 'preparing' || !!forceState}
                            className="flex-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-200 py-2 disabled:opacity-30 hover:border-orange-400/40"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={() => {
                                if (state === 'finalizada') {
                                    setState('preparing');
                                    setPassIdx(p => (p + 1) % PASSAGEIROS.length);
                                } else {
                                    advance();
                                }
                            }}
                            disabled={!!forceState}
                            className="flex-1 rounded-md bg-gradient-to-r from-orange-600 to-amber-500 text-[11px] text-white font-medium py-2 hover:brightness-110 disabled:opacity-40"
                        >
                            {state === 'finalizada' ? 'Reiniciar' : 'Avançar'}
                        </button>
                    </div>
                    <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-white/15" />
                </div>
            </div>
        </div>
    );
};

const ListInfo: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div className="text-xs space-y-2">
        <p className="font-medium text-white">{title}</p>
        <ul className="space-y-1">
            {items.map(i => (
                <li key={i} className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" /> {i}
                </li>
            ))}
        </ul>
    </div>
);

/* =============================================================================
 * Hero Selection
 * ========================================================================== */

interface HeroVariant {
    id: string;
    eyebrow?: string;
    title: string;
    highlight?: string;
    description: string;
    bullets?: string[];
    stats?: { label: string; value: string; sub?: string }[];
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; action?: 'demo' | 'none' };
    phoneStateTarget?: DemoState;
}

// UPDATED: adicionado variant 'inclusao'
const HERO_VARIANTS: HeroVariant[] = [
    {
        id: 'matching',
        eyebrow: 'Mobilidade Aberta',
        title: 'Matching Justo em Segundos',
        highlight: 'subsídio progressivo + explicabilidade',
        description: 'Algoritmo prioriza origem/destino compatíveis, acessibilidade e custo por assento ajustado à renda.',
        bullets: ['Fairness heurística', 'Transparência de fatores', 'Subsídio adaptativo'],
        stats: [
            { label: 'Economia média', value: '-58%', sub: 'custo estimado' },
            { label: 'Sem renda', value: '34%', sub: 'cobertura' },
            { label: 'Emissão evitada', value: '22t', sub: 'CO₂ / trim.' }
        ],
        primaryCta: { label: 'Criar Conta', href: '/login' },
        phoneStateTarget: 'exibindoOpcoes'
    },
    {
        id: 'viagem',
        eyebrow: 'Operação',
        title: 'Acompanhamento de Viagem',
        highlight: 'progresso + impacto ambiental',
        description: 'Mostre avanço de rota, emissões evitadas e economia relativa em tempo real para aumentar confiança.',
        bullets: ['Rota otimizada', 'Emissão monitorada', 'Feedback anônimo'],
        primaryCta: { label: 'Entrar', href: '/login' },
        phoneStateTarget: 'emViagem'
    },
    {
        id: 'auditoria',
        eyebrow: 'Governança',
        title: 'Auditoria Comunitária',
        highlight: 'código & métricas abertas',
        description: 'Pesos, fórmulas de score e agregações disponíveis para inspeção e propostas de aprimoramento.',
        bullets: ['Score acessível', 'Logs de fairness', 'Propostas (PIPs)'],
        primaryCta: { label: 'Ver Repositórios', href: '#' },
        phoneStateTarget: 'gerandoOpcoes'
    },
    // NEW VARIANT
    {
        id: 'inclusao',
        eyebrow: 'Equidade & Inclusão',
        title: 'Camadas de Inclusão Ativadas',
        highlight: 'gênero, identidade & acessibilidade',
        description: 'Priorizamos segurança e representação de mulheres, pessoas LGBTQIA+, afrodescendentes e PCDs com pesos auditáveis, subsídios direcionados e métricas abertas.',
        bullets: [
            'Métricas de diversidade abertas',
            'Pesos de score auditáveis',
            'Subsídios direcionados',
            'Preferências de segurança'
        ],
        stats: [
            { label: 'Motoristas verificados', value: '91%', sub: 'selo comunitário' },
            { label: 'Feedback seguro', value: '+72%', sub: 'confiança relatada' },
            { label: 'Subsídio eq.', value: 'R$ 38k', sub: 'último trim.' }
        ],
        primaryCta: { label: 'Ver Inclusão', href: '#inclusao' },
        phoneStateTarget: 'gerandoOpcoes'
    }
];

const heroTheme = {
    bg: 'bg-[radial-gradient(circle_at_30%_40%,#1b3145_0%,#0d1824_60%,#081019_100%)]',
    navBg: 'bg-[#1e1f23]/95',
    navRing: 'ring-1 ring-white/10',
    gradientText: 'bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-200',
    pillInactive: 'bg-white/5 hover:bg-white/10 text-slate-300',
    pillActive: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow',
    bulletDot: 'bg-gradient-to-r from-orange-500 to-amber-400'
};

// UPDATED: adiciona link "Inclusão"
const FloatingNav: React.FC<{ onDemo: () => void }> = ({ onDemo }) => {
    return (
        <div className="pointer-events-auto">
            <div className="mx-auto mt-6 max-w-6xl px-4">
                <div className={`flex items-center justify-between gap-8 px-6 py-3 rounded-2xl ${heroTheme.navBg} ${heroTheme.navRing} shadow-xl backdrop-blur`}>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                            MO
                        </div>
                        <span className="text-sm font-semibold text-white">MobilidadeAberta</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
                        {['Início', 'Rotas', 'Inclusão', 'Open Source', 'FAQ'].map(l => (
                            <a
                                key={l}
                                href={l === 'Início' ? '#inicio' : '#' + l.toLowerCase().replace(' ', '')}
                                className="text-slate-300 hover:text-white transition"
                            >
                                {l}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <a
                            href="/login"
                            className="hidden md:inline-flex items-center rounded-md px-4 py-2 text-xs font-medium border border-white/10 text-slate-200 hover:border-orange-400/50 hover:bg-orange-500/10"
                        >
                            Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HeroSelection: React.FC = () => {
    const [variant, setVariant] = useState<HeroVariant>(HERO_VARIANTS[0]);
    const [showOverlayDemo, setShowOverlayDemo] = useState(false);

    return (
        <section id="inicio" className={`relative overflow-hidden ${heroTheme.bg}`}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vmax] h-[90vmax] bg-[radial-gradient(circle_at_center,rgba(255,170,80,0.08),transparent_70%)]" />
            </div>

            <FloatingNav onDemo={() => setShowOverlayDemo(true)} />

            <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-28">
                <div className="flex flex-wrap gap-3 mb-10">
                    {HERO_VARIANTS.map(v => (
                        <button
                            key={v.id}
                            onClick={() => setVariant(v)}
                            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition ${
                                variant.id === v.id ? heroTheme.pillActive : heroTheme.pillInactive
                            }`}
                        >
                            {v.title.split(' ')[0]}
                        </button>
                    ))}
                </div>

                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    <div className="flex flex-col gap-6">
                        {variant.eyebrow && <Eyebrow>{variant.eyebrow}</Eyebrow>}
                        <div>
                            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-white">
                                {variant.title}
                            </h1>
                            {variant.highlight && (
                                <span className={`${heroTheme.gradientText} text-transparent bg-clip-text block mt-2 text-2xl md:text-3xl font-semibold`}>
                  {variant.highlight}
                </span>
                            )}
                        </div>
                        <p className="text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
                            {variant.description}
                        </p>
                        {variant.bullets && (
                            <ul className="space-y-2 text-sm text-slate-300">
                                {variant.bullets.map(b => (
                                    <li key={b} className="flex items-start gap-2">
                                        <span className={`mt-1 h-2 w-2 rounded-full ${heroTheme.bulletDot}`} />
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex flex-wrap gap-4">
                            {variant.primaryCta && (
                                <a
                                    href={variant.primaryCta.href}
                                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 px-8 py-3 text-sm font-semibold text-white shadow hover:brightness-110"
                                >
                                    <span className="relative z-10">{variant.primaryCta.label}</span>
                                    <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-500 group-hover:translate-y-0" />
                                </a>
                            )}
                            {variant.secondaryCta && (
                                <button
                                    onClick={() => {
                                        if (variant.secondaryCta?.action === 'demo') setShowOverlayDemo(true);
                                    }}
                                    className="rounded-lg border border-white/15 bg-white/5 px-8 py-3 text-sm font-medium text-slate-200 hover:border-orange-400/50 hover:bg-orange-500/10"
                                >
                                    {variant.secondaryCta.label}
                                </button>
                            )}
                        </div>
                        {variant.stats && (
                            <div className="grid grid-cols-3 gap-8 max-w-md">
                                {variant.stats.map(s => (
                                    <Stat key={s.label} label={s.label} value={s.value} sub={s.sub} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute -inset-10 blur-3xl bg-gradient-to-r from-orange-500/10 via-amber-400/10 to-cyan-400/10 rounded-full pointer-events-none" />
                            <PhoneDemo autoplay loop forceState={variant.phoneStateTarget || null} />
                            <div className="hidden sm:block absolute -top-6 -right-10 rotate-6">
                                <div className="rounded-xl px-4 py-2 text-[11px] font-medium bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-black/40 flex items-center gap-2">
                                    <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
                                    Acessibilidade+
                                </div>
                            </div>
                            <div className="hidden sm:block absolute top-1/3 -left-20 -rotate-6">
                                <div className="rounded-xl px-3 py-1.5 text-[11px] font-medium bg-[#102333] border border-white/15 text-slate-200 shadow-lg shadow-black/40">
                                    Emissões ↓63%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showOverlayDemo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowOverlayDemo(false)}
                    />
                    <div className="relative">
                        <PhoneDemo autoplay loop forceState={variant.phoneStateTarget || null} />
                        <button
                            onClick={() => setShowOverlayDemo(false)}
                            className="absolute -top-3 -right-3 rounded-full bg-orange-600 text-white text-xs px-3 py-1 shadow hover:brightness-110"
                        >
                            X
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

/* =============================================================================
 * NOVA SEÇÃO DE INCLUSÃO
 * ========================================================================== */

// Dados simulados por grupo (faça integração real depois)
interface InclusionMetric {
    id: string;
    grupo: string;
    descricao: string;
    participacao: number;    // %
    subsidioPct: number;     // % da parcela de subsídio
    retencao: number;        // %
    cor: string;
}

const INCLUSION_METRICS: InclusionMetric[] = [
    {
        id: 'mulheres',
        grupo: 'Mulheres',
        descricao: 'Motoristas e passageiras com preferências de segurança ampliadas.',
        participacao: 48,
        subsidioPct: 32,
        retencao: 74,
        cor: 'from-rose-500 to-orange-400'
    },
    {
        id: 'lgbtqia',
        grupo: 'LGBTQIA+',
        descricao: 'Sinalização opcional, feedback anônimo, moderação fortalecida.',
        participacao: 19,
        subsidioPct: 21,
        retencao: 69,
        cor: 'from-fuchsia-500 to-violet-400'
    },
    {
        id: 'afro',
        grupo: 'Afrodescendentes',
        descricao: 'Acompanhamos paridade e impacto de subsídio por região.',
        participacao: 27,
        subsidioPct: 29,
        retencao: 71,
        cor: 'from-amber-500 to-emerald-400'
    },
    {
        id: 'pcd',
        grupo: 'PCDs',
        descricao: 'Preferência de acessibilidade, priorização de recursos adaptados.',
        participacao: 11,
        subsidioPct: 18,
        retencao: 66,
        cor: 'from-cyan-500 to-teal-400'
    }
];

const InclusionCard: React.FC<{ m: InclusionMetric }> = ({ m }) => {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#182c41]/60 p-6 backdrop-blur">
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${m.cor}`} />
            <div className="relative z-10 space-y-3">
                <h5 className="text-sm font-semibold text-white">{m.grupo}</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">{m.descricao}</p>
                <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
                    <div>
                        <span className="block text-xs uppercase text-slate-500">Participação</span>
                        <span className="mt-0.5 font-semibold text-orange-200">{m.participacao}%</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-slate-500">Subsídio</span>
                        <span className="mt-0.5 font-semibold text-cyan-200">{m.subsidioPct}%</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-slate-500">Retenção</span>
                        <span className="mt-0.5 font-semibold text-amber-200">{m.retencao}%</span>
                    </div>
                </div>
                <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400"
                        style={{ width: `${Math.min(100, m.participacao)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const InclusionSection: React.FC = () => {
    return (
        <section id="inclusao" className="mx-auto max-w-7xl px-6 py-24">
            <SectionHeader
                eyebrow="Diversidade"
                title="Inclusão & Gênero"
                subtitle="Transparência em participação, subsídios e retenção de grupos priorizados. Métricas agregadas e auditáveis."
            />
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                {INCLUSION_METRICS.map(m => <InclusionCard key={m.id} m={m} />)}
            </div>
            <div className="mt-12 grid gap-10 md:grid-cols-3 text-sm leading-relaxed text-slate-300">
                <div className="space-y-3">
                    <h6 className="font-semibold text-white text-sm">Camada de Fairness</h6>
                    <p>Pesos consideram origem/destino, renda, acessibilidade, reputação e demanda com limites anti-sesgo. Logs podem ser exportados.</p>
                </div>
                <div className="space-y-3">
                    <h6 className="font-semibold text-white text-sm">Segurança & Preferências</h6>
                    <p>Preferências (por ex. motorista verificada, rotas iluminadas) influenciam opções sem excluir outros grupos injustamente.</p>
                </div>
                <div className="space-y-3">
                    <h6 className="font-semibold text-white text-sm">Auditoria Comunitária</h6>
                    <p>Métricas de distribuição de subsídio, tempo de espera e cancelamentos segmentados são publicadas trimestralmente.</p>
                </div>
            </div>
            <p className="mt-10 text-[11px] text-slate-500">
                Nota: valores demonstrativos. Em produção, todos os percentuais são recalculados dinamicamente a partir de dados anonimizados.
            </p>
        </section>
    );
};

/* =============================================================================
 * Seções existentes (Rotas, Open Source, FAQ, CTA, Footer)
 * ========================================================================== */

const PopularRoutes: React.FC = () => {
    const [sortKey, setSortKey] = useState<'viagensSemana' | 'economiaMediaPct' | 'emissao'>('viagensSemana');
    const sorted = [...ROTAS_POPULARES].sort((a, b) => {
        if (sortKey === 'viagensSemana') return b.viagensSemana - a.viagensSemana;
        if (sortKey === 'economiaMediaPct') return b.economiaMediaPct - a.economiaMediaPct;
        return b.emissaoEvitadaKg - a.emissaoEvitadaKg;
    });
    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-wide text-slate-400">Ordenar:</span>
                {[
                    { id: 'viagensSemana', label: 'Frequência' },
                    { id: 'economiaMediaPct', label: 'Economia' },
                    { id: 'emissao', label: 'Emissões' }
                ].map(o => (
                    <button
                        key={o.id}
                        onClick={() => setSortKey(o.id === 'emissao' ? 'emissao' as any : (o.id as any))}
                        className={`rounded-md px-4 py-1.5 text-xs font-medium border transition ${
                            sortKey === o.id || (o.id === 'emissao' && sortKey === 'emissao')
                                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-500'
                                : 'border-white/15 text-slate-300 hover:border-orange-400'
                        }`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {sorted.map(r => (
                    <div
                        key={r.id}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#182c41]/60 p-6 backdrop-blur hover:border-cyan-400/40 transition"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h5 className="text-sm font-semibold text-white">{r.origem} → {r.destino}</h5>
                                <p className="mt-1 text-[11px] text-slate-400">Carona</p>
                            </div>
                            <Pill tone="accent">{r.viagensSemana}/sem</Pill>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <RouteMetric label="Economia" value={`${r.economiaMediaPct}%`} accent="orange" />
                            <RouteMetric label="Emissão ev." value={`${r.emissaoEvitadaKg}kg`} accent="cyan" />
                            <RouteMetric label="Modal" value="carro" />
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-300"
                                style={{ width: `${Math.min(100, (r.economiaMediaPct / 80) * 100)}%` }}
                            />
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                            Dados agregados — metodologia aberta para auditoria.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RouteMetric: React.FC<{ label: string; value: string; accent?: 'orange' | 'cyan' }> = ({ label, value, accent }) => {
    const c = accent === 'orange' ? 'text-orange-300' : accent === 'cyan' ? 'text-cyan-300' : 'text-slate-200';
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-500">{label}</span>
            <span className={`text-sm font-semibold ${c}`}>{value}</span>
        </div>
    );
};

// FAQ
const FAQ = [
    {
        q: 'Como explicam a escolha da rota?',
        a: 'Exibimos fatores: proximidade de origem/destino, janela de tempo, capacidade, subsídio, impacto de emissões e acessibilidade.'
    },
    {
        q: 'Como funciona o subsídio?',
        a: 'Heurística progressiva baseada em renda e necessidades de acessibilidade; regras e pesos são públicos.'
    },
    {
        q: 'Posso auditar o algoritmo?',
        a: 'Sim. Código, fórmulas de score e métricas agregadas são disponibilizados para revisão comunitária.'
    },
    {
        q: 'Outras modalidades?',
        a: 'Entrarão gradualmente após validação de métricas de fairness específicas.'
    }
];

const FAQSection: React.FC = () => (
    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#16293b]/50">
        {FAQ.map((f, i) => (
            <details key={i} className="group open:bg-white/[0.04]">
                <summary className="cursor-pointer list-none px-6 py-5 text-sm font-medium text-white flex items-center justify-between">
                    <span>{f.q}</span>
                    <span className="text-xs text-slate-500 group-open:rotate-45 transition">+</span>
                </summary>
                <div className="px-6 pb-5 -mt-2 text-sm leading-relaxed text-slate-300">
                    {f.a}
                </div>
            </details>
        ))}
    </div>
);

const OPEN_ITEMS = [
    { titulo: 'Repositórios', desc: 'Core de matching, API pública, interface acessível.', link: '#' },
    { titulo: 'Dados Abertos', desc: 'Rotas anonimizadas e indicadores de equidade.', link: '#' },
    { titulo: 'Guia Ético', desc: 'Critérios de impacto e mitigação de viés.', link: '#' },
    { titulo: 'Governança', desc: 'Propostas (PIPs), votação e histórico.', link: '#' }
];

const OpenSourceSection: React.FC = () => (
    <div className="grid gap-6 md:grid-cols-4">
        {OPEN_ITEMS.map(c => (
            <a
                key={c.titulo}
                href={c.link}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#182c41]/60 p-5 hover:border-orange-400/50 transition"
            >
                <h5 className="text-sm font-semibold text-white">{c.titulo}</h5>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{c.desc}</p>
                <span className="mt-3 inline-block text-[11px] font-medium text-orange-300 group-hover:text-orange-200">
          Acessar →
        </span>
            </a>
        ))}
    </div>
);

const FinalCTA: React.FC = () => (
    <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d3447] via-[#142838] to-[#0d1b27] p-10 backdrop-blur-xl shadow-lg shadow-black/50">
            <div className="absolute -inset-px bg-[radial-gradient(circle_at_20%_20%,rgba(255,122,26,0.25),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(0,153,255,0.25),transparent_60%)] opacity-70" />
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                    <h3 className="text-2xl font-semibold bg-gradient-to-r from-orange-300 via-amber-200 to-cyan-200 bg-clip-text text-transparent">
                        Pronto para construir mobilidade justa?
                    </h3>
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                        Participe, envie PRs, audite métricas e proponha melhorias que reforçam equidade.
                    </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                    <a
                        href="/login"
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 px-8 py-3 text-sm font-semibold text-white shadow hover:brightness-110 focus:outline-none focus-visible:ring-2 ring-orange-400/50"
                    >
                        <span className="relative z-10">Entrar / Criar Conta</span>
                        <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-500 group-hover:translate-y-0" />
                    </a>
                    <a
                        href="#"
                        className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-medium text-slate-200 hover:border-orange-400/50 hover:bg-orange-500/10 focus:outline-none focus-visible:ring-2 ring-orange-400/40"
                    >
                        Repositórios
                    </a>
                </div>
            </div>
        </div>
    </section>
);

const Footer: React.FC = () => (
    <footer className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mt-10 grid gap-10 md:grid-cols-5">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                        MO
                    </div>
                    <span className="text-sm font-semibold text-white">MobilidadeAberta</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Carona colaborativa, transparente e orientada à equidade social.
                </p>
                <div className="flex gap-3">
                    {['GitHub', 'Mastodon', 'LinkedIn', 'Matrix'].map(s => (
                        <a
                            key={s}
                            href="#"
                            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-orange-400/50 hover:text-white"
                        >
                            {s}
                        </a>
                    ))}
                </div>
            </div>
            <FooterCol title="Plataforma" links={['Início', 'Rotas', 'Inclusão', 'Open Source', 'FAQ']} />
            <FooterCol title="Recursos" links={['Docs', 'API', 'Blog', 'Relatórios']} />
            <FooterCol title="Governança" links={['Propostas', 'Auditorias', 'Comitês', 'Calendário']} />
            <FooterCol title="Legal" links={['Termos', 'Privacidade', 'Código de Conduta']} />
        </div>
        <p className="mt-10 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} MobilidadeAberta — Licença MIT.
        </p>
    </footer>
);

const FooterCol: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
    <div className="space-y-3">
        <h5 className="font-semibold text-sm text-white">{title}</h5>
        <ul className="space-y-2 text-xs text-slate-400">
            {links.map(l => (
                <li key={l}>
                    <a href="#" className="hover:text-orange-300">
                        {l}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

/* =============================================================================
 * Página Principal (inclui InclusionSection)
 * ========================================================================== */
const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full font-sans text-slate-100 bg-[#0a141d]">
            <HeroSelection />
            <main className="relative z-10">
                <section id="rotas" className="mx-auto max-w-7xl px-6 py-24">
                    <SectionHeader
                        eyebrow="Tendências"
                        title="Rotas Populares"
                        subtitle="Demandas agregadas ajudam a calibrar subsídios e planejar pontos de encontro."
                    />
                    <PopularRoutes />
                </section>

                {/* NEW: Seção Inclusão */}
                <InclusionSection />

                <section id="opensource" className="mx-auto max-w-7xl px-6 py-24">
                    <SectionHeader
                        eyebrow="Colaboração"
                        title="Open Source & Governança"
                        subtitle="Código e decisões auditáveis para evolução contínua."
                    />
                    <OpenSourceSection />
                </section>
                <section id="faq" className="mx-auto max-w-5xl px-6 py-24">
                    <SectionHeader
                        eyebrow="Informações"
                        title="Perguntas Frequentes"
                        subtitle="Entenda rapidamente como operamos com transparência."
                    />
                    <FAQSection />
                </section>
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;

/* =============================================================================
 * Próximos Passos
 * - Validar métricas reais de inclusão via API.
 * - Adicionar filtros por região / período em #inclusao.
 * - Animar barras ao entrar no viewport (IntersectionObserver).
 * - Fornecer download de CSV de métricas.
 * =============================================================================
 */