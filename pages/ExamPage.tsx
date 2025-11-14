
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Question, Answer, ExamResult, LocalizedString } from '../types';
import { mockApi } from '../services/mockApi';

const MAX_VIOLATIONS = 3;

const ViolationWarningModal: React.FC<{ onAcknowledge: () => void, violationCount: number, maxViolations: number }> = ({ onAcknowledge, violationCount, maxViolations }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-gray-800">Warning!</h2>
                <p className="mt-2 text-gray-600">
                    You have switched tabs or minimized the window. This action is being monitored.
                    Continuing to do so may result in automatic submission of your exam.
                </p>
                <p className="mt-4 text-lg font-bold">
                    Warnings: <span className="text-red-600">{violationCount} / {maxViolations}</span>
                </p>
                <button
                    onClick={onAcknowledge}
                    className="w-full px-4 py-2 mt-6 font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    I Understand
                </button>
            </div>
        </div>
    );
};

interface ExamPageProps {
  user: User;
  onExamFinish: () => void;
  language: string;
}

const ExamHeader: React.FC<{ user: User, timeLeft: number, violationCount: number, maxViolations: number, language: string }> = ({ user, timeLeft, violationCount, maxViolations, language }) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between p-3 bg-white border-b-2 border-gray-300 shadow-sm">
            <h1 className="text-lg font-bold text-gray-800 md:text-xl">{user.examName}</h1>
            <div className="flex items-center gap-4 text-sm">
                <div className="hidden font-medium text-gray-600 md:block">{user.fullName}</div>
                <div className="px-3 py-1 font-semibold text-gray-700 uppercase bg-gray-200 rounded-full">{language}</div>
                 {violationCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full" title="Tab switch warnings">
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                         </svg>
                        <span className="font-semibold">{violationCount}/{maxViolations} Warnings</span>
                    </div>
                 )}
                <div className="flex items-center gap-2 px-3 py-1 text-red-600 bg-red-100 border border-red-300 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-mono text-base font-semibold">{formatTime(timeLeft)}</span>
                </div>
            </div>
        </div>
    );
};

