import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { varkQuestions } from '../data/varkQuestions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VarkTestProps {
  onComplete: () => void;
}

export default function VarkTest({ onComplete }: VarkTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState({ visual: 0, auditory: 0, reading: 0, kinesthetic: 0 });
  const [dominantStyle, setDominantStyle] = useState('');
  const { user } = useAuth();

  const handleNext = () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers, varkQuestions[currentQuestion].options[selectedOption].type];
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestion < varkQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        calculateResult(newAnswers);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
      setSelectedOption(null);
    }
  };

  const handleStartTest = () => {
    setCurrentQuestion(0);
  };

  const calculateResult = (finalAnswers: string[]) => {
    const calculatedScores = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0,
    };

    finalAnswers.forEach((answer) => {
      calculatedScores[answer as keyof typeof calculatedScores]++;
    });

    const maxScore = Math.max(calculatedScores.visual, calculatedScores.auditory, calculatedScores.reading, calculatedScores.kinesthetic);
    let dominant = '';

    if (calculatedScores.visual === maxScore) dominant = 'visual';
    else if (calculatedScores.auditory === maxScore) dominant = 'auditory';
    else if (calculatedScores.reading === maxScore) dominant = 'reading';
    else dominant = 'kinesthetic';

    setScores(calculatedScores);
    setDominantStyle(dominant);
    setShowResults(true);

    if (user) {
      supabase.from('vark_results').insert({
        user_id: user.id,
        visual_score: calculatedScores.visual,
        auditory_score: calculatedScores.auditory,
        reading_score: calculatedScores.reading,
        kinesthetic_score: calculatedScores.kinesthetic,
        dominant_style: dominant,
      });
    }
  };

  const progress = currentQuestion >= 0 ? ((currentQuestion + 1) / varkQuestions.length) * 100 : 0;

  const getStyleLabel = (style: string) => {
    const labels = {
      visual: 'Visual',
      auditory: 'Auditivo',
      reading: 'Leitura/Escrita',
      kinesthetic: 'Cinestésico'
    };
    return labels[style as keyof typeof labels] || style;
  };

  const getStyleDescription = (style: string) => {
    const descriptions = {
      visual: 'Você aprende melhor através de elementos visuais',
      auditory: 'Você aprende melhor através de sons e audições',
      reading: 'Você aprende melhor através da leitura e escrita',
      kinesthetic: 'Você aprende melhor através de movimentos e práticas'
    };
    return descriptions[style as keyof typeof descriptions] || '';
  };

  const getStyleColor = (style: string) => {
    const colors = {
      visual: 'from-blue-500 to-blue-600',
      auditory: 'from-purple-500 to-purple-600',
      reading: 'from-green-500 to-green-600',
      kinesthetic: 'from-orange-500 to-orange-600'
    };
    return colors[style as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getStudyTips = (style: string) => {
    const tips = {
      visual: [
        'Use gráficos, diagramas e mapas mentais',
        'Destaque informações importantes com cores',
        'Desenhe conceitos matemáticos',
        'Use flashcards com imagens',
        'Prefira vídeos educativos e animações'
      ],
      auditory: [
        'Grave áudios das suas anotações',
        'Participe de discussões em grupo',
        'Use músicas ou ritmos para memorizar',
        'Explique o conteúdo em voz alta',
        'Ouça podcasts educativos'
      ],
      reading: [
        'Faça resumos e anotações detalhadas',
        'Reescreva as informações importantes',
        'Use listas e tópicos para organizar',
        'Leia em voz alta para fixar melhor',
        'Crie manuais ou guias de estudo'
      ],
      kinesthetic: [
        'Use movimentos físicos para aprender',
        'Faça experimentos práticos',
        'Use objetos físicos para representar conceitos',
        'Estude enquanto caminha ou se movimenta',
        'Pratique com exercícios hands-on'
      ]
    };
    return tips[style as keyof typeof tips] || [];
  };

  const getMathTips = (style: string) => {
    const tips = {
      visual: [
        'Visualize problemas através de desenhos e gráficos',
        'Use representações geométricas para álgebra',
        'Crie esquemas coloridos para fórmulas',
        'Utilize software de geometria dinâmica',
        'Desenhe diagramas para problemas de lógica'
      ],
      auditory: [
        'Explique os passos dos problemas em voz alta',
        'Use mnemônicos com ritmo para fórmulas',
        'Grave áudios explicando conceitos matemáticos',
        'Discuta soluções com colegas',
        'Ouça explicações em áudio'
      ],
      reading: [
        'Escreva passo a passo a resolução de problemas',
        'Crie listas de fórmulas e teoremas',
        'Leia problemas matemáticos em voz alta',
        'Faça resumos escritos dos conceitos',
        'Use textos explicativos detalhados'
      ],
      kinesthetic: [
        'Use materiais manipuláveis para geometria',
        'Represente problemas com objetos físicos',
        'Faça gestos para representar operações',
        'Use o corpo para entender ângulos e formas',
        'Pratique com jogos matemáticos físicos'
      ]
    };
    return tips[style as keyof typeof tips] || [];
  };

  const renderResults = () => {
    const totalQuestions = varkQuestions.length;
    
    return (
      <div className="min-h-screen bg-[#CED0FF] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header do Resultado */}
            <div className="bg-[#150B53] p-6 text-center">
              <h1 className="text-xl font-bold text-white mb-4">Resultado do seu Teste VARK</h1>
              
              {/* Resultado Principal */}
              <div className="bg-white rounded-xl p-4 mx-auto max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Seu estilo de aprendizagem predominante é: <span className="text-blue-600">{getStyleLabel(dominantStyle)}</span>
                </h2>
                <p className="text-gray-700 text-sm">
                  {getStyleDescription(dominantStyle)}
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Distribuição dos Estilos */}
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Distribuição dos seus Estilos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
                {Object.entries(scores).map(([style, score]) => (
                  <div 
                    key={style}
                    className={`bg-gradient-to-r ${getStyleColor(style)} text-white p-3 rounded-xl shadow-lg`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">{getStyleLabel(style)}</span>
                      <span className="font-bold text-base">
                        {score}/10 ({Math.round((score / totalQuestions) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(score / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dicas Específicas para o Estilo Dominante */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                    Dicas de Estudo para {getStyleLabel(dominantStyle)}
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {getStudyTips(dominantStyle).map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                    Dicas de Matemática para {getStyleLabel(dominantStyle)}
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {getMathTips(dominantStyle).map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botão Continuar */}
              <button
                onClick={onComplete}
                className="w-full py-3 bg-[#150B53] hover:bg-[#2a1a7a] text-white font-medium rounded-lg transition-colors"
              >
                Continuar para Minhas Turmas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tela de explicação do teste
  if (currentQuestion === -1 && !showResults) {
    return (
      <div className="min-h-screen bg-[#CED0FF] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#150B53] p-6 text-center">
              <h1 className="text-xl font-bold text-white mb-2">Teste VARK</h1>
              <p className="text-[#c8b3ff] text-xs">
                Descubra seu estilo de aprendizagem preferido e potencialize seus estudos em matemática!
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Como funciona:</h2>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• 10 perguntas sobre suas preferências de aprendizagem</li>
                  <li>• Cada pergunta tem 4 alternativas (A, B, C, D)</li>
                  <li>• Resultado personalizado com dicas de estudo</li>
                  <li>• Tempo estimado: 5-10 minutos</li>
                </ul>
              </div>

              <button
                onClick={handleStartTest}
                className="w-full py-3 bg-[#150B53] hover:bg-[#2a1a7a] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Iniciar Teste
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="min-h-screen bg-[#CED0FF] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#150B53] p-6 text-center">
            <h1 className="text-xl font-bold text-white mb-2">Teste VARK</h1>
            <p className="text-[#c8b3ff] text-xs">
              Descubra seu estilo de aprendizagem preferido e potencialize seus estudos em matemática!
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="p-2 bg-gray-100">
            <div className="h-2 bg-[#c8b3ff] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="p-6">
            {/* Contador de questões */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-[#6f42c1] bg-[#f0ebff] px-3 py-1 rounded-full">
                Questão {currentQuestion + 1} de {varkQuestions.length}
              </span>
            </div>

            {/* Pergunta */}
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {varkQuestions[currentQuestion].question}
            </h2>

            {/* Opções */}
            <div className="space-y-2 mb-6">
              {varkQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    selectedOption === index
                      ? 'border-[#6f42c1] bg-[#f0ebff]'
                      : 'border-gray-200 hover:border-[#c8b3ff] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedOption === index ? 'border-[#6f42c1]' : 'border-gray-300'
                      }`}
                    >
                      {selectedOption === index && (
                        <div className="w-2 h-2 rounded-full bg-[#6f42c1]" />
                      )}
                    </div>
                    <span className="text-gray-900 text-sm">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Botões de navegação */}
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              
              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className="flex-1 py-2 bg-[#150B53] hover:bg-[#2a1a7a] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
              >
                {currentQuestion < varkQuestions.length - 1 ? 'Próxima' : 'Ver Resultado'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}