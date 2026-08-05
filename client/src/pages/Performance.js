import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { TrendingUp, Award, Target, BookOpen, ArrowLeft } from 'lucide-react';

const Performance = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [statsRes, perfRes] = await Promise.all([
        api.get('/performance/stats/overview'),
        api.get('/performance')
      ]);
      setStats(statsRes.data.stats);
      setPerformances(perfRes.data.performances);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-primary-600" size={24} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats?.totalInterviews || 0}</p>
            <p className="text-gray-600 text-sm">Interviews</p>
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
              <span className="text-sm text-gray-500">Categories</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats?.categories?.length || 0}</p>
            <p className="text-gray-600 text-sm">Practiced</p>
          </div>
        </div>

        {stats?.skills && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Skills Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Technical</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.skills.technical}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold mt-1">{stats.skills.technical}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Communication</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.skills.communication}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold mt-1">{stats.skills.communication}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.skills.confidence}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold mt-1">{stats.skills.confidence}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Problem Solving</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.skills.problemSolving}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold mt-1">{stats.skills.problemSolving}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Strong Topics
            </h2>
            {stats?.strongTopics?.length > 0 ? (
              <ul className="space-y-2">
                {stats.strongTopics.map((topic, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No strong topics yet. Complete more interviews!</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-red-600" size={20} />
              Weak Topics
            </h2>
            {stats?.weakTopics?.length > 0 ? (
              <ul className="space-y-2">
                {stats.weakTopics.map((topic, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {topic}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No weak topics detected. Keep practicing!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Performance;
