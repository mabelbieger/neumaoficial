import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

interface SignUpProps {
  onNavigateToLogin: () => void;
}

export default function SignUp({ onNavigateToLogin }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              Junte-se a nós!
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
            <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">Cadastro</h1>
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
                type="text"
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 xs:px-4 py-2 xs:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent transition-all"
                required
              />
            </div>

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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 xs:px-4 py-2 xs:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:border-transparent transition-all pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            {/* Radio buttons lado a lado */}
            <div className="flex gap-3 xs:gap-4 sm:gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="teacher"
                  checked={userType === 'teacher'}
                  onChange={(e) => setUserType(e.target.value as 'teacher')}
                  className="w-4 h-4 text-[#6f42c1] focus:ring-[#6f42c1]"
                />
                <span className="ml-2 text-xs xs:text-sm text-gray-900">Professor(a)</span>
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
                <span className="ml-2 text-xs xs:text-sm text-gray-900">Estudante</span>
              </label>
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
                'Cadastrar-se'
              )}
            </button>

            <div className="text-center pt-2 xs:pt-3">
              <p className="text-gray-600 text-xs xs:text-sm">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-[#6f42c1] hover:text-[#5a32a3] font-semibold hover:underline transition-colors"
                >
                  Faça o login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}