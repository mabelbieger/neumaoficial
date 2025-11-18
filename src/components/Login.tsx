import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen bg-[#1a0f3e] flex items-center justify-center p-2 xs:p-3 sm:p-4">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Lado Esquerdo - Banner */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#d4c5f9] to-[#b89fff] p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center relative overflow-hidden min-h-[180px] xs:min-h-[200px] sm:min-h-[250px] md:min-h-[350px] lg:min-h-[550px] xl:min-h-[600px]">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-full h-full object-contain opacity-20 scale-70 xs:scale-80 sm:scale-90 md:scale-100"
            />
          </div>
          <div className="relative text-center z-10 w-full">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6">
              Bem-vindo(a) novamente!
            </h2>
            <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 mx-auto">
              <img 
                src={logo} 
                alt="Neuma Logo" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="lg:w-1/2 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8">
            <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">Login</h1>
            <div className="w-8 xs:w-10 h-1 bg-[#6f42c1] rounded-full"></div>
          </div>

          {error && (
            <div className="mb-3 xs:mb-4 p-2 xs:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs xs:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4 sm:space-y-5">
            <div>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 xs:px-4 py-2 xs:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 xs:px-4 py-2 xs:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 xs:py-3 text-sm bg-[#c8b3ff] hover:bg-[#b89fff] text-gray-900 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 hover:shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-t-2 border-gray-900 rounded-full animate-spin mr-2"></div>
                  Carregando...
                </div>
              ) : (
                'Fazer login'
              )}
            </button>

            <div className="text-center pt-2 xs:pt-3">
              <p className="text-gray-600 text-xs xs:text-sm">
                Não possui uma conta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="text-[#6f42c1] hover:text-[#5a32a3] font-semibold hover:underline transition-colors"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}