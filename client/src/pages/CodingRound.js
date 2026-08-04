import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Code, Play, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const CodingRound = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [difficulty, setDifficulty] = useState('Beginner');

  useEffect(() => {
    fetchQuestions();
  }, [difficulty]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/coding/questions?difficulty=${difficulty}`);
      setQuestions(response.data.questions);
      if (response.data.questions.length > 0) {
        selectQuestion(response.data.questions[0]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectQuestion = (question) => {
    setSelectedQuestion(question);
    setCode(question.starterCode[language] || '');
    setResults(null);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (selectedQuestion) {
      setCode(selectedQuestion.starterCode[newLanguage] || '');
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion || !code.trim()) {
      return;
    }

    setSubmitting(true);
    setResults(null);

    try {
      const response = await api.post('/coding/submit', {
        questionId: selectedQuestion.id,
        code,
        language
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (selectedQuestion) {
      setCode(selectedQuestion.starterCode[language] || '');
      setResults(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Coding Round</h1>
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Questions</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {questions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => selectQuestion(question)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedQuestion?.id === question.id
                        ? 'bg-primary-100 border-2 border-primary-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{question.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        question.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedQuestion && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedQuestion.title}</h3>
                <p className="text-gray-700 mb-6">{selectedQuestion.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Examples:</h4>
                  {selectedQuestion.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 mb-2">
                      <p className="text-sm text-gray-600 mb-1">Input: {example.input}</p>
                      <p className="text-sm text-gray-600">Output: {example.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Code className="text-primary-600" size={24} />
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reset
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? 'Running...' : <><Play size={18} />Run Code</>}
                </button>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-gray-900 text-gray-100"
                placeholder="Write your code here..."
                spellCheck={false}
              />
            </div>

            {results && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {results.allPassed ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                  {results.message}
                </h4>
                <div className="space-y-2">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">Test Case {result.testCase}</span>
                        {result.passed ? (
                          <CheckCircle className="text-green-600" size={18} />
                        ) : (
                          <XCircle className="text-red-600" size={18} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Input: {result.input}</p>
                      <p className="text-sm text-gray-600">Expected: {result.expected}</p>
                      <p className="text-sm text-gray-600">Output: {result.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingRound;
