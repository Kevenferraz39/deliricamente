/* ============================================================
   Seed data — posts, timeline, gallery, agenda
   ============================================================ */

   const SEED_POSTS = [
    {
      id: "p001",
      type: "EVENTO",
      title: "EPIFANIA — Deliricamente Apresenta",
      excerpt:
        "Um dia inteiro de cultura na Praça Pró Polo: show, breaking, live paint, oficinas de fanzine, exposições e ativações pelo coletivo.",
      cover: { label: "POSTER · EPIFANIA · NOV/2024", variant: "red" },
      date: "2024-11-23",
      author: "Coletivo Deliricamente",
      likes: 158,
      fires: 232,
      comments: 26,
      views: 1840,
      tags: ["EPIFANIA", "Show", "Praça Pró Polo"],
      status: "published",
      body: [
        { kind: "p", text: "Delíricamente apresenta EPIFANIA — um evento com a programação cheia de cultura underground, atitude e revolução. No dia 23 de novembro a Praça Pró Polo vai ser tomada por som, traço, movimento e palavra. Tudo grátis, tudo nosso." },
        { kind: "h2", text: "A programação completa" },
        { kind: "ul", items: ["Show Deliricamente", "Cinema na praça", "Pocket show", "Breaking", "Exposições", "Live paint", "Discotecagem", "Oficina de fanzine", "Palestras", "Trancistas", "+ ativações no evento"] },
        { kind: "p", text: "Tudo realizado em parceria com Prelúdio e Mangueio Filmes, sob o guarda-chuva do movimento Arte, Guerrilha e Conhecimento — AGC. Espaço seguro, pista cheia e a quebrada inteira convocada." },
        { kind: "quote", text: "Viva a nascença da cultura underground." },
        { kind: "p", text: "Confirme presença, chama a galera e traz quem nunca foi num rolê do coletivo. EPIFANIA é pra todo mundo." },
        { kind: "embed", label: "VIDEO · TEASER EPIFANIA" },
      ],
    },
    {
      id: "p002",
      type: "SHOW",
      title: "Show Deliricamente — Delírio em Coletivo",
      excerpt:
        "Leo Braga, MC Roma, GuLírico, DJ Champola e o resto da família no palco. Set inédito com faixas do próximo trampo.",
      cover: { label: "REGISTRO · SHOW DELIRICAMENTE", variant: "" },
      date: "2024-11-23",
      author: "Hery",
      likes: 61,
      fires: 27,
      comments: 7,
      views: 920,
      tags: ["Show", "MC Roma", "GuLírico"],
      status: "published",
      body: [
        { kind: "p", text: "Deliricamente chega forte com uma junção das loucuras de Leo Braga, MC Roma, GuLírico, DJ Champola e parceiros de longa data. Set construído coletivamente nas últimas semanas de oficina e ensaio." },
        { kind: "p", text: "Quem foi sabe — quem não foi vai ter a chance no próximo. A gravação saí em breve no canal." },
      ],
    },
    {
      id: "p003",
      type: "NOTÍCIA",
      title: "Arrecadação de Alimentos — Quebrada Cuida da Quebrada",
      excerpt:
        "Durante a EPIFANIA o coletivo arrecadou mais de 200 cestas básicas. Toda doação foi direto pra famílias de Caieiras.",
      cover: { label: "REGISTRO · ARRECADAÇÃO", variant: "" },
      date: "2024-11-30",
      author: "Coletivo Deliricamente",
      likes: 89,
      fires: 142,
      comments: 14,
      views: 1120,
      tags: ["Comunidade", "Solidariedade", "Caieiras"],
      status: "published",
      body: [
        { kind: "p", text: "Durante a EPIFANIA o coletivo arrecadou alimentos não perecíveis pra distribuir entre famílias da quebrada. A meta foi superada em mais de duas vezes graças à galera que abraçou a ideia." },
        { kind: "p", text: "Agradecimento especial pros parceiros que doaram, montaram pontos de coleta e ajudaram na distribuição. Continua nessa que tem mais pela frente." },
      ],
    },
    {
      id: "p004",
      type: "CULTURA",
      title: "Oficina de Fanzine — Faça o seu zine",
      excerpt:
        "Oficina aberta de criação de fanzines com material reciclado. Sem inscrição, é só chegar com vontade.",
      cover: { label: "OFICINA · FANZINE", variant: "paper" },
      date: "2024-11-15",
      author: "Prelúdio",
      likes: 47,
      fires: 38,
      comments: 9,
      views: 720,
      tags: ["Oficina", "Fanzine", "Literatura Periférica"],
      status: "published",
      body: [
        { kind: "p", text: "A oficina de fanzine voltou! Tradição do coletivo desde os primeiros rolês, é onde a literatura periférica encontra o traço e a cola quente. Material reciclado, mesas no chão, conversa boa." },
        { kind: "p", text: "A galera produziu 23 zines no último encontro — alguns viraram parte do acervo do coletivo." },
      ],
    },
    {
      id: "p005",
      type: "EVENTO",
      title: "Campanha do Agasalho — Quebrada Aquecida",
      excerpt:
        "Ponto de coleta de roupas de inverno no Centro Cultural até 30 de junho. Doação que volta pra quem precisa.",
      cover: { label: "CAMPANHA · AGASALHO", variant: "red" },
      date: "2024-06-10",
      author: "Mangueio Filmes",
      likes: 73,
      fires: 56,
      comments: 12,
      views: 980,
      tags: ["Comunidade", "Campanha"],
      status: "published",
      body: [
        { kind: "p", text: "Inverno bateu — quebrada cuida da quebrada. Ponto de coleta no Centro Cultural até dia 30, com distribuição na semana seguinte. Roupas de adulto, criança, cobertor — tudo é bem-vindo." },
      ],
    },
    {
      id: "p006",
      type: "ANÚNCIO",
      title: "Batalha de Rima — Edição #12",
      excerpt:
        "Última quinta de cada mês na Praça do Polo. Inscrições abertas no Instagram do coletivo. Premiação em livros e produtos do AGC.",
      cover: { label: "BATALHA · RIMA #12", variant: "" },
      date: "2024-05-22",
      author: "MC Roma",
      likes: 134,
      fires: 187,
      comments: 31,
      views: 2240,
      tags: ["Batalha", "Rima", "Cypher"],
      status: "published",
      body: [
        { kind: "p", text: "Décima segunda edição da batalha — a casa cheia, a galera nova chegando junto, e os veteranos não dando moleza pra ninguém. Vinheta nova, beat novo, sangue novo." },
      ],
    },
  ];
  
  const TIMELINE = [
    { year: "2018", title: "A Semente — primeiros encontros", body:
      "Um grupo de mcs, escritores e produtores começa a se encontrar em rolês informais em Caieiras. Sem nome, sem agenda, só com a vontade de fazer arte do jeito da quebrada.",
      tags: ["Origem", "Caieiras", "Hip-hop"] },
    { year: "2019", title: "Fundação do Coletivo Deliricamente", body:
      "Nasce o coletivo com o nome que veio de um verso solto numa roda. A primeira logo dos círculos concêntricos é desenhada à mão e nunca mais sai.",
      tags: ["Fundação", "Identidade"] },
    { year: "2020", title: "Pandemia — Lives, zines e doações", body:
      "Em meio ao isolamento, o coletivo passa pra lives, zines digitais e arrecadações. Mais de 400 cestas distribuídas só no primeiro semestre.",
      tags: ["Pandemia", "Solidariedade"] },
    { year: "2021", title: "Aliança com Prelúdio e Mangueio Filmes", body:
      "Os três coletivos formalizam o movimento AGC — Arte, Guerrilha e Conhecimento. A partir daí toda ação grande é assinada em conjunto.",
      tags: ["AGC", "Prelúdio", "Mangueio Filmes"] },
    { year: "2022", title: "Primeira EPIFANIA", body:
      "Estreia do festival próprio do coletivo. Show, cinema, breaking, live paint e oficinas no mesmo dia. Mais de 1.500 pessoas passaram pela praça.",
      tags: ["EPIFANIA", "Festival"] },
    { year: "2023", title: "Selo Underground e gravações", body:
      "Lançamento do selo independente com 6 singles e um EP coletivo. Gravações nos estúdios caseiros da galera e clipes assinados pela Mangueio.",
      tags: ["Selo", "EP", "Independente"] },
    { year: "2024", title: "EPIFANIA volta — maior, mais nossa", body:
      "Segunda edição na Praça Pró Polo com programação dobrada, ativações e a campanha de arrecadação batendo recorde do coletivo.",
      tags: ["EPIFANIA", "2024"] },
  ];
  
  const GALLERY = [
    { label: "EPIFANIA — palco principal",   size: "wide tall", variant: "red" },
    { label: "Live paint — muro do polo",    size: "",          variant: "" },
    { label: "Batalha de rima — final",      size: "tall",      variant: "" },
    { label: "Oficina de fanzine",           size: "",          variant: "paper" },
    { label: "MC Roma — show 2024",          size: "",          variant: "" },
    { label: "Breaking — cypher",            size: "wide",      variant: "" },
    { label: "Discotecagem — DJ Champola",   size: "",          variant: "" },
    { label: "Arrecadação — voluntários",    size: "tall",      variant: "red" },
    { label: "Trancistas — ativação",        size: "",          variant: "paper" },
    { label: "Bastidores — backstage",       size: "",          variant: "" },
    { label: "Show abertura — GuLírico",     size: "wide",      variant: "" },
    { label: "Público — EPIFANIA",           size: "",          variant: "red" },
  ];
  
  const AGENDA = [
    { dia: "23", mes: "NOV", ano: "2024", title: "EPIFANIA — 2ª Edição", local: "Praça Pró Polo · Caieiras", tipo: "Festival" },
    { dia: "14", mes: "DEZ", ano: "2024", title: "Batalha de Rima #13", local: "Centro Cultural · Caieiras", tipo: "Batalha" },
    { dia: "11", mes: "JAN", ano: "2025", title: "Pocket Show — Deliricamente", local: "Bar do Lipe · Vila Mariana", tipo: "Show" },
    { dia: "08", mes: "FEV", ano: "2025", title: "Oficina de Fanzine #07", local: "CEU Caieiras", tipo: "Oficina" },
  ];
  
  const COLLECTIVES = [
    {
      num: "01",
      role: "Som · Palavra · Rima",
      name: "Deliricamente",
      body: "Hip-hop, literatura periférica e batalhas de rima. O braço que coloca a quebrada no microfone e no papel — com a verdade que dói e a poesia que cura.",
    },
    {
      num: "02",
      role: "Texto · Pesquisa · Edição",
      name: "Prelúdio",
      body: "Coletivo de escrita e pensamento crítico. Faz as oficinas de fanzine, os textos das ações e cuida do acervo coletivo de literatura preta e periférica.",
    },
    {
      num: "03",
      role: "Imagem · Vídeo · Memória",
      name: "Mangueio Filmes",
      body: "Audiovisual independente. Documenta cada ação, assina os clipes do selo e mantém o arquivo vivo do movimento AGC em fotografia e filme.",
    },
  ];
  
  Object.assign(window, { SEED_POSTS, TIMELINE, GALLERY, AGENDA, COLLECTIVES });