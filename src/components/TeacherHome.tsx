import { useState, useEffect } from 'react';
import { Brain, LogOut, Plus, Users, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Classroom, Activity } from '../lib/supabase';

export default function TeacherHome() {
  const { user, signOut } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    learningStyle: 'visual' as 'visual' | 'auditory' | 'reading' | 'kinesthetic',
  });

  useEffect(() => {
    loadClassrooms();
  }, [user]);

  useEffect(() => {
    if (selectedClassroom) {
      loadActivities(selectedClassroom);
    }
  }, [selectedClassroom]);

  const loadClassrooms = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setClassrooms(data);
    }
  };

  const loadActivities = async (classroomId: string) => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (data) {
      setActivities(data);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = generateCode();

    const { error } = await supabase.from('classrooms').insert({
      teacher_id: user!.id,
      name: newClassroomName,
      code,
    });

    if (!error) {
      setShowCreateClassroom(false);
      setNewClassroomName('');
      loadClassrooms();
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassroom) return;

    const { error } = await supabase.from('activities').insert({
      classroom_id: selectedClassroom,
      teacher_id: user!.id,
      title: activityForm.title,
      description: activityForm.description,
      learning_style: activityForm.learningStyle,
    });

    if (!error) {
      setShowCreateActivity(false);
      setActivityForm({
        title: '',
        description: '',
        learningStyle: 'visual',
      });
      loadActivities(selectedClassroom);
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
      visual: 'bg-blue-100 text-blue-800',
      auditory: 'bg-green-100 text-green-800',
      reading: 'bg-yellow-100 text-yellow-800',
      kinesthetic: 'bg-red-100 text-red-800',
    };
    return colors[style] || 'bg-gray-100 text-gray-800';
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Minhas Turmas</h1>
          <button
            onClick={() => setShowCreateClassroom(true)}
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
              onClick={() => setShowCreateClassroom(true)}
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
                    <button
                      onClick={() => setShowCreateActivity(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-semibold rounded-xl transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Nova Atividade
                    </button>
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
                      <div className="space-y-3">
                        {activities.map((activity) => (
                          <div key={activity.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getStyleColor(activity.learning_style)}`}>
                                    {getStyleLabel(activity.learning_style)}
                                  </span>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                )}
                              </div>
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

      {showCreateClassroom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nova Turma</h2>
              <button
                onClick={() => setShowCreateClassroom(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateClassroom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  placeholder="Ex: Matemática 3º Ano A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors"
              >
                Criar Turma
              </button>
            </form>
          </div>
        </div>
      )}

      {showCreateActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nova Atividade</h2>
              <button
                onClick={() => setShowCreateActivity(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="Ex: Exercícios de Geometria"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                  required
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo de Aprendizagem
                </label>
                <select
                  value={activityForm.learningStyle}
                  onChange={(e) => setActivityForm({ ...activityForm, learningStyle: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditivo</option>
                  <option value="reading">Leitura/Escrita</option>
                  <option value="kinesthetic">Cinestésico</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-lg transition-colors"
              >
                Criar Atividade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}