import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // Import da logo

interface SignUpProps {
  onNavigateToLogin: () => void;
}

export default function SignUp({ onNavigateToLogin }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, userType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0f3e] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Cadastro</h1>
            
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={(e) => setUserType(e.target.value as 'teacher')}
                  className="w-4 h-4 text-[#6f42c1] focus:ring-[#6f42c1]"
                />
                <span className="ml-2 text-gray-900">Professor(a)</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={(e) => setUserType(e.target.value as 'student')}
                  className="w-4 h-4 text-[#6f42c1] focus:ring-[#6f42c1]"
                />
                <span className="ml-2 text-gray-900">Estudante</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c8b3ff] hover:bg-[#b89fff] text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Cadastrar-se'}
            </button>

            <p className="text-center text-gray-600">
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-[#6f42c1] hover:underline"
              >
                Faça o login
              </button>
            </p>
          </form>
        </div>

        <div className="flex-1 bg-gradient-to-br from-[#d4c5f9] to-[#b89fff] p-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain opacity-20"
            />
          </div>
          <div className="relative text-center">
            <div className="w-32 h-32 mx-auto">
              <img 
                src={logo} 
                alt="Neuma Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}