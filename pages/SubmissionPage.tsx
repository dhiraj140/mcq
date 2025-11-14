import React from 'react';

interface SubmissionPageProps {
  onLogout: () => void;
}

const SubmissionPage: React.FC<SubmissionPageProps> = ({ onLogout }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-gray-800">Exam Submitted!</h1>
        <p className="mt-2 text-gray-600">Your responses have been saved successfully.</p>
        <p className="mt-1 text-gray-600">Results will be made available by the administration later.</p>
        <div className="mt-8">
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

export default SubmissionPage;
