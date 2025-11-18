import { useState, useEffect } from 'react';
import { BookOpen, LogOut, Check, Users, FileText, X, AlertCircle, Download, Search, ArrowLeft, Lightbulb, Brain, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  created_at: string;
  original_teacher_id?: string;
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
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [classroomCode, setClassroomCode] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudentClassrooms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClassroom) {
      loadClassroomActivities(selectedClassroom);
    }
  }, [selectedClassroom]);

  useEffect(() => {
    if (activities.length > 0) {
      const filtered = activities.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities([]);
    }
  }, [activities, searchTerm]);

  const loadStudentClassrooms = () => {
    try {
      const saved = localStorage.getItem(`student_classrooms_${user?.id}`);
      if (saved) {
        const parsed: Classroom[] = JSON.parse(saved);
        setClassrooms(parsed);
        
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
      let foundActivities: Activity[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('activities_')) {
          const activityClassroomId = key.replace('activities_', '');
          
          if (activityClassroomId === classroomId) {
            const activitiesData: Activity[] = JSON.parse(localStorage.getItem(key) || '[]');
            foundActivities = activitiesData;
            break;
          }
        }
      }
      
      setActivities(foundActivities);
      setFilteredActivities(foundActivities);
      
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
      setActivities([]);
      setFilteredActivities([]);
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

      let foundClassroom: Classroom | null = null;
      let foundTeacherId: string = '';

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('classrooms_')) {
          try {
            const teacherId = key.replace('classrooms_', '');
            const teacherClassrooms: Classroom[] = JSON.parse(localStorage.getItem(key) || '[]');
            const classroom = teacherClassrooms.find(c => c.code === formattedCode);
            
            if (classroom) {
              foundClassroom = classroom;
              foundTeacherId = teacherId;
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

      const alreadyJoined = classrooms.some(c => c.id === foundClassroom!.id);
      if (alreadyJoined) {
        throw new Error('Você já está nesta turma.');
      }

      const classroomWithTeacher: Classroom = {
        ...foundClassroom,
        original_teacher_id: foundTeacherId || undefined
      };

      const updatedClassrooms = [...classrooms, classroomWithTeacher];
      setClassrooms(updatedClassrooms);
      saveStudentClassrooms(updatedClassrooms);
      
      setSelectedClassroom(foundClassroom.id);
      setShowJoinModal(false);
      setClassroomCode('');

    } catch (err: any) {
      console.error('Erro ao entrar na turma:', err);
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
    const styles: Record<string, { 
      name: string; 
      description: string; 
      tips: string[];
      characteristics: string[];
      mathStrategies: string[];
      studyMethods: string[];
      icon: string;
      color: string;
    }> = {
      visual: {
        name: 'Visual',
        description: 'Você aprende melhor através de imagens, gráficos, diagramas e demonstrações visuais.',
        characteristics: [
          'Prefere ver informações em forma de imagens',
          'Gosta de mapas mentais e esquemas coloridos',
          'Memoriza através de associações visuais',
          'Entende melhor com demonstrações visuais'
        ],
        tips: [
          'Use mapas mentais e esquemas coloridos',
          'Assista vídeos educativos',
          'Destaque informações importantes com cores',
          'Use diagramas e infográficos para estudar'
        ],
        mathStrategies: [
          'Desenhe problemas matemáticos',
          'Use gráficos e tabelas coloridas',
          'Visualize fórmulas geometricamente',
          'Crie flashcards com imagens'
        ],
        studyMethods: [
          'Mapas mentais coloridos',
          'Vídeos explicativos',
          'Diagramas e fluxogramas',
          'Post-its coloridos'
        ],
        icon: '👁️',
        color: 'from-blue-500 to-blue-600'
      },
      auditory: {
        name: 'Auditivo',
        description: 'Você aprende melhor ouvindo explicações, conversas e discussões.',
        characteristics: [
          'Aprende melhor através de explicações orais',
          'Gosta de discutir ideias em grupo',
          'Memoriza com ritmos e músicas',
          'Prefere aulas expositivas'
        ],
        tips: [
          'Grave áudios das suas anotações',
          'Participe de discussões em grupo',
          'Use músicas ou ritmos para memorizar',
          'Explique o conteúdo em voz alta'
        ],
        mathStrategies: [
          'Explique problemas em voz alta',
          'Use mnemônicos com ritmo',
          'Grave áudios com fórmulas',
          'Discuta soluções com colegas'
        ],
        studyMethods: [
          'Gravações de áudio',
          'Discussões em grupo',
          'Podcasts educativos',
          'Leitura em voz alta'
        ],
        icon: '👂',
        color: 'from-green-500 to-green-600'
      },
      reading: {
        name: 'Leitura/Escrita',
        description: 'Você aprende melhor lendo e escrevendo textos.',
        characteristics: [
          'Prefere ler instruções escritas',
          'Gosta de fazer anotações detalhadas',
          'Aprende através da leitura',
          'Memoriza escrevendo e reescrevendo'
        ],
        tips: [
          'Faça resumos e anotações detalhadas',
          'Leia livros e artigos sobre o tema',
          'Reescreva informações com suas palavras',
          'Crie listas e glossários'
        ],
        mathStrategies: [
          'Escreva passo a passo a resolução',
          'Crie listas de fórmulas',
          'Faça resumos escritos',
          'Leia problemas em voz alta'
        ],
        studyMethods: [
          'Resumos escritos',
          'Listas organizadas',
          'Cartões de estudo',
          'Textos explicativos'
        ],
        icon: '📖',
        color: 'from-purple-500 to-purple-600'
      },
      kinesthetic: {
        name: 'Cinestésico',
        description: 'Você aprende melhor através da prática e experiências concretas.',
        characteristics: [
          'Aprende fazendo e praticando',
          'Gosta de atividades hands-on',
          'Memoriza através do movimento',
          'Prefere aprendizagem prática'
        ],
        tips: [
          'Use movimentos físicos para aprender',
          'Faça experimentos práticos',
          'Use objetos físicos para representar conceitos',
          'Estude enquanto caminha ou se movimenta'
        ],
        mathStrategies: [
          'Use materiais manipuláveis',
          'Represente problemas com objetos',
          'Faça gestos para operações',
          'Pratique com jogos matemáticos'
        ],
        studyMethods: [
          'Aprendizagem prática',
          'Experimentação',
          'Jogos educativos',
          'Simulações'
        ],
        icon: '🔄',
        color: 'from-orange-500 to-orange-600'
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
      reading: 'bg-purple-100 text-purple-800 border-purple-200',
      kinesthetic: 'bg-orange-100 text-orange-800 border-orange-200',
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

  // Verificar se o aluno já completou o teste
  const hasTakenTest = localStorage.getItem(`student_${user?.id}_has_taken_test`) === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] to-white">
      <nav className="bg-[#150B53] shadow-sm border-b border-[#150B53]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Neuma Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white text-sm md:text-base">Olá, {user?.full_name}</span>
            <button
              onClick={signOut}
              className="p-2 text-white hover:text-[#6f42c1] transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {!hasCompletedTest && !hasTakenTest ? (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8">
              {/* Cabeçalho com Logo e Título */}
              <div className="text-center mb-8">
                <img 
                  src={logo} 
                  alt="Neuma Logo" 
                  className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 object-contain"
                />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Bem-vindo ao Neuma
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Descubra seu estilo de aprendizagem com o Teste VARK
                </p>
              </div>

              {/* Seção O que é VARK */}
              <div className="bg-gray-50 rounded-xl p-6 md:p-8 mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">O que é o Modelo VARK?</h2>
                  <p className="text-gray-700 max-w-4xl mx-auto">
                    O VARK é um modelo que categoriza as preferências individuais de aprendizagem 
                    em quatro sistemas sensoriais principais, permitindo uma abordagem personalizada para o ensino.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-rows-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="w-5 h-5 text-[#6f42c1]" />
                      <h3 className="font-semibold text-gray-800">Estilos de Aprendizagem</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Os indivíduos aprendem melhor quando o conteúdo é apresentado de acordo com seu estilo preferido.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="w-5 h-5 text-[#6f42c1]" />
                      <h3 className="font-semibold text-gray-800">Adaptação</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Adequar estratégias de ensino para tornar o aprendizado mais eficaz e significativo.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-5 h-5 text-[#6f42c1]" />
                      <h3 className="font-semibold text-gray-800">Dificuldades</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Identifica desalinhamentos entre método de ensino e estilo do aluno.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-[#6f42c1]" />
                      <h3 className="font-semibold text-gray-800">Comunicação</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Torna a comunicação mais clara e compreensível para o aluno.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-5 h-5 text-[#6f42c1]" />
                      <h3 className="font-semibold text-gray-800">Aplicações</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Utilizado em educação, treinamento corporativo e desenvolvimento pessoal.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Check className="w-5 h-5 text-[#6f42c1]" />
                      <h3 className="font-semibold text-gray-800">Metodologia</h3>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Baseado em pesquisas sobre como o cérebro processa informações.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção Sistemas Sensoriais */}
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    Sistemas Sensoriais do VARK
                  </h2>
                  <p className="text-gray-700 max-w-4xl mx-auto">
                    Quatro sistemas sensoriais que influenciam como cada pessoa aprende
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Visual */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Brain className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Visual</h3>
                        <p className="text-gray-600 text-sm">Aprende através de imagens</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Prefere imagens, gráficos, diagramas e cores</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Lembra facilmente de esquemas e mapas mentais</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Gosta de materiais com organização visual clara</span>
                      </div>
                    </div>
                  </div>

                  {/* Auditivo */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Brain className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Auditivo</h3>
                        <p className="text-gray-600 text-sm">Aprende ouvindo</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Prefere ouvir explicações e conversas</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Lembra de detalhes de sons e palavras</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Gosta de músicas e gravações relacionadas ao conteúdo</span>
                      </div>
                    </div>
                  </div>

                  {/* Leitura/Escrita */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Leitura/Escrita</h3>
                        <p className="text-gray-600 text-sm">Aprende lendo e escrevendo</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Prefere textos e materiais escritos</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Facilidade em ler, escrever e reescrever</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Organiza o aprendizado com resumos e esquemas</span>
                      </div>
                    </div>
                  </div>

                  {/* Cinestésico */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Brain className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Cinestésico</h3>
                        <p className="text-gray-600 text-sm">Aprende fazendo</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Aprende melhor por meio da prática</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Lembra do que fez ou sentiu fisicamente</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">Prefere atividades práticas e experimentos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão Começar Teste */}
              <div className="text-center bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Pronto para Descobrir Seu Estilo?
                </h3>
                <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
                  Faça o teste VARK agora e descubra como você aprende melhor.
                </p>
                <button
                  onClick={onStartTest}
                  className="px-8 py-3 bg-[#150B53] hover:bg-[#350B53] text-white font-semibold rounded-lg transition-colors"
                >
                  Começar Teste VARK
                </button>
              </div>
            </div>
          </div>
        ) : (
          // ... resto do código para quando o teste já foi completado (mantido igual)
          <div className="space-y-6 md:space-y-8">
            {/* Seção Fixa com Informações do Sistema Sensorial */}
            {styleInfo && (
              <div className={`bg-gradient-to-r ${styleInfo.color} rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 text-white`}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Informações Principais */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">{styleInfo.icon}</div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">Seu Sistema Sensorial: {styleInfo.name}</h2>
                        <p className="text-white/90 text-sm md:text-base mt-1">{styleInfo.description}</p>
                      </div>
                    </div>

                    {/* Características */}
                    <div className="mb-4">
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Suas Características:
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {styleInfo.characteristics.map((char, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">{char}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Estratégias de Aprendizado */}
                  <div className="lg:w-96 space-y-4">
                    <div className="bg-white/20 rounded-xl p-4">
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Estratégias para Matemática:
                      </h3>
                      <ul className="space-y-1 text-xs md:text-sm">
                        {styleInfo.mathStrategies.map((strategy, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-white rounded-full mt-1.5 flex-shrink-0"></div>
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/20 rounded-xl p-4">
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Métodos de Estudo:
                      </h3>
                      <ul className="space-y-1 text-xs md:text-sm">
                        {styleInfo.studyMethods.map((method, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-white rounded-full mt-1.5 flex-shrink-0"></div>
                            <span>{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botão para refazer teste */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={onStartTest}
                    disabled={hasTakenTest}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs md:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {hasTakenTest ? 'Teste Concluído' : 'Refazer Teste'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Lista de Turmas - Coluna Esquerda */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-bold text-gray-900">Minhas Turmas</h3>
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#6f42c1] hover:bg-[#5a35a0] text-white text-xs md:text-sm font-medium rounded-lg transition-colors"
                    >
                      <Users className="w-3 md:w-4 h-3 md:h-4" />
                      <span className="hidden sm:inline">Entrar</span>
                    </button>
                  </div>

                  {classrooms.length === 0 ? (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <BookOpen className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-2 md:mb-3 text-gray-400" />
                      <p className="text-sm md:text-base">Nenhuma turma ainda</p>
                      <p className="text-xs md:text-sm mt-1">Entre em uma turma com o código do professor</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
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
                          <div className="font-medium text-sm md:text-base">{classroom.name}</div>
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

              {/* Atividades - Coluna Direita */}
              <div className="lg:col-span-3">
                {selectedClassroom ? (
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        {selectedActivity && (
                          <button
                            onClick={() => setSelectedActivity(null)}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                        )}
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {selectedActivity ? selectedActivity.title : selectedClassroomData?.name}
                          </h2>
                          {!selectedActivity && (
                            <p className="text-gray-600 text-sm md:text-base">
                              Código: <span className="font-mono font-bold">{selectedClassroomData?.code}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {!selectedActivity && (
                        <div className="relative w-full md:w-64">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Pesquisar atividades..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Detalhe da Atividade */}
                    {selectedActivity ? (
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`text-xs px-3 py-1 rounded-full border ${getStyleColor(selectedActivity.learning_style)}`}>
                              {getStyleLabel(selectedActivity.learning_style)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Postada em: {new Date(selectedActivity.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição:</h3>
                          <p className="text-gray-700 whitespace-pre-line">{selectedActivity.description}</p>
                          
                          {/* Arquivo anexado */}
                          {selectedActivity.file_url && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="font-medium text-blue-800">{selectedActivity.file_name}</p>
                                    <p className="text-sm text-blue-600">
                                      {getFileTypeLabel(selectedActivity.file_type)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadFile(selectedActivity)}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors w-full sm:w-auto justify-center"
                                >
                                  <Download className="w-4 h-4" />
                                  Baixar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Grid de Atividades */
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Atividades da Turma</h3>
                        {filteredActivities.length === 0 ? (
                          <div className="text-center py-8 md:py-12 text-gray-500">
                            <FileText className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
                            <p className="text-base md:text-lg mb-1 md:mb-2">
                              {searchTerm ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade disponível'}
                            </p>
                            <p className="text-sm md:text-base">
                              {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'O professor ainda não postou atividades para esta turma'}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredActivities.map((activity) => (
                              <button
                                key={activity.id}
                                onClick={() => setSelectedActivity(activity)}
                                className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow hover:border-[#6f42c1] group"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <span className={`text-xs px-2 py-1 rounded-full border ${getStyleColor(activity.learning_style)}`}>
                                    {getStyleLabel(activity.learning_style)}
                                  </span>
                                </div>
                                
                                <h4 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-[#6f42c1] transition-colors">
                                  {activity.title}
                                </h4>
                                
                                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                  {activity.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>
                                    {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                  {activity.file_url && (
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-12 text-center">
                    <BookOpen className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 md:mb-6 text-gray-400" />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Selecione uma turma</h2>
                    <p className="text-gray-600 text-sm md:text-base">Escolha uma turma para ver as atividades</p>
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
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Entrar em uma Turma</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setError('');
                  setClassroomCode('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <X className="w-5 md:w-6 h-5 md:h-6" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent text-center text-xl md:text-2xl font-mono tracking-wider"
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
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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