import { Question, User, ExamResult, Exam, Coordinator } from '../types';
import { INITIAL_EXAMS } from '../constants';

// Initialize with some default data if localStorage is empty
const initializeData = () => {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
     if (!localStorage.getItem('exams')) {
        localStorage.setItem('exams', JSON.stringify(INITIAL_EXAMS.map(({questions, ...exam}) => exam)));
    }
    if (!localStorage.getItem('questions')) {
        const allQuestions = INITIAL_EXAMS.reduce((acc, exam) => {
            return { ...acc, [exam.name]: exam.questions };
        }, {});
        localStorage.setItem('questions', JSON.stringify(allQuestions));
    }
    if (!localStorage.getItem('results')) {
        localStorage.setItem('results', JSON.stringify([]));
    }
    if (!localStorage.getItem('examSchedules')) {
        localStorage.setItem('examSchedules', JSON.stringify({}));
    }
    if (!localStorage.getItem('coordinators')) {
        localStorage.setItem('coordinators', JSON.stringify([{id: 'coord1', username: 'coordinator', assignedExamName: 'General Knowledge Championship'}]));
    }
    if (!localStorage.getItem('coordinator_credentials')) {
        localStorage.setItem('coordinator_credentials', JSON.stringify([{username: 'coordinator', password: 'Coord@123'}]));
    }
};

initializeData();

