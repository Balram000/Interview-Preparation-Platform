import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { MessageSquare, Lightbulb, Send, CheckCircle, ArrowLeft, Mic, MicOff } from 'lucide-react';

const HRInterview = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchPracticeQuestions();
  }, []);

  const fetchPracticeQuestions = async () => {
    try {
      const response = await api.get('/hr/practice?count=3');
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching HR questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return;
    }

    setSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await api.post('/hr/evaluate', {
        questionId: currentQuestion.id,
        answer
      });
      setEvaluation(response.data.evaluation);
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setEvaluation(null);
    setAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">HR Interview Practice</h1>
          </div>
          <div className="text-gray-600">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {evaluation ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Feedback</h2>
              <div className={`text-3xl font-bold ${evaluation.score >= 70 ? 'text-green-600' : evaluation.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {evaluation.score}/100
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="text-primary-600" size={20} />
                Feedback
              </h3>
              <ul className="space-y-2">
                {evaluation.feedback.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Lightbulb className="text-yellow-600" size={20} />
                Tips for Improvement
              </h3>
              <ul className="space-y-2">
                {evaluation.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <span className="text-sm text-primary-600 font-medium">{currentQuestion?.category}</span>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">{currentQuestion?.question}</h2>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Lightbulb className="text-yellow-600" size={20} />
                Tips
              </h3>
              <ul className="space-y-2">
                {currentQuestion?.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
              <div className="relative">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                  placeholder="Type your answer here or use voice input..."
                />
                <button
                  onClick={toggleRecording}
                  className={`absolute bottom-4 right-4 p-2 rounded-full transition ${
                    isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? 'Evaluating...' : <><Send size={20} />Submit Answer</>}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HRInterview;
