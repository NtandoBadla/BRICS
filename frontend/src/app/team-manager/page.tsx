"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import CreatePlayerForm from '@/components/CreatePlayerFormModern';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Shirt } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TeamManagerPage() {
  const { user, logout } = useAuth();
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/athletes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAthletes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching athletes:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['TEAM_MANAGER', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Team Manager Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Squad Size</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{athletes.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Match</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Saturday</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kit Status</CardTitle>
                <Shirt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ready</div>
              </CardContent>
            </Card>
          </div>

          <CreatePlayerForm onPlayerCreated={fetchAthletes} />

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              {athletes.length === 0 ? (
                <p className="text-gray-500 text-sm">No players yet</p>
              ) : (
                <div className="space-y-3">
                  {athletes.map((athlete) => (
                    <div key={athlete.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{athlete.firstName} {athlete.lastName}</h3>
                      <p className="text-sm text-gray-600">{athlete.team?.name}</p>
                      <p className="text-xs text-gray-500">{athlete.gender} - Born: {new Date(athlete.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}