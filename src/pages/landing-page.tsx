import { type FC } from "react";
import { Link } from "react-router";

/* =============================================================================
 * 1. TIPOS E DADOS
 * ========================================================================== */

interface CardData {
  icone: string;
  titulo: string;
  descricao: string;
  cite?: number[];
}

// Dados extraídos diretamente do PDF da apresentação
const PROBLEMAS: CardData[] = [
  {
    icone: "🕒",
    titulo: "Tempo de Deslocamento Elevado",
    descricao:
      "Jornadas longas e cansativas até a universidade, com pouca integração de transporte entre a periferia e o campus.",
    cite: [8, 9],
  },
  {
    icone: " overcrowding",
    titulo: "Transporte Precarizado",
    descricao:
      "Superlotação, especialmente em horários de pico, tornando o trajeto desconfortável e estressante.",
    cite: [11, 12],
  },
  {
    icone: "🛡️",
    titulo: "Riscos de Segurança",
    descricao:
      "A vulnerabilidade no transporte público expõe os estudantes, principalmente mulheres, a riscos de assédio.",
    cite: [13],
  },
  {
    icone: "♿",
    titulo: "Falta de Acessibilidade",
    descricao:
      "A ausência de infraestrutura adequada para Pessoas com Deficiência (PCDs) transforma o deslocamento em um desafio diário.",
    cite: [14],
  },
];

const DIFERENCIAIS: CardData[] = [
  {
    icone: "❤️",
    titulo: "Assento Solidário",
    descricao:
      "Um sistema inovador que oferece caronas gratuitas ou a custo reduzido para estudantes hipossuficientes, garantindo que ninguém fique para trás.",
    cite: [42, 24],
  },
  {
    icone: "</>",
    titulo: "Código Open Source",
    descricao:
      "Nossa plataforma é aberta! Isso permite que a comunidade audite, contribua e ajude a escalar a solução para outras universidades.",
    cite: [44, 68],
  },
  {
    icone: "🤝",
    titulo: "Segurança e Comunidade",
    descricao:
      "Foco na proteção dos usuários com um sistema de avaliação de motoristas e comunicação direta, criando um ambiente de confiança entre colegas.",
    cite: [29, 60, 26],
  },
  {
    icone: "💸",
    titulo: "Baixo Custo Real",
    descricao:
      "Corridas com preços acessíveis, pensadas para a realidade financeira dos estudantes, aumentando a taxa de ocupação dos veículos e reduzindo custos para todos.",
    cite: [32, 41, 43],
  },
];

const PLANOS_FUTUROS: CardData[] = [
  {
    icone: "🏆",
    titulo: "Gamificação e Recompensas",
    descricao:
      "Motoristas acumularão pontos e score para ganhar prêmios, como vouchers de desconto em gasolina e apps de delivery.",
    cite: [63, 64],
  },
  {
    icone: "🏢",
    titulo: "Hubs de Segurança",
    descricao:
      "Instalação de pontos de encontro seguros em áreas de grande circulação de alunos para aumentar a confiabilidade das caronas.",
    cite: [65],
  },
  {
    icone: "🔗",
    titulo: "Parcerias Estratégicas",
    descricao:
      "Colaboração com empresas para oferecer benefícios exclusivos aos usuários, fortalecendo o ecossistema da nossa comunidade.",
    cite: [64],
  },
];

const EQUIPE = {
  nome: "IMPORT PANDAS",
  membros: ["Nicolas Macedo", "Bernardo Lopes", "Juan Perri", "Claudio Jr."],
  cite: [2, 3, 4, 5, 6],
};

/* =============================================================================
 * 2. TEMA E ESTILOS
 * ========================================================================== */

const theme = {
  bg: "bg-stone-950",
  navBg: "bg-stone-950/70 backdrop-blur-lg",
  navRing: "ring-1 ring-white/10",
  gradientText: "bg-gradient-to-r from-orange-500 to-amber-400",
  button:
    "inline-block rounded-md bg-orange-600 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-orange-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-stone-950",
  buttonSecondary:
    "inline-block rounded-md border-2 border-orange-600 px-6 py-3 text-base font-bold text-orange-500 hover:bg-orange-600 hover:text-white transition-colors duration-300",
  card: "relative overflow-hidden rounded-lg border border-white/10 bg-stone-900 p-6 shadow-xl",
};

/* =============================================================================
 * 3. COMPONENTES DE UI
 * ========================================================================== */

const SectionHeader: FC<{
  title: string;
  subtitle: string;
  eyebrow?: string;
}> = ({ title, subtitle, eyebrow }) => (
  <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
    {eyebrow && (
      <p className="text-orange-500 font-semibold tracking-wider uppercase">
        {eyebrow}
      </p>
    )}
    <h2
      className={`mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-white`}
    >
      {title}
    </h2>
    <p className="mt-4 text-lg md:text-xl leading-relaxed text-stone-400">
      {subtitle}
    </p>
  </div>
);

const InfoCard: FC<{ data: CardData }> = ({ data }) => (
  <div className={theme.card}>
    <div className="text-4xl">{data.icone}</div>
    <h3 className="mt-4 text-xl font-bold text-white">{data.titulo}</h3>
    <p className="mt-2 text-base text-stone-400">{data.descricao}</p>
  </div>
);

/* =============================================================================
 * 4. SEÇÕES DA PÁGINA
 * ========================================================================== */

