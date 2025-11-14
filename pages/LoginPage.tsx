
import React, { useState, useEffect } from 'react';
import { User, Exam } from '../types';
import { mockApi } from '../services/mockApi';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateToAdmin: () => void;
  onNavigateToCoordinator: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToAdmin, onNavigateToCoordinator }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [examName, setExamName] = useState('');
  // FIX: Changed state type to `Omit<Exam, 'questions'>[]` to match what `getExams` returns.
  const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mockApi.getExams().then(fetchedExams => {
      setExams(fetchedExams);
      if (fetchedExams.length > 0) {
        setExamName(fetchedExams[0].name);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const response = await mockApi.loginUser(rollNumber, password, examName);
      if (response.success && response.user) {
        onLogin(response.user);
      } else {
        setError(response.message);
      }
    } else {
      if (!fullName) {
        setError("Full Name is required for registration.");
        setLoading(false);
        return;
      }
      const response = await mockApi.registerUser(fullName, rollNumber, password, examName);
      if (response.success) {
        setIsLogin(true);
        setError('Registration successful! Please log in.');
      } else {
        setError(response.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Candidate Portal</h2>
          <p className="mt-2 text-gray-600">{isLogin ? 'Log in to start your exam' : 'Create an account to register'}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="rollNumber" className="sr-only">Roll Number / Email</label>
            <input
              id="rollNumber"
              name="rollNumber"
              type="text"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Roll Number / Email"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="examName" className="sr-only">Exam Name</label>
            <select
              id="examName"
              name="examName"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            >
              {exams.map(exam => <option key={exam.name} value={exam.name}>{exam.name}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:text-blue-500">
            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign In'}
          </button>
        </div>
        <div className="flex justify-center gap-4 text-sm text-center text-gray-500">
          <button onClick={onNavigateToAdmin} className="font-medium hover:underline">
            Admin Login
          </button>
          <button onClick={onNavigateToCoordinator} className="font-medium hover:underline">
            Coordinator Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
