import { useState, useEffect } from 'react';
import { BookOpen, LogOut, Check, Users, FileText, X, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // Import da logo

interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  created_at: string;
  original_teacher_id?: string; // Opcional para compatibilidade
}

interface Activity {
  id: string;
  classroom_id: string;
  teacher_id: string;
  title: string;
  description: string;
  learning_style: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

interface StudentHomeProps {
  onStartTest: () => void;
  hasCompletedTest: boolean;
  varkResult: any;
}

export default function StudentHome({ onStartTest, hasCompletedTest, varkResult }: StudentHomeProps) {
  const { user, signOut } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [classroomCode, setClassroomCode] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carrega turmas do aluno do localStorage
  useEffect(() => {
    if (user) {
      loadStudentClassrooms();
    }
  }, [user]);

  // Carrega atividades quando seleciona uma turma
  useEffect(() => {
    if (selectedClassroom) {
      loadClassroomActivities(selectedClassroom);
    }
  }, [selectedClassroom]);

  const loadStudentClassrooms = () => {
    try {
      const saved = localStorage.getItem(`student_classrooms_${user?.id}`);
      if (saved) {
        const parsed: Classroom[] = JSON.parse(saved);
        setClassrooms(parsed);
        
        // Seleciona a primeira turma se não houver seleção
        if (parsed.length > 0 && !selectedClassroom) {
          setSelectedClassroom(parsed[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar turmas do aluno:', err);
    }
  };

  const loadClassroomActivities = (classroomId: string) => {
    try {
      // SOLUÇÃO: Procura atividades em TODOS os professores
      let foundActivities: Activity[] = [];
      
      // Percorre localStorage para encontrar as atividades desta turma
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('activities_')) {
          // activities_CLASSROOM_ID
          const activityClassroomId = key.replace('activities_', '');
          
          if (activityClassroomId === classroomId) {
            const activitiesData: Activity[] = JSON.parse(localStorage.getItem(key) || '[]');
            foundActivities = activitiesData;
            console.log('✅ Atividades encontradas para turma:', classroomId, activitiesData);
            break;
          }
        }
      }
      
      setActivities(foundActivities);
      
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
      setActivities([]);
    }
  };

  const saveStudentClassrooms = (classrooms: Classroom[]) => {
    localStorage.setItem(`student_classrooms_${user?.id}`, JSON.stringify(classrooms));
  };

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formattedCode = classroomCode.trim().toUpperCase();

      if (!formattedCode) {
        throw new Error('Digite um código da turma');
      }

      if (formattedCode.length !== 6) {
        throw new Error('O código deve ter 6 caracteres');
      }

      console.log('🔍 Procurando turma com código:', formattedCode);

      // SOLUÇÃO: Procura a turma em TODOS os dados salvos no localStorage
      let foundClassroom: Classroom | null = null;
      let foundTeacherId: string = '';

      // Percorre todas as chaves do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Procura em chaves que começam com "classrooms_"
        if (key && key.startsWith('classrooms_')) {
          try {
            const teacherId = key.replace('classrooms_', '');
            const teacherClassrooms: Classroom[] = JSON.parse(localStorage.getItem(key) || '[]');
            const classroom = teacherClassrooms.find(c => c.code === formattedCode);
            
            if (classroom) {
              foundClassroom = classroom;
              foundTeacherId = teacherId;
              console.log('✅ Turma encontrada:', classroom, 'do professor:', teacherId);
              break;
            }
          } catch (err) {
            console.warn('Erro ao ler dados do professor:', err);
          }
        }
      }

      if (!foundClassroom) {
        throw new Error('Turma não encontrada. Verifique o código.');
      }

      // Verifica se o aluno já está na turma
      const alreadyJoined = classrooms.some(c => c.id === foundClassroom!.id);
      if (alreadyJoined) {
        throw new Error('Você já está nesta turma.');
      }

      // CORREÇÃO: Criar um novo objeto Classroom com a propriedade opcional
      const classroomWithTeacher: Classroom = {
        ...foundClassroom,
        original_teacher_id: foundTeacherId || undefined // Converte string vazia para undefined
      };

      // Adiciona a turma ao aluno
      const updatedClassrooms = [...classrooms, classroomWithTeacher];
      setClassrooms(updatedClassrooms);
      saveStudentClassrooms(updatedClassrooms);
      
      // Seleciona a turma automaticamente
      setSelectedClassroom(foundClassroom.id);

      // Fecha o modal e limpa
      setShowJoinModal(false);
      setClassroomCode('');

      console.log('✅ Aluno entrou na turma:', foundClassroom.name);

    } catch (err: any) {
      console.error('❌ Erro ao entrar na turma:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (activity: Activity) => {
    if (!activity.file_url) return;
    
    const link = document.createElement('a');
    link.href = activity.file_url;
    link.download = activity.file_name || 'arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      visual: 'Visual',
      auditory: 'Auditivo',
      reading: 'Leitura/Escrita',
      kinesthetic: 'Cinestésico',
    };
    return labels[style] || style;
  };

  const getStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      visual: 'bg-blue-100 text-blue-800 border-blue-200',
      auditory: 'bg-green-100 text-green-800 border-green-200',
      reading: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      kinesthetic: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[style] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getFileTypeLabel = (fileType?: string) => {
    if (!fileType) return 'Arquivo';
    
    const types: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'text/plain': 'Texto',
      'image/jpeg': 'Imagem JPEG',
      'image/png': 'Imagem PNG',
      'video/mp4': 'Vídeo MP4',
      'audio/mpeg': 'Áudio MP3',
      'application/zip': 'Arquivo ZIP'
    };
    
    return types[fileType] || 'Arquivo';
  };

