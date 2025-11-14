
import React, { useState, useEffect } from 'react';
import { Coordinator, User } from '../types';
import { mockApi } from '../services/mockApi';

interface CoordinatorPageProps {
  coordinator: Coordinator;
  onLogout: () => void;
}

const CoordinatorPage: React.FC<CoordinatorPageProps> = ({ coordinator, onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        mockApi.getAllUsers().then(allUsers => {
            const assignedUsers = allUsers.filter(user => user.examName === coordinator.assignedExamName);
            setUsers(assignedUsers);
            setIsLoading(false);
        });
    }, [coordinator.assignedExamName]);

    return (
         <div className="min-h-screen bg-gray-100">
            <header className="flex items-center justify-between p-4 bg-white shadow-md">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Coordinator Dashboard</h1>
                    <p className="text-sm text-gray-600">Managing: <span className="font-semibold">{coordinator.assignedExamName}</span></p>
                </div>
                <button onClick={onLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
            </header>
            <main className="p-4 md:p-8">
                <div className="p-4 bg-white rounded-lg shadow overflow-x-auto">
                    <h2 className="mb-4 text-xl font-semibold">Registered Users for {coordinator.assignedExamName}</h2>
                    {isLoading ? <p>Loading users...</p> : (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Full Name</th>
                                    <th scope="col" className="px-6 py-3">Roll Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map(u => (
                                        <tr key={u.id} className="bg-white border-b">
                                            <td className="px-6 py-4">{u.fullName}</td>
                                            <td className="px-6 py-4">{u.rollNumber}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-center text-gray-500">No users registered for this exam yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CoordinatorPage;
