import { useState, useEffect } from 'react';
import { Brain, BookOpen, LogOut, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, VarkResult } from '../lib/supabase';

interface StudentHomeProps {
  onStartTest: () => void;
  hasCompletedTest: boolean;
}

export default function StudentHome({ onStartTest, hasCompletedTest }: StudentHomeProps) {
  const { user, signOut } = useAuth();
  const [varkResult, setVarkResult] = useState<VarkResult | null>(null);
  const [classroomCode, setClassroomCode] = useState('');
  const [hasClassroom, setHasClassroom] = useState(false);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadVarkResult();
    checkClassroom();
  }, [user]);

  const loadVarkResult = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('vark_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setVarkResult(data);
    }
  };

  const checkClassroom = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('classroom_members')
      .select('id')
      .eq('student_id', user.id)
      .maybeSingle();

    setHasClassroom(!!data);
  };

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id')
      .eq('code', classroomCode.toUpperCase())
      .maybeSingle();

    if (!classroom) {
      setError('Código de turma inválido');
      return;
    }

    const { error: joinError } = await supabase
      .from('classroom_members')
      .insert({
        classroom_id: classroom.id,
        student_id: user!.id,
      });

    if (joinError) {
      setError('Erro ao entrar na turma');
    } else {
      setShowJoinModal(false);
      setClassroomCode('');
      checkClassroom();
    }
  };

  const getStyleInfo = (style: string) => {
    const styles: Record<string, { name: string; description: string; tips: string[] }> = {
      visual: {
        name: 'Visual',
        description: 'Você aprende melhor através de imagens, gráficos, diagramas e demonstrações visuais.',
        tips: [
          'Use mapas mentais e esquemas coloridos',
          'Assista vídeos educativos',
          'Destaque informações importantes com cores',
          'Use diagramas e infográficos para estudar'
        ]
      },
      auditory: {
        name: 'Auditivo',
        description: 'Você aprende melhor ouvindo explicações, conversas e discussões.',
        tips: [
          'Grave áudios das suas anotações',
          'Participe de discussões em grupo',
          'Ouça podcasts educativos',
          'Explique o conteúdo em voz alta'
        ]
      },
      reading: {
        name: 'Leitura/Escrita',
        description: 'Você aprende melhor lendo e escrevendo textos.',
        tips: [
          'Faça resumos e anotações detalhadas',
          'Leia livros e artigos sobre o tema',
          'Reescreva informações com suas palavras',
          'Crie listas e glossários'
        ]
      },
      kinesthetic: {
        name: 'Cinestésico',
        description: 'Você aprende melhor através da prática e experiências concretas.',
        tips: [
          'Faça experimentos práticos',
          'Use simulações e jogos educativos',
          'Estude em diferentes ambientes',
          'Associe movimentos ao aprendizado'
        ]
      }
    };

    return styles[style] || styles.visual;
  };

  const styleInfo = varkResult ? getStyleInfo(varkResult.dominant_style) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#6f42c1]" />
            <span className="text-2xl font-bold text-[#6f42c1]">neuma</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.full_name}</span>
            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:text-[#6f42c1] transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!hasCompletedTest ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <Brain className="w-24 h-24 mx-auto mb-6 text-[#6f42c1]" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Neuma!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Descubra seu estilo de aprendizagem com o Teste VARK
              </p>

              <div className="bg-[#f0ebff] rounded-2xl p-8 mb-8 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é o VARK?</h2>
                <p className="text-gray-700 mb-4">
                  O VARK é um questionário que identifica seu estilo de aprendizagem preferido entre quatro tipos:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#6f42c1] flex-shrink-0 mt-1" />
                    <div>
                      <strong>Visual:</strong> Aprende com imagens
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#6f42c1] flex-shrink-0 mt-1" />
                    <div>
                      <strong>Auditivo:</strong> Aprende ouvindo
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#6f42c1] flex-shrink-0 mt-1" />
                    <div>
                      <strong>Leitura/Escrita:</strong> Aprende lendo
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#6f42c1] flex-shrink-0 mt-1" />
                    <div>
                      <strong>Cinestésico:</strong> Aprende fazendo
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartTest}
                className="px-12 py-4 bg-[#6f42c1] hover:bg-[#5a35a0] text-white text-lg font-semibold rounded-xl transition-colors"
              >
                Começar Teste
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {styleInfo && (
              <div className="bg-gradient-to-br from-[#6f42c1] to-[#8b5cf6] rounded-3xl shadow-xl p-12 text-white">
                <h1 className="text-4xl font-bold mb-4">Seu Estilo de Aprendizagem</h1>
                <h2 className="text-5xl font-bold mb-6">{styleInfo.name}</h2>
                <p className="text-xl mb-8 text-white/90">{styleInfo.description}</p>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Dicas para potencializar seu aprendizado:</h3>
                  <ul className="space-y-3">
                    {styleInfo.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 flex-shrink-0 mt-1" />
                        <span className="text-lg">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!hasClassroom ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-6 text-[#6f42c1]" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Participe de uma Turma</h2>
                <p className="text-gray-600 mb-8">
                  Insira o código fornecido pelo seu professor para acessar atividades personalizadas
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-12 py-4 bg-[#6f42c1] hover:bg-[#5a35a0] text-white text-lg font-semibold rounded-xl transition-colors"
                >
                  Entrar em uma Turma
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Suas Atividades</h2>
                <p className="text-center text-gray-600">
                  Seu professor irá disponibilizar atividades aqui em breve!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar em uma Turma</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleJoinClassroom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Turma
                </label>
                <input
                  type="text"
                  value={classroomCode}
                  onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent text-center text-2xl font-mono tracking-wider"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setError('');
                    setClassroomCode('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}