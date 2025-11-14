
import React, { useState, useEffect } from 'react';
import { User, Exam } from '../types';
import { mockApi } from '../services/mockApi';

interface InstructionsPageProps {
  user: User;
  onStartExam: (language: string) => void;
  onLogout: () => void;
}

const InstructionsPage: React.FC<InstructionsPageProps> = ({ user, onStartExam, onLogout }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    const fetchExam = async () => {
        const examData = await mockApi.getExam(user.examName);
        if(examData) {
            setExam(examData);
            if (examData.supportedLanguages && examData.supportedLanguages.length > 0) {
              setSelectedLanguage(examData.supportedLanguages[0]);
            }
        }
    };
    fetchExam();
  }, [user.examName]);

  const renderExamStatus = () => {
    const startButton = (
       <button
          onClick={() => onStartExam(selectedLanguage)}
          className="px-8 py-3 text-lg font-semibold text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Start Exam
        </button>
    );

    if (!exam || (!exam.startTime && !exam.endTime)) {
      return startButton;
    }
    
    const now = new Date();
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;

    if (startTime && now < startTime) {
      return (
        <div className="p-4 text-center text-yellow-800 bg-yellow-100 rounded-md">
          <p className="font-semibold">The exam has not started yet.</p>
          <p>It will be available on {startTime.toLocaleString()}.</p>
        </div>
      );
    }
    
    if (endTime && now > endTime) {
      return (
        <div className="p-4 text-center text-red-800 bg-red-100 rounded-md">
          <p className="font-semibold">The exam period has ended.</p>
        </div>
      );
    }

    return startButton;
  };
  
  if (!exam) {
    return <div className="flex items-center justify-center min-h-screen">Loading Instructions...</div>
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-8">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Exam Instructions</h1>
          <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
        </div>
        <div className="p-6 space-y-4 md:p-8">
          <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
            <p className="font-semibold text-gray-700">Welcome, <span className="text-blue-600">{user.fullName}</span></p>
            <p className="text-sm text-gray-600">Roll No: {user.rollNumber}</p>
            <p className="text-sm text-gray-600">Exam: {user.examName}</p>
          </div>

          {exam.supportedLanguages && exam.supportedLanguages.length > 1 && (
            <div className="p-4 border rounded-md bg-gray-50">
                <label htmlFor="language-select" className="block mb-2 font-semibold text-gray-700">Select Exam Language:</label>
                <select 
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                    {exam.supportedLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                </select>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-700">Please read the following instructions carefully:</h2>
          
          <ul className="space-y-3 list-disc list-inside text-gray-600">
            <li>The exam consists of <span className="font-bold">{exam?.questions.length || 0}</span> multiple-choice questions.</li>
            <li>The total duration of the exam is <span className="font-bold">{exam?.durationInMinutes || 0}</span> minutes.</li>
            <li>The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination.</li>
            <li>Each question has 4 options, out of which only one is correct.</li>
            <li>There is no negative marking for incorrect answers.</li>
            <li>The question palette on the right side of the screen shows the status of each question.</li>
            <li>You can use the "Mark for Review" option to revisit a question later.</li>
            <li>Your answers are saved automatically.</li>
            <li>The exam will be submitted automatically when the timer runs out.</li>
            <li>Do not close the browser window or refresh the page during the exam.</li>
          </ul>

          <div className="flex justify-center pt-6">
            {renderExamStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;