const Nav: FC = () => (
  <header className="fixed top-0 left-0 right-0 z-50">
    <div className="mx-auto max-w-7xl px-6 mt-4">
      <div
        className={`flex items-center justify-between gap-8 px-6 py-3 rounded-xl ${theme.navBg} ${theme.navRing}`}
      >
        <a href="#inicio" className="flex items-center">
          {/* LOGO HORIZONTAL ADICIONADA AQUI */}
          <img src="/logo.svg" alt="Vector Logo" className="h-8 w-auto" />
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {["problema", "diferenciais", "futuro", "equipe"].map((link) => (
            <a
              key={link}
              href={`#${link}`}
              className="capitalize text-stone-300 hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>
        <Link
          to="/login"
          className="hidden sm:block text-sm font-bold text-orange-500 hover:text-orange-400"
        >
          Acessar Plataforma
        </Link>
      </div>
    </div>
  </header>
);

const Hero: FC = () => (
  <section
    id="inicio"
    className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.15),transparent_50%)] pointer-events-none" />
    <div className="relative z-10 mx-auto max-w-7xl px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter text-white">
            Sua jornada universitária,
            <span
              className={`block ${theme.gradientText} text-transparent bg-clip-text`}
            >
              sem obstáculos.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-stone-300 max-w-xl leading-relaxed">
            Vector é o app de caronas de universitários para universitários,
            focado em inclusão, segurança e economia. Unindo pessoas no mesmo
            sentido.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
            <Link to="/login" className={theme.button}>
              Entrar Agora!
            </Link>
            <a
              href="https://github.com/claudio-asj/hackathona"
              target="_blank"
              rel="noopener noreferrer"
              className={theme.buttonSecondary}
            >
              Ver Repositório
            </a>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <img
            src="https://images.unsplash.com/photo-1618172193763-c586e9f585b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Ilustração de rotas e conexões universitárias"
            className="rounded-2xl shadow-2xl w-full max-w-md h-auto object-cover aspect-[4/3] transform transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
    </div>
  </section>
);

const ProblemSection: FC = () => (
  <section id="problema" className="mx-auto max-w-7xl px-6 py-24">
    <SectionHeader
      eyebrow="O desafio diário"
      title="Ir para a faculdade não deveria ser um problema"
      subtitle="Identificamos as principais dores que estudantes enfrentam no transporte, e decidimos agir."
    />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {PROBLEMAS.map((p) => (
        <InfoCard key={p.titulo} data={p} />
      ))}
    </div>
  </section>
);

const DifferentialsSection: FC = () => (
  <section
    id="diferenciais"
    className="mx-auto max-w-7xl px-6 py-24 bg-stone-900/50 rounded-2xl"
  >
    <SectionHeader
      eyebrow="Nossa Solução"
      title="Mais que um app de carona, uma ferramenta de inclusão."
      subtitle="O Vector foi projetado com funcionalidades inteligentes para promover conforto, rapidez e segurança a quem mais precisa."
    />
    <div className="grid gap-6 md:grid-cols-2">
      {DIFERENCIAIS.map((d) => (
        <div
          key={d.titulo}
          className={`${theme.card} flex items-start gap-4 hover:border-orange-500/50 transition-colors`}
        >
          <div className="text-4xl pt-1">{d.icone}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{d.titulo}</h3>
            <p className="mt-1 text-base text-stone-400">{d.descricao}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const FutureSection: FC = () => (
  <section id="futuro" className="mx-auto max-w-7xl px-6 py-24">
    <SectionHeader
      eyebrow="Visão de futuro"
      title="Nossos próximos passos"
      subtitle="Estamos apenas começando. Temos grandes planos para expandir o impacto positivo do Vector na comunidade."
    />
    <div className="grid gap-8 md:grid-cols-3">
      {PLANOS_FUTUROS.map((p) => (
        <div key={p.titulo} className="text-center flex flex-col items-center">
          <div className="text-5xl mb-4">{p.icone}</div>
          <h3 className="text-xl font-bold text-white">{p.titulo}</h3>
          <p className="mt-2 text-base text-stone-400">{p.descricao}</p>
        </div>
      ))}
    </div>
  </section>
);

const TeamSection: FC = () => (
  <section id="equipe" className="mx-auto max-w-4xl px-6 py-24 text-center">
    <p className="text-orange-500 font-semibold tracking-wider uppercase">
      Os criadores
    </p>
    <h2 className="mt-2 text-3xl font-bold text-white">
      Equipe{" "}
      <span className="font-mono p-1 rounded bg-stone-800">{EQUIPE.nome}</span>
    </h2>
    <p className="mt-4 text-lg text-stone-400">{EQUIPE.membros.join(" • ")}</p>
  </section>
);

const CTASection: FC = () => (
  <section className="mx-auto max-w-5xl px-6 pb-24">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-10 text-center shadow-2xl">
      {/* ÍCONE DO PROJETO ADICIONADO AQUI */}
      <img
        src="/icone.svg"
        alt="Ícone Vector"
        className="h-16 w-16 mx-auto mb-4"
      />
      <h2 className="text-3xl font-extrabold text-white">
        Venha criar uma universidade mais acessível para todos.
      </h2>
      <p className="mt-3 text-lg text-white/80">
        Faça parte da mudança. Apoie, contribua ou cadastre-se para receber
        novidades.
      </p>
      <div className="mt-8">
        <a
          href="#"
          className="inline-block rounded-md bg-white px-8 py-3 text-base font-bold text-orange-600 shadow-lg hover:bg-stone-200 transition-colors"
        >
          Junte-se à Comunidade
        </a>
      </div>
    </div>
  </section>
);

/* =============================================================================
 * 5. PÁGINA PRINCIPAL
 * ========================================================================== */
const VectorLandingPage: FC = () => {
  return (
    <div className={`min-h-screen w-full font-sans text-stone-200 ${theme.bg}`}>
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <DifferentialsSection />
        <FutureSection />
        <TeamSection />
        <CTASection />
      </main>
    </div>
  );
};

export default VectorLandingPage;
