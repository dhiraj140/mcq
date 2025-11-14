
import React from 'react';
import { User, ExamResult } from '../types';

interface ResultPageProps {
  user: User;
  result: ExamResult;
  onLogout: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ user, result, onLogout }) => {

  const getRemarkColor = (remark: string) => {
    switch (remark) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Average': return 'text-yellow-600';
      case 'Fail': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl md:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Exam Result</h1>
          <p className="mt-2 text-gray-600">Summary of your performance</p>
        </div>
        
        <div className="p-4 mt-6 border-2 border-dashed rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Candidate Name</p>
              <p className="text-lg font-semibold text-gray-800">{user.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Roll Number</p>
              <p className="text-lg font-semibold text-gray-800">{user.rollNumber}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500">Exam Name</p>
              <p className="text-lg font-semibold text-gray-800">{result.examName}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-lg font-semibold text-gray-800">{new Date(result.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-xl font-bold text-blue-800">{result.totalQuestions}</p>
              <p className="text-sm font-medium text-blue-600">Total Questions</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-xl font-bold text-green-800">{result.correctAnswers}</p>
              <p className="text-sm font-medium text-green-600">Correct</p>
            </div>
            <div className="p-4 bg-red-100 rounded-lg">
              <p className="text-xl font-bold text-red-800">{result.incorrectAnswers}</p>
              <p className="text-sm font-medium text-red-600">Incorrect</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-xl font-bold text-gray-800">{result.unanswered}</p>
              <p className="text-sm font-medium text-gray-600">Unanswered</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 mt-8 text-center bg-yellow-50 rounded-lg">
          <p className="text-sm font-medium text-yellow-800">Your Score</p>
          <p className="text-5xl font-bold text-yellow-900">{result.score}<span className="text-2xl font-normal">/{result.totalQuestions}</span></p>
          <p className="mt-2 text-2xl font-semibold text-yellow-900">{result.percentage}%</p>
           <p className={`mt-2 text-2xl font-bold ${getRemarkColor(result.remark)}`}>{result.remark}</p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onLogout}
            className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