export const mockApi = {
    registerUser: (fullName: string, rollNumber: string, password: string, examName: string): Promise<{ success: boolean; message: string; user?: User }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
                if (users.some(u => u.rollNumber === rollNumber && u.examName === examName)) {
                    resolve({ success: false, message: 'A user with this Roll Number is already registered for this exam.' });
                } else {
                    const newUser: User = { id: Date.now().toString(), fullName, rollNumber, examName };
                    const userCredentials = { rollNumber, password, examName };
                    
                    const updatedUsers = [...users, newUser];
                    localStorage.setItem('users', JSON.stringify(updatedUsers));

                    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
                    credentials.push(userCredentials);
                    localStorage.setItem('credentials', JSON.stringify(credentials));
                    
                    resolve({ success: true, message: 'Registration successful!', user: newUser });
                }
            }, 500);
        });
    },

    loginUser: (rollNumber: string, password: string, examName: string): Promise<{ success: boolean; message: string; user?: User }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
                const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
                
                const credMatch = credentials.find((c: any) => c.rollNumber === rollNumber && c.password === password && c.examName === examName);
                if (credMatch) {
                    const user = users.find(u => u.rollNumber === rollNumber && u.examName === examName);
                    if (user) {
                        resolve({ success: true, message: 'Login successful!', user });
                    } else {
                        resolve({ success: false, message: 'User data not found.' });
                    }
                } else {
                    resolve({ success: false, message: 'Invalid credentials or exam selection.' });
                }
            }, 500);
        });
    },
    
    getExams: (): Promise<Omit<Exam, 'questions'>[]> => Promise.resolve(JSON.parse(localStorage.getItem('exams') || '[]')),

    getExam: async (examName: string): Promise<Exam | undefined> => {
        // FIX: Changed type to `Omit<Exam, 'questions'>[]` to match the return type of `getExams`.
        const exams: Omit<Exam, 'questions'>[] = await mockApi.getExams();
        const exam = exams.find(e => e.name === examName);
        if (!exam) return undefined;

        const allQuestions = JSON.parse(localStorage.getItem('questions') || '{}');
        const schedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
        
        const schedule = schedules[examName];
        
        return { ...exam, questions: allQuestions[examName] || [], ...schedule };
    },

    getQuestionsForExam: (examName: string): Promise<Question[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const allQuestions = JSON.parse(localStorage.getItem('questions') || '{}');
                resolve(allQuestions[examName] || []);
            }, 300);
        });
    },
    
    saveResult: (result: ExamResult): Promise<{ success: boolean }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const results: ExamResult[] = JSON.parse(localStorage.getItem('results') || '[]');
                results.push(result);
                localStorage.setItem('results', JSON.stringify(results));
                resolve({ success: true });
            }, 500);
        });
    },

    // Admin functions
    addExam: (exam: {name: string, durationInMinutes: number, supportedLanguages: string[]}): Promise<{ success: boolean }> => {
        const exams = JSON.parse(localStorage.getItem('exams') || '[]');
        exams.push({ ...exam, startTime: null, endTime: null });
        localStorage.setItem('exams', JSON.stringify(exams));
        // Also initialize questions array for the new exam
        const allQuestions = JSON.parse(localStorage.getItem('questions') || '{}');
        allQuestions[exam.name] = [];
        localStorage.setItem('questions', JSON.stringify(allQuestions));
        return Promise.resolve({ success: true });
    },
    deleteExam: (examName: string): Promise<{ success: boolean }> => {
        let exams = JSON.parse(localStorage.getItem('exams') || '[]');
        exams = exams.filter((e: Exam) => e.name !== examName);
        localStorage.setItem('exams', JSON.stringify(exams));

        const allQuestions = JSON.parse(localStorage.getItem('questions') || '{}');
        delete allQuestions[examName];
        localStorage.setItem('questions', JSON.stringify(allQuestions));

        const schedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
        delete schedules[examName];
        localStorage.setItem('examSchedules', JSON.stringify(schedules));
        
        // Also remove associated coordinators
        let coordinators = JSON.parse(localStorage.getItem('coordinators') || '[]');
        coordinators = coordinators.filter((c: Coordinator) => c.assignedExamName !== examName);
        localStorage.setItem('coordinators', JSON.stringify(coordinators));

        return Promise.resolve({ success: true });
    },
    getAllUsers: (): Promise<User[]> => Promise.resolve(JSON.parse(localStorage.getItem('users') || '[]')),
    updateUserPassword: (rollNumber: string, examName: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
                const credentialIndex = credentials.findIndex((c: any) => c.rollNumber === rollNumber && c.examName === examName);

                if (credentialIndex > -1) {
                    credentials[credentialIndex].password = newPassword;
                    localStorage.setItem('credentials', JSON.stringify(credentials));
                    resolve({ success: true, message: 'Password updated successfully.' });
                } else {
                    resolve({ success: false, message: 'User not found.' });
                }
            }, 300);
        });
    },
    getAllResults: (): Promise<ExamResult[]> => Promise.resolve(JSON.parse(localStorage.getItem('results') || '[]')),
    getAllQuestions: (): Promise<Record<string, Question[]>> => Promise.resolve(JSON.parse(localStorage.getItem('questions') || '{}')),
    updateQuestions: (examName: string, questions: Question[]): Promise<{success: boolean}> => {
        const allQuestions = JSON.parse(localStorage.getItem('questions') || '{}');
        allQuestions[examName] = questions;
        localStorage.setItem('questions', JSON.stringify(allQuestions));
        return Promise.resolve({success: true});
    },
    updateExamSchedule: (examName: string, startTime: string | null, endTime: string | null): Promise<{ success: boolean }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const schedules = JSON.parse(localStorage.getItem('examSchedules') || '{}');
                schedules[examName] = { startTime, endTime };
                localStorage.setItem('examSchedules', JSON.stringify(schedules));
                resolve({ success: true });
            }, 300);
        });
    },

    // Coordinator functions
    loginCoordinator: (username: string, password: string): Promise<{ success: boolean, message: string, coordinator?: Coordinator }> => {
        return new Promise(resolve => {
             const credentials = JSON.parse(localStorage.getItem('coordinator_credentials') || '[]');
             const coordinators: Coordinator[] = JSON.parse(localStorage.getItem('coordinators') || '[]');
             const credMatch = credentials.find((c: any) => c.username === username && c.password === password);
             if (credMatch) {
                 const coordinator = coordinators.find(c => c.username === username);
                 if (coordinator) {
                     resolve({ success: true, message: 'Login successful!', coordinator });
                 } else {
                     resolve({ success: false, message: 'Coordinator data not found.' });
                 }
             } else {
                 resolve({ success: false, message: 'Invalid credentials.' });
             }
        });
    },
    getAllCoordinators: (): Promise<Coordinator[]> => Promise.resolve(JSON.parse(localStorage.getItem('coordinators') || '[]')),
    addCoordinator: (username: string, password: string, assignedExamName: string): Promise<{ success: boolean }> => {
        const coordinators = JSON.parse(localStorage.getItem('coordinators') || '[]');
        const credentials = JSON.parse(localStorage.getItem('coordinator_credentials') || '[]');
        
        const newCoordinator = { id: `coord-${Date.now()}`, username, assignedExamName };
        coordinators.push(newCoordinator);
        localStorage.setItem('coordinators', JSON.stringify(coordinators));

        credentials.push({ username, password });
        localStorage.setItem('coordinator_credentials', JSON.stringify(credentials));

        return Promise.resolve({ success: true });
    },
    deleteCoordinator: (id: string): Promise<{ success: boolean }> => {
        let coordinators: Coordinator[] = JSON.parse(localStorage.getItem('coordinators') || '[]');
        const coordinatorToDelete = coordinators.find(c => c.id === id);
        if (!coordinatorToDelete) return Promise.resolve({ success: false });

        coordinators = coordinators.filter(c => c.id !== id);
        localStorage.setItem('coordinators', JSON.stringify(coordinators));

        let credentials = JSON.parse(localStorage.getItem('coordinator_credentials') || '[]');
        credentials = credentials.filter((c: any) => c.username !== coordinatorToDelete.username);
        localStorage.setItem('coordinator_credentials', JSON.stringify(credentials));

        return Promise.resolve({ success: true });
    },
    registerBulkUsers: (newUsers: { fullName: string; rollNumber: string; password: string; examName: string }[]): Promise<{ success: boolean; message: string; addedCount: number, skippedCount: number }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
                const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
                
                let addedCount = 0;
                let skippedCount = 0;

                newUsers.forEach(newUser => {
                    const userExists = users.some(u => u.rollNumber === newUser.rollNumber && u.examName === newUser.examName);
                    if (userExists) {
                        skippedCount++;
                    } else {
                        const userToAdd: User = { 
                            id: `${Date.now()}-${newUser.rollNumber}`, 
                            fullName: newUser.fullName, 
                            rollNumber: newUser.rollNumber, 
                            examName: newUser.examName 
                        };
                        const credentialToAdd = { 
                            rollNumber: newUser.rollNumber, 
                            password: newUser.password, 
                            examName: newUser.examName 
                        };

                        users.push(userToAdd);
                        credentials.push(credentialToAdd);
                        addedCount++;
                    }
                });

                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('credentials', JSON.stringify(credentials));

                resolve({ 
                    success: true, 
                    message: `Bulk import completed. Added: ${addedCount}, Skipped (duplicates): ${skippedCount}.`,
                    addedCount,
                    skippedCount
                });
            }, 500);
        });
    }
};