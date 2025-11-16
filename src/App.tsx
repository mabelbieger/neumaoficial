import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import SignUp from './components/SignUp';
import Login from './components/Login';
import StudentHome from './components/StudentHome';
import TeacherHome from './components/TeacherHome';
import VarkTest from './components/VarkTest';
import { supabase } from './lib/supabase';

type View = 'signup' | 'login';

function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('login');
  const [showTest, setShowTest] = useState(false);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);

  useEffect(() => {
    if (user && user.user_type === 'student') {
      checkVarkCompletion();
    }
  }, [user]);

  const checkVarkCompletion = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('vark_results')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    setHasCompletedTest(!!data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0f3e] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return view === 'signup' ? (
      <SignUp onNavigateToLogin={() => setView('login')} />
    ) : (
      <Login onNavigateToSignUp={() => setView('signup')} />
    );
  }

  if (user.user_type === 'teacher') {
    return <TeacherHome />;
  }

  if (showTest) {
    return (
      <VarkTest
        onComplete={() => {
          setShowTest(false);
          setHasCompletedTest(true);
        }}
      />
    );
  }

  return (
    <StudentHome
      onStartTest={() => setShowTest(true)}
      hasCompletedTest={hasCompletedTest}
    />
  );
}

export default App;