  const styleInfo = varkResult ? getStyleInfo(varkResult.dominant_style) : null;
  const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] to-white">
    <nav className="bg-[#150B53] shadow-sm border-b border-[#150B53]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Neuma Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
          <span className="text-white">Olá, {user?.full_name}</span>
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
              <img 
                src={logo} 
                alt="Neuma Logo" 
                className="w-24 h-24 mx-auto mb-6 object-contain"
              />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Neuma!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Descubra seu estilo de aprendizagem com o Teste VARK
              </p>

              <div className="bg-[#f0ebff] rounded-2xl p-8 mb-8 text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é o VARK?</h2>
                <p className="text-gray-700 mb-4">
O VARK é uma abordagem que identifica quatro estilos de aprendizagem: <strong>Visual, Auditivo, Leitura/Escrita e Cinestésico</strong> <br /> para entender como cada pessoa prefere receber informações. Conhecer esses estilos permite adaptar o ensino às necessidades individuais dos alunos, tornando o aprendizado mais eficaz.                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#6f42c1] flex-shrink-0 mt-" />
                    <div>
                      <strong>Visual:</strong> Aprende com imagens
                    </div>
                  </div>
                  <div className="flex items-start gap-">
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
                className="px-12 py-4 bg-[#150B53] hover:bg-[#350B53] text-white text-lg font-semibold rounded-xl transition-colors"
              >
                Começar Teste
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {styleInfo && (
              <div className="bg-gradient-to-br from-[#6f42c1] to-[#8b5cf6] rounded-3xl shadow-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-4">Seu Estilo de Aprendizagem</h1>
                <h2 className="text-4xl font-bold mb-4">{styleInfo.name}</h2>
                <p className="text-lg mb-6 text-white/90">{styleInfo.description}</p>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Dicas para seu aprendizado:</h3>
                  <ul className="space-y-2">
                    {styleInfo.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 flex-shrink-0 mt-1" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de Turmas */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Minhas Turmas</h3>
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#6f42c1] hover:bg-[#5a35a0] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Entrar
                    </button>
                  </div>

                  {classrooms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Nenhuma turma ainda</p>
                      <p className="text-sm">Entre em uma turma com o código do professor</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {classrooms.map((classroom) => (
                        <button
                          key={classroom.id}
                          onClick={() => setSelectedClassroom(classroom.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedClassroom === classroom.id
                              ? 'bg-[#6f42c1] text-white'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="font-medium text-sm">{classroom.name}</div>
                          <div className={`text-xs font-mono ${
                            selectedClassroom === classroom.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            Código: {classroom.code}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Atividades da Turma Selecionada */}
              <div className="lg:col-span-2">
                {selectedClassroom ? (
                  <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedClassroomData?.name}
                        </h2>
                        <p className="text-gray-600">
                          Código: <span className="font-mono font-bold">{selectedClassroomData?.code}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900">Atividades da Turma</h3>
                      {activities.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg mb-2">Nenhuma atividade disponível</p>
                          <p className="text-sm">O professor ainda não postou atividades para esta turma</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities.map((activity) => (
                            <div key={activity.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900 text-lg">{activity.title}</h4>
                                    <span className={`text-xs px-3 py-1 rounded-full border ${getStyleColor(activity.learning_style)}`}>
                                      {getStyleLabel(activity.learning_style)}
                                    </span>
                                  </div>
                                  {activity.description && (
                                    <p className="text-gray-600 mb-3">{activity.description}</p>
                                  )}
                                  
                                  {/* Arquivo anexado */}
                                  {activity.file_url && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-blue-800 truncate">
                                          {activity.file_name}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                          {getFileTypeLabel(activity.file_type)}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => downloadFile(activity)}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                                      >
                                        <Download className="w-3 h-3" />
                                        Baixar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                Postada em: {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione uma turma</h2>
                    <p className="text-gray-600">Escolha uma turma para ver as atividades</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Entrar na Turma */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Entrar em uma Turma</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setError('');
                  setClassroomCode('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Erro</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
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
                  placeholder="Digite o código de 6 caracteres"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent text-center text-2xl font-mono tracking-wider"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Peça o código de 6 caracteres ao seu professor
                </p>
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
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar na Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