const QuestionPalette: React.FC<{ answers: Answer[], currentQuestionIndex: number, goToQuestion: (index: number) => void }> = ({ answers, currentQuestionIndex, goToQuestion }) => {
    const getStatusColor = (status: Answer['status'], index: number) => {
        if (index === currentQuestionIndex) return 'bg-blue-500 text-white border-blue-700';
        switch (status) {
            case 'answered': return 'bg-green-500 text-white';
            case 'review': return 'bg-purple-500 text-white';
            case 'unanswered': return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
            default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
    };
    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="mb-4 font-semibold text-center text-gray-700">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 md:grid-cols-4 lg:grid-cols-5">
                {answers.map((answer, index) => (
                    <button
                        key={answer.questionId}
                        onClick={() => goToQuestion(index)}
                        className={`flex items-center justify-center w-10 h-10 font-bold rounded-md transition-colors duration-150 ${getStatusColor(answer.status, index)}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
             <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center"><span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>Answered</div>
                <div className="flex items-center"><span className="w-4 h-4 mr-2 bg-purple-500 rounded-full"></span>Marked for Review</div>
                <div className="flex items-center"><span className="w-4 h-4 mr-2 bg-gray-200 border rounded-full"></span>Not Answered</div>
            </div>
        </div>
    );
};

const getLocalizedText = (localizedString: LocalizedString, lang: string) => {
    const defaultLang = Object.keys(localizedString)[0] || 'en';
    return localizedString[lang] || localizedString[defaultLang];
}

const QuestionDisplay: React.FC<{
    question: Question;
    answer: Answer | undefined;
    questionNumber: number;
    totalQuestions: number;
    language: string;
    onSelectOption: (optionIndex: number) => void;
    onMarkForReview: () => void;
    onClearResponse: () => void;
}> = ({ question, answer, questionNumber, totalQuestions, language, onSelectOption, onMarkForReview, onClearResponse }) => {
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Question {questionNumber} of {totalQuestions}</h2>
            <p className="mb-6 text-base text-gray-700">{getLocalizedText(question.text, language)}</p>
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <label key={index} className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors duration-150 ${answer?.selectedOptionIndex === index ? 'bg-blue-100 border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                        <input
                            type="radio"
                            name={`question_${question.id}`}
                            className="w-5 h-5 text-blue-600 form-radio focus:ring-blue-500"
                            checked={answer?.selectedOptionIndex === index}
                            onChange={() => onSelectOption(index)}
                        />
                        <span className="ml-4 text-gray-700">{getLocalizedText(option, language)}</span>
                    </label>
                ))}
            </div>
            <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-gray-200">
                <button onClick={onMarkForReview} className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                    {answer?.status === 'review' ? 'Unmark Review' : 'Mark for Review'}
                </button>
                <button onClick={onClearResponse} className="px-4 py-2 font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600">
                    Clear Response
                </button>
            </div>
        </div>
    );
};


const ExamPage: React.FC<ExamPageProps> = ({ user, onExamFinish, language }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [violationCount, setViolationCount] = useState(0);
    const [showViolationWarning, setShowViolationWarning] = useState(false);

    // Use a ref to get the latest violation count in the event listener without re-attaching it
    const violationCountRef = useRef(violationCount);
    useEffect(() => {
        violationCountRef.current = violationCount;
    }, [violationCount]);


    const submitExam = useCallback(() => {
        // Prevent multiple submissions
        if (questions.length === 0 || localStorage.getItem(`exam_submitted_${user.id}`)) return;
        
        localStorage.setItem(`exam_submitted_${user.id}`, 'true');

        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;

        answers.forEach((answer, index) => {
            if (answer.selectedOptionIndex === null) {
                unanswered++;
            } else if (answer.selectedOptionIndex === questions[index].correctAnswerIndex) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        });

        const totalQuestions = questions.length;
        const score = correctAnswers;
        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        let remark = 'Fail';
        if (percentage >= 80) remark = 'Excellent';
        else if (percentage >= 60) remark = 'Good';
        else if (percentage >= 40) remark = 'Average';

        const result: ExamResult = {
            userId: user.id,
            examName: user.examName,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            unanswered,
            score,
            percentage: parseFloat(percentage.toFixed(2)),
            remark,
            timestamp: new Date().toISOString(),
        };

        mockApi.saveResult(result).then(() => {
            localStorage.removeItem(`exam_progress_${user.id}`);
            onExamFinish();
        });
    }, [answers, questions, user, onExamFinish]);
    
    // Anti-cheating event listeners
     useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const newCount = violationCountRef.current + 1;
                setViolationCount(newCount);
                setShowViolationWarning(true);
                if (newCount >= MAX_VIOLATIONS) {
                    setTimeout(() => {
                        alert("Exam submitted automatically due to exceeding the maximum number of warnings.");
                        submitExam();
                    }, 500);
                }
            }
        };

        const preventAction = (e: Event) => {
            e.preventDefault();
            alert("This action is disabled during the exam.");
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', preventAction);
        document.addEventListener('copy', preventAction);
        document.addEventListener('paste', preventAction);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', preventAction);
            document.removeEventListener('copy', preventAction);
            document.removeEventListener('paste', preventAction);
        };
    }, [submitExam]);

    useEffect(() => {
        const loadExamData = async () => {
            localStorage.removeItem(`exam_submitted_${user.id}`);
            const exam = await mockApi.getExam(user.examName);
            if (!exam) {
                setIsLoading(false);
                return;
            }
            
            const fetchedQuestions = exam.questions || [];
            setQuestions(fetchedQuestions);
            
            const savedProgress = localStorage.getItem(`exam_progress_${user.id}`);
            if (savedProgress) {
                const { savedAnswers, savedTimeLeft, savedIndex, savedViolations } = JSON.parse(savedProgress);
                setAnswers(savedAnswers);
                setTimeLeft(savedTimeLeft);
                setCurrentQuestionIndex(savedIndex);
                setViolationCount(savedViolations || 0);
            } else {
                setAnswers(fetchedQuestions.map(q => ({ questionId: q.id, selectedOptionIndex: null, status: 'unanswered' })));
                setTimeLeft(exam.durationInMinutes * 60);
            }
            setIsLoading(false);
        };
        loadExamData();
    }, [user.examName, user.id]);

    useEffect(() => {
        if (!isLoading && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                     if (newTime % 5 === 0) { // Save progress every 5 seconds
                        localStorage.setItem(`exam_progress_${user.id}`, JSON.stringify({ savedAnswers: answers, savedTimeLeft: newTime, savedIndex: currentQuestionIndex, savedViolations: violationCount }));
                    }
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else if (!isLoading && timeLeft === 0 && questions.length > 0) {
            submitExam();
        }
    }, [timeLeft, isLoading, submitExam, answers, currentQuestionIndex, user.id, questions.length, violationCount]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading Exam...</div>;
    }
    
    if (questions.length === 0) {
         return <div className="flex items-center justify-center min-h-screen">This exam has no questions. Please contact an administrator.</div>;
    }

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    const handleSelectOption = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            ...newAnswers[currentQuestionIndex],
            selectedOptionIndex: optionIndex,
            status: 'answered'
        };
        setAnswers(newAnswers);
    };

    const handleMarkForReview = () => {
        const newAnswers = [...answers];
        const currentStatus = newAnswers[currentQuestionIndex].status;
        newAnswers[currentQuestionIndex].status = currentStatus === 'review' ? (newAnswers[currentQuestionIndex].selectedOptionIndex !== null ? 'answered' : 'unanswered') : 'review';
        setAnswers(newAnswers);
    };

    const handleClearResponse = () => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
            ...newAnswers[currentQuestionIndex],
            selectedOptionIndex: null,
            status: 'unanswered'
        };
        setAnswers(newAnswers);
    };
    
    return (
        <div className="min-h-screen bg-slate-200">
            {showViolationWarning && (
                <ViolationWarningModal 
                    onAcknowledge={() => setShowViolationWarning(false)}
                    violationCount={violationCount}
                    maxViolations={MAX_VIOLATIONS}
                />
            )}
            <ExamHeader user={user} timeLeft={timeLeft} violationCount={violationCount} maxViolations={MAX_VIOLATIONS} language={language}/>
            <div className="container p-4 mx-auto">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
                    <div className="flex flex-col space-y-6">
                        <QuestionDisplay
                            question={questions[currentQuestionIndex]}
                            answer={answers[currentQuestionIndex]}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={questions.length}
                            language={language}
                            onSelectOption={handleSelectOption}
                            onMarkForReview={handleMarkForReview}
                            onClearResponse={handleClearResponse}
                        />
                        <div className="flex justify-between p-4 bg-white border border-gray-200 rounded-lg">
                            <button
                                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-2 font-semibold text-white bg-gray-500 rounded-md disabled:bg-gray-300 hover:bg-gray-600"
                            >
                                Previous
                            </button>
                            {currentQuestionIndex === questions.length - 1 ? (
                                <button onClick={submitExam} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                    Submit Exam
                                </button>
                            ) : (
                                <button onClick={() => goToQuestion(currentQuestionIndex + 1)} className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="order-first lg:order-last">
                        <QuestionPalette answers={answers} currentQuestionIndex={currentQuestionIndex} goToQuestion={goToQuestion} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
