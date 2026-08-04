import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axios';
import { Clock, Send, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, difficulty, mode } = location.state || {};
  
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role || !difficulty || !mode) {
      navigate('/dashboard');
      return;
    }
    createInterview();
  }, [role, difficulty, mode]);

  useEffect(() => {
    if (timeLeft > 0 && interview?.status === 'in_progress') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitAnswer();
    }
  }, [timeLeft, interview?.status]);

  const createInterview = async () => {
    try {
      const response = await api.post('/interviews', {
        role,
        difficulty,
        mode,
        useAI: true
      });
      setInterview(response.data.interview);
      await startInterview(response.data.interview._id);
    } catch (error) {
      console.error('Error creating interview:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (interviewId) => {
    try {
      await api.put(`/interviews/${interviewId}/start`);
      setInterview(prev => ({ ...prev, status: 'in_progress', startedAt: new Date() }));
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setIsSubmitting(true);
    const currentQuestion = interview.questions[currentQuestionIndex];

    try {
      const response = await api.put(
        `/interviews/${interview._id}/questions/${currentQuestion.question._id}`,
        {
          answer,
          timeTaken: 300 - timeLeft
        }
      );
      
      setFeedback(response.data.feedback);
      setInterview(prev => {
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          userAnswer: answer,
          aiFeedback: response.data.feedback
        };
        return { ...prev, questions: updatedQuestions };
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setAnswer('');
    setTimeLeft(300);

    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeInterview();
    }
  };

  const completeInterview = async () => {
    try {
      const response = await api.put(`/interviews/${interview._id}/complete`);
      navigate('/performance', { state: { interview: response.data.interview } });
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading interview...</p>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex]?.question;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{interview.role}</h1>
            <p className="text-gray-600 text-sm">{interview.difficulty} • {interview.mode}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span className={`font-mono ${timeLeft < 60 ? 'text-red-600' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-gray-600">
              {currentQuestionIndex + 1} / {interview.questions.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
          ></div>
        </div>

        {feedback ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Feedback</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{feedback.score}</p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{feedback.accuracy}%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{feedback.communication}%</p>
                <p className="text-sm text-gray-600">Communication</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{feedback.confidence}%</p>
                <p className="text-sm text-gray-600">Confidence</p>
              </div>
            </div>

            {feedback.strengths?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.missingConcepts?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle size={18} />
                  Missing Concepts
                </h3>
                <ul className="space-y-1">
                  {feedback.missingConcepts.map((concept, index) => (
                    <li key={index} className="text-gray-700">• {concept}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleNextQuestion}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              {currentQuestionIndex < interview.questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight size={20} />
                </>
              ) : (
                'Complete Interview'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Question {currentQuestionIndex + 1}
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">{currentQuestion?.question}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Type your answer here..."
              />
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answer.trim()}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Submit Answer
                  <Send size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interview;
