import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // Import da logo

interface LoginProps {
  onNavigateToSignUp: () => void;
}

export default function Login({ onNavigateToSignUp }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0f3e] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        <div className="flex-1 bg-gradient-to-br from-[#d4c5f9] to-[#b89fff] p-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain opacity-20"
            />
          </div>
          <div className="relative text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Bem-vindo(a) novamente!</h2>
            <div className="w-48 h-48 mx-auto">
              <img 
                src={logo} 
                alt="Neuma Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Login</h1>
            
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c8b3ff] hover:bg-[#b89fff] text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Fazer login'}
            </button>

            <p className="text-center text-gray-600">
              Não possui uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="text-[#6f42c1] hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}