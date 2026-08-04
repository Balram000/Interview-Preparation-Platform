import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { BookOpen, TrendingUp, Target, LogOut, BarChart3, Award, FileText, Code, MessageSquare, ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/performance/stats/overview');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startInterview = (role, difficulty, mode) => {
    navigate('/interview', { state: { role, difficulty, mode } });
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Interview Prep</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-primary-600" size={24} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats?.totalInterviews || 0}</p>
            <p className="text-gray-600 text-sm">Interviews Completed</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats?.averageScore || 0}%</p>
            <p className="text-gray-600 text-sm">Score</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-yellow-600" size={24} />
              <span className="text-sm text-gray-500">Best</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats?.bestScore || 0}%</p>
            <p className="text-gray-600 text-sm">Score</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Target className="text-purple-600" size={24} />
              <span className="text-sm text-gray-500">Target</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{user?.targetRole}</p>
            <p className="text-gray-600 text-sm">Current Role</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Start New Interview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select id="role-select" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Cyber Security Analyst">Cyber Security Analyst</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select id="difficulty-select" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select id="mode-select" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="Text">Text Answer</option>
                <option value="MCQ">MCQ</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              const role = document.getElementById('role-select').value;
              const difficulty = document.getElementById('difficulty-select').value;
              const mode = document.getElementById('mode-select').value;
              startInterview(role, difficulty, mode);
            }}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Start Interview
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/performance')}
            className="w-full bg-white border-2 border-primary-600 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition flex items-center justify-center gap-2"
          >
            <BarChart3 size={20} />
            View Performance Analytics
          </button>
          
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="w-full bg-white border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Analyze Resume
          </button>

          <button
            onClick={() => navigate('/coding-round')}
            className="w-full bg-white border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center gap-2"
          >
            <Code size={20} />
            Coding Round
          </button>

          <button
            onClick={() => navigate('/hr-interview')}
            className="w-full bg-white border-2 border-orange-600 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2"
          >
            <MessageSquare size={20} />
            HR Interview Practice
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
