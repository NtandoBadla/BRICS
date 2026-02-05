'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardSelector() {
  const { user } = useAuth();

  const dashboards = [
    { role: 'PLAYER', path: '/player', label: 'Player Dashboard' },
    { role: 'AGENT', path: '/agent', label: 'Agent Dashboard' },
    { role: 'COACH', path: '/coach', label: 'Coach Dashboard' },
    { role: 'TEAM_MANAGER', path: '/team-manager', label: 'Team Manager Dashboard' },
    { role: 'ADMIN', path: '/admin', label: 'Admin Dashboard' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Access</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map(dashboard => (
          <Card key={dashboard.role}>
            <CardHeader>
              <CardTitle>{dashboard.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={dashboard.path}>
                <Button className="w-full">Access Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {user && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p>Current User: {user.firstName} {user.lastName}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
    </div>
  );
}