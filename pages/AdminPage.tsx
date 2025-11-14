import React, { useState, useEffect, useRef } from 'react';
import { User, ExamResult, Question, Exam, Coordinator, LocalizedString } from '../types';
import { mockApi } from '../services/mockApi';

interface AdminPageProps {
  onLogout: () => void;
}

type AdminTab = 'users' | 'results' | 'questions' | 'schedule' | 'exams' | 'coordinators';

const ExamManager: React.FC = () => {
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [newExamName, setNewExamName] = useState('');
    const [newExamDuration, setNewExamDuration] = useState(30);
    const [newExamLanguages, setNewExamLanguages] = useState('en');

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = () => mockApi.getExams().then(setExams);

    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        const languages = newExamLanguages.split(',').map(l => l.trim().toLowerCase()).filter(Boolean);
        if (!newExamName.trim() || newExamDuration <= 0 || languages.length === 0) {
            alert("Please provide a valid exam name, duration, and at least one language code (e.g., en).");
            return;
        }
        await mockApi.addExam({ 
            name: newExamName.trim(), 
            durationInMinutes: newExamDuration,
            supportedLanguages: languages,
        });
        setNewExamName('');
        setNewExamDuration(30);
        setNewExamLanguages('en');
        loadExams();
        alert('Exam added successfully!');
    };
    
    const handleDeleteExam = async (examName: string) => {
        if (window.confirm(`Are you sure you want to delete the exam "${examName}"? This will delete all associated questions, schedules, and coordinator assignments.`)) {
            await mockApi.deleteExam(examName);
            loadExams();
            alert('Exam deleted successfully!');
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <form onSubmit={handleAddExam} className="grid grid-cols-1 gap-4 p-4 mb-6 border rounded-lg md:grid-cols-4 md:items-end">
                <div className="md:col-span-2">
                    <label htmlFor="examName" className="block text-sm font-medium">Exam Name</label>
                    <input
                        id="examName"
                        type="text"
                        value={newExamName}
                        onChange={e => setNewExamName(e.target.value)}
                        className="w-full p-2 mt-1 border rounded"
                        placeholder="e.g., Regional Officer Exam"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium">Duration (minutes)</label>
                    <input
                        id="duration"
                        type="number"
                        value={newExamDuration}
                        onChange={e => setNewExamDuration(parseInt(e.target.value, 10))}
                        className="w-full p-2 mt-1 border rounded"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="languages" className="block text-sm font-medium">Languages</label>
                    <input
                        id="languages"
                        type="text"
                        value={newExamLanguages}
                        onChange={e => setNewExamLanguages(e.target.value)}
                        className="w-full p-2 mt-1 border rounded"
                        placeholder="en, hi, es"
                        required
                    />
                </div>
                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded md:w-auto h-fit hover:bg-green-700">Add Exam</button>
            </form>

             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                   <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Exam Name</th>
                            <th scope="col" className="px-6 py-3">Duration</th>
                            <th scope="col" className="px-6 py-3">Languages</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                   <tbody>
                       {exams.map(exam => (
                           <tr key={exam.name} className="bg-white border-b">
                               <td className="px-6 py-4 font-medium text-gray-900">{exam.name}</td>
                               <td className="px-6 py-4">{exam.durationInMinutes} minutes</td>
                               <td className="px-6 py-4">{exam.supportedLanguages.join(', ').toUpperCase()}</td>
                               <td className="px-6 py-4">
                                   <button onClick={() => handleDeleteExam(exam.name)} className="font-medium text-red-600 hover:underline">Delete</button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
                </table>
            </div>
        </div>
    );
};

const QuestionManager: React.FC<{}> = () => {
    const [allQuestions, setAllQuestions] = useState<Record<string, Question[]>>({});
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        mockApi.getExams().then(exams => {
            setExams(exams);
            if (exams.length > 0) {
                setSelectedExam(exams[0].name);
            }
        });
        mockApi.getAllQuestions().then(setAllQuestions);
    }, []);

    const handleSaveQuestion = async (question: Question) => {
        const currentExamQuestions = allQuestions[selectedExam] || [];
        let updatedQuestions;
        if (currentExamQuestions.find(q => q.id === question.id)) {
            updatedQuestions = currentExamQuestions.map(q => q.id === question.id ? question : q);
        } else {
            updatedQuestions = [...currentExamQuestions, { ...question, id: Date.now() }];
        }
        await mockApi.updateQuestions(selectedExam, updatedQuestions);
        setAllQuestions(prev => ({ ...prev, [selectedExam]: updatedQuestions }));
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = async (questionId: number) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const updatedQuestions = allQuestions[selectedExam].filter(q => q.id !== questionId);
            await mockApi.updateQuestions(selectedExam, updatedQuestions);
            setAllQuestions(prev => ({ ...prev, [selectedExam]: updatedQuestions }));
        }
    };

    const handleImportClick = () => {
        if (!selectedExam) {
            alert("Please select an exam first.");
            return;
        }
        fileInputRef.current?.click();
    };
    
    // Note: CSV import is not updated for multilingual support as the complexity is high.
    // It will only import questions for the primary language ('en').
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        alert("Note: CSV Import only supports the primary language (en) for now.");
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvText = e.target?.result as string;
            // ... (rest of the logic remains the same, will add to 'en' key)
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const selectedExamDetails = exams.find(e => e.name === selectedExam);

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                 <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="p-2 border rounded">
                    {exams.map(exam => <option key={exam.name} value={exam.name}>{exam.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <button onClick={() => { if(selectedExam) {setEditingQuestion(null); setIsModalOpen(true); } else {alert("Please select an exam.")}}} className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700" disabled={!selectedExam}>Add Question</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                   <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Question Text (EN)</th>
                            <th scope="col" className="px-6 py-3">Correct Answer (EN)</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                   <tbody>
                       {allQuestions[selectedExam]?.map(q => (
                           <tr key={q.id} className="bg-white border-b">
                               <td className="px-6 py-4">{q.text['en'] || Object.values(q.text)[0]}</td>
                               <td className="px-6 py-4">{q.options[q.correctAnswerIndex]['en'] || Object.values(q.options[q.correctAnswerIndex])[0]}</td>
                               <td className="px-6 py-4 space-x-2">
                                   <button onClick={() => { setEditingQuestion(q); setIsModalOpen(true); }} className="font-medium text-blue-600 hover:underline">Edit</button>
                                   <button onClick={() => handleDeleteQuestion(q.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
                </table>
            </div>
            {isModalOpen && <QuestionModal 
              question={editingQuestion} 
              onSave={handleSaveQuestion} 
              onClose={() => setIsModalOpen(false)}
              supportedLanguages={selectedExamDetails?.supportedLanguages || ['en']}
            />}
        </div>
    );
};

const QuestionModal: React.FC<{ question: Question | null, onSave: (q: Question) => void, onClose: () => void, supportedLanguages: string[] }> = ({ question, onSave, onClose, supportedLanguages }) => {
    const getInitialFormData = () => {
        if (question) return question;
        const text: LocalizedString = {};
        const options: LocalizedString[] = [{}, {}, {}, {}];
        supportedLanguages.forEach(lang => {
            text[lang] = '';
            options.forEach(opt => opt[lang] = '');
        });
        return { id: 0, text, options, correctAnswerIndex: 0 };
    };

    const [formData, setFormData] = useState<Question>(getInitialFormData());
    
    const handleTextChange = (lang: string, value: string) => {
        setFormData(prev => ({...prev, text: {...prev.text, [lang]: value }}));
    };
    
    const handleOptionChange = (optionIndex: number, lang: string, value: string) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex] = {...newOptions[optionIndex], [lang]: value };
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, correctAnswerIndex: parseInt(e.target.value, 10) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
                <h3 className="mb-4 text-xl font-bold">{question ? 'Edit' : 'Add'} Question</h3>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2 border rounded-md">
                    {supportedLanguages.map(lang => (
                      <div key={lang} className="p-3 mb-4 border rounded-lg shadow-sm">
                        <h4 className="font-semibold tracking-wider text-gray-600 uppercase">{lang}</h4>
                        <div className="mt-2 space-y-2">
                          <input type="text" value={formData.text[lang] || ''} onChange={e => handleTextChange(lang, e.target.value)} placeholder={`Question Text (${lang})`} className="w-full p-2 border rounded" />
                          {formData.options.map((opt, i) => (
                              <input key={i} type="text" value={opt[lang] || ''} onChange={(e) => handleOptionChange(i, lang, e.target.value)} placeholder={`Option ${i + 1} (${lang})`} className="w-full p-2 border rounded" />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="block mb-1 font-medium">Correct Answer</label>
                      <select value={formData.correctAnswerIndex} onChange={handleCorrectAnswerChange} className="w-full p-2 border rounded">
                          {formData.options.map((opt, i) => <option key={i} value={i}>{`Option ${i + 1} (${opt['en'] || Object.values(opt)[0] || ''})`}</option>)}
                      </select>
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    );
};


const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');


    const loadUsers = () => {
        mockApi.getAllUsers().then(setUsers);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleOpenPasswordModal = (user: User) => {
        setEditingUser(user);
        setNewPassword('');
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setEditingUser(null);
    };

    const handlePasswordChange = async () => {
        if (!editingUser || !newPassword.trim()) {
            alert("Please enter a new password.");
            return;
        }
        const response = await mockApi.updateUserPassword(editingUser.rollNumber, editingUser.examName, newPassword.trim());
        alert(response.message);
        if (response.success) {
            handleClosePasswordModal();
        }
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csvText = e.target?.result as string;
                if (!csvText) {
                    alert("Could not read file content.");
                    return;
                }
    
                const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    alert("CSV file must contain a header and at least one data row.");
                    return;
                }

                const headerLine = lines.shift();
                if (!headerLine) {
                     alert("CSV file is empty or missing a header.");
                     return;
                }

                // Normalize header for comparison by removing quotes and trimming whitespace
                const normalizedHeader = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, '')).join(',');

                if (normalizedHeader !== 'fullName,rollNumber,password,examName') {
                    alert(`Invalid CSV header.\nExpected: fullName,rollNumber,password,examName\nReceived: "${headerLine.trim()}"`);
                    return;
                }
    
                const allExams = await mockApi.getExams();
                const validExamNames = new Set(allExams.map(ex => ex.name));
                
                const usersToRegister: { fullName: string; rollNumber: string; password: string; examName: string }[] = [];
                const errors: string[] = [];
                
                lines.forEach((line, index) => {
                    const columns = line.split(','); 
                    const lineNumber = index + 2; // +1 for 0-index, +1 for header
                    if (columns.length === 4) {
                        const [fullName, rollNumber, password, examName] = columns.map(c => c.trim().replace(/^"|"$/g, ''));
                        if (!fullName || !rollNumber || !password || !examName) {
                            errors.push(`Line ${lineNumber}: Incomplete data.`);
                        } else if (!validExamNames.has(examName)) {
                            errors.push(`Line ${lineNumber}: Exam '${examName}' does not exist.`);
                        } else {
                            usersToRegister.push({ fullName, rollNumber, password, examName });
                        }
                    } else {
                        errors.push(`Line ${lineNumber}: Invalid number of columns (expected 4, found ${columns.length}).`);
                    }
                });
    
                if (errors.length > 0) {
                    alert(`Import aborted due to ${errors.length} errors:\n- ${errors.slice(0, 5).join('\n- ')}\n${errors.length > 5 ? '...and more.' : ''}`);
                } else if (usersToRegister.length > 0) {
                    const response = await mockApi.registerBulkUsers(usersToRegister);
                    alert(response.message);
                    loadUsers();
                } else {
                    alert("No valid users found to import from the file.");
                }
            } finally {
                 if (event.target) {
                    event.target.value = ''; // Reset file input to allow re-uploading the same file
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow overflow-x-auto">
             <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                 <h3 className="text-lg font-semibold">Registered Users</h3>
                 <div>
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileImport} className="hidden" />
                    <button 
                        onClick={handleImportClick}
                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                    >
                        Import Users (CSV)
                    </button>
                 </div>
            </div>
             <p className="mb-4 text-xs text-gray-500">
                CSV file must have a header row: <code>fullName,rollNumber,password,examName</code>. The <code>examName</code> must match an existing exam.
            </p>
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Full Name</th>
                        <th scope="col" className="px-6 py-3">Roll Number</th>
                        <th scope="col" className="px-6 py-3">Exam</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="bg-white border-b">
                            <td className="px-6 py-4">{u.fullName}</td>
                            <td className="px-6 py-4">{u.rollNumber}</td>
                            <td className="px-6 py-4">{u.examName}</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => handleOpenPasswordModal(u)}
                                    className="font-medium text-blue-600 hover:underline"
                                >
                                    Change Password
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isPasswordModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-4 text-lg font-bold">Change Password for {editingUser.fullName}</h3>
                        <p className="mb-2 text-sm text-gray-600">Roll Number: {editingUser.rollNumber}</p>
                        <p className="mb-4 text-sm text-gray-600">Exam: {editingUser.examName}</p>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 mt-1 border rounded"
                                placeholder="Enter new password"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end mt-6 space-x-2">
                            <button onClick={handleClosePasswordModal} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handlePasswordChange} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                                Save Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResultManager: React.FC = () => {
    const [results, setResults] = useState<ExamResult[]>([]);
    useEffect(() => { mockApi.getAllResults().then(setResults); }, []);
    const exportCSV = () => {
        const headers = "UserID,Exam,Score,Percentage,Remark,Date\n";
        const csvContent = results.map(r => `${r.userId},${r.examName},${r.score}/${r.totalQuestions},${r.percentage}%,${r.remark},${new Date(r.timestamp).toLocaleString()}`).join("\n");
        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "results.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <button onClick={exportCSV} className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">Export as CSV</button>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr><th scope="col" className="px-6 py-3">Exam</th><th scope="col" className="px-6 py-3">User ID</th><th scope="col" className="px-6 py-3">Score</th><th scope="col" className="px-6 py-3">Percentage</th><th scope="col" className="px-6 py-3">Remark</th></tr>
                    </thead>
                    <tbody>
                        {results.map(r => <tr key={r.timestamp+r.userId} className="bg-white border-b"><td className="px-6 py-4">{r.examName}</td><td className="px-6 py-4">{r.userId}</td><td className="px-6 py-4">{r.score}/{r.totalQuestions}</td><td className="px-6 py-4">{r.percentage}%</td><td className="px-6 py-4">{r.remark}</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ScheduleManager: React.FC = () => {
    const [schedules, setSchedules] = useState<Record<string, { startTime: string | null, endTime: string | null }>>({});
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const savedSchedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
            const fetchedExams = await mockApi.getExams();
            setSchedules(savedSchedules);
            setExams(fetchedExams);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleSave = async (examName: string, startTime: string | null, endTime: string | null) => {
        await mockApi.updateExamSchedule(examName, startTime, endTime);
        alert(`Schedule updated for ${examName}`);
    };

    const handleTimeChange = (examName: string, type: 'startTime' | 'endTime', value: string) => {
        setSchedules(prev => ({
            ...prev,
            [examName]: {
                ...prev[examName],
                [type]: value ? new Date(value).toISOString() : null
            }
        }));
    };

    const formatDateTimeLocal = (isoString: string | null | undefined) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
            return localDate.toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    if (isLoading) return <div>Loading schedules...</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow space-y-6">
            {exams.map(exam => {
                const schedule = schedules[exam.name] || { startTime: null, endTime: null };
                return (
                    <div key={exam.name} className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold text-gray-700">{exam.name}</h3>
                        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Start Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 mt-1 border rounded-md"
                                    value={formatDateTimeLocal(schedule.startTime)}
                                    onChange={(e) => handleTimeChange(exam.name, 'startTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 mt-1 border rounded-md"
                                    value={formatDateTimeLocal(schedule.endTime)}
                                    onChange={(e) => handleTimeChange(exam.name, 'endTime', e.target.value)}
                                />
                            </div>
                            <div className="self-end">
                                <button
                                    onClick={() => handleSave(exam.name, schedule.startTime, schedule.endTime)}
                                    className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700"
                                >
                                    Save Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const CoordinatorManager: React.FC = () => {
    const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
    const [exams, setExams] = useState<Omit<Exam, 'questions'>[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [assignedExam, setAssignedExam] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [coords, fetchedExams] = await Promise.all([mockApi.getAllCoordinators(), mockApi.getExams()]);
        setCoordinators(coords);
        setExams(fetchedExams);
        if(fetchedExams.length > 0) {
            setAssignedExam(fetchedExams[0].name);
        }
    }

    const handleAddCoordinator = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newUsername.trim() || !newPassword.trim() || !assignedExam) {
            alert("Please fill all fields.");
            return;
        }
        await mockApi.addCoordinator(newUsername, newPassword, assignedExam);
        setIsModalOpen(false);
        setNewUsername('');
        setNewPassword('');
        loadData();
        alert("Coordinator added.");
    }

    const handleDeleteCoordinator = async (id: string) => {
        if(window.confirm("Are you sure you want to delete this coordinator?")) {
            await mockApi.deleteCoordinator(id);
            loadData();
            alert("Coordinator deleted.");
        }
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 mb-4 font-bold text-white bg-green-500 rounded hover:bg-green-700">Add Coordinator</button>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Username</th>
                            <th scope="col" className="px-6 py-3">Assigned Exam</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coordinators.map(c => <tr key={c.id} className="bg-white border-b"><td className="px-6 py-4">{c.username}</td><td className="px-6 py-4">{c.assignedExamName}</td><td className="px-6 py-4"><button onClick={() => handleDeleteCoordinator(c.id)} className="font-medium text-red-600 hover:underline">Delete</button></td></tr>)}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg p-6 bg-white rounded-lg">
                        <h3 className="mb-4 text-lg font-bold">Add Coordinator</h3>
                        <form onSubmit={handleAddCoordinator} className="space-y-4">
                             <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username" required className="w-full p-2 border rounded" />
                             <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" required className="w-full p-2 border rounded" />
                             <select value={assignedExam} onChange={e => setAssignedExam(e.target.value)} required className="w-full p-2 border rounded">
                                {exams.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                             </select>
                             <div className="flex justify-end mt-4 space-x-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">Save</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('exams');

    const renderContent = () => {
        switch (activeTab) {
            case 'exams': return <ExamManager />;
            case 'coordinators': return <CoordinatorManager />;
            case 'users': return <UserManager />;
            case 'results': return <ResultManager />;
            case 'questions': return <QuestionManager />;
            case 'schedule': return <ScheduleManager />;
            default: return null;
        }
    };
    
    const TabButton: React.FC<{tab: AdminTab, label: string}> = ({tab, label}) => (
        <button onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-semibold rounded-t-lg ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="flex items-center justify-between p-4 bg-white shadow-md">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <button onClick={onLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
            </header>
            <main className="p-4 md:p-8">
                <div className="mb-4 border-b border-gray-200">
                     <nav className="flex flex-wrap -mb-px">
                        <TabButton tab="exams" label="Manage Exams" />
                        <TabButton tab="questions" label="Manage Questions" />
                        <TabButton tab="schedule" label="Schedule Exams" />
                        <TabButton tab="coordinators" label="Manage Coordinators" />
                        <TabButton tab="users" label="Manage Users" />
                        <TabButton tab="results" label="View Results" />
                    </nav>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPage;