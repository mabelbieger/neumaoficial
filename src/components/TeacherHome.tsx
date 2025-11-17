import { useState, useEffect } from 'react';
import { Brain, LogOut, Plus, Users, FileText, X, AlertCircle, CheckCircle, RefreshCw, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  created_at: string;
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

export default function TeacherHome() {
  const { user, signOut } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newClassroomCode, setNewClassroomCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    learningStyle: 'visual' as 'visual' | 'auditory' | 'reading' | 'kinesthetic',
    fileUrl: '',
    fileName: '',
    fileType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carrega dados do localStorage quando o componente monta
  useEffect(() => {
    if (user) {
      loadClassroomsFromStorage();
    }
  }, [user]);

  // Carrega atividades quando seleciona uma turma
  useEffect(() => {
    if (selectedClassroom) {
      loadActivitiesFromStorage(selectedClassroom);
    }
  }, [selectedClassroom]);

  // Carrega turmas do localStorage
  const loadClassroomsFromStorage = () => {
    try {
      const saved = localStorage.getItem(`classrooms_${user?.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setClassrooms(parsed);
        
        // Seleciona a primeira turma se não houver seleção
        if (parsed.length > 0 && !selectedClassroom) {
          setSelectedClassroom(parsed[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar turmas do storage:', err);
    }
  };

  // Carrega atividades do localStorage
  const loadActivitiesFromStorage = (classroomId: string) => {
    try {
      const saved = localStorage.getItem(`activities_${classroomId}`);
      if (saved) {
        setActivities(JSON.parse(saved));
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
      setActivities([]);
    }
  };

  // Salva turmas no localStorage
  const saveClassroomsToStorage = (classrooms: Classroom[]) => {
    localStorage.setItem(`classrooms_${user?.id}`, JSON.stringify(classrooms));
  };

  // Salva atividades no localStorage
  const saveActivitiesToStorage = (classroomId: string, activities: Activity[]) => {
    localStorage.setItem(`activities_${classroomId}`, JSON.stringify(activities));
  };

  // Gera código único
  const generateCodeClient = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Gera ID único
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleGenerateCode = () => {
    setIsGeneratingCode(true);
    setTimeout(() => {
      const newCode = generateCodeClient();
      setNewClassroomCode(newCode);
      setIsGeneratingCode(false);
    }, 300);
  };

  // Upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica o tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    // Lê o arquivo e converte para Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      setActivityForm(prev => ({
        ...prev,
        fileUrl: base64,
        fileName: file.name,
        fileType: file.type
      }));
      
      setSuccessMessage(`Arquivo "${file.name}" anexado com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    };
    
    reader.onerror = () => {
      setError('Erro ao ler o arquivo');
    };
    
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setActivityForm(prev => ({
      ...prev,
      fileUrl: '',
      fileName: '',
      fileType: ''
    }));
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

  const deleteActivity = (activityId: string) => {
    const updatedActivities = activities.filter(a => a.id !== activityId);
    setActivities(updatedActivities);
    if (selectedClassroom) {
      saveActivitiesToStorage(selectedClassroom, updatedActivities);
    }
    setSuccessMessage('Atividade excluída com sucesso!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Cria turma (apenas no frontend)
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validações
      if (!newClassroomName.trim()) {
        throw new Error('Nome da turma é obrigatório');
      }

      if (!newClassroomCode.trim()) {
        throw new Error('Código da turma é obrigatório');
      }

      const formattedCode = newClassroomCode.trim().toUpperCase().replace(/\s/g, '');

      if (formattedCode.length !== 6) {
        throw new Error('O código deve ter exatamente 6 caracteres');
      }

      if (!/^[A-Z0-9]{6}$/.test(formattedCode)) {
        throw new Error('O código deve conter apenas letras maiúsculas e números');
      }

      // Verifica se o código já existe localmente
      const codeExists = classrooms.some(classroom => 
        classroom.code === formattedCode
      );

      if (codeExists) {
        throw new Error('Este código já está em uso. Por favor, use outro código.');
      }

      // Cria nova turma
      const newClassroom: Classroom = {
        id: generateId(),
        teacher_id: user.id,
        name: newClassroomName.trim(),
        code: formattedCode,
        created_at: new Date().toISOString(),
      };

      // Atualiza estado e salva no localStorage
      const updatedClassrooms = [newClassroom, ...classrooms];
      setClassrooms(updatedClassrooms);
      saveClassroomsToStorage(updatedClassrooms);

      // Mensagem de sucesso
      setSuccessMessage(`🎉 Turma "${newClassroom.name}" criada com sucesso! Código: ${newClassroom.code}`);

      // Fecha o modal e limpa formulário
      setShowCreateClassroom(false);
      setNewClassroomName('');
      setNewClassroomCode('');

      // Seleciona a turma criada
      setSelectedClassroom(newClassroom.id);

      // Remove mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err: any) {
      console.error('❌ Erro ao criar turma:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cria atividade (apenas no frontend)
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!selectedClassroom || !user) {
        throw new Error('Turma não selecionada');
      }

      if (!activityForm.title.trim()) {
        throw new Error('Título da atividade é obrigatório');
      }

      // Cria nova atividade COM ARQUIVO
      const newActivity: Activity = {
        id: generateId(),
        classroom_id: selectedClassroom,
        teacher_id: user.id,
        title: activityForm.title.trim(),
        description: activityForm.description.trim(),
        learning_style: activityForm.learningStyle,
        created_at: new Date().toISOString(),
        file_url: activityForm.fileUrl,
        file_name: activityForm.fileName,
        file_type: activityForm.fileType
      };

      // Atualiza estado e salva no localStorage
      const updatedActivities = [newActivity, ...activities];
      setActivities(updatedActivities);
      saveActivitiesToStorage(selectedClassroom, updatedActivities);

      // Mensagem de sucesso
      let successMsg = `✅ Atividade "${newActivity.title}" criada com sucesso!`;
      if (newActivity.file_url) {
        successMsg += ` Arquivo anexado: ${newActivity.file_name}`;
      }
      setSuccessMessage(successMsg);

      // Fecha o modal e limpa formulário COMPLETO
      setShowCreateActivity(false);
      setActivityForm({
        title: '',
        description: '',
        learningStyle: 'visual',
        fileUrl: '',
        fileName: '',
        fileType: ''
      });

      // Remove mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err: any) {
      console.error('❌ Erro ao criar atividade:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0ebff] to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#6f42c1]" />
            <span className="text-2xl font-bold text-[#6f42c1]">neuma</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Prof. {user?.full_name}</span>
            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:text-[#6f42c1] transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Erro</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">Sucesso!</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Minhas Turmas</h1>
          <button
            onClick={() => {
              setShowCreateClassroom(true);
              setNewClassroomCode(generateCodeClient());
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Turma
          </button>
        </div>

        {classrooms.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhuma turma ainda</h2>
            <p className="text-gray-600 mb-8">Crie sua primeira turma para começar!</p>
            <button
              onClick={() => {
                setShowCreateClassroom(true);
                setNewClassroomCode(generateCodeClient());
              }}
              className="px-8 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-semibold rounded-xl transition-colors"
            >
              Criar Primeira Turma
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
                {classrooms.map((classroom) => (
                  <button
                    key={classroom.id}
                    onClick={() => setSelectedClassroom(classroom.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedClassroom === classroom.id
                        ? 'bg-[#6f42c1] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="font-semibold mb-1">{classroom.name}</div>
                    <div className={`text-sm font-mono ${
                      selectedClassroom === classroom.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      Código: {classroom.code}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedClassroom ? (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedClassroomData?.name}
                      </h2>
                      <p className="text-gray-600">
                        Código da turma: <span className="font-mono font-bold">{selectedClassroomData?.code}</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const classroom = classrooms.find(c => c.id === selectedClassroom);
                          if (classroom) {
                            navigator.clipboard.writeText(classroom.code);
                            setSuccessMessage('Código copiado para a área de transferência!');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        Copiar Código
                      </button>
                      <button
                        onClick={() => setShowCreateActivity(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-semibold rounded-xl transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Nova Atividade
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['visual', 'auditory', 'reading', 'kinesthetic'].map((style) => (
                      <div key={style} className="bg-[#f0ebff] rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-[#6f42c1] mb-1">
                          {activities.filter(a => a.learning_style === style).length}
                        </div>
                        <div className="text-sm text-gray-600">{getStyleLabel(style)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Atividades</h3>
                    {activities.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Nenhuma atividade criada ainda</p>
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
                              <button
                                onClick={() => deleteActivity(activity.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir atividade"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">
                              Criada em: {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione uma turma</h2>
                  <p className="text-gray-600">Escolha uma turma para ver e gerenciar suas atividades</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar Turma */}
      {showCreateClassroom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nova Turma</h2>
              <button
                onClick={() => {
                  setShowCreateClassroom(false);
                  setError(null);
                  setNewClassroomName('');
                  setNewClassroomCode('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateClassroom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Turma *
                </label>
                <input
                  type="text"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  placeholder="Ex: Matemática 3º Ano A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={3}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Turma *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClassroomCode}
                    onChange={(e) => setNewClassroomCode(e.target.value.toUpperCase())}
                    placeholder="Digite ou gere um código"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent font-mono uppercase"
                    required
                    disabled={loading}
                    minLength={6}
                    maxLength={6}
                    pattern="[A-Z0-9]{6}"
                    title="6 caracteres (letras maiúsculas e números)"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode || loading}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                    {isGeneratingCode ? '...' : 'Gerar'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Digite um código único de 6 caracteres (apenas letras maiúsculas e números)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Use o botão "Gerar" para criar um código automaticamente, ou digite um código personalizado.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando turma...' : 'Criar Turma'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Atividade */}
      {showCreateActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nova Atividade</h2>
              <button
                onClick={() => {
                  setShowCreateActivity(false);
                  setError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="Ex: Exercícios de Geometria"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Descrição da atividade..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>

              {/* Upload de Arquivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar Arquivo (Opcional)
                </label>
                
                {activityForm.fileUrl ? (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 text-sm">
                            {activityForm.fileName}
                          </p>
                          <p className="text-green-600 text-xs">
                            Arquivo pronto para anexar
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6f42c1] transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3,.zip"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer block"
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-1">
                        Clique para anexar um arquivo
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, Word, Imagens, Vídeos, Áudio (max. 10MB)
                      </p>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo de Aprendizagem *
                </label>
                <select
                  value={activityForm.learningStyle}
                  onChange={(e) => setActivityForm({ ...activityForm, learningStyle: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                  disabled={loading}
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditivo</option>
                  <option value="reading">Leitura/Escrita</option>
                  <option value="kinesthetic">Cinestésico</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando atividade...' : 'Criar Atividade'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}