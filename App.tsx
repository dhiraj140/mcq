
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CoordinatorLoginPage from './pages/CoordinatorLoginPage';
import InstructionsPage from './pages/InstructionsPage';
import ExamPage from './pages/ExamPage';
import SubmissionPage from './pages/SubmissionPage';
import AdminPage from './pages/AdminPage';
import CoordinatorPage from './pages/CoordinatorPage';
import { User, Coordinator } from './types';

const App: React.FC = () => {
  const [page, setPage] = useState<string>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCoordinator, setIsCoordinator] = useState<boolean>(false);
  const [currentCoordinator, setCurrentCoordinator] = useState<Coordinator | null>(null);
  const [examLanguage, setExamLanguage] = useState<string>('en');

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('currentUser');
    const adminLoggedIn = sessionStorage.getItem('isAdmin');
    const coordinatorLoggedIn = sessionStorage.getItem('currentCoordinator');

    if (adminLoggedIn) {
      setIsAdmin(true);
      setPage('admin');
    } else if (coordinatorLoggedIn) {
      const coordinator = JSON.parse(coordinatorLoggedIn);
      setCurrentCoordinator(coordinator);
      setIsCoordinator(true);
      setPage('coordinator');
    }
    else if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
      setPage('instructions');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    setPage('instructions');
  };
  
  const handleAdminLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('isAdmin', 'true');
    setPage('admin');
  };

  const handleCoordinatorLogin = (coordinator: Coordinator) => {
    setCurrentCoordinator(coordinator);
    setIsCoordinator(true);
    sessionStorage.setItem('currentCoordinator', JSON.stringify(coordinator));
    setPage('coordinator');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setIsCoordinator(false);
    setCurrentCoordinator(null);
    sessionStorage.clear();
    setPage('login');
  };

  const startExam = (language: string) => {
    if (currentUser) {
      setExamLanguage(language);
      setPage('exam');
    }
  };

  const handleExamFinish = () => {
    setPage('submitted');
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigateToAdmin={() => setPage('admin_login')} onNavigateToCoordinator={() => setPage('coordinator_login')} />;
      case 'admin_login':
        return <AdminLoginPage onAdminLogin={handleAdminLogin} onNavigateToUser={() => setPage('login')} />;
      case 'coordinator_login':
        return <CoordinatorLoginPage onCoordinatorLogin={handleCoordinatorLogin} onNavigateToUser={() => setPage('login')} />;
      case 'instructions':
        return currentUser && <InstructionsPage user={currentUser} onStartExam={startExam} onLogout={handleLogout} />;
      case 'exam':
        return currentUser && <ExamPage user={currentUser} onExamFinish={handleExamFinish} language={examLanguage} />;
      case 'submitted':
        return <SubmissionPage onLogout={handleLogout} />;
      case 'admin':
        return isAdmin && <AdminPage onLogout={handleLogout} />;
      case 'coordinator':
        return isCoordinator && currentCoordinator && <CoordinatorPage coordinator={currentCoordinator} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} onNavigateToAdmin={() => setPage('admin_login')} onNavigateToCoordinator={() => setPage('coordinator_login')}/>;
    }
  };

  return <div className="min-h-screen font-sans">{renderPage()}</div>;
};

export default App;
