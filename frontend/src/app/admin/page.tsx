"use client";

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import NationalSquadManagement from '@/components/NationalSquadManagement';
import StatsEngine from '@/components/StatsEngine';
import SystemOverview from '@/components/SystemOverview';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Shield, Trophy, Calendar, FileText, UserPlus, Building, Eye, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import { api, getErrorMessage } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompetitions: 0,
    totalMatches: 0,
    totalReferees: 0,
    loading: true
  });
  const [footballData, setFootballData] = useState<{
    leagues: any[];
    visible: boolean;
    loading: boolean;
    error?: string;
  }>({
    leagues: [],
    visible: false,
    loading: false,
    error: undefined
  });

  useEffect(() => {
    // Fetch real dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const users = await api.getUsers(token);
          setStats(prev => ({ ...prev, totalUsers: users.length }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const handleAddUser = () => {
    router.push('/signup');
  };

  const handleManageUsers = () => {
    router.push('/admin/users');
  };

  const handleManageMatches = () => {
    router.push('/admin/matches');
  };

  const handleViewReports = () => {
    router.push('/admin/reports');
  };

  const loadFootballData = async () => {
    setFootballData(prev => ({ ...prev, loading: true, error: undefined }));
    try {
      const data = await api.getFootballLeagues();
      setFootballData({
        leagues: data.response || [],
        visible: true,
        loading: false,
        error: undefined
      });
    } catch (error) {
      console.error('Error loading football data:', error);
      setFootballData(prev => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error)
      }));
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">BRICS Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
          {/* Dashboard Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.loading ? '...' : stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competitions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Active competitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referees</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Certified referees</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <Button onClick={handleAddUser} className="h-20 flex flex-col gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span>Add New User</span>
                </Button>
                <Button onClick={handleManageUsers} className="h-20 flex flex-col gap-2" variant="outline">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
                <Button onClick={handleManageMatches} className="h-20 flex flex-col gap-2" variant="outline">
                  <BarChart3 className="h-6 w-6" />
                  <span>Match Results</span>
                </Button>
                <Button onClick={handleViewReports} className="h-20 flex flex-col gap-2" variant="outline">
                  <FileText className="h-6 w-6" />
                  <span>Match Reports</span>
                </Button>
                <Button onClick={() => router.push('/competitions')} className="h-20 flex flex-col gap-2" variant="outline">
                  <Trophy className="h-6 w-6" />
                  <span>Competitions</span>
                </Button>
                <Button onClick={loadFootballData} className="h-20 flex flex-col gap-2" variant="outline" disabled={footballData.loading}>
                  <Eye className="h-6 w-6" />
                  <span>{footballData.loading ? 'Loading...' : 'Football Data'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Football Data Display */}
          {footballData.visible && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Football Leagues Data</CardTitle>
              </CardHeader>
              <CardContent>
                {footballData.error && (
                  <div className="p-4 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
                    {footballData.error}
                  </div>
                )}
                <div className="max-h-96 overflow-y-auto">
                  {footballData.leagues.length > 0 ? (
                    <div className="grid gap-4">
                      {footballData.leagues.slice(0, 10).map((league, i) => (
                        <div key={i} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/league/${league.league?.id}`)}>
                          <div className="flex items-center gap-4">
                            {league.league?.logo && (
                              <img src={league.league.logo} alt="League Logo" className="w-12 h-12 object-contain" />
                            )}
                            <div>
                              <h3 className="font-semibold">{league.league?.name}</h3>
                              <p className="text-sm text-gray-600">{league.country?.name}</p>
                              <p className="text-xs text-gray-500">Type: {league.league?.type}</p>
                              <p className="text-xs text-blue-600 mt-1">Click to view details →</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No football data available</p>
                  )}
                </div>
                <Button
                  onClick={() => setFootballData(prev => ({ ...prev, visible: false }))}
                  variant="outline"
                  className="mt-4"
                >
                  Hide Data
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Management Sections */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="squads">National Squads</TabsTrigger>
              <TabsTrigger value="stats">Stats Engine</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">System Users</p>
                          <p className="text-sm text-gray-600">Manage all platform users</p>
                        </div>
                        <Button onClick={handleManageUsers} size="sm">Manage</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Role Assignments</p>
                          <p className="text-sm text-gray-600">Update user permissions</p>
                        </div>
                        <Button onClick={() => router.push('/admin/users')} size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competition Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Match Results</p>
                          <p className="text-sm text-gray-600">Update scores and statuses</p>
                        </div>
                        <Button onClick={handleManageMatches} size="sm">Manage</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Match Reports</p>
                          <p className="text-sm text-gray-600">View referee match reports</p>
                        </div>
                        <Button onClick={handleViewReports} size="sm" variant="outline">View</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">Active Competitions</p>
                          <p className="text-sm text-gray-600">Monitor ongoing tournaments</p>
                        </div>
                        <Button onClick={() => router.push('/competitions')} size="sm" variant="outline">View All</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="system">
              <SystemOverview />
            </TabsContent>
            
            <TabsContent value="squads">
              <NationalSquadManagement />
            </TabsContent>
            
            <TabsContent value="stats">
              <StatsEngine />
            </TabsContent>
            
            <TabsContent value="management">
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => router.push('/admin/governance')}>
                      <Building className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                      <h3 className="font-semibold mb-1">Governance</h3>
                      <p className="text-sm text-gray-600">Manage organizational structure</p>
                    </div>
                    <div className="text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => router.push('/admin/referee')}>
                      <Shield className="h-12 w-12 mx-auto text-green-600 mb-2" />
                      <h3 className="font-semibold mb-1">Referee Management</h3>
                      <p className="text-sm text-gray-600">Manage referee assignments</p>
                    </div>
                    <div className="text-center p-6 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => router.push('/admin/cms')}>
                      <FileText className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                      <h3 className="font-semibold mb-1">Content Management</h3>
                      <p className="text-sm text-gray-600">Manage website content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}