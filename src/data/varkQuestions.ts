export interface VarkQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    type: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  }[];
}

export const varkQuestions: VarkQuestion[] = [
  {
    id: 1,
    question: 'Quando você precisa aprender a usar um novo aplicativo, você prefere:',
    options: [
      { text: 'Assistir a um vídeo tutorial mostrando o passo a passo.', type: 'visual' },
      { text: 'Ouvir alguém explicando como usar e fazer perguntas.', type: 'auditory' },
      { text: 'Ler o manual ou as instruções escritas.', type: 'reading' },
      { text: 'Ir testando e explorando por conta própria.', type: 'kinesthetic' },
    ],
  },
  {
    id: 2,
    question: 'Em uma palestra ou aula, o que mais ajuda você a entender o conteúdo?',
    options: [
      { text: 'Slides com gráficos, esquemas e imagens.', type: 'visual' },
      { text: 'A fala clara e a entonação do palestrante.', type: 'auditory' },
      { text: 'Receber um resumo por escrito.', type: 'reading' },
      { text: 'Participar com atividades, demonstrações ou experiências.', type: 'kinesthetic' },
    ],
  },
  {
    id: 3,
    question: 'Quando você tenta memorizar algo, o que costuma fazer?',
    options: [
      { text: 'Associa imagens ou esquemas mentais ao conteúdo.', type: 'visual' },
      { text: 'Repete em voz alta ou grava áudios para ouvir depois.', type: 'auditory' },
      { text: 'Faz anotações, resumos ou reescreve várias vezes.', type: 'reading' },
      { text: 'Associa com movimentos, situações práticas ou exemplos do dia a dia.', type: 'kinesthetic' },
    ],
  },
  {
    id: 4,
    question: 'Ao receber uma receita culinária nova, você prefere:',
    options: [
      { text: 'Ver um vídeo mostrando a receita sendo preparada.', type: 'visual' },
      { text: 'Ouvir alguém explicando o passo a passo por telefone ou pessoalmente.', type: 'auditory' },
      { text: 'Ler a receita escrita com todos os detalhes.', type: 'reading' },
      { text: 'Ir preparando enquanto aprende, mesmo que erre.', type: 'kinesthetic' },
    ],
  },
  {
    id: 5,
    question: 'Quando está em um museu ou local histórico, o que mais chama sua atenção?',
    options: [
      { text: 'As imagens, maquetes e exposições visuais.', type: 'visual' },
      { text: 'Os áudios com explicações ou guias falando sobre o local.', type: 'auditory' },
      { text: 'As placas com textos explicativos.', type: 'reading' },
      { text: 'As reconstruções interativas ou a possibilidade de tocar objetos.', type: 'kinesthetic' },
    ],
  },
  {
    id: 6,
    question: 'Para aprender um novo idioma, você prefere:',
    options: [
      { text: 'Usar aplicativos com imagens e associações visuais.', type: 'visual' },
      { text: 'Ouvir músicas, podcasts ou conversar com nativos.', type: 'auditory' },
      { text: 'Ler textos e fazer anotações de vocabulário.', type: 'reading' },
      { text: 'Praticar situações reais, como simulações de diálogos.', type: 'kinesthetic' },
    ],
  },
  {
    id: 7,
    question: 'Quando está tentando lembrar o nome de uma pessoa, você costuma:',
    options: [
      { text: 'Visualizar o rosto dela ou o local onde a viu.', type: 'visual' },
      { text: 'Recordar a voz ou a conversa que tiveram.', type: 'auditory' },
      { text: 'Lembrar como o nome era escrito.', type: 'reading' },
      { text: 'Recordar o que estavam fazendo juntos.', type: 'kinesthetic' },
    ],
  },
  {
    id: 8,
    question: 'Diante de um novo conteúdo na escola/faculdade, você sente mais facilidade quando:',
    options: [
      { text: 'O professor usa esquemas, gráficos e imagens.', type: 'visual' },
      { text: 'A explicação é verbal e clara.', type: 'auditory' },
      { text: 'Há materiais de leitura, apostilas ou slides disponíveis.', type: 'reading' },
      { text: 'Você participa de experimentos ou atividades práticas.', type: 'kinesthetic' },
    ],
  },
  {
    id: 9,
    question: 'Em uma loja ou lugar novo, você costuma se orientar melhor:',
    options: [
      { text: 'Observando placas, mapas ou sinalizações visuais.', type: 'visual' },
      { text: 'Perguntando a alguém como chegar ao local.', type: 'auditory' },
      { text: 'Lendo descrições ou instruções do local.', type: 'reading' },
      { text: 'Caminhando, testando caminhos até encontrar.', type: 'kinesthetic' },
    ],
  },
  {
    id: 10,
    question: 'Qual destas atividades você acha mais agradável para aprender algo novo?',
    options: [
      { text: 'Desenhar ou assistir vídeos explicativos.', type: 'visual' },
      { text: 'Participar de discussões em grupo ou ouvir podcasts.', type: 'auditory' },
      { text: 'Ler livros, artigos e fazer anotações.', type: 'reading' },
      { text: 'Praticar diretamente, montar, desmontar, experimentar.', type: 'kinesthetic' },
    ],
  },
];