import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { FileText, Upload, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/resume/analyze', {
        resumeText,
        targetRole
      });
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Resume Analyzer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-primary-600" />
              Paste Your Resume
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Cyber Security Analyst">Cyber Security Analyst</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume Text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Paste your resume text here..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>

          <div className="space-y-6">
            {analysis ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${getScoreBg(analysis.score)} rounded-xl p-6 text-center`}>
                    <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                    <p className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
                    </p>
                  </div>

                  <div className={`${getScoreBg(analysis.atsScore)} rounded-xl p-6 text-center`}>
                    <p className="text-sm text-gray-600 mb-1">ATS Score</p>
                    <p className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <XCircle className="text-red-600" size={20} />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Suggestions</h3>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <FileText size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Analysis Yet</h3>
                <p className="text-gray-600">Paste your resume text and click "Analyze Resume" to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalyzer;
