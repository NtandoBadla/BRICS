"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AlertCircle, Trash2, UserCog, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
}

const ROLES = ['ADMIN', 'SECRETARIAT', 'REFEREE', 'TEAM_MANAGER', 'FEDERATION_OFFICIAL'];

export default function UserManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // ID of user being acted upon

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const data = await api.getUsers(token);
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            setActionLoading(userId);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                return;
            }

            await api.updateUserRole(token, userId, newRole);

            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            
            // Show success message
            alert(`Role updated successfully! User will receive an email notification.`);
        } catch (err: any) {
            console.error('Role update error:', err);
            const errorMsg = err.message || 'Failed to update role';
            alert('Failed to update role: ' + errorMsg);
            // Revert optimistic update by refetching
            fetchUsers();
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            setActionLoading(userId);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                return;
            }

            await api.deleteUser(token, userId);

            // Remove from list
            setUsers(users.filter(u => u.id !== userId));
            alert('User deleted successfully.');
        } catch (err: any) {
            console.error('Delete user error:', err);
            const errorMsg = err.message || 'Failed to delete user';
            alert('Failed to delete user: ' + errorMsg);
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-8">Loading users...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <select
                                                            className="border rounded p-1 text-sm bg-white"
                                                            value={user.role}
                                                            onChange={(e) => {
                                                                const newRole = e.target.value;
                                                                console.log('Role change:', { userId: user.id, oldRole: user.role, newRole });
                                                                if (newRole && newRole !== user.role) {
                                                                    handleRoleUpdate(user.id, newRole);
                                                                }
                                                            }}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            {ROLES.map(role => (
                                                                <option key={role} value={role}>{role}</option>
                                                            ))}
                                                        </select>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {users.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                        No users found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </ProtectedRoute>
    );
}
