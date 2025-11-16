import { useState } from 'react';
import { Brain, ChevronRight } from 'lucide-react';
import { varkQuestions } from '../data/varkQuestions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface VarkTestProps {
  onComplete: () => void;
}

export default function VarkTest({ onComplete }: VarkTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { user } = useAuth();

  const handleNext = () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers, varkQuestions[currentQuestion].options[selectedOption].type];
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQuestion < varkQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        calculateResult(newAnswers);
      }
    }
  };

  const calculateResult = async (finalAnswers: string[]) => {
    const scores = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0,
    };

    finalAnswers.forEach((answer) => {
      scores[answer as keyof typeof scores]++;
    });

    const maxScore = Math.max(scores.visual, scores.auditory, scores.reading, scores.kinesthetic);
    let dominantStyle = '';

    if (scores.visual === maxScore) dominantStyle = 'visual';
    else if (scores.auditory === maxScore) dominantStyle = 'auditory';
    else if (scores.reading === maxScore) dominantStyle = 'reading';
    else dominantStyle = 'kinesthetic';

    if (user) {
      await supabase.from('vark_results').insert({
        user_id: user.id,
        visual_score: scores.visual,
        auditory_score: scores.auditory,
        reading_score: scores.reading,
        kinesthetic_score: scores.kinesthetic,
        dominant_style: dominantStyle,
      });
    }

    onComplete();
  };

  const progress = ((currentQuestion + 1) / varkQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-[#1a0f3e] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1a0f3e] to-[#2d1b5e] p-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-[#c8b3ff]" />
            <h1 className="text-4xl font-bold text-white mb-2">Teste VARK</h1>
            <p className="text-[#c8b3ff]">Descubra o seu estilo de aprendizagem!</p>
          </div>

          <div className="p-2 bg-gray-100">
            <div className="h-2 bg-[#c8b3ff] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="p-12">
            <div className="mb-8">
              <span className="text-sm font-semibold text-[#6f42c1] bg-[#f0ebff] px-3 py-1 rounded-full">
                Questão {currentQuestion + 1} de {varkQuestions.length}
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              {varkQuestions[currentQuestion].question}
            </h2>

            <div className="space-y-4 mb-8">
              {varkQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full p-5 text-left rounded-xl border-2 transition-all ${
                    selectedOption === index
                      ? 'border-[#6f42c1] bg-[#f0ebff]'
                      : 'border-gray-200 hover:border-[#c8b3ff] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === index ? 'border-[#6f42c1]' : 'border-gray-300'
                      }`}
                    >
                      {selectedOption === index && (
                        <div className="w-3 h-3 rounded-full bg-[#6f42c1]" />
                      )}
                    </div>
                    <span className="text-gray-900">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-full py-4 bg-[#6f42c1] hover:bg-[#5a35a0] text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentQuestion < varkQuestions.length - 1 ? 'Próxima' : 'Ver Resultado'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}